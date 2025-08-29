# WebXR Controller Movement Options

Configuration options for `WebXRFeatureName.MOVEMENT` in Babylon.js

## Movement Control
- `movementEnabled: true` - Enable/disable movement (default: true)
- `movementSpeed: 1` - Movement speed multiplier (default: 1)
- `movementThreshold: 0.25` - Thumbstick threshold to register movement (default: 0.25)
- `movementOrientationFollowsViewerPose: true` - Movement follows camera direction (default: true)
- `movementOrientationFollowsController: false` - Movement follows controller direction (default: false)

## Rotation Control
- `rotationEnabled: true` - Enable/disable rotation (default: true)
- `rotationSpeed: 1.0` - Rotation speed factor (default: 1.0)  
- `rotationThreshold: 0.25` - Thumbstick threshold to register rotation (default: 0.25)

## Advanced Options
- `orientationPreferredHandedness` - Which controller controls orientation
- `customRegistrationConfigurations` - Custom controller mappings

## Sensitivity Tuning
For reducing sensitivity, use:
- `movementSpeed: 0.3` - Slower movement
- `movementThreshold: 0.4` - Higher threshold = less sensitive thumbstick
- `rotationSpeed: 0.5` - Slower rotation

## Example Configuration
```javascript
featureManager.enableFeature(WebXRFeatureName.MOVEMENT, 'latest', {
    xrInput: xr.input,
    movementSpeed: 0.3,
    movementThreshold: 0.4,
    rotationSpeed: 0.5,
});
```