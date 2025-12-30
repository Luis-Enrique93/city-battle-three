import type { EventManager } from '../event-manager'
import type { GameEvent } from '../event-manager'
import type { IEventSubscriber } from '../event-manager'
import { PowerUpEvent } from '../../game-objects/power-up'
import { PowerUpType } from '../../game-objects/power-up'
import type { PowerUp } from '../../game-objects/power-up'
import type { SpriteContainer } from '../sprite-container'
import { TankStateInvincible } from '../../game-objects/tank/tank-state-invincible'
import type { Tank } from '../../game-objects/tank'
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
  private threeScene: THREE.Scene | null = null

  constructor(eventManager: EventManager, threeScene?: THREE.Scene) {
    this.eventManager = eventManager
    if (threeScene) {
      this.threeScene = threeScene
    }
    this.eventManager.addSubscriber(this, [PowerUpEvent.PICK])
  }

  public setThreeScene(threeScene: THREE.Scene): void {
    this.threeScene = threeScene
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
    // TODO: Play sound "powerup_pick"
    console.log('PowerUp picked:', powerUp.getType())

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
      console.log('Handling STAR power-up, playerTank:', playerTank)
      this.handleStar(playerTank)
    } else if (type === PowerUpType.TANK) {
      this.handleTank()
    }
  }

  private handleGrenade(): void {
    // Destruir todos los tanques enemigos
    if (this.spriteContainer) {
      const enemyTanks = this.spriteContainer.getEnemyTanks()
      for (const tank of enemyTanks) {
        tank.setValue(0)
        tank.destroy()
      }
    }
  }

  private handleHelmet(playerTank: any): void {
    if (playerTank && this.threeScene) {
      const tank = playerTank as Tank
      tank.setInvincible(true)
      const state = new TankStateInvincible(tank, this.threeScene)
      state.setStateDuration(PowerUpHandlerConstants.HELMET_DURATION)
      // Guardar referencia al estado para poder destruirlo cuando termine
      ;(tank as any).invincibleState = state
      // Escuchar cuando termine la invencibilidad
      this.eventManager.addSubscriber(
        {
          notify: (event: any) => {
            if (
              event.name === 'TankStateInvincible.Event.END' &&
              event.tank === tank
            ) {
              tank.setInvincible(false)
              if ((tank as any).invincibleState) {
                ;(tank as any).invincibleState = null
              }
            }
          },
        },
        ['TankStateInvincible.Event.END'],
      )
    }
  }

  private handleTimer(): void {
    // Congelar enemigos temporalmente
    this.eventManager.fireEvent({ name: PowerUpHandlerEvent.FREEZE })
  }

  private handleShovel(): void {
    // Fortificar la base con muros de acero
    this.eventManager.fireEvent({ name: PowerUpHandlerEvent.SHOVEL_START })
  }

  private handleStar(playerTank: any): void {
    // Mejorar el tanque del jugador
    console.log('handleStar called, playerTank:', playerTank)
    if (playerTank) {
      if (typeof playerTank.upgrade === 'function') {
        console.log('Calling upgrade() on player tank')
        playerTank.upgrade()
        console.log('Upgrade level after:', playerTank.getUpgradeLevel?.())
      } else {
        console.log('ERROR: playerTank.upgrade is not a function!')
      }
    } else {
      console.log('ERROR: No player tank for star!')
    }
  }

  private handleTank(): void {
    // Dar una vida extra al jugador
    this.eventManager.fireEvent({ name: PowerUpHandlerEvent.TANK })
  }
}
