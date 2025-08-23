import {Engine} from '@babylonjs/core/Engines/engine';
import {Scene} from '@babylonjs/core/scene';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {HemisphericLight} from '@babylonjs/core/Lights/hemisphericLight';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {UniversalCamera} from '@babylonjs/core/Cameras/universalCamera';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {Color3} from '@babylonjs/core/Maths/math.color';
import {Quaternion} from '@babylonjs/core/Maths/math.vector';
import '@babylonjs/core/Helpers/sceneHelpers';
import "@babylonjs/loaders";

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
    light.intensity = 0.8;

    // Create ground plane
    const ground = MeshBuilder.CreateGround('ground', {width: 20, height: 20}, scene);

    // Create various objects to explore
    const redBox = MeshBuilder.CreateBox('redBox', {size: 1}, scene);
    redBox.position = new Vector3(3, 0.5, 2);
    const redMaterial = new StandardMaterial('redMaterial', scene);
    redMaterial.diffuseColor = new Color3(1, 0, 0);
    redBox.material = redMaterial;

    const blueBox = MeshBuilder.CreateBox('blueBox', {width: 1, height: 2, depth: 1}, scene);
    blueBox.position = new Vector3(-4, 1, 1);
    const blueMaterial = new StandardMaterial('blueMaterial', scene);
    blueMaterial.diffuseColor = new Color3(0, 0, 1);
    blueBox.material = blueMaterial;

    const greenSphere = MeshBuilder.CreateSphere('greenSphere', {diameter: 1.5}, scene);
    greenSphere.position = new Vector3(0, 0.75, 5);
    const greenMaterial = new StandardMaterial('greenMaterial', scene);
    greenMaterial.diffuseColor = new Color3(0, 1, 0);
    greenSphere.material = greenMaterial;

    const yellowCylinder = MeshBuilder.CreateCylinder('yellowCylinder', {height: 3, diameter: 1}, scene);
    yellowCylinder.position = new Vector3(-2, 1.5, -3);
    const yellowMaterial = new StandardMaterial('yellowMaterial', scene);
    yellowMaterial.diffuseColor = new Color3(1, 1, 0);
    yellowCylinder.material = yellowMaterial;

    // Create some walls for spatial reference
    const wall1 = MeshBuilder.CreateBox('wall1', {width: 10, height: 3, depth: 0.2}, scene);
    wall1.position = new Vector3(0, 1.5, 8);
    const grayMaterial = new StandardMaterial('grayMaterial', scene);
    grayMaterial.diffuseColor = new Color3(0.8, 0.8, 0.8);
    wall1.material = grayMaterial;

    const wall2 = MeshBuilder.CreateBox('wall2', {width: 0.2, height: 3, depth: 10}, scene);
    wall2.position = new Vector3(8, 1.5, 0);
    wall2.material = grayMaterial;

    scene.createDefaultEnvironment({
        createSkybox: true,
        skyboxSize: 50,
        createGround: false
    });

    const xrHelper = await scene.createDefaultXRExperienceAsync({
        floorMeshes: [ground]
    });

    // Enable teleportation
    if (xrHelper.teleportation) {
        xrHelper.teleportation.addFloorMesh(ground);
    }

    // Beat Saber - Controller tracking and saber visualization
    const sabers = {};
    
    // Listen for controller connections
    if (xrHelper.input) {
        xrHelper.input.onControllerAddedObservable.add((controller) => {
            console.log('Controller connected:', controller.uniqueId);
            
            // Create saber for this controller
            const saber = MeshBuilder.CreateCylinder(`saber_${controller.uniqueId}`, {
                height: 1.5,
                diameter: 0.05
            }, scene);
            
            // Color based on hand (assuming left=blue, right=red)
            const saberMaterial = new StandardMaterial(`saberMaterial_${controller.uniqueId}`, scene);
            // Default to blue, will be set properly when we detect handedness
            saberMaterial.diffuseColor = new Color3(0, 0.5, 1);
            saberMaterial.emissiveColor = new Color3(0, 0.2, 0.5);
            saber.material = saberMaterial;
            
            // Store saber reference
            sabers[controller.uniqueId] = {
                controller: controller,
                saber: saber,
                material: saberMaterial
            };
            
            // Update saber position each frame
            controller.onMotionControllerInitObservable.add((motionController) => {
                console.log('Motion controller initialized:', motionController.handness);
                
                // Set color based on handedness
                if (motionController.handness === 'left') {
                    saberMaterial.diffuseColor = new Color3(0, 0.5, 1); // Blue
                    saberMaterial.emissiveColor = new Color3(0, 0.2, 0.5);
                } else if (motionController.handness === 'right') {
                    saberMaterial.diffuseColor = new Color3(1, 0.2, 0); // Red
                    saberMaterial.emissiveColor = new Color3(0.5, 0.1, 0);
                }
            });
        });
        
        xrHelper.input.onControllerRemovedObservable.add((controller) => {
            console.log('Controller disconnected:', controller.uniqueId);
            
            // Clean up saber
            if (sabers[controller.uniqueId]) {
                sabers[controller.uniqueId].saber.dispose();
                delete sabers[controller.uniqueId];
            }
        });
    }
    
    // Update saber positions every frame
    scene.registerBeforeRender(() => {
        Object.values(sabers).forEach(({ controller, saber }) => {
            if (controller.grip) {
                // Position saber at controller grip position
                saber.position.copyFrom(controller.grip.position);
                
                // Rotate saber to point forward like a lightsaber
                // Apply 90-degree rotation around X-axis to make cylinder point forward
                const baseRotation = controller.grip.rotationQuaternion.clone();
                const forwardRotation = Quaternion.FromEulerAngles(Math.PI / 2, 0, 0);
                saber.rotationQuaternion = baseRotation.multiply(forwardRotation);
                
                // Offset saber forward from controller grip
                const forward = new Vector3(0, 0.75, 0); // Move along cylinder's length
                forward.rotateByQuaternionToRef(saber.rotationQuaternion, forward);
                saber.position.addInPlace(forward);
            }
        });
    });

    engine.runRenderLoop(() => scene.render());
    window.addEventListener('resize', () => engine.resize());
}

document.addEventListener('DOMContentLoaded', init);