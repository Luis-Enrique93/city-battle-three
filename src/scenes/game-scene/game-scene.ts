import type { IScene, ISceneManager } from '../../core/scene-manager'
import type { Renderer } from '../../core/renderer'
import type { IEventSubscriber, GameEvent } from '../../core/event-manager'
import { EventManager } from '../../core/event-manager'
import { Keyboard } from '../../core/keyboard'
import { Tank } from '../../game-objects/tank'
import { SpriteDirection } from '../../sprites/sprite'
import { Globals } from '../../core/globals'
import { STAGES } from '../../core/stages'
import { MapLoader } from '../../core/map-loader'
import { SpriteContainer } from '../../core/sprite-container'
import { CollisionDetector } from '../../core/collision-detector'
import { BulletFactory } from '../../core/bullet-factory'
import { BulletExplosionFactory } from '../../core/bullet-explosion-factory'
import { TankExplosionFactory } from '../../core/tank-explosion-factory'
import { PointsFactory } from '../../core/points-factory'
import { EnemyFactory, EnemyFactoryEvent } from '../../core/enemy-factory'
import { AITankControllerContainer } from '../../core/ai-tank-controller-container'
import { AITankControllerFactory } from '../../core/ai-tank-controller-factory'
import { Player, PlayerEvent } from '../../core/player'
import {
  PlayerTankFactory,
  PlayerTankFactoryEvent,
} from '../../core/player-tank-factory'
import { Rect } from '../../geometry/rect'
import { Point } from '../../geometry'
import * as THREE from 'three'
import { PowerUpFactory } from '../../core/power-up-factory'
import { PowerUpHandler } from '../../core/power-up-handler'
import { FreezeTimer } from '../../core/freeze-timer'
import { ShovelHandler } from '../../core/shovel-handler'
import { BaseWallBuilder } from '../../core/base-wall-builder'
import { LivesView } from '../../ui/lives-view/lives-view'
import { EnemyFactoryView } from '../../ui/enemy-factory-view/enemy-factory-view'
import { StageFlag } from '../../ui/stage-flag/stage-flag'
import { StageMessage } from '../../ui/stage-message/stage-message'
import { Curtain } from '../../ui/curtain/curtain'
import { Script } from '../../core/script/script'
import { Delay } from '../../core/script/delay'
import { SoundManager } from '../../core/sound-manager'

export class GameScene implements IScene, IEventSubscriber {
  private threeScene: THREE.Scene
  private sceneManager: ISceneManager
  private tank: Tank | null = null
  private mapLoader: MapLoader | null = null
  private backgroundPlane: THREE.Mesh | null = null
  private pressedKeys: Set<number> = new Set()
  private spriteContainer: SpriteContainer
  private enemyFactory: EnemyFactory
  private aiControllersContainer: AITankControllerContainer
  private player: Player
  private playerTankFactory: PlayerTankFactory
  private powerUpFactory: PowerUpFactory
  private freezeTimer: FreezeTimer
  private shovelHandler: ShovelHandler
  private currentStage: number
  private livesView: LivesView | null = null
  private enemyFactoryView: EnemyFactoryView | null = null
  private stageFlag: StageFlag | null = null
  private curtain!: Curtain
  private stageMessage!: StageMessage
  private script!: Script
  private levelVisible: boolean = false

  constructor(
    sceneManager: ISceneManager,
    threeScene: THREE.Scene,
    stage = 1,
    player?: Player,
  ) {
    this.threeScene = threeScene
    this.sceneManager = sceneManager
    this.currentStage = stage

    const eventManager = sceneManager.getEventManager()
    eventManager.addSubscriber(this, [
      Keyboard.Event.KEY_PRESSED,
      Keyboard.Event.KEY_RELEASED,
      EnemyFactoryEvent.LAST_ENEMY_DESTROYED,
      PlayerEvent.OUT_OF_LIVES,
      PlayerTankFactoryEvent.PLAYER_TANK_CREATED,
    ])

    // Usar player existente o crear uno nuevo (como en el original)
    this.player = player === undefined ? new Player() : player
    this.player.setEventManager(eventManager)

    // Crear PlayerTankFactory para respawn
    this.playerTankFactory = new PlayerTankFactory(
      eventManager,
      this.threeScene,
    )
    const gameFieldX = Globals.UNIT_SIZE
    const gameFieldY = Globals.TILE_SIZE
    const spawnPosition = new Point(
      gameFieldX + 4 * Globals.UNIT_SIZE,
      gameFieldY + 12 * Globals.UNIT_SIZE,
    )
    this.playerTankFactory.setAppearPosition(spawnPosition)

    // Crear SpriteContainer y CollisionDetector
    this.spriteContainer = new SpriteContainer(eventManager)
    const gameFieldBounds = new Rect(
      Globals.UNIT_SIZE,
      Globals.TILE_SIZE,
      13 * Globals.UNIT_SIZE,
      13 * Globals.UNIT_SIZE,
    )
    new CollisionDetector(eventManager, gameFieldBounds, this.spriteContainer)

    // Crear BulletFactory y BulletExplosionFactory
    new BulletFactory(eventManager, this.threeScene)
    new BulletExplosionFactory(eventManager, this.threeScene)
    new TankExplosionFactory(eventManager, this.threeScene)
    new PointsFactory(eventManager, this.threeScene)
    this.powerUpFactory = new PowerUpFactory(eventManager, this.threeScene)
    const powerUpHandler = new PowerUpHandler(eventManager, this.threeScene)
    powerUpHandler.setSpriteContainer(this.spriteContainer)
    this.freezeTimer = new FreezeTimer(eventManager)
    this.shovelHandler = new ShovelHandler(eventManager)

    // Crear sistema de enemigos
    this.aiControllersContainer = new AITankControllerContainer(eventManager)
    const aiControllerFactory = new AITankControllerFactory(
      eventManager,
      this.spriteContainer,
    )
    aiControllerFactory.setControllersContainer(this.aiControllersContainer)
    this.enemyFactory = new EnemyFactory(eventManager, this.threeScene)

    this.createBackground()
    this.loadMap(eventManager, stage)
    // Configurar BaseWallBuilder para ShovelHandler
    this.setupBaseWallBuilder(eventManager)
    // Crear tanque inicial del jugador
    this.playerTankFactory.create()
    this.setupEnemyFactory(stage)

    // Crear contenedor UI moderno
    this.createUIContainer()

    // Crear componentes UI
    this.livesView = new LivesView(this.player)
    this.enemyFactoryView = new EnemyFactoryView(this.enemyFactory)
    this.stageFlag = new StageFlag(stage)

    // Crear Curtain y StageMessage (como en el original)
    this.curtain = new Curtain()
    this.stageMessage = new StageMessage(this.currentStage)

    // Crear Script para secuenciar la animación inicial (como en el original)
    this.script = new Script()
    this.script.enqueue({
      update: () => {
        this.curtain.fall()
        if (this.curtain.isFallen()) {
          this.script.actionCompleted()
        }
      },
    })
    this.script.enqueue({
      execute: () => {
        this.stageMessage.show()
        SoundManager.getInstance().play('stage_start')
      },
    })
    this.script.enqueue(new Delay(this.script, 60))
    this.script.enqueue({
      execute: () => {
        this.stageMessage.hide()
        this.levelVisible = true
      },
    })
    this.script.enqueue({
      update: () => {
        this.curtain.rise()
        if (this.curtain.isRisen()) {
          this.script.actionCompleted()
        }
      },
    })
    // Después de que la cortina suba, el nivel continúa normalmente
    this.script.enqueue({
      execute: () => {
        // El nivel ya está visible y funcionando
      },
    })
  }

  private setupBaseWallBuilder(eventManager: EventManager): void {
    // Base está en (224, 400) según el mapa
    // Muros alrededor de la base (8 posiciones) - usar posiciones absolutas del mapa
    const baseWallBuilder = new BaseWallBuilder()
    baseWallBuilder.setWallPositions([
      new Point(208, 416), // Izquierda abajo
      new Point(208, 400), // Izquierda centro
      new Point(208, 384), // Izquierda arriba
      new Point(224, 384), // Centro arriba
      new Point(240, 384), // Centro-derecha arriba
      new Point(256, 384), // Derecha arriba
      new Point(256, 400), // Derecha centro
      new Point(256, 416), // Derecha abajo
    ])
    baseWallBuilder.setSpriteContainer(this.spriteContainer)
    baseWallBuilder.setEventManager(eventManager)
    baseWallBuilder.setThreeScene(this.threeScene)
    this.shovelHandler.setBaseWallBuilder(baseWallBuilder)
  }

  private createBackground(): void {
    const grayGeometry = new THREE.PlaneGeometry(
      Globals.CANVAS_WIDTH,
      Globals.CANVAS_HEIGHT,
    )
    const grayMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 })
    const grayPlane = new THREE.Mesh(grayGeometry, grayMaterial)
    grayPlane.position.set(0, 0, -10)
    this.threeScene.add(grayPlane)

    const gameFieldX = Globals.UNIT_SIZE
    const gameFieldY = Globals.TILE_SIZE
    const gameFieldW = 13 * Globals.UNIT_SIZE
    const gameFieldH = 13 * Globals.UNIT_SIZE

    const blackGeometry = new THREE.PlaneGeometry(gameFieldW, gameFieldH)
    const blackMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
    this.backgroundPlane = new THREE.Mesh(blackGeometry, blackMaterial)
    const x = gameFieldX + gameFieldW / 2 - Globals.CANVAS_WIDTH / 2
    const y = Globals.CANVAS_HEIGHT / 2 - gameFieldY - gameFieldH / 2
    this.backgroundPlane.position.set(x, y, -9)
    this.threeScene.add(this.backgroundPlane)
  }

  private loadMap(eventManager: EventManager, stage: number): void {
    const stageData = STAGES[(stage - 1) % STAGES.length]
    this.mapLoader = new MapLoader(eventManager, this.threeScene)
    this.mapLoader.loadMap(stageData.map)
  }

  private updatePlayerTankReference(): void {
    // Buscar el tanque del jugador en el sprite container
    const tanks = this.spriteContainer.getTanks()
    const playerTank = tanks.find((tank: Tank) => tank.isPlayer())
    if (playerTank) {
      this.tank = playerTank
    }
  }

  private setupEnemyFactory(stage: number): void {
    const stageData = STAGES[(stage - 1) % STAGES.length]
    const gameFieldX = Globals.UNIT_SIZE
    const gameFieldY = Globals.TILE_SIZE

    // Posiciones de spawn de enemigos (arriba del mapa)
    this.enemyFactory.setPositions([
      new Point(gameFieldX + 6 * Globals.UNIT_SIZE, gameFieldY),
      new Point(gameFieldX + 12 * Globals.UNIT_SIZE, gameFieldY),
      new Point(gameFieldX, gameFieldY),
    ])

    this.enemyFactory.setEnemies(stageData.tanks)
    this.enemyFactory.setEnemyCountLimit(4)

    // Posiciones donde pueden aparecer power-ups (grid 4x4 como en el original)
    // Usar los mismos offsets que el original (+15, +17) para evitar muros
    const powerUpCol1X = gameFieldX + Globals.UNIT_SIZE + 15
    const powerUpCol2X = gameFieldX + 4 * Globals.UNIT_SIZE + 15
    const powerUpCol3X = gameFieldX + 7 * Globals.UNIT_SIZE + 15
    const powerUpCol4X = gameFieldX + 10 * Globals.UNIT_SIZE + 15

    const powerUpRow1Y = gameFieldY + Globals.UNIT_SIZE + 17
    const powerUpRow2Y = gameFieldY + 4 * Globals.UNIT_SIZE + 17
    const powerUpRow3Y = gameFieldY + 7 * Globals.UNIT_SIZE + 17
    const powerUpRow4Y = gameFieldY + 10 * Globals.UNIT_SIZE + 17

    this.powerUpFactory.setPositions([
      new Point(powerUpCol1X, powerUpRow1Y),
      new Point(powerUpCol2X, powerUpRow1Y),
      new Point(powerUpCol3X, powerUpRow1Y),
      new Point(powerUpCol4X, powerUpRow1Y),
      new Point(powerUpCol1X, powerUpRow2Y),
      new Point(powerUpCol2X, powerUpRow2Y),
      new Point(powerUpCol3X, powerUpRow2Y),
      new Point(powerUpCol4X, powerUpRow2Y),
      new Point(powerUpCol1X, powerUpRow3Y),
      new Point(powerUpCol2X, powerUpRow3Y),
      new Point(powerUpCol3X, powerUpRow3Y),
      new Point(powerUpCol4X, powerUpRow3Y),
      new Point(powerUpCol1X, powerUpRow4Y),
      new Point(powerUpCol2X, powerUpRow4Y),
      new Point(powerUpCol3X, powerUpRow4Y),
      new Point(powerUpCol4X, powerUpRow4Y),
    ])
  }

  public update(): void {
    // Actualizar Script primero (como en el original)
    this.script.update()

    // Si el nivel no es visible aún, no actualizar el juego
    if (!this.levelVisible) {
      return
    }

    // Actualizar referencia al tanque del jugador (por si respawneó)
    this.updatePlayerTankReference()

    // Actualizar todos los sprites del contenedor
    const sprites = this.spriteContainer.getSprites()
    for (const sprite of sprites) {
      sprite.update()
    }

    // Actualizar sistema de enemigos
    this.enemyFactory.update()
    this.aiControllersContainer.update()
    this.freezeTimer.update()
    this.shovelHandler.update()

    // Actualizar UI
    if (this.livesView) {
      this.livesView.update()
    }
    if (this.enemyFactoryView) {
      this.enemyFactoryView.update()
    }
  }

  public draw(_renderer: Renderer): void {
    // El renderizado se hace automáticamente por Three.js
  }

  private createUIContainer(): void {
    // Crear contenedor UI si no existe
    let uiContainer = document.querySelector(
      '.game-ui-container',
    ) as HTMLDivElement
    if (!uiContainer) {
      uiContainer = document.createElement('div')
      uiContainer.className = 'game-ui-container'
      document.body.appendChild(uiContainer)
    }
  }

  public destroy(): void {
    // Limpiar componentes UI
    if (this.livesView) {
      this.livesView.destroy()
      this.livesView = null
    }
    if (this.enemyFactoryView) {
      this.enemyFactoryView.destroy()
      this.enemyFactoryView = null
    }
    if (this.stageFlag) {
      this.stageFlag.destroy()
      this.stageFlag = null
    }
    if (this.stageMessage) {
      this.stageMessage.destroy()
    }
    if (this.curtain) {
      this.curtain.destroy()
    }
    // Limpiar contenedor UI si está vacío
    const uiContainer = document.querySelector('.game-ui-container')
    if (uiContainer && uiContainer.children.length === 0) {
      uiContainer.remove()
    }
  }

  public notify(event: GameEvent): void {
    if (event.name === EnemyFactoryEvent.LAST_ENEMY_DESTROYED) {
      this.handleWin()
      return
    }

    if (event.name === PlayerEvent.OUT_OF_LIVES) {
      this.playerTankFactory.setActive(false)
      // Ir a pantalla de Game Over con el player actual
      this.sceneManager.toGameOverScene(this.player)
      return
    }

    if (event.name === PlayerTankFactoryEvent.PLAYER_TANK_CREATED) {
      // Cuando el tanque respawnea, limpiar las teclas presionadas para evitar movimiento automático
      this.pressedKeys.clear()
      // Actualizar referencia al nuevo tanque
      this.updatePlayerTankReference()
      return
    }

    // Actualizar referencia al tanque del jugador
    this.updatePlayerTankReference()

    if (!this.tank) {
      return
    }

    if (event.name === Keyboard.Event.KEY_PRESSED) {
      this.handleKeyPressed(event.key as number)
    } else if (event.name === Keyboard.Event.KEY_RELEASED) {
      this.handleKeyReleased(event.key as number)
    }
  }

  private handleWin(): void {
    // Mostrar estadísticas del stage antes de avanzar
    setTimeout(() => {
      this.sceneManager.toStageStatisticsScene(
        this.currentStage,
        this.player,
        false,
      )
    }, 1000) // 1 segundo de delay antes de mostrar stats
  }

  private handleKeyPressed(key: number): void {
    this.pressedKeys.add(key)

    if (key === Keyboard.Key.UP) {
      this.setTankDirection(SpriteDirection.UP)
    } else if (key === Keyboard.Key.DOWN) {
      this.setTankDirection(SpriteDirection.DOWN)
    } else if (key === Keyboard.Key.LEFT) {
      this.setTankDirection(SpriteDirection.LEFT)
    } else if (key === Keyboard.Key.RIGHT) {
      this.setTankDirection(SpriteDirection.RIGHT)
    } else if (key === Keyboard.Key.SPACE) {
      if (this.tank) {
        this.tank.shoot()
      }
    }
  }

  private handleKeyReleased(key: number): void {
    this.pressedKeys.delete(key)

    const currentDirection = this.tank!.getDirection()
    const isCurrentDirectionKey =
      (key === Keyboard.Key.UP && currentDirection === SpriteDirection.UP) ||
      (key === Keyboard.Key.DOWN &&
        currentDirection === SpriteDirection.DOWN) ||
      (key === Keyboard.Key.LEFT &&
        currentDirection === SpriteDirection.LEFT) ||
      (key === Keyboard.Key.RIGHT && currentDirection === SpriteDirection.RIGHT)

    if (!isCurrentDirectionKey) {
      return
    }

    const otherDirection = this.getOtherPressedDirection()
    if (otherDirection !== null) {
      this.setTankDirection(otherDirection)
    } else {
      this.tank!.stop()
    }
  }

  private setTankDirection(direction: SpriteDirection): void {
    if (!this.tank) {
      return
    }
    this.tank.setDirection(direction)
    this.tank.setSpeed(this.tank.getNormalSpeed())
  }

  private getOtherPressedDirection(): SpriteDirection | null {
    if (!this.tank) {
      return null
    }

    const currentDirection = this.tank.getDirection()

    if (
      this.pressedKeys.has(Keyboard.Key.UP) &&
      currentDirection !== SpriteDirection.UP
    ) {
      return SpriteDirection.UP
    }
    if (
      this.pressedKeys.has(Keyboard.Key.DOWN) &&
      currentDirection !== SpriteDirection.DOWN
    ) {
      return SpriteDirection.DOWN
    }
    if (
      this.pressedKeys.has(Keyboard.Key.LEFT) &&
      currentDirection !== SpriteDirection.LEFT
    ) {
      return SpriteDirection.LEFT
    }
    if (
      this.pressedKeys.has(Keyboard.Key.RIGHT) &&
      currentDirection !== SpriteDirection.RIGHT
    ) {
      return SpriteDirection.RIGHT
    }

    return null
  }
}
