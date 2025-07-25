import { Engine, Scene, Vector3, HemisphericLight, MeshBuilder, WebXRDefaultExperience } from 'babylonjs';
import { XRDevice, metaQuest3 } from 'iwer';
import { DevUI } from '@iwer/devui';

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('renderCanvas');
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    // Ground plane + lighting
    MeshBuilder.CreateGround('ground', { width: 20, height: 20 }, scene);
    new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    // Initialize IWER runtime and DevUI overlay
    const xrDevice = new XRDevice(metaQuest3);
    xrDevice.installRuntime();
    new DevUI(xrDevice);

    // WebXR experience with hand tracking
    WebXRDefaultExperience.CreateAsync(scene, {
        uiOptions: {
            sessionMode: 'immersive-vr',
            referenceSpaceType: 'local-floor'
        },
        optionalFeatures: ['hand-tracking']
    }).then(() => {
        engine.runRenderLoop(() => scene.render());
    });

    // Resize handler
    window.addEventListener('resize', () => engine.resize());
});
