import { Sprite } from '../../sprites/sprite'
import { EventManager } from '../../core/event-manager'
import type { GameEvent } from '../../core/event-manager'
import { ImageManager } from '../../core/image-manager'
import { Globals } from '../../core/globals'
import { CollisionDetectorEvent } from '../../core/collision-detector'
import { EnemyFactoryEvent } from '../../core/enemy-factory'
import { BlinkTimer } from '../../core/blink-timer'
import { Tank } from '../tank'
import * as THREE from 'three'

export const PowerUpEvent = {
  DESTROYED: 'PowerUp.Event.DESTROYED',
  PICK: 'PowerUp.Event.PICK',
} as const

export const PowerUpType = {
  GRENADE: 'grenade',
  HELMET: 'helmet',
  SHOVEL: 'shovel',
  STAR: 'star',
  TANK: 'tank',
  TIMER: 'timer',
} as const

export class PowerUp extends Sprite {
  private type: string = PowerUpType.GRENADE
  private blinkTimer: BlinkTimer
  private value: number = 500
  private playerTank: Tank | null = null

  constructor(eventManager: EventManager, threeScene: THREE.Scene) {
    super(eventManager, threeScene)

    this.setDimensions(Globals.UNIT_SIZE, Globals.UNIT_SIZE)
    this.setZIndex(5)
    this.blinkTimer = new BlinkTimer(7)
    this.eventManager.addSubscriber(this, [
      CollisionDetectorEvent.COLLISION,
      EnemyFactoryEvent.ENEMY_CREATED,
    ])
    this.updateTexture()
  }

  public setType(type: string): void {
    this.type = type
    this.updateTexture()
  }

  public getType(): string {
    return this.type
  }

  public setValue(value: number): void {
    this.value = value
  }

  public getValue(): number {
    return this.value
  }

  public setPlayerTank(tank: Tank): void {
    this.playerTank = tank
  }

  public getPlayerTank(): Tank | null {
    return this.playerTank
  }

  private getImageName(): string {
    return `powerup_${this.type}`
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
      setTimeout(() => {
        this.updateTexture()
        if (this.threeSprite) {
          this.updateThreeSpritePosition()
        }
      }, 100)
    }
  }

  protected updateHook(): void {
    this.blinkTimer.update()
    if (this.threeSprite) {
      this.updateThreeSpritePosition()
      // Aplicar visibilidad del blink
      if (this.threeSprite.material instanceof THREE.SpriteMaterial) {
        this.threeSprite.material.opacity = this.blinkTimer.isVisible()
          ? 1.0
          : 0.0
      }
    }
  }

  public notify(event: GameEvent): void {
    if (this.isCollidedWithPlayer(event)) {
      this.playerTank = event.initiator as Tank
      this.eventManager.fireEvent({
        name: PowerUpEvent.PICK,
        powerUp: this,
      })
      this.destroy()
    } else if (event.name === EnemyFactoryEvent.ENEMY_CREATED) {
      const enemy = event.enemy as Tank
      if (enemy.isFlashing()) {
        this.destroy()
      }
    }
  }

  private isCollidedWithPlayer(event: GameEvent): boolean {
    if (event.name !== CollisionDetectorEvent.COLLISION) {
      return false
    }
    if (!(event.initiator instanceof Tank)) {
      return false
    }
    if (!event.initiator.isPlayer()) {
      return false
    }
    if (event.sprite !== this) {
      return false
    }
    return true
  }

  protected destroyHook(): void {
    this.eventManager.fireEvent({
      name: PowerUpEvent.DESTROYED,
      powerUp: this,
    })
  }
}
