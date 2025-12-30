import { Sprite } from '../../sprites/sprite'
import { EventManager } from '../../core/event-manager'
import { ImageManager } from '../../core/image-manager'
import { Globals } from '../../core/globals'
import * as THREE from 'three'

export const PointsType = {
  TANK: 'Points.Type.TANK',
  POWERUP: 'Points.Type.POWERUP',
} as const

export const PointsEvent = {
  DESTROYED: 'Points.Event.DESTROYED',
} as const

export class Points extends Sprite {
  private value: number = 0
  private duration: number = 20
  private timer: number = 0
  private type: string = PointsType.TANK

  constructor(eventManager: EventManager, threeScene: THREE.Scene) {
    super(eventManager, threeScene)

    this.setDimensions(Globals.UNIT_SIZE, Globals.UNIT_SIZE)
    this.setZIndex(5)
    this.updateTexture()
  }

  public setValue(value: number): void {
    this.value = value
    this.updateTexture()
  }

  public getValue(): number {
    return this.value
  }

  public setDuration(duration: number): void {
    this.duration = duration
  }

  public setType(type: string): void {
    this.type = type
  }

  public getType(): string {
    return this.type
  }

  private getImageName(): string {
    return `points_${this.value}`
  }

  private updateTexture(): void {
    const imageManager = ImageManager.getInstance()
    const texture = imageManager.getTexture(this.getImageName() as any)
    if (texture) {
      if (!this.threeSprite) {
        this.createThreeSprite(texture)
      } else {
        this.updateThreeSpriteTexture(texture)
      }
    } else {
      setTimeout(() => {
        this.updateTexture()
        if (this.threeSprite) {
          this.updateThreeSpritePosition()
        }
      }, 100)
    }
  }

  protected updateHook(): void {
    this.timer++
    if (this.timer > this.duration) {
      this.destroy()
      return
    }
    this.updateThreeSpritePosition()
  }

  protected destroyHook(): void {
    this.eventManager.fireEvent({
      name: PointsEvent.DESTROYED,
      points: this,
    })
  }
}
