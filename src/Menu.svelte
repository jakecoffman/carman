<script>
  import Phaser from "phaser";
  import Drive from "./Drive.svelte";

  export let game

  const carColors = 4
  export let players = []

  let middleText = `Press A on a gamepad or SPACE to play alone`

  class MenuScene extends Phaser.Scene {
    constructor() {
      super({key: 'menu'})
    }

    preload() {
      this.load.spritesheet('cars', 'cars.png', {frameWidth: 32, frameHeight: 32})
    }

    create() {
      this.playerText = [
        this.add.text(100, 100, ''),
        this.add.text(500, 100, ''),
        this.add.text(100, 500, ''),
        this.add.text(500, 500, '')
      ]
      players = []
      const startingPositions = [[132, 132], [532, 132], [132, 532], [532, 542]]
      for (let i = 0; i < startingPositions.length; i++) {
        const pos = startingPositions[i]
        const player = {
          id: i,
          car: this.add.sprite(pos[0], pos[1], 'cars', i),
          keyboard: false,
          pad: null,
          color: i,
          joined: false,
          ready: false,
          score: 0
        }
        players.push(player)
      }
      players.forEach(player => {
        player.car.setVisible(false)
      })
      players = players
      this.controllerPoller = setInterval(() => {
        for (let pad of this.input.gamepad.gamepads) {
          if (!pad) {
            continue
          }
          if (!players[pad.index].pad) {
            this.initControllers(pad)
          }
        }
      }, 1000)

      this.input.gamepad.on('connected', pad => {
        console.log('connected callback', pad.index)
        this.initControllers(pad)
      })

      this.input.keyboard.once('keyup_SPACE', () => {
        middleText = ''
        players = [{
          id: 0,
          keyboard: true,
          color: Phaser.Math.RND.between(0, 3),
          joined: true,
          ready: true,
          score: 0
        }]
        this.scene.start('drive', {players})
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
        players[pad.index].pad = pad
        players[pad.index].joined = false
      })
    }

    initControllers(pad) {
      middleText = ''
      this.playerText[pad.index].setText('press A to join')
      const player = players[pad.index]
      player.pad = pad
      player.pad.on('down', (index, value, button) => {
        if (this.playing) {
          return
        }
        console.log('player', pad.index, 'pressed', index)
        if (index === 14 && !player.ready) {
          player.color--
          if (player.color < 0) {
            player.color = carColors - 1
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
        } else if (index === 1) { // B
          if (player.ready) {
            player.ready = false
            this.allReady = false
            middleText = ''
            this.playerText[pad.index].setText('select car')
          } else if (player.joined) {
            player.joined = false
            player.car.setVisible(false)
            this.playerText[pad.index].setText('press A to join')
          }
        } else if (index === 0) { // A
          if (!player.joined) {
            player.joined = true
            this.playerText[pad.index].setText('select car')
            player.car.setVisible(true)
          } else if (!player.ready) {
            player.ready = true
            this.playerText[pad.index].setText('waiting for others')
            if (!players.some(p => p.joined && !p.ready)) {
              this.allReady = true
              middleText = 'press A to play'
            }
          } else if (this.allReady) {
            middleText = ''
            this.scene.launch('drive', {
              players: players.filter(p => p.joined),
              input: this.input
            })
            clearInterval(this.controllerPoller)
            this.playing = true
          }
        }
        // tell svelte to react
        players[pad.index] = player
      })
    }
  }

  game.scene.add('menu', MenuScene, true)

  function getColor(player) {
    if (player.color === 0) {
      return 'red'
    }
    if (player.color === 1) {
      return 'purple'
    }
    if (player.color === 2) {
      return 'green'
    }
    if (player.color === 3) {
      return 'blue'
    }
  }
</script>

<ul>
{#each players as player}
  {#if player.joined}
    <li class={getColor(player)}>
      <div>Player {player.id+1}</div>
      <div>Score {player.score}</div>
    </li>
  {/if}
{/each}
</ul>

<p class="middle-text">{middleText}</p>

<Drive {game} bind:players={players}/>

<style>
  ul {
    list-style: none;
    font-size: 16pt;
    padding: 0;
    margin: 1rem;

    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;

    display: grid;
    grid-template-columns: auto auto;
    justify-content: space-between;
    align-content: space-between;
  }

  li {
    padding: 1rem;
    border: 1px solid;
    border-radius: 5px;
    opacity: .7;
  }

  .red {
    /*border-color: red;*/
    background: red;
  }

  .green {
    /*border-color: #207d20;*/
    background: #207d20;
  }

  .blue {
    /*border-color: #3c3cf8;*/
    background: #3c3cf8;
  }

  .purple {
    /*border-color: #8b578b;*/
    background: #8b578b;
  }

  .middle-text {
    position: absolute;
    left: 0;
    top: 50%;
    width: 100%;
    height: 100%;
    text-align: center;
    color: white;
  }
</style>