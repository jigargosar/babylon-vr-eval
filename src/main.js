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
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';

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

    const ambientLight = new HemisphericLight('ambientLight', Vector3.Up(), scene);
    	ambientLight.intensity = 0.1;

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

	const floorGroup = new TransformNode("floorGroup", scene);
	floorGroup.position.y = 0; // Single control point for floor elements
	
	setupNeonFloor(scene, floorGroup);
	const footprintsGroup = setupFootprints(scene);
	footprintsGroup.parent = floorGroup;
	footprintsGroup.position.y = 0.01; // Slightly above tube level
}

function setupNeonFloor(scene, floorGroup) {
	// Create 4x2.5 meter rounded rectangle path for play area boundary
	const width = 4;
	const depth = 2.5;
	const cornerRadius = 0.3;
	const height = 0.1; // Float above ground
	
	// Calculate path points for rounded rectangle
	const path = [];
	const segments = 16; // Points per corner arc
	
	// Helper function to add arc points
	const addArc = (centerX, centerZ, startAngle, endAngle) => {
		for (let i = 0; i <= segments; i++) {
			const angle = startAngle + (endAngle - startAngle) * (i / segments);
			path.push(new Vector3(
				centerX + Math.cos(angle) * cornerRadius,
				height,
				centerZ + Math.sin(angle) * cornerRadius
			));
		}
	};
	
	// Build rounded rectangle path (clockwise from top-right)
	// Top-right corner
	addArc(width/2 - cornerRadius, depth/2 - cornerRadius, 0, Math.PI/2);
	// Top-left corner  
	addArc(-width/2 + cornerRadius, depth/2 - cornerRadius, Math.PI/2, Math.PI);
	// Bottom-left corner
	addArc(-width/2 + cornerRadius, -depth/2 + cornerRadius, Math.PI, 3*Math.PI/2);
	// Bottom-right corner
	addArc(width/2 - cornerRadius, -depth/2 + cornerRadius, 3*Math.PI/2, 2*Math.PI);
	// Close the path
	path.push(path[0]);
	
	// Create neon tube
	const tube = MeshBuilder.CreateTube('neonFloor', {
		path: path,
		radius: 0.05,
		tessellation: 8,
		cap: 1
	}, scene);
	
	// Create neon material
	const neonMaterial = new StandardMaterial('neonFloorMaterial', scene);
	neonMaterial.diffuseColor = new Color3(0, 0, 0);
	neonMaterial.emissiveColor = new Color3(0, 0.8, 2.0);
	tube.material = neonMaterial;
	
	// Parent to floor group
	tube.parent = floorGroup;
	tube.position.y = 0; // At floor group level
}

function setupFootprints(scene) {
	// Create footprints group for easy positioning control
	const footprintsGroup = new TransformNode("footprintsGroup", scene);
	
	// Create foot-shaped outlines at center for starting position
	const footLength = 0.28;
	const footWidth = 0.12;
	const footSeparation = 0.25; // Distance between feet (shoulder width)
	const height = 0.01; // Just above ground
	
	// Create left and right foot shapes
	const createFootprint = (name, xOffset) => {
		// Create realistic foot shape using multiple components
		const footGroup = [];
		
		// Heel (circular back part)
		const heel = MeshBuilder.CreateDisc(name + '_heel', {
			radius: footWidth * 0.4,
			tessellation: 12
		}, scene);
		heel.position.x = xOffset;
		heel.position.y = height;
		heel.position.z = -footLength * 0.3;
		heel.rotation.x = Math.PI / 2;
		heel.parent = footprintsGroup; // Parent to group
		
		// Arch (narrower middle section)
		const arch = MeshBuilder.CreateDisc(name + '_arch', {
			radius: footWidth * 0.5,
			tessellation: 12
		}, scene);
		arch.position.x = xOffset;
		arch.position.y = height;
		arch.position.z = 0;
		arch.rotation.x = Math.PI / 2;
		arch.scaling.x = 0.6; // Narrower arch
		arch.scaling.z = 0.8;
		arch.parent = footprintsGroup; // Parent to group
		
		// Toe area (wider front part)
		const toe = MeshBuilder.CreateDisc(name + '_toe', {
			radius: footWidth * 0.45,
			tessellation: 12
		}, scene);
		toe.position.x = xOffset;
		toe.position.y = height;
		toe.position.z = footLength * 0.25;
		toe.rotation.x = Math.PI / 2;
		toe.scaling.x = 1.1; // Wider toe area
		toe.scaling.z = 0.7;
		toe.parent = footprintsGroup; // Parent to group
		
		// Create white material
		const whiteMaterial = new StandardMaterial(name + 'Material', scene);
		whiteMaterial.diffuseColor = new Color3(1, 1, 1);
		whiteMaterial.emissiveColor = new Color3(0.8, 0.8, 0.8);
		
		// Apply material to all parts
		heel.material = whiteMaterial;
		arch.material = whiteMaterial;
		toe.material = whiteMaterial;
		
		// Keep as separate meshes (simpler approach)
		return { heel, arch, toe };
	};
	
	// Create left and right footprints
	createFootprint('leftFootprint', -footSeparation/2);
	createFootprint('rightFootprint', footSeparation/2);
	
	return footprintsGroup;
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
		Object.keys(sabers).forEach(hand => {
			if (sabers[hand].controller === controller) {
				sabers[hand].mesh.setEnabled(false);
				sabers[hand].controller = null;
			}
		});
	});


    // Update saber positions every frame
	scene.registerBeforeRender(() => {
		Object.keys(sabers).forEach(hand => {
			const saber = sabers[hand];
			if (saber.controller?.grip) {
				positionSaber(saber);
            }
		});
	});

    function positionSaber(saber) {
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

}

document.addEventListener('DOMContentLoaded', init);
