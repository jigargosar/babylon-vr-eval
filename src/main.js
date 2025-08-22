import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';

const canvas = document.getElementById('renderCanvas');
const engine = new Engine(canvas, true);
const scene = new Scene(engine);

const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 10, Vector3.Zero(), scene);
camera.attachControl(canvas, true);

const light = new HemisphericLight('light', Vector3.Up(), scene);

const ground = MeshBuilder.CreateGround('ground', { width: 6, height: 6 }, scene);
const box = MeshBuilder.CreateBox('box', { size: 1 }, scene);
box.position.y = 1;

engine.runRenderLoop(() => scene.render());
window.addEventListener('resize', () => engine.resize());