import Car from "./Car";
import {randomSafeTile, tints} from "./utils";
import Phaser from "phaser";
import Pellet from "./Pellet";

export default class DriveScene extends Phaser.Scene {
    constructor() {
        super({key: 'drive'})
    }

    preload() {
        this.load.tilemapTiledJSON('map', 'maze.json')
        this.load.image('tiles', 'tiles.png')
        this.load.image('car', 'car.png')
        this.load.atlas('heart', 'heart-sheet.png', 'heart-sheet.json')
    }

    create(data) {
        this.anims.create({
            key: 'spin',
            frames: this.anims.generateFrameNames('heart'),
            frameRate: 10,
            repeat: -1
        });
        this.map = this.add.tilemap('map')
        const tileset = this.map.addTilesetImage('tiles', 'tiles')
        this.layer = this.map.createDynamicLayer('Tile Layer 1', tileset)

        this.map.setCollision(20, true, this.layer)

        this.hoverText = this.add.text(100, 100, ``)

        const startingPositions = [{
            position: [1, 1],
            move: Phaser.DOWN,
            angle: 0,
        }, {
            position: [18, 13],
            move: Phaser.UP,
            angle: -90,
        },{
            position: [18, 1],
            move: Phaser.LEFT,
            angle: 0,
        },{
            position: [1, 13],
            move: Phaser.RIGHT,
            angle: 0,
        }]
        let cur = 0

        this.cars = []

        for (let p of data.players) {
            let controls
            if (p.keyboard) {
                const keys = this.input.keyboard.addKeys({
                    up: Phaser.Input.Keyboard.KeyCodes.UP,
                    down: Phaser.Input.Keyboard.KeyCodes.DOWN,
                    left: Phaser.Input.Keyboard.KeyCodes.LEFT,
                    right: Phaser.Input.Keyboard.KeyCodes.RIGHT
                })
                controls = {
                    up() { return keys.up.isDown },
                    down() { return keys.down.isDown },
                    left() { return keys.left.isDown },
                    right() { return keys.right.isDown },
                }
            } else {
                controls = {
                    up() {
                        const yAxis = p.pad.getAxisValue(1)
                        if (yAxis < -.5) {
                            return true
                        }
                        return p.pad.up
                    },
                    down() {
                        const yAxis = p.pad.getAxisValue(1)
                        if (yAxis > .5) {
                            return true
                        }
                        return p.pad.down
                    },
                    left() {
                        const xAxis = p.pad.getAxisValue(0)
                        if (xAxis < -.5) {
                            return true
                        }
                        return p.pad.left
                    },
                    right() {
                        const xAxis = p.pad.getAxisValue(0)
                        if (xAxis > .5) {
                            return true
                        }
                        return p.pad.right
                    },
                }
            }
            const starting = startingPositions[cur]
            cur++
            const car = new Car(this, controls, starting.position[0], starting.position[1])
            car.tint = tints[p.color]
            car.angle = starting.angle
            car.move(starting.move)
            this.cars.push(car)
        }

        this.pellet = new Pellet(this)

        // this.cameras.main.startFollow(this.car, true)
        this.cameras.main.setBounds(0, 0, this.layer.width, this.layer.height)
        this.cameras.main.setZoom(1.5)
    }

    update(time, dt) {
        for (let car of this.cars) {
            car.update(time, dt)
        }
        this.pellet.update()
        for (let car1 of this.cars) {
            for (let car2 of this.cars) {
                if (car1 === car2) {
                    continue
                }
                this.physics.world.collide(car1, car2, (car1, car2) => {
                    // TODO come up with a good collision result, maybe moves the cars back one space?
                    // car1.move(opposites(car1.current))
                    // car2.move(opposites(car2.current))
                })
            }
            this.physics.world.collide(this.pellet, car1, () => {}, () => {
                const tile = randomSafeTile(this.map)
                this.pellet.x = tile.pixelX+16
                this.pellet.y = tile.pixelY+16
                return false
            })
        }

        const mouseX = this.input.mousePointer.worldX
        const mouseY = this.input.mousePointer.worldY
        const tile = this.map.getTileAtWorldXY(mouseX, mouseY)
        if (tile) {
            this.hoverText.x = mouseX + 5
            this.hoverText.y = mouseY + 10
            this.hoverText.setText(`${tile.x}, ${tile.y}`)
        }
    }
}