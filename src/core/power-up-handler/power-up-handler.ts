import type { EventManager } from '../event-manager'
import type { GameEvent } from '../event-manager'
import type { IEventSubscriber } from '../event-manager'
import { PowerUpEvent } from '../../game-objects/power-up'
import { PowerUpType } from '../../game-objects/power-up'
import type { PowerUp } from '../../game-objects/power-up'
import type { SpriteContainer } from '../sprite-container'
import { TankStateInvincible } from '../../game-objects/tank/tank-state-invincible'
import type { Tank } from '../../game-objects/tank'
import { SoundManager } from '../sound-manager'
import * as THREE from 'three'

export const PowerUpHandlerEvent = {
  FREEZE: 'PowerUpHandler.Event.FREEZE',
  SHOVEL_START: 'PowerUpHandler.Event.SHOVEL_START',
  TANK: 'PowerUpHandler.Event.TANK',
} as const

export const PowerUpHandlerConstants = {
  HELMET_DURATION: 345,
} as const

export class PowerUpHandler implements IEventSubscriber {
  private eventManager: EventManager
  private spriteContainer: SpriteContainer | null = null
  private threeScene: THREE.Scene

  constructor(eventManager: EventManager, threeScene: THREE.Scene) {
    this.eventManager = eventManager
    this.threeScene = threeScene
    this.eventManager.addSubscriber(this, [PowerUpEvent.PICK])
  }

  public setSpriteContainer(container: SpriteContainer): void {
    this.spriteContainer = container
  }

  public notify(event: GameEvent): void {
    if (event.name === PowerUpEvent.PICK) {
      this.handle(event.powerUp as PowerUp)
    }
  }

  private handle(powerUp: PowerUp): void {
    // Reproducir sonido cuando se recoge el power-up (como en el original)
    SoundManager.getInstance().play('powerup_pick')

    const type = powerUp.getType()
    const playerTank = powerUp.getPlayerTank()

    if (type === PowerUpType.GRENADE) {
      this.handleGrenade()
    } else if (type === PowerUpType.HELMET) {
      this.handleHelmet(playerTank)
    } else if (type === PowerUpType.TIMER) {
      this.handleTimer()
    } else if (type === PowerUpType.SHOVEL) {
      this.handleShovel()
    } else if (type === PowerUpType.STAR) {
      this.handleStar(playerTank)
    } else if (type === PowerUpType.TANK) {
      this.handleTank()
    }
  }

  private handleGrenade(): void {
    // Destruir todos los tanques enemigos
    if (this.spriteContainer) {
      const enemyTanks = this.spriteContainer.getEnemyTanks()
      enemyTanks.forEach(tank => {
        tank.setValue(0)
        tank.destroy()
      })
    }
  }

  private handleHelmet(playerTank: Tank | null): void {
    if (!playerTank) {
      return
    }
    const state = new TankStateInvincible(playerTank, this.threeScene)
    state.setStateDuration(PowerUpHandlerConstants.HELMET_DURATION)
    playerTank.setState(state)
  }

  private handleTimer(): void {
    // Congelar enemigos temporalmente
    this.eventManager.fireEvent({ name: PowerUpHandlerEvent.FREEZE })
  }

  private handleShovel(): void {
    // Fortificar la base con muros de acero
    this.eventManager.fireEvent({ name: PowerUpHandlerEvent.SHOVEL_START })
  }

  private handleStar(playerTank: Tank | null): void {
    if (!playerTank) {
      return
    }
    playerTank.upgrade()
  }

  private handleTank(): void {
    // Dar una vida extra al jugador
    this.eventManager.fireEvent({ name: PowerUpHandlerEvent.TANK })
  }
}
