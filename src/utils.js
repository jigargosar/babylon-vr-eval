import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector';

export function lineSegmentDistanceWithPoints(p1, q1, p2, q2) {
	// Calculate the closest distance between two 3D line segments and return closest points
	const d1 = q1.subtract(p1);
	const d2 = q2.subtract(p2);
	const r = p1.subtract(p2);

	const a = Vector3.Dot(d1, d1);
	const b = Vector3.Dot(d1, d2);
	const c = Vector3.Dot(d2, d2);
	const d = Vector3.Dot(d1, r);
	const e = Vector3.Dot(d2, r);

	// noinspection SpellCheckingInspection
	const denom = a * c - b * b;

	let t1, t2;

	if (denom < 0.000001) {
		// Lines are parallel
		t1 = 0;
		t2 = b > c ? d / b : e / c;
	} else {
		t1 = (b * e - c * d) / denom;
		t2 = (a * e - b * d) / denom;
	}

	// Clamp to segment bounds [0,1]
	t1 = Math.max(0, Math.min(1, t1));
	t2 = Math.max(0, Math.min(1, t2));

	// Calculate closest points
	const closest1 = p1.add(d1.scale(t1));
	const closest2 = p2.add(d2.scale(t2));

	return {
		distance: Vector3.Distance(closest1, closest2),
		point1: closest1,
		point2: closest2,
	};
}

export function createSparkParticleSystem(name, scene, glowLayer) {
	// Create master line mesh for sparks
	const sparkLineMaster = MeshBuilder.CreateCylinder(
		name + '_master',
		{ height: 0.03, diameter: 0.002 },
		scene,
	);

	// Create bright white emissive material
	const sparkMaterial = new StandardMaterial(name + '_material', scene);
	sparkMaterial.diffuseColor = new Color3(0, 0, 0);
	sparkMaterial.emissiveColor = new Color3(3, 3, 3);
	sparkLineMaster.material = sparkMaterial;

	// Hide master mesh
	sparkLineMaster.setEnabled(false);

	// Add to glow layer
	glowLayer.addIncludedOnlyMesh(sparkLineMaster);

	// Create spark instances pool
	const sparkInstances = [];
	const maxSparks = 100;

	for (let i = 0; i < maxSparks; i++) {
		const instance = sparkLineMaster.createInstance(`${name}_spark_${i}`);
		instance.setEnabled(false);
		sparkInstances.push({
			mesh: instance,
			active: false,
			startTime: 0,
			direction: new Vector3(0, 0, 0),
			lifetime: 0.3,
		});
	}

	// System state
	let isRunning = false;
	let emitterPosition = new Vector3(0, 0, 0);

	// Animation loop registration
	const animationCallback = () => {
		if (!isRunning) return;

		const currentTime = Date.now();

		// Update active sparks
		sparkInstances.forEach((spark) => {
			if (spark.active) {
				const elapsed = (currentTime - spark.startTime) / 1000;
				if (elapsed > spark.lifetime) {
					spark.active = false;
					spark.mesh.setEnabled(false);
				} else {
					// Move spark along its direction
					const distance = elapsed * 0.5; // Speed
					spark.mesh.position = emitterPosition.add(
						spark.direction.scale(distance),
					);
				}
			}
		});

		// Trigger multiple new sparks per frame
		for (let i = 0; i < 5; i++) {
			// Try to emit 5 sparks per frame
			const inactiveSpark = sparkInstances.find((s) => !s.active);
			if (inactiveSpark) {
				// Random outward direction
				const dir = new Vector3(
					(Math.random() - 0.5) * 2,
					(Math.random() - 0.5) * 2,
					(Math.random() - 0.5) * 2,
				).normalize();

				inactiveSpark.active = true;
				inactiveSpark.startTime = currentTime;
				inactiveSpark.direction = dir;
				inactiveSpark.mesh.position = emitterPosition;

				// Orient line along direction vector (cylinder Y-axis points along direction)
				const up = new Vector3(0, 1, 0);
				// noinspection UnnecessaryLocalVariableJS
				const rotationQuaternion = Quaternion.FromUnitVectorsToRef(
					up,
					dir,
					new Quaternion(),
				);
				inactiveSpark.mesh.rotationQuaternion = rotationQuaternion;
				inactiveSpark.mesh.setEnabled(true);
			}
		}
	};

	// ParticleSystem-compatible interface
	return {
		setEmitterPosition(position) {
			emitterPosition = position.clone();
		},
		ensureStarted() {
			if (!isRunning) {
				isRunning = true;
				scene.registerBeforeRender(animationCallback);
			}
		},
		ensureStopped() {
			if (isRunning) {
				isRunning = false;
				scene.unregisterBeforeRender(animationCallback);
				// Deactivate all sparks
				sparkInstances.forEach((spark) => {
					spark.active = false;
					spark.mesh.setEnabled(false);
				});
			}
		},
	};
}