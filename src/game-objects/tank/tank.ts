import { Sprite, SpriteDirection } from '../../sprites/sprite'
import { EventManager } from '../../core/event-manager'
import type { GameEvent } from '../../core/event-manager'
import { ImageManager } from '../../core/image-manager'
import { Globals } from '../../core/globals'
import { CollisionDetectorEvent } from '../../core/collision-detector'
import { BulletEvent } from '../bullet/bullet'
import { BulletSpeed, BulletType } from '../bullet/bullet'
import { Bullet } from '../bullet/bullet'
import { TankEvent } from '../../core/bullet-factory'
import { Wall } from '../walls/wall'
import { Base } from '../base/base'
import { Water } from '../water/water'
import { TankStateInvincibleEvent } from './tank-state-invincible'
import { TankStateInvincible } from './tank-state-invincible'
import { TankStateNormal } from './tank-state-normal'
import { TankStateAppearingEvent } from './tank-state-appearing'
import type { ITankState } from './tank-state'
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
  private turnSmoothSens: number = Globals.TILE_SIZE - 1
  private turnRoundTo: number = Globals.TILE_SIZE
  private isPlayerTank: boolean = true
  private collisionResolvingMoveLimit: number = 10

  private bulletSize: number = 10
  private bulletSpeed: number = BulletSpeed.NORMAL
  private bulletsLimit: number = 1
  private bullets: number = 0
  private bulletType: string = BulletType.NORMAL

  private hitCount: number = 0
  private hitLimit: number = 1
  private upgradeLevel: number = 0
  private trackAnimationDuration: number = 2
  private state: ITankState

  constructor(eventManager: EventManager, threeScene: THREE.Scene) {
    super(eventManager, threeScene)

    this.eventManager.addSubscriber(this, [
      CollisionDetectorEvent.COLLISION,
      CollisionDetectorEvent.OUT_OF_BOUNDS,
      BulletEvent.DESTROYED,
      TankStateInvincibleEvent.END,
      TankStateAppearingEvent.END,
    ])

    // Inicializar con estado normal
    this.state = new TankStateNormal(this)

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

  private value: number = 0
  private flashing: boolean = false

  public setValue(value: number): void {
    this.value = value
  }

  public getValue(): number {
    return this.value
  }

  public isFlashing(): boolean {
    return this.flashing
  }

  public startFlashing(): void {
    this.flashing = true
  }

  public setNormalSpeed(speed: number): void {
    super.setNormalSpeed(speed)
  }

  public getColorValue(): number {
    return this.colorValue
  }

  public setColorValue(value: number): void {
    this.colorValue = value
    this.updateTexture()
  }

  private getImageName(): string {
    return this.state.getImageName()
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
    if (!this.state.canMove()) {
      return
    }
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
    this.state.update()
    this.updateThreeSpritePosition()
    this.updateTexture()
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
    if (!this.state.canShoot()) {
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
      event.name === TankStateAppearingEvent.END &&
      event.tank === this
    ) {
      this.stateAppearingEnd()
    } else if (
      event.name === TankStateInvincibleEvent.END &&
      event.tank === this
    ) {
      // Volver al estado normal cuando termine la invencibilidad
      if (this.state instanceof TankStateInvincible) {
        ;(this.state as TankStateInvincible).destroy()
      }
      this.state = new TankStateNormal(this)
    } else if (this.isBulletCollision(event) && this.canBeDestroyed()) {
      this.hit()
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

  private isBulletCollision(event: GameEvent): boolean {
    if (event.name !== CollisionDetectorEvent.COLLISION) {
      return false
    }

    let bullet: Bullet | null = null
    let bulletTank: Tank | null = null

    // Caso 1: Este tanque es el initiator y colisiona con una bala
    if (event.initiator === this && event.sprite instanceof Bullet) {
      bullet = event.sprite as Bullet
      bulletTank = bullet.getTank()
    }
    // Caso 2: Una bala es el initiator y colisiona con este tanque
    else if (event.initiator instanceof Bullet && event.sprite === this) {
      bullet = event.initiator as Bullet
      bulletTank = bullet.getTank()
    } else {
      return false
    }

    // No recibir daño de tus propias balas
    if (bulletTank === this) {
      return false
    }
    // Enemigos no se dañan entre sí
    if (this.isEnemy() && bulletTank.isEnemy()) {
      return false
    }
    // Jugador no se daña de sus propias balas
    if (this.isPlayer() && bulletTank.isPlayer()) {
      return false
    }
    return true
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
    return this.state.isCollidable()
  }

  public canBeDestroyed(): boolean {
    return this.state.canBeDestroyed()
  }

  public hit(): void {
    this.hitCount++
    // TODO: Update color/flash effect
    if (this.hitCount >= this.hitLimit) {
      this.destroy()
    }
  }

  public setHitLimit(limit: number): void {
    this.hitLimit = limit
  }

  public getHitLimit(): number {
    return this.hitLimit
  }

  public getHitCount(): number {
    return this.hitCount
  }

  public isNotHit(): boolean {
    return this.hitCount === 0
  }

  public upgrade(): void {
    this.upgradeLevel++
    if (this.upgradeLevel > 3) {
      this.upgradeLevel = 3
      return
    }

    if (this.upgradeLevel === 1) {
      // Nivel 1: Balas más rápidas
      this.setBulletSpeed(BulletSpeed.FAST)
    } else if (this.upgradeLevel === 2) {
      // Nivel 2: Puede disparar 2 balas a la vez
      this.setBulletsLimit(2)
    } else if (this.upgradeLevel === 3) {
      // Nivel 3: Balas mejoradas (destruyen muros de acero)
      this.bulletType = BulletType.ENHANCED
    }
    this.updateTexture()
  }

  public getUpgradeLevel(): number {
    return this.upgradeLevel
  }

  public getTrackAnimationDuration(): number {
    return this.trackAnimationDuration
  }

  public setTrackAnimationDuration(duration: number): void {
    this.trackAnimationDuration = duration
  }

  public getEventManager(): EventManager {
    return this.eventManager
  }

  public setState(state: ITankState): void {
    // Si el estado anterior es TankStateInvincible, destruir el escudo
    if (this.state instanceof TankStateInvincible) {
      ;(this.state as TankStateInvincible).destroy()
    }
    this.state = state
    this.updateTexture()
  }

  public getState(): ITankState {
    return this.state
  }

  public isInvincible(): boolean {
    return this.state instanceof TankStateInvincible
  }

  private stateAppearingEnd(): void {
    if (!this.threeScene) {
      return
    }
    if (this.isPlayer()) {
      // Para el jugador, pasar a estado invencible después de aparecer
      const invincibleState = new TankStateInvincible(this, this.threeScene)
      invincibleState.setStateDuration(110) // Duración del respawn invincibility
      this.setState(invincibleState)
      this.setDirection(SpriteDirection.UP)
    } else {
      // Para enemigos, pasar a estado normal
      this.setState(new TankStateNormal(this))
      this.setDirection(SpriteDirection.DOWN)
    }
  }

  protected destroyHook(): void {
    // Destruir estado si es TankStateInvincible
    if (this.state instanceof TankStateInvincible) {
      ;(this.state as TankStateInvincible).destroy()
    }

    this.eventManager.fireEvent({
      name: TankEvent.DESTROYED,
      tank: this,
    })

    if (this.isPlayer()) {
      this.eventManager.fireEvent({
        name: TankEvent.PLAYER_DESTROYED,
        tank: this,
      })
    } else {
      this.eventManager.fireEvent({
        name: TankEvent.ENEMY_DESTROYED,
        tank: this,
      })
      if (this.flashing) {
        this.eventManager.fireEvent({
          name: TankEvent.FLASHING_TANK_DESTROYED,
          tank: this,
        })
      }
    }
  }
}
