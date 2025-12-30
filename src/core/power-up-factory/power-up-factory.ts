import type { EventManager } from '../event-manager'
import type { GameEvent } from '../event-manager'
import type { IEventSubscriber } from '../event-manager'
import { TankEvent } from '../../core/bullet-factory'
import { PowerUp, PowerUpType } from '../../game-objects/power-up'
import { Point } from '../../geometry'
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
      const randomPosition =
        this.positions[Math.floor(Math.random() * this.positions.length)]
      powerUp.setXY(randomPosition.getX(), randomPosition.getY())
      // PowerUp actualizará su posición en updateHook()
    }

    return powerUp
  }
}
