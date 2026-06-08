import createThreeSlide from '../three/createThreeSlide.js';

export default createThreeSlide({
  steps: [
    ({ spawnBall, animate }) => {
      const ball = spawnBall({
        color: 0xff0000,
        x: -2,
        fadeIn: true,
      });

      animate(() => {
        ball.rotation.y += 0.03;
      });
    },

    ({ spawnBall, animate }) => {
      const ball = spawnBall({
        color: 0x00ff00,
        x: 0,
        fadeIn: true,
      });

      animate(() => {
        ball.position.y = Math.sin(Date.now() * 0.003) * 0.5;
      });
    },

    ({ spawnBall }) => {
      spawnBall({
        color: 0x0000ff,
        x: 2,
        fadeIn: true,
      });
    },
  ],
});