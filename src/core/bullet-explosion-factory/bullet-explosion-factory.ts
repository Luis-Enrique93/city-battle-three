import type { EventManager } from '../event-manager'
import type { GameEvent } from '../event-manager'
import type { IEventSubscriber } from '../event-manager'
import { BulletEvent } from '../../game-objects/bullet'
import { Bullet } from '../../game-objects/bullet'
import { BulletExplosion } from '../../game-objects/explosions'
import { Globals } from '../globals'
import * as THREE from 'three'

export class BulletExplosionFactory implements IEventSubscriber {
  private eventManager: EventManager
  private threeScene: THREE.Scene
  private explosionSize: number = Globals.UNIT_SIZE

  constructor(eventManager: EventManager, threeScene: THREE.Scene) {
    this.eventManager = eventManager
    this.threeScene = threeScene
    this.eventManager.addSubscriber(this, [BulletEvent.DESTROYED])
  }

  public notify(event: GameEvent): void {
    if (event.name === BulletEvent.DESTROYED) {
      const bullet = event.bullet as Bullet
      if (bullet.shouldExplode()) {
        this.create(bullet)
      }
    }
  }

  private create(bullet: Bullet): BulletExplosion {
    const explosion = new BulletExplosion(this.eventManager, this.threeScene)
    const bulletCenter = bullet.getCenter()
    const x = bulletCenter.getX() - this.explosionSize / 2
    const y = bulletCenter.getY() - this.explosionSize / 2
    explosion.initializeExplosion(x, y)
    return explosion
  }
}
