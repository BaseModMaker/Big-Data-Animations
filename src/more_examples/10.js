import createThreeSlide from '../three/createThreeSlide.js';

export default createThreeSlide({
  steps: [
    ({ THREE, add, tween, camera }) => {
      const axisLength = 4;

      // Isometric-like camera view:
      // X -> bottom right, Y -> up, Z -> bottom left
      camera.position.set(6, 6, 6);
      camera.lookAt(0, 0, 0);

      function createTextSprite(text, color) {
        const canvas = document.createElement('canvas');
        const size = 128;
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, size, size);
        ctx.font = 'bold 64px Arial';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, size / 2, size / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          opacity: 0,
        });

        const sprite = new THREE.Sprite(material);
        sprite.scale.set(0.45, 0.45, 0.45);

        return sprite;
      }

      function createAxis(color, direction) {
        // Root object at origin so scaling makes it grow from the origin
        const axisRoot = new THREE.Group();

        const geometry = new THREE.CylinderGeometry(0.025, 0.025, axisLength, 16);
        const material = new THREE.MeshBasicMaterial({ color });
        const axisMesh = new THREE.Mesh(geometry, material);

        // Cylinder is centered, so move it half its length upward in local space
        axisMesh.position.y = axisLength / 2;
        axisRoot.add(axisMesh);

        // Rotate local Y to target direction
        const yAxis = new THREE.Vector3(0, 1, 0);
        axisRoot.quaternion.setFromUnitVectors(yAxis, direction.clone().normalize());

        // Start almost invisible and grow
        axisRoot.scale.y = 0.001;

        add(axisRoot);

        return axisRoot;
      }

      const xAxis = createAxis(0xff4444, new THREE.Vector3(1, 0, 0));
      const yAxis = createAxis(0x00ff00, new THREE.Vector3(0, 1, 0));
      const zAxis = createAxis(0x4488ff, new THREE.Vector3(0, 0, 1));

      tween({
        duration: 1000,
        onUpdate(progress) {
          xAxis.scale.y = progress;
          yAxis.scale.y = progress;
          zAxis.scale.y = progress;
        },
        onComplete() {
          const xLabel = createTextSprite('X', '#ff4444');
          const yLabel = createTextSprite('Y', '#00ff00');
          const zLabel = createTextSprite('Z', '#4488ff');

          xLabel.position.set(axisLength + 0.35, 0, 0);
          yLabel.position.set(0, axisLength + 0.35, 0);
          zLabel.position.set(0, 0, axisLength + 0.35);

          add(xLabel);
          add(yLabel);
          add(zLabel);

          tween({
            duration: 600,
            onUpdate(progress) {
              xLabel.material.opacity = progress;
              yLabel.material.opacity = progress;
              zLabel.material.opacity = progress;
            },
          });
        },
      });
    },

    ({ THREE, add, tween }) => {
      const width = 4;
      const depth = 4;
      const segments = 40;

      const geometry = new THREE.PlaneGeometry(width, depth, segments, segments);
      geometry.rotateX(-Math.PI / 2);

      const positions = geometry.attributes.position;

      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);

        const distance = Math.sqrt(x * x + z * z);
        const y = Math.sin(distance * 3) * 0.35;

        positions.setY(i, y);
      }

      positions.needsUpdate = true;
      geometry.computeVertexNormals();

      const material = new THREE.MeshBasicMaterial({
        color: 0x44aaff,
        transparent: true,
        opacity: 0,
        wireframe: true,
      });

      const surface = new THREE.Mesh(geometry, material);

      surface.position.set(2, 0, 2);
      surface.scale.setScalar(0.001);

      add(surface);

      tween({
        duration: 1200,
        onUpdate(progress) {
          surface.scale.setScalar(progress);
          material.opacity = progress;
        },
      });
    },

    ({ THREE, add, tween }) => {
      const points = [
        { x: 0.3, z: 0.6 },
        { x: 0.8, z: 1.4 },
        { x: 1.4, z: 2.1 },
        { x: 2.0, z: 0.9 },
        { x: 2.7, z: 2.5 },
        { x: 3.3, z: 1.6 },
      ];

      points.forEach((point, index) => {
        setTimeout(() => {
          const distance = Math.sqrt(
            (point.x - 2) * (point.x - 2) +
            (point.z - 2) * (point.z - 2)
          );

          const y = Math.sin(distance * 3) * 0.35;

          const geometry = new THREE.SphereGeometry(0.1, 24, 24);
          const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0,
          });

          const sphere = new THREE.Mesh(geometry, material);

          sphere.position.set(point.x, 0, point.z);
          sphere.scale.setScalar(0.001);

          add(sphere);

          tween({
            duration: 600,
            onUpdate(progress) {
              sphere.position.y = y * progress;
              sphere.scale.setScalar(progress);
              material.opacity = progress;
            },
          });
        }, index * 200);
      });
    },
  ],
});