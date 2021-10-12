import { debounce } from 'underscore';
import { AxesHelper, Scene, PerspectiveCamera, AmbientLight, DirectionalLight, WebGLRenderer, Mesh, BoxGeometry, MeshBasicMaterial } from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { data, types, filters } from "../store/DataStore";
import moment from "moment";

import {Text} from 'troika-three-text'

class Viewer {

    constructor() {
        this.controls = null;
        this.containerEl = null;
        this.scene = new Scene();
        this.camera = new PerspectiveCamera( 75, 1, 0.1, 1000 );
        this.renderer = new WebGLRenderer( { alpha: true } );
        this._addLights();
        this._initCamera();
        this._initDevHelpers();
        this._addTestCube();
        this.barWidth = 5;
        this.barMargin = 1;

        // graph data
        this.fromUnixTime = null;
        this.toUnixTime = null;
        this.timeResolution = 30 * 60;
        this.types = {}; // typeId => type
        this.data = [];
        this.xLabels = [];
        this.bars = [];
    }

    refresh() {

        console.log('refresh()');
        this._refreshGraphData();
        this._refreshXLabels();
        this._refreshBars();
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
    _refreshGraphData() {
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

                xLabel.text = type.label;
                xLabel.maxWidth = this.barWidth * 4;
                xLabel.fontSize = this.barWidth / 2.5;
                xLabel.textAlign = 'right';
                xLabel.anchorX = 'right';
                xLabel.position.z = this.barMargin;
                xLabel.position.y = 0;
                xLabel.rotation.x = -Math.PI /2;
                xLabel.rotation.z = Math.PI /2;
                xLabel.color = 0x038525;

                this.scene.add(xLabel);

                this.xLabels[type.id] = xLabel;
            }

            xLabel = this.xLabels[type.id];
            xLabel.position.x = type.xPos;
            xLabel.visible = type.show;
            xLabel.sync();
        }
    }

    _xPos(position) {
        return -(((this.barMargin + this.barWidth) * (position + 1)) - (this.barWidth / 2.0));
    }

    _refreshBars() {

    }

    _initControls() {
        this.controls = new OrbitControls(this.camera, this.containerEl);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }

    _addLights() {
        // ambient light
        const light = new AmbientLight( 0x404040 ); // soft white light
        this.scene.add( light );

        // directional light
        const color = 0xFFFFFF;
        const intensity = 1;
        const directionalLight = new DirectionalLight(color, intensity);
        directionalLight.position.set(0, 10, 0);
        directionalLight.target.position.set(5, 0, 0);
        this.scene.add(directionalLight);
        this.scene.add(directionalLight.target);
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
    }
}

const viewer = new Viewer();

export {
    viewer
}

