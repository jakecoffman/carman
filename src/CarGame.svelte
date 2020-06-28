<script>
  import Phaser from 'phaser'
  import DriveScene from './DriveScene'

  const config = {
    type: Phaser.AUTO,
    width: '100%',
    height: '100%',
    input: {
      gamepad: true
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: {y: 0}
      }
    },
    scale: {
      // mode: Phaser.Scale.FIT,
      // autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [DriveScene]
  }

  const game = new Phaser.Game(config)
</script>
