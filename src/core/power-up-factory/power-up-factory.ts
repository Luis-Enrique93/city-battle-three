import type { EventManager } from '../event-manager'
import type { GameEvent } from '../event-manager'
import type { IEventSubscriber } from '../event-manager'
import { TankEvent } from '../../core/bullet-factory'
import { PowerUp, PowerUpType } from '../../game-objects/power-up'
import { Point } from '../../geometry'
import { SoundManager } from '../sound-manager'
import * as THREE from 'three'

export class PowerUpFactory implements IEventSubscriber {
  private eventManager: EventManager
  private threeScene: THREE.Scene
  private positions: Point[] = []

  constructor(eventManager: EventManager, threeScene: THREE.Scene) {
    this.eventManager = eventManager
    this.threeScene = threeScene
    this.eventManager.addSubscriber(this, [TankEvent.FLASHING_TANK_DESTROYED])
  }

  public setPositions(positions: Point[]): void {
    this.positions = positions
  }

  public notify(event: GameEvent): void {
    if (event.name === TankEvent.FLASHING_TANK_DESTROYED) {
      this.create()
    }
  }

  public create(): PowerUp {
    const powerUp = new PowerUp(this.eventManager, this.threeScene)
    const types = [
      PowerUpType.GRENADE,
      PowerUpType.HELMET,
      PowerUpType.SHOVEL,
      PowerUpType.STAR,
      PowerUpType.TANK,
      PowerUpType.TIMER,
    ]
    const randomType = types[Math.floor(Math.random() * types.length)]
    powerUp.setType(randomType)

    if (this.positions.length > 0) {
      // Seleccionar una posición aleatoria (como en el original)
      const randomIndex = Math.floor(Math.random() * this.positions.length)
      const randomPosition = this.positions[randomIndex]
      powerUp.setXY(randomPosition.getX(), randomPosition.getY())
    }

    // Reproducir sonido cuando aparece el power-up (como en el original)
    SoundManager.getInstance().play('powerup_appear')

    return powerUp
  }
}
