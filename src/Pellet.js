import Phaser from "phaser";

export default class Pellet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene) {
        let x, y, tile
        do {
            x = Phaser.Math.RND.between(0, scene.map.width-1)
            y = Phaser.Math.RND.between(0, scene.map.height-1)
            tile = scene.map.getTileAt(x, y)
        } while (tile.index !== 1)

        super(scene, tile.pixelX + 16, tile.pixelY + 16, "dot")

        scene.add.existing(this)
        scene.physics.add.existing(this)
    }

    update(args) {
        super.update(args)
    }
}
