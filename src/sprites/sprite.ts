import { Rect } from '../geometry/rect'
import { EventManager } from '../core/event-manager'
import type { IEventSubscriber, GameEvent } from '../core/event-manager'
import * as THREE from 'three'
import { Globals } from '../core/globals'

export const SpriteDirection = {
  RIGHT: 'right',
  LEFT: 'left',
  UP: 'up',
  DOWN: 'down',
} as const

export type SpriteDirection =
  (typeof SpriteDirection)[keyof typeof SpriteDirection]

export class SpriteEvent {
  public static readonly MOVED = 'Sprite.Event.MOVED'
  public static readonly CREATED = 'Sprite.Event.CREATED'
  public static readonly DESTROYED = 'Sprite.Event.DESTROYED'
}

export class Sprite extends Rect implements IEventSubscriber {
  protected eventManager: EventManager
  protected prevDirection: SpriteDirection = SpriteDirection.RIGHT
  protected direction: SpriteDirection = SpriteDirection.RIGHT
  protected normalSpeed = 0
  protected speed = 0
  protected destroyed = false
  protected turn = false
  protected zIndex = 0
  protected moveFrequency = 1
  protected moveTimer = 0

  protected threeSprite: THREE.Sprite | null = null
  protected threeScene: THREE.Scene | null = null

  constructor(eventManager: EventManager, threeScene: THREE.Scene) {
    super()
    this.eventManager = eventManager
    this.threeScene = threeScene
    this.eventManager.fireEvent({
      name: SpriteEvent.CREATED,
      sprite: this,
    })
  }

  public getDirection(): SpriteDirection {
    return this.direction
  }

  public setDirection(direction: SpriteDirection): void {
    if (direction === this.direction) {
      return
    }
    this.prevDirection = this.direction
    this.direction = direction
    this.turn = true
  }

  public getPrevDirection(): SpriteDirection {
    return this.prevDirection
  }

  public isTurn(): boolean {
    return this.turn
  }

  public getSpeed(): number {
    return this.speed
  }

  public setSpeed(speed: number): void {
    this.speed = speed
  }

  public getNormalSpeed(): number {
    return this.normalSpeed
  }

  public setNormalSpeed(speed: number): void {
    this.normalSpeed = speed
  }

  public toNormalSpeed(): void {
    this.speed = this.normalSpeed
  }

  public setMoveFrequency(frequency: number): void {
    this.moveFrequency = frequency
  }

  public stop(): void {
    this.speed = 0
  }

  public move(): void {
    this.moveTimer++
    if (this.moveTimer < this.moveFrequency || this.speed === 0) {
      return
    }
    this.moveTimer = 0
    this.doMove()
  }

  protected doMove(): void {
    this._x = this.getNewX()
    this._y = this.getNewY()
    this.turn = false
    this.eventManager.fireEvent({
      name: SpriteEvent.MOVED,
      sprite: this,
    })
    this.moveHook()
    this.updateThreeSpritePosition()
  }

  protected moveHook(): void {
    // Override in subclasses
  }

  public update(): void {
    if (this.destroyed) {
      this.doDestroy()
      return
    }

    this.move()
    this.updateHook()
  }

  protected updateHook(): void {
    // Override in subclasses
  }

  public destroy(): void {
    this.destroyed = true
  }

  public isDestroyed(): boolean {
    return this.destroyed
  }

  protected doDestroy(): void {
    this.eventManager.removeSubscriber(this)
    this.eventManager.fireEvent({
      name: SpriteEvent.DESTROYED,
      sprite: this,
    })
    this.destroyHook()
    this.removeFromScene()
  }

  protected destroyHook(): void {
    // Override in subclasses
  }

  public resolveOutOfBounds(bounds: Rect): void {
    if (this.direction === SpriteDirection.RIGHT) {
      this._x = bounds.getRight() - this._w + 1
    } else if (this.direction === SpriteDirection.LEFT) {
      this._x = bounds.getLeft()
    } else if (this.direction === SpriteDirection.UP) {
      this._y = bounds.getTop()
    } else if (this.direction === SpriteDirection.DOWN) {
      this._y = bounds.getBottom() - this._h + 1
    }
    this.updateThreeSpritePosition()
  }

  public setZIndex(zIndex: number): void {
    this.zIndex = zIndex
    if (this.threeSprite) {
      this.threeSprite.position.z = zIndex
    }
  }

  public getZIndex(): number {
    return this.zIndex
  }

  protected getNewX(): number {
    let result = this._x

    if (this.direction === SpriteDirection.RIGHT) {
      result += this.speed
    } else if (this.direction === SpriteDirection.LEFT) {
      result -= this.speed
    }

    return result
  }

  protected getNewY(): number {
    let result = this._y

    if (this.direction === SpriteDirection.UP) {
      result -= this.speed
    } else if (this.direction === SpriteDirection.DOWN) {
      result += this.speed
    }

    return result
  }

  protected createThreeSprite(texture: THREE.Texture): void {
    const material = new THREE.SpriteMaterial({ map: texture })
    this.threeSprite = new THREE.Sprite(material)
    this.threeSprite.scale.set(this._w, this._h, 1)
    this.updateThreeSpritePosition()
    this.threeSprite.position.z = this.zIndex

    if (this.threeScene) {
      this.threeScene.add(this.threeSprite)
    }
  }

  protected updateThreeSpritePosition(): void {
    if (this.threeSprite) {
      // Convertir coordenadas del juego (0,0 top-left) a Three.js (centro en 0,0)
      const x = this._x - Globals.CANVAS_WIDTH / 2 + this._w / 2
      const y = Globals.CANVAS_HEIGHT / 2 - this._y - this._h / 2
      this.threeSprite.position.set(x, y, this.zIndex)
    }
  }

  protected updateThreeSpriteTexture(texture: THREE.Texture): void {
    if (this.threeSprite) {
      ;(this.threeSprite.material as THREE.SpriteMaterial).map = texture
      ;(this.threeSprite.material as THREE.SpriteMaterial).needsUpdate = true
    }
  }

  protected removeFromScene(): void {
    if (this.threeSprite && this.threeScene) {
      this.threeScene.remove(this.threeSprite)
      this.threeSprite.material.dispose()
      this.threeSprite = null
    }
  }

  public notify(_event: GameEvent): void {
    // Override in subclasses to handle events
  }
}
