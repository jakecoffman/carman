export function opposites(turnTo) {
  if (turnTo === Phaser.NONE) {
    return Phaser.NONE
  } else if (turnTo === Phaser.UP) {
    return Phaser.DOWN
  } else if (turnTo === Phaser.DOWN) {
    return Phaser.UP
  } else if (turnTo === Phaser.LEFT) {
    return Phaser.RIGHT
  } else if (turnTo === Phaser.RIGHT) {
    return Phaser.LEFT
  } else {
    throw `Unknown ${turnTo}`
  }
}
