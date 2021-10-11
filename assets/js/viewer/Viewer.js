import { debounce } from 'underscore';
import { AxesHelper, Scene, PerspectiveCamera, AmbientLight, DirectionalLight, WebGLRenderer, Mesh, BoxGeometry, MeshBasicMaterial } from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default class Viewer {

    constructor() {
        this.controls = null;
        this.containerEl = null;
        this.scene = new Scene();
        this.camera = new PerspectiveCamera( 75, 1, 0.1, 1000 );
        this.renderer = new WebGLRenderer();
        this._addLights();
        this._initCamera();
        this._initDevHelpers();
        this._addTestCube();
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

