import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import '@babylonjs/core/Helpers/sceneHelpers';

const canvas = document.getElementById('renderCanvas');
const engine = new Engine(canvas, true);
const scene = new Scene(engine);

const camera = new FreeCamera('camera1', new Vector3(0, 5, -10), scene);
camera.setTarget(Vector3.Zero());
camera.attachControl(canvas, true);
camera.speed = 0.5;
camera.angularSensibility = 5000;

const light = new HemisphericLight('light', Vector3.Up(), scene);

const box = MeshBuilder.CreateBox('box', { size: 1 }, scene);
box.position.y = 1;

scene.createDefaultEnvironment();

engine.runRenderLoop(() => scene.render());
window.addEventListener('resize', () => engine.resize());