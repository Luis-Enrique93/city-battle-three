import type { EventManager } from '../event-manager'
import type { GameEvent } from '../event-manager'
import type { IEventSubscriber } from '../event-manager'
import { TankExplosion } from '../../game-objects/explosions/tank-explosion'
import { TankEvent } from '../bullet-factory'
import { Tank } from '../../game-objects/tank'
import { Globals } from '../globals'
import { SoundManager } from '../sound-manager'
import * as THREE from 'three'

export class TankExplosionFactory implements IEventSubscriber {
  private eventManager: EventManager
  private threeScene: THREE.Scene
  private explosionSize: number = Globals.UNIT_SIZE * 2

  constructor(eventManager: EventManager, threeScene: THREE.Scene) {
    this.eventManager = eventManager
    this.threeScene = threeScene
    this.eventManager.addSubscriber(this, [TankEvent.DESTROYED])
  }

  public setExplosionSize(size: number): void {
    this.explosionSize = size
  }

  public getExplosionSize(): number {
    return this.explosionSize
  }

  public notify(event: GameEvent): void {
    if (event.name === TankEvent.DESTROYED) {
      this.create(event.tank as Tank)
    }
  }

  public create(tank: Tank): TankExplosion {
    const explosion = new TankExplosion(
      this.eventManager,
      this.threeScene,
      tank,
    )
    const tankCenterX = tank.getX() + tank.getWidth() / 2
    const tankCenterY = tank.getY() + tank.getHeight() / 2
    explosion.initializeExplosion(
      tankCenterX - this.explosionSize / 2,
      tankCenterY - this.explosionSize / 2,
    )

    // Reproducir sonido de explosión (como en el original)
    SoundManager.getInstance().play('explosion_1')

    return explosion
  }
}
