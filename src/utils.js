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

export const tints = [
  0xFFFFFF,
  0x00FF00,
  0xaaaaFF,
  0xccFF00,
  0x00ccAA,
]
