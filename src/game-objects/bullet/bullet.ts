import { Sprite } from '../../sprites/sprite'
import { EventManager } from '../../core/event-manager'
import type { GameEvent } from '../../core/event-manager'
import { CollisionDetectorEvent } from '../../core/collision-detector'
import { ImageManager } from '../../core/image-manager'
import { Tank } from '../tank/tank'
import { Wall } from '../walls/wall'
import { Base } from '../base/base'
import { SoundManager } from '../../core/sound-manager'
import * as THREE from 'three'

export class BulletEvent {
  public static readonly DESTROYED = 'Bullet.Event.DESTROYED'
}

export class BulletSpeed {
  public static readonly NORMAL = 5
  public static readonly FAST = 8
}

export class BulletType {
  public static readonly NORMAL = 'Bullet.Type.NORMAL'
  public static readonly ENHANCED = 'Bullet.Type.ENHANCED'
}

export class Bullet extends Sprite {
  private tank: Tank
  private explode: boolean = true
  private bulletType: string = BulletType.NORMAL

  constructor(eventManager: EventManager, threeScene: THREE.Scene, tank: Tank) {
    super(eventManager, threeScene)

    this.tank = tank
    this.eventManager.addSubscriber(this, [
      CollisionDetectorEvent.OUT_OF_BOUNDS,
      CollisionDetectorEvent.COLLISION,
    ])

    this.setDimensions(tank.getBulletSize(), tank.getBulletSize())
    this.setDirection(tank.getDirection())
    this.setSpeed(tank.getBulletSpeed())
    this.bulletType = tank.getBulletType()
  }

  public initializeBullet(positionX: number, positionY: number): void {
    this.setXY(positionX, positionY)
    this.updateTexture()
  }

  public getTank(): Tank {
    return this.tank
  }

  public setExplode(value: boolean): void {
    this.explode = value
  }

  public shouldExplode(): boolean {
    return this.explode
  }

  public getBulletType(): string {
    return this.bulletType
  }

  public setBulletType(type: string): void {
    this.bulletType = type
  }

  private getImageName(): string {
    const direction = this.getDirection()
    return `bullet_${direction}`
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

  protected updateHook(): void {
    this.updateThreeSpritePosition()
  }

  protected destroyHook(): void {
    this.eventManager.fireEvent({
      name: BulletEvent.DESTROYED,
      bullet: this,
      tank: this.tank,
    })
  }

  public notify(event: GameEvent): void {
    if (this.isOutOfBounds(event)) {
      // Reproducir sonido solo si es del jugador (como en el original)
      if (this.tank.isPlayer()) {
        SoundManager.getInstance().play('bullet_hit_1')
      }
      this.destroy()
    } else if (this.isWallCollision(event)) {
      // Reproducir sonido solo si es del jugador (como en el original)
      if (this.tank.isPlayer()) {
        const wall = event.sprite as Wall
        // Usar isInvincibleForNormalBullets() para determinar el tipo de muro
        // (evita importación circular con SteelWall y BrickWall)
        if (wall.isInvincibleForNormalBullets()) {
          // Muro de acero
          SoundManager.getInstance().play('bullet_hit_1')
        } else {
          // Muro de ladrillo
          SoundManager.getInstance().play('bullet_hit_2')
        }
      }
      this.destroy()
    } else if (this.isBaseCollision(event)) {
      this.destroy()
    } else if (this.isTankCollision(event)) {
      const otherTank = event.sprite as Tank
      this.explode = otherTank.canBeDestroyed()
      this.destroy()
    } else if (this.isBulletCollision(event)) {
      this.explode = false
      this.destroy()
    }
  }

  private isOutOfBounds(event: GameEvent): boolean {
    return (
      event.name === CollisionDetectorEvent.OUT_OF_BOUNDS &&
      event.sprite === this
    )
  }

  private isWallCollision(event: GameEvent): boolean {
    if (
      event.name !== CollisionDetectorEvent.COLLISION ||
      event.initiator !== this ||
      !(event.sprite instanceof Wall)
    ) {
      return false
    }
    const wall = event.sprite as Wall
    // Las balas normales no destruyen muros de acero, pero sí se destruyen al chocar
    // Las balas mejoradas destruyen cualquier muro
    if (this.bulletType === BulletType.ENHANCED) {
      return true
    }
    // Si el muro es invencible, la bala se destruye pero no destruye el muro
    if (wall.isInvincibleForNormalBullets()) {
      return true
    }
    return true
  }

  private isBaseCollision(event: GameEvent): boolean {
    if (
      event.name !== CollisionDetectorEvent.COLLISION ||
      event.initiator !== this ||
      !(event.sprite instanceof Base)
    ) {
      return false
    }
    const base = event.sprite as Base
    return !base.isHit()
  }

  private isTankCollision(event: GameEvent): boolean {
    if (
      event.name !== CollisionDetectorEvent.COLLISION ||
      event.initiator !== this ||
      !(event.sprite instanceof Tank)
    ) {
      return false
    }
    const otherTank = event.sprite as Tank
    if (otherTank === this.tank) {
      return false
    }
    if (otherTank.isEnemy() && this.tank.isEnemy()) {
      return false
    }
    return otherTank.isCollidable()
  }

  private isBulletCollision(event: GameEvent): boolean {
    if (event.name !== CollisionDetectorEvent.COLLISION) {
      return false
    }
    if (
      !(event.sprite instanceof Bullet) ||
      !(event.initiator instanceof Bullet)
    ) {
      return false
    }
    const otherBullet = event.sprite as Bullet
    const otherTank = otherBullet.getTank()
    if (this.tank.isEnemy() && otherTank.isEnemy()) {
      return false
    }
    return true
  }
}
