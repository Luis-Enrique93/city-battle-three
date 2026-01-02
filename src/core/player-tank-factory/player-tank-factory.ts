import type { EventManager } from '../event-manager'
import type { GameEvent } from '../event-manager'
import type { IEventSubscriber } from '../event-manager'
import { TankExplosionEvent } from '../../game-objects/explosions/tank-explosion'
import { TankExplosion } from '../../game-objects/explosions/tank-explosion'
import { Tank } from '../../game-objects/tank'
import { TankStateAppearing } from '../../game-objects/tank/tank-state-appearing'
import { SpriteDirection } from '../../sprites/sprite'
import { Point } from '../../geometry'
import * as THREE from 'three'

export const PlayerTankFactoryEvent = {
  PLAYER_TANK_CREATED: 'PlayerTankFactory.Event.PLAYER_TANK_CREATED',
} as const

export class PlayerTankFactory implements IEventSubscriber {
  private eventManager: EventManager
  private threeScene: THREE.Scene
  private appearPosition: Point = new Point(0, 0)
  private active: boolean = true

  constructor(eventManager: EventManager, threeScene: THREE.Scene) {
    this.eventManager = eventManager
    this.threeScene = threeScene
    this.eventManager.addSubscriber(this, [TankExplosionEvent.DESTROYED])
  }

  public setAppearPosition(position: Point): void {
    this.appearPosition = position
  }

  public setActive(active: boolean): void {
    this.active = active
  }

  public notify(event: GameEvent): void {
    if (!this.active) {
      return
    }
    if (this.isTankExplosionDestroyed(event)) {
      this.create()
    }
  }

  public create(): Tank {
    const tank = new Tank(this.eventManager, this.threeScene)
    tank.setIsPlayer(true)
    tank.setTankPosition(this.appearPosition.getX(), this.appearPosition.getY())
    // Resetear velocidad y dirección al respawnear
    tank.setSpeed(0)
    tank.setDirection(SpriteDirection.UP)
    // Establecer estado de aparición (animación de respawn)
    const appearingState = new TankStateAppearing(tank)
    tank.setState(appearingState)

    this.eventManager.fireEvent({
      name: PlayerTankFactoryEvent.PLAYER_TANK_CREATED,
      tank: tank,
    })

    return tank
  }

  private isTankExplosionDestroyed(event: GameEvent): boolean {
    if (event.name !== TankExplosionEvent.DESTROYED) {
      return false
    }
    const explosion = event.explosion as TankExplosion
    const tank = explosion.getTank()
    if (!tank.isPlayer()) {
      return false
    }
    return true
  }
}
