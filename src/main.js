/**
 * main.js
 *
 * Babylon.js v8+ + WebXR (hand‐tracking) + IWER + DevUI
 *
 * 1) glTF loader (registers .glb/.gltf support):
 *    https://doc.babylonjs.com/features/featuresDeepDive/importers/loadingFileTypes
 *
 * 2) WebXRDefaultExperience (hand‐tracking + UI):
 *    https://doc.babylonjs.com/features/featuresDeepDive/webXR/webXRDefaultExperience_helper
 *
 * 3) IWER runtime (Quest emulation):
 *    https://meta-quest.github.io/immersive-web-emulation-runtime/getting-started.html
 *
 * 4) DevUI overlay (v1.1.3+):
 *    https://github.com/meta-quest/immersive-web-emulation-runtime/tree/main/devui
 */

import '@babylonjs/loaders/glTF';                           // hook up .glb/.gltf support

import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { WebXRDefaultExperience } from '@babylonjs/core/XR/webXRDefaultExperience';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import '@babylonjs/core/Animations/animatable';

import { XRDevice, metaQuest3 } from 'iwer';
import { DevUI } from '@iwer/devui';                        // default export in v1.1+

// Error handling wrapper
function handleError(operation, error) {
    console.error(`Error in ${operation}:`, error);
    // You can add more sophisticated error handling here
}

window.addEventListener('DOMContentLoaded', async () => {
    try {
        // Grab canvas + initialize engine/scene
        const canvas = document.getElementById('renderCanvas');
        if (!canvas) {
            throw new Error('Canvas element with id "renderCanvas" not found');
        }

        // Initialize engine with proper WebXR settings
        const engine = new Engine(canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true,
            antialias: true,
            powerPreference: "high-performance"
        });

        const scene = new Scene(engine);

        // Create camera manually (the correct way for Babylon.js 8.x)
        const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 10, Vector3.Zero(), scene);
        camera.attachControl(canvas, true);
        camera.setTarget(Vector3.Zero());

        // Create ground with material
        const ground = MeshBuilder.CreateGround('ground', { width: 20, height: 20 }, scene);
        const groundMaterial = new StandardMaterial('groundMat', scene);
        groundMaterial.diffuseColor = new Color3(0.2, 0.7, 0.2);
        ground.material = groundMaterial;

        // Create light
        const light = new HemisphericLight('light', Vector3.Up(), scene);
        light.intensity = 0.7;

        // Add some debug objects for testing
        const box = MeshBuilder.CreateBox('box', { size: 0.5 }, scene);
        box.position = new Vector3(0, 1, 0);
        const boxMaterial = new StandardMaterial('boxMat', scene);
        boxMaterial.diffuseColor = new Color3(1, 0, 0);
        box.material = boxMaterial;

        // Install IWER runtime (Quest emulator) first
        console.log('Installing IWER runtime...');
        const xrDevice = new XRDevice(metaQuest3);
        await xrDevice.installRuntime();
        console.log('IWER runtime installed successfully');

        // Initialize DevUI (no need to bind to XR separately - it auto-binds)
        console.log('Initializing DevUI...');
        const devUI = new DevUI(xrDevice);
        console.log('DevUI initialized successfully');

        // Check WebXR support before creating experience
        if (!navigator.xr) {
            console.warn('WebXR not supported in this browser');
        }

        // Create the WebXR experience with stable configuration (avoiding hand tracking material issues)
        console.log('Creating WebXR experience...');
        const xrExperience = await WebXRDefaultExperience.CreateAsync(scene, {
            uiOptions: {
                sessionMode: 'immersive-vr',
                referenceSpaceType: 'local-floor'
            },
            // Remove hand-tracking for now to avoid material build errors
            // optionalFeatures: ['hand-tracking'],

            // Disable problematic default hand meshes
            disableDefaultUI: false,
            disablePointerSelection: false,
            disableNearInteraction: true, // This causes the material errors

            // Add floor mesh detection
            floorMeshes: [ground]
        });

        console.log('WebXR experience created successfully');

        // Configure hand tracking manually if needed (avoids default material issues)
        if (xrExperience.baseExperience.featuresManager) {
            try {
                // Enable hand tracking with custom configuration to avoid material errors
                const handTracking = xrExperience.baseExperience.featuresManager.enableFeature(
                    "xr-hand-tracking",
                    "latest",
                    {
                        xrInput: xrExperience.input,
                        // Disable default hand meshes that cause material errors
                        handMeshes: {
                            disableDefaultMeshes: true
                        }
                    }
                );

                if (handTracking) {
                    console.log('Hand tracking enabled with custom configuration');
                }
            } catch (handTrackingError) {
                console.warn('Hand tracking setup failed:', handTrackingError);
            }
        }

        // DevUI automatically handles XR binding - no manual binding needed
        console.log('Setup completed - DevUI will automatically handle XR sessions');

        // Start render loop
        engine.runRenderLoop(() => {
            try {
                scene.render();
            } catch (renderError) {
                handleError('render loop', renderError);
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            try {
                engine.resize();
            } catch (resizeError) {
                handleError('window resize', resizeError);
            }
        });

        console.log('Babylon.js + IWER setup completed successfully');

    } catch (error) {
        handleError('main initialization', error);
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', event => {
    handleError('unhandled promise rejection', event.reason);
});

// Handle general errors
window.addEventListener('error', event => {
    handleError('general error', event.error);
});