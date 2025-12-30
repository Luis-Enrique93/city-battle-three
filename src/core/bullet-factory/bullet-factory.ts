import type { EventManager } from '../event-manager'
import type { GameEvent } from '../event-manager'
import type { IEventSubscriber } from '../event-manager'
import { Tank } from '../../game-objects/tank/tank'
import { Bullet } from '../../game-objects/bullet'
import { SpriteDirection } from '../../sprites/sprite'
import { Point } from '../../geometry/point'
import * as THREE from 'three'

export class TankEvent {
  public static readonly SHOOT = 'Tank.Event.SHOOT'
  public static readonly DESTROYED = 'Tank.Event.DESTROYED'
  public static readonly PLAYER_DESTROYED = 'Tank.Event.PLAYER_DESTROYED'
  public static readonly ENEMY_DESTROYED = 'Tank.Event.ENEMY_DESTROYED'
  public static readonly FLASHING_TANK_DESTROYED =
    'Tank.Event.FLASHING_TANK_DESTROYED'
}

export class BulletFactory implements IEventSubscriber {
  private eventManager: EventManager
  private threeScene: THREE.Scene

  constructor(eventManager: EventManager, threeScene: THREE.Scene) {
    this.eventManager = eventManager
    this.threeScene = threeScene
    this.eventManager.addSubscriber(this, [TankEvent.SHOOT])
  }

  public notify(event: GameEvent): void {
    if (event.name === TankEvent.SHOOT) {
      this.createBullet(event.tank as Tank)
    }
  }

  private createBullet(tank: Tank): Bullet {
    const position = this.getBulletPosition(tank)
    const bullet = new Bullet(this.eventManager, this.threeScene, tank)
    bullet.initializeBullet(position.getX(), position.getY())
    return bullet
  }

  private getBulletPosition(tank: Tank): Point {
    const direction = tank.getDirection()
    const bulletSize = tank.getBulletSize()
    let x = 0
    let y = 0

    if (direction === SpriteDirection.RIGHT) {
      x = tank.getRight() - 1
      y = tank.getTop() + tank.getHeight() / 2 - bulletSize / 2
    } else if (direction === SpriteDirection.LEFT) {
      x = tank.getLeft() + 1
      y = tank.getTop() + tank.getHeight() / 2 - bulletSize / 2
    } else if (direction === SpriteDirection.UP) {
      x = tank.getLeft() + tank.getWidth() / 2 - bulletSize / 2
      y = tank.getTop() + 1
    } else if (direction === SpriteDirection.DOWN) {
      x = tank.getLeft() + tank.getWidth() / 2 - bulletSize / 2
      y = tank.getBottom() - 1
    }

    return new Point(x, y)
  }
}
