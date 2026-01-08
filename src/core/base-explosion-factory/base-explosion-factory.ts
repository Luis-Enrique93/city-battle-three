import type { EventManager } from '../event-manager'
import type { GameEvent } from '../event-manager'
import type { IEventSubscriber } from '../event-manager'
import { BaseExplosion } from '../../game-objects/explosions/base-explosion'
import { BaseEvent } from '../../game-objects/base/base'
import { Base } from '../../game-objects/base/base'
import { Globals } from '../globals'
import { SoundManager } from '../sound-manager'
import * as THREE from 'three'

export class BaseExplosionFactory implements IEventSubscriber {
  private eventManager: EventManager
  private threeScene: THREE.Scene
  private explosionSize: number = Globals.UNIT_SIZE * 2

  constructor(eventManager: EventManager, threeScene: THREE.Scene) {
    this.eventManager = eventManager
    this.threeScene = threeScene
    this.eventManager.addSubscriber(this, [BaseEvent.HIT])
  }

  public setExplosionSize(size: number): void {
    this.explosionSize = size
  }

  public getExplosionSize(): number {
    return this.explosionSize
  }

  public notify(event: GameEvent): void {
    if (event.name === BaseEvent.HIT) {
      this.create(event.base as Base)
    }
  }

  public create(base: Base): BaseExplosion {
    const explosion = new BaseExplosion(
      this.eventManager,
      this.threeScene,
      base,
    )
    const baseCenter = base.getRect().getCenter()
    explosion.initializeExplosion(
      baseCenter.getX() - this.explosionSize / 2,
      baseCenter.getY() - this.explosionSize / 2,
    )

    // Reproducir sonido de explosión (como en el original - explosion_2)
    SoundManager.getInstance().play('explosion_2')

    return explosion
  }
}
