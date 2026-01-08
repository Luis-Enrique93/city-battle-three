import { Sprite } from '../../sprites/sprite'
import { EventManager } from '../../core/event-manager'
import type { GameEvent } from '../../core/event-manager'
import { ImageManager } from '../../core/image-manager'
import { Globals } from '../../core/globals'
import { CollisionDetectorEvent } from '../../core/collision-detector'
import { Bullet } from '../bullet/bullet'
import * as THREE from 'three'

export const BaseEvent = {
  HIT: 'Base.Event.HIT',
} as const

export class Base extends Sprite {
  private isHitFlag = false

  constructor(eventManager: EventManager, threeScene: THREE.Scene) {
    super(eventManager, threeScene)
    this.setDimensions(Globals.UNIT_SIZE, Globals.UNIT_SIZE)
    // Suscribirse a eventos de colisión para detectar cuando es golpeada por balas
    this.eventManager.addSubscriber(this, [CollisionDetectorEvent.COLLISION])
    this.createBaseSprite()
  }

  private getImageName(): string {
    return this.isHitFlag ? 'base_destroyed' : 'base'
  }

  private createBaseSprite(): void {
    const imageManager = ImageManager.getInstance()
    const texture = imageManager.getTexture(this.getImageName() as any)
    if (texture) {
      this.createThreeSprite(texture)
    } else {
      setTimeout(() => this.createBaseSprite(), 100)
    }
  }

  public setBasePosition(x: number, y: number): void {
    this.setXY(x, y)
    this.updateThreeSpritePosition()
  }

  public isHit(): boolean {
    return this.isHitFlag
  }

  public setHit(hit: boolean): void {
    this.isHitFlag = hit
    // Actualizar textura si cambia el estado
    const imageManager = ImageManager.getInstance()
    const texture = imageManager.getTexture(this.getImageName() as any)
    if (texture && this.threeSprite) {
      this.updateThreeSpriteTexture(texture)
    }
  }

  public notify(event: GameEvent): void {
    if (this.isHitByBullet(event)) {
      this.onHit()
    }
  }

  private isHitByBullet(event: GameEvent): boolean {
    return (
      event.name === CollisionDetectorEvent.COLLISION &&
      event.initiator instanceof Bullet &&
      event.sprite === this &&
      !this.isHitFlag
    )
  }

  private onHit(): void {
    if (this.isHitFlag) {
      return
    }
    this.isHitFlag = true
    this.setHit(true)
    this.eventManager.fireEvent({
      name: BaseEvent.HIT,
      base: this,
    })
  }
}
