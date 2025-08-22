import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import '@babylonjs/core/Helpers/sceneHelpers';

window.addEventListener('DOMContentLoaded', () => {
    try {
        const canvas = document.getElementById('renderCanvas');
        console.log('Canvas found:', canvas);
        
        const engine = new Engine(canvas, true);
        console.log('Engine created');
        
        const scene = new Scene(engine);
        console.log('Scene created');

        const camera = new FreeCamera('camera1', new Vector3(0, 5, -10), scene);
        camera.setTarget(Vector3.Zero());
        camera.attachControl(canvas, true);
        console.log('Camera created');

        const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
        light.intensity = 0.7;
        console.log('Light created');

        const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 2, segments: 32 }, scene);
        sphere.position.y = 1;
        console.log('Sphere created');
        
        scene.createDefaultEnvironment();
        console.log('Default environment created');

        engine.runRenderLoop(() => scene.render());
        window.addEventListener('resize', () => engine.resize());
        
        console.log('Babylon.js setup complete');
    } catch (error) {
        console.error('Setup failed:', error);
    }
});