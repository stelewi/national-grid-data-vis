import { debounce } from 'underscore';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { data, types, filters } from "../store/DataStore";
import moment from "moment";
import {Text} from 'troika-three-text'
import {Tween, update as tweenUpdate, Easing } from "@tweenjs/tween.js";
import Series from "./Series";
import DataPoint from "./DataPoint";
import {
    AxesHelper,
    Scene,
    PerspectiveCamera,
    AmbientLight,
    DirectionalLight,
    WebGLRenderer,
    Mesh,
    BoxGeometry,
    MeshBasicMaterial, SpotLight, PointLight, HemisphereLight
} from "three";


class Viewer {

    constructor() {
        this.controls = null;
        this.containerEl = null;
        this.scene = new Scene();
        this.camera = new PerspectiveCamera( 75, 1, 0.1, 1000 );
        this.renderer = new WebGLRenderer( { alpha: true, antialias: true } );
        this._initCamera();
        this._addLights();
        this._initDevHelpers();
        this._addTestCube();
        this.barWidth = 5;
        this.barMargin = 2;
        this.barMaxHeight = 40;
        this.quantityMax = 35000; // 35 GWh

        // graph data
        this.fromUnixTime = null;
        this.toUnixTime = null;
        this.timeResolution = 30 * 60;
        this.maxZTicks = 50;
        this.types = {}; // typeId => type
        this.data = [];
        this.xLabels = {}; // typeId => Text
        this.series = {}; // typeId => Series
    }

    refresh() {
        console.log('refresh()');

        // viewer base data, refreshed from the data store's latest data set
        this._refreshBaseData();

        // viewer data structures for display (depend on our base data)
        this._refreshXLabels();
        this._refreshSeries();
        this._refreshDataPoints();
    }

    attachToContainer(containerEl) {

        this.containerEl = containerEl;
        this.containerEl.appendChild(this.renderer.domElement);
        this._initControls();

        const resize = () => {
            this.containerEl.removeChild(this.renderer.domElement);
            this.renderer.setSize(this.containerEl.clientWidth, this.containerEl.clientHeight);
            this.camera.aspect = this.containerEl.clientWidth / this.containerEl.clientHeight;
            this.camera.updateProjectionMatrix();
            this.containerEl.appendChild(this.renderer.domElement);
        }

        const debouncedResize = debounce(resize, 100);

        resize();

        this._animate();

        window.addEventListener('resize', debouncedResize);
    }

    _refreshTypes() {
        this.types = {};
        let position = 0, type = null;

        for(let i = 0; i < types.value.length; i++)
        {
            type = types.value[i];

            this.types[type.id] = {
                id: type.id,
                name: type.name,
                color: type.color,
                label: type.label,
                show: type.show,
                position: type.show ? position : null,
                xPos: type.show ? this._xPos(position) : null
            }

            if(type.show)
            {
                position++;
            }
        }
    }

    _refreshData() {
        this.data = data.value.map((record) => ({
            unixTime: moment(record.time).unix(),
            typeId: record.resourceType.id,
            quantity: record.quantity
        }) );
    }

    /**
     *  refresh the base data that we build our graph from
     * @private
     */
    _refreshBaseData() {
        this.fromUnixTime =  moment(filters.from, moment.HTML5_FMT.DATETIME_LOCAL).unix();
        this.toUnixTime =  moment(filters.to, moment.HTML5_FMT.DATETIME_LOCAL).unix();
        this._refreshTypes();
        this._refreshData();
    }

    _refreshXLabels() {

        let type = null, xLabel = null;

        for(let typeId in this.types)
        {
            type = this.types[typeId];

            // no xLabel exists for this type so create one..
            if(this.xLabels[type.id] === undefined)
            {
                xLabel = new Text();

                xLabel.tween = null;
                xLabel.text = type.label;
                xLabel.maxWidth = this.barWidth * 4;
                xLabel.fontSize = this.barWidth / 2;
                xLabel.textAlign = 'right';
                xLabel.anchorX = 'right';
                xLabel.anchorY = 'middle';
                xLabel.position.z = this.barMargin;
                xLabel.position.x = type.xPos;
                xLabel.position.y = this._xLabelYPos(type);
                xLabel.rotation.x = -Math.PI /2;
                xLabel.rotation.z = Math.PI /2;
                xLabel.color = 0x038525;
                xLabel.visible = type.show;

                this.scene.add(xLabel);

                this.xLabels[type.id] = xLabel;
            }

            this._tweenXLabel(type);
        }
    }

    _tweenXLabel(type) {
        let xLabel = this.xLabels[type.id];

        if(type.show && !xLabel.visible)
        {
            xLabel.position.x = type.xPos;
        }

        // stop any old, in-progress tween
        if(xLabel.tween !== null)
        {
            xLabel.tween.stop();
        }

        xLabel.tween = new Tween(xLabel)
            .easing(Easing.Quadratic.InOut)
            .to({
                position: {x: type.xPos, y: this._xLabelYPos(type) },
                material: { opacity: type.show ? 1.0 : 0.0}
            }, 1000)
            .onStart((xLabel) => {
                xLabel.visible = true; // always make visible, and just let opacity tween so the job...
            })
            .onComplete((xLabel) => {
                xLabel.position.x = type.xPos;
                xLabel.sync();
                xLabel.visible = type.show;
                xLabel.tween = null;
            })
            .start();
    }

    _xLabelYPos(type) {
        return type.show ? 0 : -this.barWidth;
    }

    _xPos(position) {

        return - (
            (this.barWidth / 2.0 + this.barMargin) +
            ((this.barMargin + this.barWidth) * position)
        );


        return -(
            (this.barMargin + this.barWidth) * (position + 1) - (this.barWidth / 2.0 + this.barMargin)
        );
    }


    /**
     *
     * @param {number} unixTime
     * @returns {number}
     * @private
     */
    _unixTimeToDataPointIndex(unixTime) {

        return Math.round((this.toUnixTime - unixTime) / this.timeResolution);
    }

    /**
     *
     * @param index {number}
     * @returns {number}
     * @private
     */
    _dataPointIndexToZPos(index) {

        return 0 - (this.barMargin + (this.barWidth / 2)) - (index * (this.barWidth + this.barMargin));
    }

    _refreshSeries() {



        // this.types[type.id] = {
        //     id: type.id,
        //     name: type.name,
        //     color: type.color,
        //     label: type.label,
        //     show: type.show,
        //     position: type.show ? position : null,
        //     xPos: type.show ? this._xPos(position) : null
        // }


    }

    _refreshDataPoints() {

        this.data.forEach((dataRec) => {

            const series = this._getSeries(dataRec.typeId);
            const type = this.types[dataRec.typeId];
            const dpIndex = this._unixTimeToDataPointIndex(dataRec.unixTime);

            let dp = series.getDataPoint(dpIndex);

            // no dp exists to refresh, create one
            if (dp === null)
            {
                let geometry = new BoxGeometry(1,1,1);

                dp = new DataPoint(
                    dpIndex,
                    dataRec.unixTime,
                    dataRec.typeId,
                    dataRec.quantity,
                    geometry,
                    new Mesh(geometry, series.material)
                );

                dp.mesh.scale.x = this.barWidth;
                dp.mesh.scale.z = this.barWidth;
                dp.mesh.position.x = type.xPos;
                dp.mesh.position.z = this._dataPointIndexToZPos(dpIndex);

                series.addDataPoint(dp);
            }

            this._tweenDataPoint(dp)
        });
    }

    /**
     *
     * @param {DataPoint} dp
     * @private
     */
    _tweenDataPoint(dp) {
        const series = this._getSeries(dp.typeId);
        const type = this.types[dp.typeId];

        const barHeight =  (dp.quantity / this.quantityMax) * this.barMaxHeight;

        dp.mesh.scale.y = barHeight;
        dp.mesh.position.y = barHeight / 2;
        dp.mesh.position.x = type.xPos;
    }


    /**
     *
     * @param typeId
     * @returns {Series}
     * @private
     */
    _getSeries(typeId) {
        if(this.series[typeId] === undefined)
        {
            const type = this.types[typeId];

            const newSeries = new Series(typeId, type.color);
            newSeries.show = false;

            this.series[typeId] = newSeries;
            this.scene.add(newSeries.group);
        }

        return this.series[typeId];
    }

    _initControls() {
        this.controls = new OrbitControls(this.camera, this.containerEl);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }

    _addLights() {
        // ambient light
        //const light = new AmbientLight( 0x404040 ); // soft white light
        const skyColor = 0xB1E1FF;  // light blue
        const groundColor = 0xB97A20;  // brownish orange
        const light = new HemisphereLight(skyColor, groundColor, 1);
        this.scene.add( light );

        // directional light
        const color = 0xFFFFFF;
        const intensity = 1;
        const directionalLight = new DirectionalLight(color, intensity);
        directionalLight.position.set(0, 10, 0);
        directionalLight.target.position.set(5, 0, 0);
        this.scene.add(directionalLight);
        this.scene.add(directionalLight.target);

        const pointLight = new PointLight(0xffffff);
        this.scene.add(pointLight);
    }

    _addTestCube() {
        const geometry = new BoxGeometry();
        const material = new MeshBasicMaterial( { color: 0x00ff00 } );
        const cube = new Mesh( geometry, material );
        this.scene.add( cube );
    }

    _initCamera() {
        this.camera.position.z = 40;
        this.camera.position.x = 40;
        this.camera.lookAt(0,0,0);
    }

    _initDevHelpers() {
        const axesHelper = new AxesHelper(500);
        this.scene.add(axesHelper);
    }

    _animate() {
        requestAnimationFrame( () => this._animate() );
        this.controls ? this.controls.update() : null;
        this.renderer.render( this.scene, this.camera );
        tweenUpdate();
    }
}

const viewer = new Viewer();

export {
    viewer
}

