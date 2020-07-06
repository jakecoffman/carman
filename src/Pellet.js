import Phaser from "phaser";
import {randomSafeTile} from "./utils";

export default class Pellet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene) {
        const tile = randomSafeTile(scene.map)
        super(scene, tile.pixelX + 16, tile.pixelY + 16, "heart")

        this.play('spin')

        scene.add.existing(this)
        scene.physics.add.existing(this)
    }

    update(args) {
        super.update(args)
    }
}
