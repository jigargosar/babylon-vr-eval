import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Quaternion } from '@babylonjs/core/Maths/math.vector';
import '@babylonjs/core/Helpers/sceneHelpers';
import '@babylonjs/loaders';
import { WebXRState } from '@babylonjs/core';

function setupDesktopCamera(scene) {
	const camera = new UniversalCamera(
		'camera1',
		new Vector3(0, 5, -10),
		scene,
	);
	camera.setTarget(Vector3.Zero());
	camera.speed = 0.5;
	camera.angularSensibility = 5000;
	setupWASDControls(camera);
	camera.attachControl();
	// const engine = scene.getEngine();
	// engine.getRenderingCanvas().addEventListener('click', () => {
	//     engine.enterPointerlock();
	// });
	return camera;

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
}

function setupScene(scene) {
	// const light = new HemisphericLight('light', Vector3.Up(), scene);
	// light.intensity = 0.8;

	// Create ground plane
	// noinspection JSUnusedLocalSymbols
	const ground = MeshBuilder.CreateGround(
		'ground',
		{ width: 20, height: 20 },
		scene,
	);

	// Create various objects to explore
	const redBox = MeshBuilder.CreateBox('redBox', { size: 1 }, scene);
	redBox.position = new Vector3(3, 0.5, 2);
	const redMaterial = new StandardMaterial('redMaterial', scene);
	redMaterial.diffuseColor = new Color3(0, 0, 0);
	redMaterial.emissiveColor = new Color3(1.5, 0, 0);
	redBox.material = redMaterial;

	const blueBox = MeshBuilder.CreateBox(
		'blueBox',
		{ width: 1, height: 2, depth: 1 },
		scene,
	);
	blueBox.position = new Vector3(-4, 1, 1);
	const blueMaterial = new StandardMaterial('blueMaterial', scene);
	blueMaterial.diffuseColor = new Color3(0, 0, 0);
	blueMaterial.emissiveColor = new Color3(0, 0.5, 1.5);
	blueBox.material = blueMaterial;

	const greenSphere = MeshBuilder.CreateSphere(
		'greenSphere',
		{ diameter: 1.5 },
		scene,
	);
	greenSphere.position = new Vector3(0, 0.75, 5);
	const greenMaterial = new StandardMaterial('greenMaterial', scene);
	greenMaterial.diffuseColor = new Color3(0, 0, 0);
	greenMaterial.emissiveColor = new Color3(0, 1.5, 0.5);
	greenSphere.material = greenMaterial;

	const yellowCylinder = MeshBuilder.CreateCylinder(
		'yellowCylinder',
		{ height: 3, diameter: 1 },
		scene,
	);
	yellowCylinder.position = new Vector3(-2, 1.5, -3);
	const yellowMaterial = new StandardMaterial('yellowMaterial', scene);
	yellowMaterial.diffuseColor = new Color3(0, 0, 0);
	yellowMaterial.emissiveColor = new Color3(1.5, 1.5, 0);
	yellowCylinder.material = yellowMaterial;

	// Create some walls for spatial reference
	const wall1 = MeshBuilder.CreateBox(
		'wall1',
		{ width: 10, height: 3, depth: 0.2 },
		scene,
	);
	wall1.position = new Vector3(0, 1.5, 8);
	const grayMaterial = new StandardMaterial('grayMaterial', scene);
	grayMaterial.diffuseColor = new Color3(0, 0, 0);
	grayMaterial.emissiveColor = new Color3(0.8, 0.8, 1.2);
	wall1.material = grayMaterial;

	const wall2 = MeshBuilder.CreateBox(
		'wall2',
		{ width: 0.2, height: 3, depth: 10 },
		scene,
	);
	wall2.position = new Vector3(8, 1.5, 0);
	wall2.material = grayMaterial;
	scene.createDefaultEnvironment({
		createSkybox: true,
		skyboxSize: 50,
		createGround: false,
	});
}
async function init() {
	const canvas = document.getElementById('renderCanvas');
	// noinspection JSCheckFunctionSignatures
	const engine = new Engine(canvas, true);
	const scene = new Scene(engine);

	setupScene(scene);

	const desktopCamera = setupDesktopCamera(scene);

	// noinspection JSUnresolvedReference
	const xr = await scene.createDefaultXRExperienceAsync({
		disableTeleportation: true,
	});

	xr.baseExperience.onStateChangedObservable.add((state) => {
		if (state === WebXRState.ENTERING_XR) {
			scene.removeCamera(desktopCamera);
		}
	});

	setupSabers(scene, xr);

	engine.runRenderLoop(() => scene.render());
	window.addEventListener('resize', () => engine.resize());
}


function setupSabers(scene, xr) {
	// Helper function to create saber with all properties
	const createSaber = (name, material, scene) => {
		const mesh = MeshBuilder.CreateCylinder(name, { height: 1.5, diameter: 0.05 }, scene);
		mesh.material = material;
		mesh.setEnabled(false);
		return mesh;
	};

	// Create materials
	const createBlueMaterial = (scene) => {
		const material = new StandardMaterial('blueSaberMaterial', scene);
		material.diffuseColor = new Color3(0, 0, 0);
		material.emissiveColor = new Color3(0, 0.8, 1.5);
		return material;
	};

	const createRedMaterial = (scene) => {
		const material = new StandardMaterial('redSaberMaterial', scene);
		material.diffuseColor = new Color3(0, 0, 0);
		material.emissiveColor = new Color3(1.5, 0.3, 0);
		return material;
	};

	// Pre-create both sabers at startup
	const sabers = {
		left: {
			mesh: createSaber('leftSaber', createBlueMaterial(scene), scene),
			controller: null
		},
		right: {
			mesh: createSaber('rightSaber', createRedMaterial(scene), scene),
			controller: null
		}
	};

	// Controller connection logic
	xr.input.onControllerAddedObservable.add((controller) => {
		console.log('Controller connected:', controller.uniqueId);

		controller.onMotionControllerInitObservable.add((motionController) => {
			console.log('Motion controller initialized:', motionController.handness);

			const saber = sabers[motionController.handness];
			if (saber) {
				saber.controller = controller;
				saber.mesh.setEnabled(true);
			}
		});
	});

	xr.input.onControllerRemovedObservable.add((controller) => {
		console.log('Controller disconnected:', controller.uniqueId);

		// Find and disable the saber for this controller
		['left', 'right'].forEach(hand => {
			if (sabers[hand].controller === controller) {
				sabers[hand].mesh.setEnabled(false);
				sabers[hand].controller = null;
			}
		});
	});

	// Update saber positions every frame
	scene.registerBeforeRender(() => {
		['left', 'right'].forEach(hand => {
			const saber = sabers[hand];
			if (saber.controller?.grip) {
				// Position saber at controller grip position
				saber.mesh.position.copyFrom(saber.controller.grip.position);

				// Rotate saber to point forward like a lightsaber
				const baseRotation = saber.controller.grip.rotationQuaternion.clone();
				const forwardRotation = Quaternion.FromEulerAngles(Math.PI / 2, 0, 0);
				saber.mesh.rotationQuaternion = baseRotation.multiply(forwardRotation);

				// Offset saber forward from controller grip
				const forward = new Vector3(0, 0.75, 0);
				forward.rotateByQuaternionToRef(saber.mesh.rotationQuaternion, forward);
				saber.mesh.position.addInPlace(forward);
			}
		});
	});
}

document.addEventListener('DOMContentLoaded', init);
