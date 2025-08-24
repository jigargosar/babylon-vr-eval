import { WebXRFeatureName } from "@babylonjs/core/XR/webXRFeaturesManager";

// Toggle this flag to switch between handedness-based mapping (false)
// or hardcoded controller indices: 0 → teleport, 1 → planar movement (true)
const useHardcodedHands = false;

async function initXR(scene, groundMesh) {
    // 1. Create XR experience with built-in locomotion disabled
    const xr = await scene.createDefaultXRExperienceAsync({
        floorMeshes: [groundMesh],
        disableTeleportation: true,
        disableMovement:    true
    });

    // 2. Enable features but don’t attach them yet
    const teleportation = xr.featuresManager.enableFeature(
        WebXRFeatureName.TELEPORTATION,
        "stable",
        { xrInput: xr.input, floorMeshes: [groundMesh] }
    );
    const planarMovement = xr.featuresManager.enableFeature(
        WebXRFeatureName.PLANAR_MOBILITY,
        "stable",
        { xrInput: xr.input, floorMeshes: [groundMesh] }
    );

    // 3. Track controllers in an array so we can hardcode by index if needed
    const controllers = [];

    xr.input.onControllerAddedObservable.add((controller) => {
        controllers.push(controller);
        assignFeatures(controller, controllers.indexOf(controller));
    });

    xr.input.onControllerRemovedObservable.add((controller) => {
        teleportation.detachFromController(controller);
        planarMovement.detachFromController(controller);

        const idx = controllers.indexOf(controller);
        if (idx !== -1) {
            controllers.splice(idx, 1);
        }
    });

    // 4. Decide whether to attach teleportation or planar movement
    function assignFeatures(controller, index) {
        const hand = controller.inputSource.handedness; // "left" | "right" | "none"

        const doTeleport = useHardcodedHands
            ? index === 0
            : hand === "left";

        const doPlanar = useHardcodedHands
            ? index === 1
            : hand === "right";

        if (doTeleport) teleportation.attachToController(controller);
        if (doPlanar)    planarMovement.attachToController(controller);
    }
}

// Example usage:
// assume you have a Babylon scene and a groundMesh already created
initXR(scene, groundMesh);
