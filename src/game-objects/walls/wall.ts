import { Sprite } from '../../sprites/sprite'
import { EventManager } from '../../core/event-manager'
import { ImageManager } from '../../core/image-manager'
import { Globals } from '../../core/globals'
import * as THREE from 'three'

export abstract class Wall extends Sprite {
  protected invincibleForNormalBullets = false

  constructor(eventManager: EventManager, threeScene: THREE.Scene) {
    super(eventManager, threeScene)
    this.setDimensions(Globals.TILE_SIZE, Globals.TILE_SIZE)
    this.createWallSprite()
  }

  protected abstract getImageName(): string

  private createWallSprite(): void {
    const imageManager = ImageManager.getInstance()
    const texture = imageManager.getTexture(this.getImageName() as any)
    if (texture) {
      this.createThreeSprite(texture)
    } else {
      setTimeout(() => this.createWallSprite(), 100)
    }
  }

  public setWallPosition(x: number, y: number): void {
    this.setXY(x, y)
    this.updateThreeSpritePosition()
  }
}
