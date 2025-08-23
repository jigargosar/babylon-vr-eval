import {Engine} from '@babylonjs/core/Engines/engine';
import {Scene} from '@babylonjs/core/scene';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {HemisphericLight} from '@babylonjs/core/Lights/hemisphericLight';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {UniversalCamera} from '@babylonjs/core/Cameras/universalCamera';
import {WebXRDefaultExperience} from '@babylonjs/core/XR/webXRDefaultExperience';
import '@babylonjs/core/Helpers/sceneHelpers';

function setupWASDControls(camera) {
    const KEY_W = 87;
    const KEY_A = 65;
    const KEY_S = 83;
    const KEY_D = 68;
    const KEY_Q = 81;
    const KEY_E = 69;
    const KEY_UP = 38;
    const KEY_DOWN = 40;
    const KEY_LEFT = 37;
    const KEY_RIGHT = 39;

    camera.keysUp = [KEY_W, KEY_UP];
    camera.keysDown = [KEY_S, KEY_DOWN];
    camera.keysLeft = [KEY_A, KEY_LEFT];
    camera.keysRight = [KEY_D, KEY_RIGHT];
    camera.keysUpward = [KEY_Q];
    camera.keysDownward = [KEY_E];
    camera.keysUpwardSpeed = 0.5;
    camera.keysDownwardSpeed = 0.5;
}

function setupCamera(scene, canvas) {
    const camera = new UniversalCamera('camera1', new Vector3(0, 5, -10), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);
    camera.speed = 0.5;
    camera.angularSensibility = 5000;
    setupWASDControls(camera);
    return camera;
}

async function init() {
    const canvas = document.getElementById('renderCanvas');
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    setupCamera(scene, canvas);

    // canvas.addEventListener('click', () => {
    //     engine.enterPointerlock();
    // });

    const light = new HemisphericLight('light', Vector3.Up(), scene);

    const box = MeshBuilder.CreateBox('box', {size: 1}, scene);
    box.position.y = 1;

    scene.createDefaultEnvironment();

    const xrHelper = await scene.createDefaultXRExperienceAsync({
        floorMeshes: []
    });

    engine.runRenderLoop(() => scene.render());
    window.addEventListener('resize', () => engine.resize());
}

document.addEventListener('DOMContentLoaded', init);