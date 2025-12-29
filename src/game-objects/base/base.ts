import { Sprite } from '../../sprites/sprite'
import { EventManager } from '../../core/event-manager'
import { ImageManager } from '../../core/image-manager'
import { Globals } from '../../core/globals'
import * as THREE from 'three'

export class Base extends Sprite {
  private hit = false

  constructor(eventManager: EventManager, threeScene: THREE.Scene) {
    super(eventManager, threeScene)
    this.setDimensions(Globals.UNIT_SIZE, Globals.UNIT_SIZE)
    this.createBaseSprite()
  }

  private getImageName(): string {
    return this.hit ? 'base_destroyed' : 'base'
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
    return this.hit
  }

  public setHit(hit: boolean): void {
    this.hit = hit
    // Actualizar textura si cambia el estado
    const imageManager = ImageManager.getInstance()
    const texture = imageManager.getTexture(this.getImageName() as any)
    if (texture && this.threeSprite) {
      this.updateThreeSpriteTexture(texture)
    }
  }
}
