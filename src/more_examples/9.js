import createThreeSlide from '../three/createThreeSlide.js';

const points = [
  { x: 1.0, y: 1.5, z: 0.5 },
  { x: 2.0, y: 0.8, z: 1.4 },
  { x: 1.3, y: 2.4, z: 2.2 },
  { x: 2.8, y: 1.2, z: 1.8 },
  { x: 3.2, y: 2.7, z: 0.9 },
];

export default createThreeSlide({
  cameraZ: 8,

  steps: [
    ({ THREE, add, tween }) => {
      const axisLength = 4;

      function createAxis(color, rotationZ = 0, rotationY = 0) {
        const geometry = new THREE.CylinderGeometry(0.025, 0.025, axisLength, 16);
        const material = new THREE.MeshBasicMaterial({ color });

        const axis = new THREE.Mesh(geometry, material);

        axis.position.y = axisLength / 2;
        axis.rotation.z = rotationZ;
        axis.rotation.y = rotationY;
        axis.scale.y = 0.001;

        add(axis);

        tween({
          duration: 1000,
          onUpdate(progress) {
            axis.scale.y = progress;
          },
        });

        return axis;
      }

      // Y axis
      createAxis(0x00ff00);

      // X axis
      createAxis(0xff4444, -Math.PI / 2);

      // Z axis
      createAxis(0x4488ff, 0, Math.PI / 2);
    },

    ({ THREE, add, tween }) => {
      points.forEach((point, index) => {
        setTimeout(() => {
          const geometry = new THREE.SphereGeometry(0.12, 24, 24);
          const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0,
          });

          const sphere = new THREE.Mesh(geometry, material);

          sphere.position.set(0, 0, 0);
          sphere.scale.setScalar(0.001);

          add(sphere);

          tween({
            duration: 700,
            onUpdate(progress) {
              sphere.position.set(
                point.x * progress,
                point.y * progress,
                point.z * progress
              );

              sphere.scale.setScalar(progress);
              material.opacity = progress;
            },
          });
        }, index * 250);
      });
    },
  ],
});