import Phaser from 'phaser'
import {opposites} from "./utils";

export default class Car extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, controls, x, y) {
    const tile = scene.map.getTileAt(x, y)
    super(scene, tile.pixelX+16, tile.pixelY+16, "car")

    this.scene = scene
    this.controls = controls

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.speed = 150
    this.threshold = 5
    this.turnSpeed = 150

    this.marker = new Phaser.Geom.Point()
    this.turnPoint = new Phaser.Geom.Point()

    this.directions = {}

    this.current = Phaser.UP
    this.turning = Phaser.NONE
    // prevents partial rotations
    this.performingTurn = false
  }

  update(args) {
    super.update(args)

    this.scene.physics.world.collide(this, this.scene.layer)

    // this.marker.x = this.math.snapToFloor(Math.floor(this.x), this.scene.gridsize) / this.scene.gridsize
    // this.marker.y = this.math.snapToFloor(Math.floor(this.y), this.scene.gridsize) / this.scene.gridsize

    //  Update our grid sensors
    // this.directions[1] = this.scene.map.getTileLeft(this.scene.layer.index, this.marker.x, this.marker.y)
    // this.directions[2] = this.scene.map.getTileRight(this.scene.layer.index, this.marker.x, this.marker.y)
    // this.directions[3] = this.scene.map.getTileAbove(this.scene.layer.index, this.marker.x, this.marker.y)
    // this.directions[4] = this.scene.map.getTileBelow(this.scene.layer.index, this.marker.x, this.marker.y)

    if (this.performingTurn) {
      return
    }

    this.scene.map.worldToTileXY(this.x, this.y, true, this.marker)
    // this.marker.y = this.scene.map.worldToTileY(this.y, true)

    this.directions[Phaser.LEFT] = this.scene.map.getTileAt(this.marker.x - 1, this.marker.y)
    this.directions[Phaser.RIGHT] = this.scene.map.getTileAt(this.marker.x + 1, this.marker.y)
    this.directions[Phaser.UP] = this.scene.map.getTileAt(this.marker.x, this.marker.y-1)
    this.directions[Phaser.DOWN] = this.scene.map.getTileAt(this.marker.x, this.marker.y+1)

    this.checkKeys()

    if (this.turning !== Phaser.NONE) {
      this.turn()
    }

  }

  checkKeys() {
    if (this.controls.left() && this.current !== Phaser.LEFT) {
      this.checkDirection(Phaser.LEFT)
    } else if (this.controls.right() && this.current !== Phaser.RIGHT) {
      this.checkDirection(Phaser.RIGHT)
    } else if (this.controls.up() && this.current !== Phaser.UP) {
      this.checkDirection(Phaser.UP)
    } else if (this.controls.down() && this.current !== Phaser.DOWN) {
      this.checkDirection(Phaser.DOWN)
    } else {
      //  This forces them to hold the key down to turn the corner
      this.turning = Phaser.NONE
    }
  }

  checkDirection(turnTo) {
    if (this.directions[turnTo].index !== this.scene.safetile) {
      //  Invalid direction if they're already set to turn that way
      //  Or there is no tile there, or the tile isn't index a floor tile
      return
    }

    //  Check if they want to turn around and can
    if (this.current === opposites(turnTo)) {
      this.move(turnTo)
    } else {
      this.turning = turnTo

      this.turnPoint.x = (this.marker.x * this.scene.gridsize) + (this.scene.gridsize / 2)
      this.turnPoint.y = (this.marker.y * this.scene.gridsize) + (this.scene.gridsize / 2)
    }
  }

  turn() {
    const cx = Math.floor(this.x)
    const cy = Math.floor(this.y)

    //  This needs a threshold, because at high speeds you can't turn because the coordinates skip past
    if (!Phaser.Math.Fuzzy.Equal(cx, this.turnPoint.x, this.threshold) ||
        !Phaser.Math.Fuzzy.Equal(cy, this.turnPoint.y, this.threshold)) {
      return false
    }

    this.x = this.turnPoint.x
    this.y = this.turnPoint.y

    this.body.reset(this.turnPoint.x, this.turnPoint.y)

    this.move(this.turning)

    this.turning = Phaser.NONE

    return true
  }

  move(direction) {
    let speed = this.speed

    if (direction === Phaser.LEFT || direction === Phaser.UP) {
      speed = -speed
    }

    if (direction === Phaser.LEFT || direction === Phaser.RIGHT) {
      this.body.velocity.x = speed
    } else {
      this.body.velocity.y = speed
    }

    this.performingTurn = true
    // this.add.tween(this).to({angle: this.getAngle(direction)}, this.turnSpeed, "Linear", true)
    this.scene.tweens.add({
      targets: this,
      angle: this.getAngle(direction),
      duration: this.turnSpeed,
      ease: 'Linear',
      onComplete: () => this.performingTurn = false
    })

    this.current = direction
  }

  getAngle(to) {
    // if (to === Phaser.UP) {
    //   return 0
    // }
    // if (to === Phaser.DOWN) {
    //   return 180
    // }
    // if (to === Phaser.LEFT) {
    //   return -90
    // }
    // if (to === Phaser.RIGHT) {
    //   return 90
    // }
    //
    //  About-face?
    if (this.current === opposites(to)) {
      return this.angle - 180
    }
    if ((this.current === Phaser.UP && to === Phaser.LEFT) ||
        (this.current === Phaser.DOWN && to === Phaser.RIGHT) ||
        (this.current === Phaser.LEFT && to === Phaser.DOWN) ||
        (this.current === Phaser.RIGHT && to === Phaser.UP)) {
      return this.angle - 90
    }
    return this.angle + 90
  }
}
