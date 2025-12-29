import { Sprite } from '../../sprites/sprite'
import { EventManager } from '../../core/event-manager'
import { ImageManager } from '../../core/image-manager'
import { Globals } from '../../core/globals'
import { Animation } from '../../core/animation'
import * as THREE from 'three'

export class BulletExplosion extends Sprite {
  private animation: Animation
  private lastFrame: number = 1

  constructor(eventManager: EventManager, threeScene: THREE.Scene) {
    super(eventManager, threeScene)

    this.animation = new Animation([1, 2, 3], 2)
    this.setDimensions(Globals.UNIT_SIZE, Globals.UNIT_SIZE)
    this.setZIndex(10)
    this.lastFrame = this.animation.getFrame()
  }

  public initializeExplosion(x: number, y: number): void {
    this.setXY(x, y)
    this.updateTexture()
  }

  private getImageName(): string {
    return `bullet_explosion_${this.animation.getFrame()}`
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
}
