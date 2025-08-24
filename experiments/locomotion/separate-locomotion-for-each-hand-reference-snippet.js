// 1. Import & register the two features so enableFeature won't be undefined
import { WebXRControllerTeleportation } from "@babylonjs/core/XR/features/WebXRControllerTeleportation";
import { WebXRControllerMovement    } from "@babylonjs/core/XR/features/WebXRControllerMovement";
import { WebXRFeatureName            } from "@babylonjs/core/XR/webXRFeaturesManager";

// Toggle this flag to switch between handedness-based (false)
// or hardcoded controller-index mapping: 0 → teleport, 1 → move (true)
const useHardcodedHands = false;

async function initXR(scene, groundMesh) {
    // 2. Create default XR experience with built-in teleport & movement disabled
    const xr = await scene.createDefaultXRExperienceAsync({
        floorMeshes:        [groundMesh],
        disableTeleportation: true,
        disableMovement:      true
    });

    // 3. Grab the feature manager from the baseExperience helper
    const fm = xr.baseExperience.featuresManager;

    // 4. Enable (but do NOT auto-attach) each feature by its static Name
    const teleport = fm.enableFeature(
        WebXRControllerTeleportation.Name,
        "stable",
        { xrInput: xr.input, floorMeshes: [groundMesh] }
    );
    const movement = fm.enableFeature(
        WebXRControllerMovement.Name,
        "stable",
        { xrInput: xr.input }
    );

    // 5. Track connected controllers for optional hard-coding
    const controllers = [];

    xr.input.onControllerAddedObservable.add((controller) => {
        controllers.push(controller);
        assign(controller, controllers.indexOf(controller));
    });

    xr.input.onControllerRemovedObservable.add((controller) => {
        teleport.detach(controller);
        movement.detach(controller);

        const idx = controllers.indexOf(controller);
        if (idx !== -1) controllers.splice(idx, 1);
    });

    // 6. Attach based on handedness or hardcoded index
    function assign(controller, index) {
        const hand = controller.inputSource.handedness; // "left" | "right" | "none"

        const wantsTeleport = useHardcodedHands
            ? index === 0
            : hand === "left";

        const wantsMove = useHardcodedHands
            ? index === 1
            : hand === "right";

        if (wantsTeleport) teleport.attach(controller);
        if (wantsMove)     movement.attach(controller);
    }
}

// Usage (once your Babylon scene and groundMesh exist):
initXR(scene, groundMesh);
