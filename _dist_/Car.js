import Phaser from "../web_modules/phaser.js";
import {gridsize, opposites, safetile} from "./utils.js";
export default class Car extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, controls, x, y, color) {
    const tile = scene.map.getTileAt(x, y);
    super(scene, tile.pixelX + 16, tile.pixelY + 16, "cars", color);
    this.scene = scene;
    this.controls = controls;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.speed = 150;
    this.threshold = 5;
    this.turnSpeed = 150;
    this.marker = new Phaser.Geom.Point();
    this.turnPoint = new Phaser.Geom.Point();
    this.directions = {};
    this.current = Phaser.UP;
    this.turning = Phaser.NONE;
    this.performingTurn = false;
  }
  update(args) {
    super.update(args);
    this.scene.physics.world.collide(this, this.scene.layer);
    if (this.performingTurn) {
      return;
    }
    this.marker = this.scene.map.worldToTileXY(this.x, this.y, true);
    this.directions[Phaser.LEFT] = this.scene.map.getTileAt(this.marker.x - 1, this.marker.y);
    this.directions[Phaser.RIGHT] = this.scene.map.getTileAt(this.marker.x + 1, this.marker.y);
    this.directions[Phaser.UP] = this.scene.map.getTileAt(this.marker.x, this.marker.y - 1);
    this.directions[Phaser.DOWN] = this.scene.map.getTileAt(this.marker.x, this.marker.y + 1);
    this.checkKeys();
    if (this.turning !== Phaser.NONE) {
      this.turn();
    }
  }
  checkKeys() {
    if (this.controls.left() && this.current !== Phaser.LEFT) {
      this.checkDirection(Phaser.LEFT);
    } else if (this.controls.right() && this.current !== Phaser.RIGHT) {
      this.checkDirection(Phaser.RIGHT);
    } else if (this.controls.up() && this.current !== Phaser.UP) {
      this.checkDirection(Phaser.UP);
    } else if (this.controls.down() && this.current !== Phaser.DOWN) {
      this.checkDirection(Phaser.DOWN);
    } else {
      this.turning = Phaser.NONE;
    }
  }
  checkDirection(turnTo) {
    if (this.directions[turnTo].index !== safetile) {
      return;
    }
    if (this.current === opposites(turnTo)) {
      this.move(turnTo);
    } else {
      this.turning = turnTo;
      this.turnPoint.x = this.marker.x * gridsize + gridsize / 2;
      this.turnPoint.y = this.marker.y * gridsize + gridsize / 2;
    }
  }
  turn() {
    const cx = Math.floor(this.x);
    const cy = Math.floor(this.y);
    if (!Phaser.Math.Fuzzy.Equal(cx, this.turnPoint.x, this.threshold) || !Phaser.Math.Fuzzy.Equal(cy, this.turnPoint.y, this.threshold)) {
      return false;
    }
    this.x = this.turnPoint.x;
    this.y = this.turnPoint.y;
    this.body.reset(this.turnPoint.x, this.turnPoint.y);
    this.move(this.turning);
    this.turning = Phaser.NONE;
    return true;
  }
  move(direction) {
    let speed = this.speed;
    if (direction === Phaser.LEFT || direction === Phaser.UP) {
      speed = -speed;
    }
    if (direction === Phaser.LEFT || direction === Phaser.RIGHT) {
      this.body.velocity.x = speed;
    } else {
      this.body.velocity.y = speed;
    }
    this.performingTurn = true;
    this.scene.tweens.add({
      targets: this,
      angle: this.getAngle(direction),
      duration: this.turnSpeed,
      ease: "Linear",
      onComplete: () => this.performingTurn = false
    });
    this.current = direction;
  }
  getAngle(to) {
    if (this.current === opposites(to)) {
      return this.angle - 180;
    }
    if (this.current === Phaser.UP && to === Phaser.LEFT || this.current === Phaser.LEFT && to === Phaser.DOWN || this.current === Phaser.DOWN && to === Phaser.RIGHT || this.current === Phaser.RIGHT && to === Phaser.UP) {
      return this.angle - 90;
    }
    return this.angle + 90;
  }
}
