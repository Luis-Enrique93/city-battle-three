import type { EventManager } from '../event-manager'
import type { GameEvent } from '../event-manager'
import type { IEventSubscriber } from '../event-manager'
import { Points, PointsType } from '../../game-objects/points/points'
import { TankExplosionEvent } from '../../game-objects/explosions/tank-explosion'
import { TankExplosion } from '../../game-objects/explosions/tank-explosion'
import { Globals } from '../globals'
import { Point } from '../../geometry'
import * as THREE from 'three'

export const PointsFactoryEvent = {
  POINTS_CREATED: 'PointsFactory.Event.POINTS_CREATED',
} as const

export class PointsFactory implements IEventSubscriber {
  private eventManager: EventManager
  private threeScene: THREE.Scene
  private pointsSize: number = Globals.UNIT_SIZE

  constructor(eventManager: EventManager, threeScene: THREE.Scene) {
    this.eventManager = eventManager
    this.threeScene = threeScene
    this.eventManager.addSubscriber(this, [TankExplosionEvent.DESTROYED])
  }

  public setPointsSize(size: number): void {
    this.pointsSize = size
  }

  public notify(event: GameEvent): void {
    if (this.isEnemyTankExplosionEnd(event)) {
      const explosion = event.explosion as TankExplosion
      const tank = explosion.getTank()
      const center = explosion.getCenter()
      this.create(center, tank.getValue(), PointsType.TANK)
    }
  }

  public create(center: Point, value: number, type: string): Points {
    const points = new Points(this.eventManager, this.threeScene)
    points.setValue(value)
    points.setType(type)

    const x = center.getX() - this.pointsSize / 2
    const y = center.getY() - this.pointsSize / 2
    points.setXY(x, y)
    // Points actualizará su posición en updateHook()

    this.eventManager.fireEvent({
      name: PointsFactoryEvent.POINTS_CREATED,
      points: points,
    })

    return points
  }

  private isEnemyTankExplosionEnd(event: GameEvent): boolean {
    if (event.name !== TankExplosionEvent.DESTROYED) {
      return false
    }
    const explosion = event.explosion as TankExplosion
    const tank = explosion.getTank()
    if (!tank.isEnemy()) {
      return false
    }
    if (tank.getValue() <= 0) {
      return false
    }
    return true
  }
}
