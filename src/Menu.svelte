<script>
import Phaser from "phaser";

const carColors = 4

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({key: 'menu'})
    }

    preload() {
        this.load.spritesheet('cars', 'cars.png', { frameWidth: 32, frameHeight: 32 })
    }

    create() {
        this.playerText = [
            this.add.text(100, 100, ''),
            this.add.text(500, 100, ''),
            this.add.text(100, 500, ''),
            this.add.text(500, 500, '')
        ]
        this.players = []
        const startingPositions = [[132, 132], [532, 132], [132, 532], [532, 542]]
        for (let i=0; i < startingPositions.length; i++ ) {
            const pos = startingPositions[i]
            const player = {
                id: i,
                car: this.add.sprite(pos[0], pos[1], 'cars', i),
                color: i
            }
            this.players.push(player)
        }
        this.players.forEach(player => {
            player.car.setVisible(false)
        })
        this.controllerPoller = setInterval(() => {
            for (let pad of this.input.gamepad.gamepads) {
                if (!pad) {
                    continue
                }
                if (!this.players[pad.index].pad) {
                    this.initControllers(pad)
                }
            }
        }, 1000)

        this.input.gamepad.on('connected', pad => {
            console.log('connected callback', pad.index)
            this.initControllers(pad)
        })
        this.middleText = this.add.text(250, 250, `Press A on a gamepad or SPACE to play alone`)
        this.input.keyboard.once('keyup_SPACE', () => {
            this.scene.start('drive', {
                players: [{
                    keyboard: true,
                    color: Phaser.Math.RND.between(0, 3)
                }]
            })
        })

        this.allReady = false
        this.playing = false

        if (this.input.gamepad.gamepads.length > 0) {
            for (let pad of this.input.gamepad.gamepads) {
                this.initControllers(pad)
            }
        }

        this.input.gamepad.on('disconnected', pad => {
            console.log('pad', pad.index, 'disconnected')
            const player = this.players[pad.index]
            player.pad = pad
            player.joined = false
        })
    }

    initControllers(pad) {
        this.middleText.setText('')
        this.playerText[pad.index].setText('press A to join')
        const player = this.players[pad.index]
        player.pad = pad
        player.pad.on('down', (index, value, button) => {
            if (this.playing) {
                return
            }
            console.log('player', pad.index, 'pressed', index)
            if (index === 14 && !player.ready) {
                player.color--
                if (player.color < 0) {
                    player.color = carColors-1
                }
                const x = player.car.x
                const y = player.car.y
                player.car.destroy()
                player.car = this.add.sprite(x, y, 'cars', player.color)
            } else if (index === 15 && !player.ready) {
                player.color++
                if (player.color >= carColors) {
                    player.color = 0
                }
                const x = player.car.x
                const y = player.car.y
                player.car.destroy()
                player.car = this.add.sprite(x, y, 'cars', player.color)
            } else if (index === 1) { // index 0 is A index 1 is B
                if (player.ready) {
                    player.ready = false
                    this.allReady = false
                    this.middleText.setText('')
                    this.playerText[pad.index].setText('select car')
                    return
                }
                if (player.joined) {
                    player.joined = false
                    player.car.setVisible(false)
                    this.playerText[pad.index].setText('press A to join')
                    return
                }
            }
            if (index === 0) {
                if (!player.joined) {
                    player.joined = true
                    this.playerText[pad.index].setText('select car')
                    player.car.setVisible(true)
                    return
                }
                if (!player.ready) {
                    player.ready = true
                    this.playerText[pad.index].setText('waiting for others')
                    if (!this.players.some(p => p.joined && !p.ready)) {
                        this.allReady = true
                        this.middleText.setText('press A to play')
                    }
                    return
                }
                if (this.allReady) {
                    this.scene.launch('drive', {
                        players: this.players.filter(p => p.joined),
                        input: this.input
                    })
                    clearInterval(this.controllerPoller)
                    this.playing = true
                }
            }
        })
    }
}
</script>
