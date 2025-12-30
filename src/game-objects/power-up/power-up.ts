import { Sprite, SpriteEvent } from '../../sprites/sprite'
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
    // Disparar MOVED para que CollisionDetector detecte colisiones con este sprite
    this.eventManager.fireEvent({
      name: SpriteEvent.MOVED,
      sprite: this,
    })
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
    // Solo actualizar posición si es visible (el sprite seguirá renderizándose pero podemos ocultarlo con opacity)
    if (this.threeSprite) {
      this.updateThreeSpritePosition()
      // Aplicar visibilidad del blink
      if (this.threeSprite.material instanceof THREE.SpriteMaterial) {
        this.threeSprite.material.opacity = this.blinkTimer.isVisible()
          ? 1.0
          : 0.0
      }
    }
    // Disparar MOVED periódicamente para que CollisionDetector detecte colisiones
    // (aunque el PowerUp no se mueve, necesitamos que se detecten colisiones cuando el tanque se mueve hacia él)
    this.eventManager.fireEvent({
      name: SpriteEvent.MOVED,
      sprite: this,
    })
  }

  public notify(event: GameEvent): void {
    if (this.isCollidedWithPlayer(event)) {
      // Obtener el tanque del jugador de la colisión
      const tank =
        event.initiator instanceof Tank
          ? (event.initiator as Tank)
          : event.sprite instanceof Tank
          ? (event.sprite as Tank)
          : null

      if (tank && tank.isPlayer()) {
        this.playerTank = tank
        this.eventManager.fireEvent({
          name: PowerUpEvent.PICK,
          powerUp: this,
        })
        this.destroy()
      }
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
    // El evento puede venir de dos formas:
    // 1. Tanque (initiator) colisiona con PowerUp (sprite)
    // 2. PowerUp (initiator) colisiona con Tanque (sprite)
    const tank =
      event.initiator instanceof Tank
        ? (event.initiator as Tank)
        : event.sprite instanceof Tank
        ? (event.sprite as Tank)
        : null

    if (!tank) {
      return false
    }

    if (!tank.isPlayer()) {
      return false
    }

    // Verificar que el power-up esté involucrado en la colisión
    if (event.initiator !== this && event.sprite !== this) {
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
