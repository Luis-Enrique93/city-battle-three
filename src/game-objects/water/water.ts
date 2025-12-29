import { Sprite } from '../../sprites/sprite'
import { EventManager } from '../../core/event-manager'
import { ImageManager } from '../../core/image-manager'
import { Globals } from '../../core/globals'
import * as THREE from 'three'

export class Water extends Sprite {
  private animationFrame = 1
  private animationTimer = 0
  private animationActive = true

  constructor(eventManager: EventManager, threeScene: THREE.Scene) {
    super(eventManager, threeScene)
    this.setDimensions(Globals.UNIT_SIZE, Globals.UNIT_SIZE)
    this.createWaterSprite()
  }

  private getImageName(): string {
    return `water_${this.animationFrame}`
  }

  private createWaterSprite(): void {
    const imageManager = ImageManager.getInstance()
    const texture = imageManager.getTexture(this.getImageName() as any)
    if (texture) {
      this.createThreeSprite(texture)
    } else {
      setTimeout(() => this.createWaterSprite(), 100)
    }
  }

  protected updateHook(): void {
    if (this.animationActive) {
      this.animationTimer++
      if (this.animationTimer >= 30) {
        this.animationTimer = 0
        this.animationFrame = this.animationFrame === 1 ? 2 : 1
        const imageManager = ImageManager.getInstance()
        const texture = imageManager.getTexture(this.getImageName() as any)
        if (texture && this.threeSprite) {
          this.updateThreeSpriteTexture(texture)
        }
      }
    }
    this.updateThreeSpritePosition()
  }

  public setWaterPosition(x: number, y: number): void {
    this.setXY(x, y)
    this.updateThreeSpritePosition()
  }

  public stopAnimation(): void {
    this.animationActive = false
  }
}
