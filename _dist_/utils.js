import Phaser from "../web_modules/phaser.js";
export function opposites(turnTo) {
  if (turnTo === Phaser.NONE) {
    return Phaser.NONE;
  } else if (turnTo === Phaser.UP) {
    return Phaser.DOWN;
  } else if (turnTo === Phaser.DOWN) {
    return Phaser.UP;
  } else if (turnTo === Phaser.LEFT) {
    return Phaser.RIGHT;
  } else if (turnTo === Phaser.RIGHT) {
    return Phaser.LEFT;
  } else {
    throw `Unknown ${turnTo}`;
  }
}
export const safetile = 1;
export const gridsize = 32;
export function randomSafeTile(map) {
  let x, y, tile;
  do {
    x = Phaser.Math.RND.between(0, map.width - 1);
    y = Phaser.Math.RND.between(0, map.height - 1);
    tile = map.getTileAt(x, y);
  } while (tile.index !== safetile);
  return tile;
}
