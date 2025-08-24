# VR Movement Options

## Option 1: Single Controller Teleportation + Smooth Locomotion

### Device Behavior:
- **Left Controller**: Point at ground → arc appears → squeeze trigger → teleport to location
- **Right Controller**: Push thumbstick forward → move smoothly in that direction, no teleportation UI
- **Visual**: Only left controller shows teleportation arc, right controller has no teleport visuals
- **Feel**: Very clear separation - left hand for jumping around, right hand for fine positioning

### Code Implementation:
```javascript
// Disable default teleportation system
if (xrHelper.teleportation) {
    xrHelper.teleportation.dispose();
}

// Custom teleportation for left controller only
let leftController = null;
let rightController = null;

xrHelper.input.onControllerAddedObservable.add((controller) => {
    controller.onMotionControllerInitObservable.add((motionController) => {
        if (motionController.handness === 'left') {
            leftController = controller;
            // Enable custom teleportation
            setupTeleportation(controller);
        } else if (motionController.handness === 'right') {
            rightController = controller;
            // Enable smooth locomotion
            setupSmoothMovement(controller);
        }
    });
});

function setupTeleportation(controller) {
    const teleportationFeature = xrHelper.featuresManager.enableFeature(
        BABYLON.WebXRFeatureName.TELEPORTATION, 
        "stable", 
        {
            xrInput: xrHelper.input,
            floorMeshes: [ground],
            renderingGroupId: 1
        },
        undefined,
        false
    );
    
    // Restrict to only this controller
    teleportationFeature.addBlockerMesh(rightController.grip);
}

function setupSmoothMovement(controller) {
    let moveVector = new Vector3(0, 0, 0);
    
    scene.registerBeforeRender(() => {
        if (controller.motionController) {
            const thumbstick = controller.motionController.getComponent("thumbstick");
            if (thumbstick && thumbstick.axes.length >= 2) {
                const x = thumbstick.axes[0];
                const y = thumbstick.axes[1];
                
                if (Math.abs(y) > 0.1) { // Deadzone
                    // Move forward/backward based on HMD direction
                    const camera = xrHelper.baseExperience.camera;
                    const forward = camera.getDirection(BABYLON.Vector3.Forward());
                    forward.y = 0; // Keep movement horizontal
                    forward.normalize();
                    
                    const speed = y * 0.05; // Adjust speed
                    xrHelper.baseExperience.camera.position.addInPlace(forward.scale(speed));
                }
            }
        }
    });
}
```

---

## Option 2: Mixed Locomotion System

### Device Behavior:
- **Primary Controller** (usually right): Point and teleport with trigger
- **Secondary Controller** (usually left): Thumbstick for smooth movement + rotation
- **Toggle Button**: Press 'A' or 'X' to switch between teleport mode and smooth mode
- **Visual Feedback**: Button press shows current mode (teleport arc vs movement indicator)
- **Feel**: One controller does everything, other controller for fine adjustments

### Code Implementation:
```javascript
let locomotionMode = 'teleport'; // 'teleport' or 'smooth'
let primaryController = null;
let secondaryController = null;

xrHelper.input.onControllerAddedObservable.add((controller) => {
    controller.onMotionControllerInitObservable.add((motionController) => {
        if (motionController.handness === 'right') {
            primaryController = controller;
            setupMixedLocomotion(controller);
        } else {
            secondaryController = controller;
            setupSecondaryControls(controller);
        }
    });
});

function setupMixedLocomotion(controller) {
    // Toggle locomotion mode
    const aButton = controller.motionController?.getComponent("a-button");
    aButton?.onButtonStateChangedObservable.add((component) => {
        if (component.pressed) {
            locomotionMode = locomotionMode === 'teleport' ? 'smooth' : 'teleport';
            console.log('Locomotion mode:', locomotionMode);
            showModeIndicator(locomotionMode);
        }
    });
    
    // Main trigger for teleport or smooth movement activation
    const trigger = controller.motionController?.getMainComponent();
    trigger?.onButtonStateChangedObservable.add((component) => {
        if (locomotionMode === 'teleport' && component.pressed) {
            performTeleportation(controller);
        }
    });
    
    // Continuous smooth movement when in smooth mode
    scene.registerBeforeRender(() => {
        if (locomotionMode === 'smooth' && trigger?.value > 0.1) {
            const direction = controller.grip.getDirection(BABYLON.Vector3.Forward());
            direction.y = 0;
            direction.normalize();
            
            const speed = trigger.value * 0.03;
            xrHelper.baseExperience.camera.position.addInPlace(direction.scale(speed));
        }
    });
}

function setupSecondaryControls(controller) {
    scene.registerBeforeRender(() => {
        const thumbstick = controller.motionController?.getComponent("thumbstick");
        if (thumbstick?.axes.length >= 2) {
            const x = thumbstick.axes[0];
            const y = thumbstick.axes[1];
            
            // Rotation
            if (Math.abs(x) > 0.3) {
                const rotationSpeed = x * 0.02;
                xrHelper.baseExperience.camera.rotationQuaternion = 
                    xrHelper.baseExperience.camera.rotationQuaternion.multiply(
                        BABYLON.Quaternion.FromEulerAngles(0, rotationSpeed, 0)
                    );
            }
            
            // Strafe movement
            if (Math.abs(y) > 0.1) {
                const camera = xrHelper.baseExperience.camera;
                const right = camera.getDirection(BABYLON.Vector3.Right());
                right.y = 0;
                right.normalize();
                
                const speed = y * 0.02;
                camera.position.addInPlace(right.scale(speed));
            }
        }
    });
}
```

---

## Option 3: Gesture-Based Movement

### Device Behavior:
- **Teleportation**: Point controller downward (45+ degrees) → arc appears → trigger teleports
- **Forward Movement**: Point controller forward (horizontal ±30 degrees) → hold trigger → move in pointed direction
- **Visual Feedback**: Different colored rays (blue for teleport, green for movement)
- **Intuitive**: Direction you point = direction you go
- **Feel**: Very natural, like pointing where you want to go

### Code Implementation:
```javascript
let isMoving = false;
const teleportAngleThreshold = Math.PI / 4; // 45 degrees down
const moveAngleThreshold = Math.PI / 6; // 30 degrees from horizontal

xrHelper.input.onControllerAddedObservable.add((controller) => {
    let rayMesh = createRayVisualization();
    
    controller.onMotionControllerInitObservable.add((motionController) => {
        setupGestureLocomotion(controller, rayMesh);
    });
});

function setupGestureLocomotion(controller, rayMesh) {
    const trigger = controller.motionController?.getMainComponent();
    
    scene.registerBeforeRender(() => {
        if (!controller.grip) return;
        
        // Get controller pointing direction
        const forward = controller.grip.getDirection(BABYLON.Vector3.Forward());
        const angleFromHorizontal = Math.asin(Math.abs(forward.y));
        
        // Determine gesture type based on pointing angle
        const isPointingDown = forward.y < -Math.sin(teleportAngleThreshold);
        const isPointingForward = angleFromHorizontal < moveAngleThreshold;
        
        if (isPointingDown) {
            // Teleportation gesture
            setupTeleportationRay(controller, rayMesh);
            
            if (trigger?.pressed) {
                performRaycastTeleport(controller);
            }
        } else if (isPointingForward) {
            // Smooth movement gesture
            setupMovementRay(controller, rayMesh);
            
            if (trigger?.value > 0.1) {
                performDirectionalMovement(controller, trigger.value);
            }
        } else {
            // No gesture - hide ray
            rayMesh.setEnabled(false);
        }
    });
}

function setupTeleportationRay(controller, rayMesh) {
    rayMesh.setEnabled(true);
    rayMesh.material.emissiveColor = new Color3(0, 0.5, 1); // Blue
    
    // Create arc pointing to ground
    const ray = new BABYLON.Ray(controller.grip.position, controller.grip.getDirection(BABYLON.Vector3.Forward()));
    const hit = scene.pickWithRay(ray, (mesh) => mesh === ground);
    
    if (hit.hit) {
        updateRayVisualization(rayMesh, controller.grip.position, hit.pickedPoint, 'arc');
    }
}

function setupMovementRay(controller, rayMesh) {
    rayMesh.setEnabled(true);
    rayMesh.material.emissiveColor = new Color3(0, 1, 0.5); // Green
    
    // Straight ray for movement direction
    const forward = controller.grip.getDirection(BABYLON.Vector3.Forward());
    const endPoint = controller.grip.position.add(forward.scale(3));
    updateRayVisualization(rayMesh, controller.grip.position, endPoint, 'straight');
}

function performDirectionalMovement(controller, intensity) {
    const direction = controller.grip.getDirection(BABYLON.Vector3.Forward());
    direction.y = 0; // Keep movement horizontal
    direction.normalize();
    
    const speed = intensity * 0.04;
    xrHelper.baseExperience.camera.position.addInPlace(direction.scale(speed));
}
```

---

## Recommendation:

For **Beat Saber**, I'd recommend **Option 1** because:
- **Clean separation**: Left hand teleports, right hand stays free for saber
- **No mode confusion**: Always know what each controller does
- **Performance**: Right hand smooth movement lets you fine-tune position for hitting targets
- **Intuitive**: Most VR users expect this layout