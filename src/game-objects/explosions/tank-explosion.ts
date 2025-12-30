import { Sprite } from '../../sprites/sprite'
import { EventManager } from '../../core/event-manager'
import { ImageManager } from '../../core/image-manager'
import { Globals } from '../../core/globals'
import { Animation } from '../../core/animation'
import { Tank } from '../tank/tank'
import { Point } from '../../geometry'
import * as THREE from 'three'

export const TankExplosionEvent = {
  DESTROYED: 'TankExplosion.Event.DESTROYED',
} as const

export class TankExplosion extends Sprite {
  private animation: Animation
  private tank: Tank
  private lastFrame: number = 1

  constructor(eventManager: EventManager, threeScene: THREE.Scene, tank: Tank) {
    super(eventManager, threeScene)

    this.tank = tank
    this.animation = new Animation([1, 2, 3, 4, 5, 3], 3)
    this.setDimensions(Globals.UNIT_SIZE * 2, Globals.UNIT_SIZE * 2)
    this.setZIndex(10)
    this.lastFrame = this.animation.getFrame()
  }

  public initializeExplosion(x: number, y: number): void {
    this.setXY(x, y)
    this.updateTexture()
  }

  public getTank(): Tank {
    return this.tank
  }

  public getCenter(): Point {
    return this.getRect().getCenter()
  }

  private getImageName(): string {
    return `big_explosion_${this.animation.getFrame()}`
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
    if (this.animation.isCompleted()) {
      this.destroy()
      return
    }

    this.animation.update()
    const currentFrame = this.animation.getFrame()

    if (currentFrame !== this.lastFrame) {
      this.lastFrame = currentFrame
      this.updateTexture()
    }

    this.updateThreeSpritePosition()
  }

  protected destroyHook(): void {
    this.eventManager.fireEvent({
      name: TankExplosionEvent.DESTROYED,
      explosion: this,
    })
  }
}
