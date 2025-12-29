import { Sprite, SpriteDirection } from '../../sprites/sprite'
import { EventManager } from '../../core/event-manager'
import type { GameEvent } from '../../core/event-manager'
import { ImageManager } from '../../core/image-manager'
import { Globals } from '../../core/globals'
import { CollisionDetectorEvent } from '../../core/collision-detector'
import { BulletEvent } from '../bullet/bullet'
import { BulletSpeed, BulletType } from '../bullet/bullet'
import { TankEvent } from '../../core/bullet-factory'
import { Wall } from '../walls/wall'
import { Base } from '../base/base'
import { Water } from '../water/water'
import * as THREE from 'three'

export class Tank extends Sprite {
  public static Type = {
    PLAYER_1: 'player1',
    BASIC: 'basic',
    FAST: 'fast',
    POWER: 'power',
    ARMOR: 'armor',
  } as const

  private type: string = Tank.Type.PLAYER_1
  private colorValue: number = 0
  private trackFrame: number = 1
  private trackAnimationTimer: number = 0
  private turnSmoothSens: number = Globals.TILE_SIZE - 1
  private turnRoundTo: number = Globals.TILE_SIZE
  private isPlayerTank: boolean = true
  private collisionResolvingMoveLimit: number = 10

  private bulletSize: number = 10
  private bulletSpeed: number = BulletSpeed.NORMAL
  private bulletsLimit: number = 1
  private bullets: number = 0
  private bulletType: string = BulletType.NORMAL

  constructor(eventManager: EventManager, threeScene: THREE.Scene) {
    super(eventManager, threeScene)

    this.eventManager.addSubscriber(this, [
      CollisionDetectorEvent.COLLISION,
      CollisionDetectorEvent.OUT_OF_BOUNDS,
      BulletEvent.DESTROYED,
    ])

    this.setDimensions(Globals.UNIT_SIZE, Globals.UNIT_SIZE)
    this.setNormalSpeed(2)
    this.setSpeed(0)
    this.setDirection(SpriteDirection.UP)
    this.updateTexture()
  }

  public isPlayer(): boolean {
    return this.isPlayerTank
  }

  public isEnemy(): boolean {
    return !this.isPlayerTank
  }

  public setIsPlayer(isPlayer: boolean): void {
    this.isPlayerTank = isPlayer
  }

  public getType(): string {
    return this.type
  }

  public setType(type: string): void {
    this.type = type
    this.updateTexture()
  }

  public setValue(_value: number): void {
    // TODO: Implement value system for points
  }

  public setNormalSpeed(speed: number): void {
    super.setNormalSpeed(speed)
  }

  private getImageName(): string {
    const direction = this.getDirection()
    return `tank_${this.type}_${direction}_c${this.colorValue}_t${this.trackFrame}`
  }

  private updateTexture(): void {
    const imageManager = ImageManager.getInstance()
    const texture = imageManager.getTexture(this.getImageName() as any)
    if (texture) {
      if (!this.threeSprite) {
        this.createThreeSprite(texture)
      } else {
        this.updateThreeSpriteTexture(texture)
      }
    } else {
      setTimeout(() => this.updateTexture(), 100)
    }
  }
  public move(): void {
    if (this.isTurn()) {
      this.smoothTurn()
    }
    super.move()
  }

  private smoothTurn(): void {
    const direction = this.getDirection()
    const prevDirection = this.getPrevDirection()

    const isChangingToVertical =
      (direction === SpriteDirection.UP ||
        direction === SpriteDirection.DOWN) &&
      (prevDirection === SpriteDirection.RIGHT ||
        prevDirection === SpriteDirection.LEFT)

    const isChangingToHorizontal =
      (direction === SpriteDirection.LEFT ||
        direction === SpriteDirection.RIGHT) &&
      (prevDirection === SpriteDirection.UP ||
        prevDirection === SpriteDirection.DOWN)

    if (isChangingToVertical) {
      this.alignToTileCenter('x')
    } else if (isChangingToHorizontal) {
      this.alignToTileCenter('y')
    }
  }

  private alignToTileCenter(axis: 'x' | 'y'): void {
    const center =
      axis === 'x'
        ? this.getX() + this.getWidth() / 2
        : this.getY() + this.getHeight() / 2
    const tileCenter = Math.round(center / this.turnRoundTo) * this.turnRoundTo
    const offset = tileCenter - center

    if (Math.abs(offset) < this.turnSmoothSens) {
      if (axis === 'x') {
        this.setX(this.getX() + offset)
      } else {
        this.setY(this.getY() + offset)
      }
      this.updateThreeSpritePosition()
    }
  }

  protected updateHook(): void {
    if (this.getSpeed() > 0) {
      this.trackAnimationTimer++
      if (this.trackAnimationTimer >= 2) {
        this.trackAnimationTimer = 0
        this.trackFrame = this.trackFrame === 1 ? 2 : 1
        this.updateTexture()
      }
    }
    this.updateThreeSpritePosition()
  }

  public setTankPosition(x: number, y: number): void {
    this.setXY(x, y)
    this.updateThreeSpritePosition()
  }

  public getBulletSize(): number {
    return this.bulletSize
  }

  public setBulletSize(size: number): void {
    this.bulletSize = size
  }

  public getBulletSpeed(): number {
    return this.bulletSpeed
  }

  public setBulletSpeed(speed: number): void {
    this.bulletSpeed = speed
  }

  public getBulletsLimit(): number {
    return this.bulletsLimit
  }

  public setBulletsLimit(limit: number): void {
    this.bulletsLimit = limit
  }

  public getBulletType(): string {
    return this.bulletType
  }

  public setBulletType(type: string): void {
    this.bulletType = type
  }

  public shoot(): void {
    if (this.isDestroyed()) {
      return
    }
    if (this.bullets >= this.bulletsLimit) {
      return
    }
    this.bullets++
    this.eventManager.fireEvent({
      name: TankEvent.SHOOT,
      tank: this,
    })
  }

  public notify(event: GameEvent): void {
    if (event.name === BulletEvent.DESTROYED && event.tank === this) {
      this.bullets--
    } else if (
      this.isWallCollision(event) ||
      this.isTankCollision(event) ||
      this.isBaseCollision(event) ||
      this.isWaterCollision(event)
    ) {
      this.resolveCollisionWithSprite(event.sprite as Sprite)
    } else if (
      event.name === CollisionDetectorEvent.OUT_OF_BOUNDS &&
      event.sprite === this
    ) {
      this.resolveOutOfBounds(event.bounds as any)
    }
  }

  private isWallCollision(event: GameEvent): boolean {
    return (
      event.name === CollisionDetectorEvent.COLLISION &&
      event.initiator === this &&
      event.sprite instanceof Wall
    )
  }

  private isTankCollision(event: GameEvent): boolean {
    return (
      event.name === CollisionDetectorEvent.COLLISION &&
      event.initiator === this &&
      event.sprite instanceof Tank &&
      (event.sprite as Tank).isCollidable()
    )
  }

  private isBaseCollision(event: GameEvent): boolean {
    return (
      event.name === CollisionDetectorEvent.COLLISION &&
      event.initiator === this &&
      event.sprite instanceof Base
    )
  }

  private isWaterCollision(event: GameEvent): boolean {
    return (
      event.name === CollisionDetectorEvent.COLLISION &&
      event.initiator === this &&
      event.sprite instanceof Water
    )
  }

  private resolveCollisionWithSprite(other: Sprite): void {
    let moveX = 0
    let moveY = 0
    const direction = this.getDirection()

    if (direction === SpriteDirection.RIGHT) {
      moveX = this.getRight() - other.getLeft() + 1
    } else if (direction === SpriteDirection.LEFT) {
      moveX = this.getLeft() - other.getRight() - 1
    } else if (direction === SpriteDirection.UP) {
      moveY = this.getTop() - other.getBottom() - 1
    } else if (direction === SpriteDirection.DOWN) {
      moveY = this.getBottom() - other.getTop() + 1
    }

    if (
      Math.abs(moveX) > this.collisionResolvingMoveLimit ||
      Math.abs(moveY) > this.collisionResolvingMoveLimit
    ) {
      return
    }

    this.setX(this.getX() - moveX)
    this.setY(this.getY() - moveY)
    this.updateThreeSpritePosition()
  }

  public isCollidable(): boolean {
    return true // TODO: Implement tank states (appearing, invincible, etc.)
  }

  public canBeDestroyed(): boolean {
    return true // TODO: Implement tank states (appearing, invincible, etc.)
  }
}
