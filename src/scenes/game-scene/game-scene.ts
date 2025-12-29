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
import { Rect } from '../../geometry/rect'
import * as THREE from 'three'

export class GameScene implements IScene, IEventSubscriber {
  private threeScene: THREE.Scene
  private tank: Tank | null = null
  private mapLoader: MapLoader | null = null
  private backgroundPlane: THREE.Mesh | null = null
  private pressedKeys: Set<number> = new Set()
  private spriteContainer: SpriteContainer

  constructor(sceneManager: ISceneManager, threeScene: THREE.Scene, stage = 1) {
    this.threeScene = threeScene

    const eventManager = sceneManager.getEventManager()
    eventManager.addSubscriber(this, [
      Keyboard.Event.KEY_PRESSED,
      Keyboard.Event.KEY_RELEASED,
    ])

    // Crear SpriteContainer y CollisionDetector
    this.spriteContainer = new SpriteContainer(eventManager)
    const gameFieldBounds = new Rect(
      Globals.UNIT_SIZE,
      Globals.TILE_SIZE,
      13 * Globals.UNIT_SIZE,
      13 * Globals.UNIT_SIZE,
    )
    new CollisionDetector(eventManager, gameFieldBounds, this.spriteContainer)

    this.createBackground()
    this.loadMap(eventManager, stage)
    this.createTank(eventManager)
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

  private createTank(eventManager: EventManager): void {
    // Posición inicial: Gamefield offset + posición relativa
    // Gamefield: x = UNIT_SIZE, y = TILE_SIZE
    const gameFieldX = Globals.UNIT_SIZE
    const gameFieldY = Globals.TILE_SIZE
    const startX = gameFieldX + 4 * Globals.UNIT_SIZE
    const startY = gameFieldY + 12 * Globals.UNIT_SIZE

    this.tank = new Tank(eventManager, this.threeScene)
    this.tank.setTankPosition(startX, startY)
  }

  public update(): void {
    if (this.tank) {
      this.tank.update()
    }
  }

  public draw(_renderer: Renderer): void {
    // El renderizado se hace automáticamente por Three.js
  }

  public notify(event: GameEvent): void {
    if (!this.tank) {
      return
    }

    if (event.name === Keyboard.Event.KEY_PRESSED) {
      this.handleKeyPressed(event.key as number)
    } else if (event.name === Keyboard.Event.KEY_RELEASED) {
      this.handleKeyReleased(event.key as number)
    }
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
      // TODO: Implement shooting
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
