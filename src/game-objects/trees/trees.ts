import { Sprite } from '../../sprites/sprite'
import { EventManager } from '../../core/event-manager'
import { ImageManager } from '../../core/image-manager'
import { Globals } from '../../core/globals'
import * as THREE from 'three'

export class Trees extends Sprite {
  constructor(eventManager: EventManager, threeScene: THREE.Scene) {
    super(eventManager, threeScene)
    this.setDimensions(Globals.UNIT_SIZE, Globals.UNIT_SIZE)
    this.zIndex = 1 // Trees se dibujan encima
    this.createTreesSprite()
  }

  private createTreesSprite(): void {
    const imageManager = ImageManager.getInstance()
    const texture = imageManager.getTexture('trees' as any)
    if (texture) {
      this.createThreeSprite(texture)
    } else {
      setTimeout(() => this.createTreesSprite(), 100)
    }
  }

  public setTreesPosition(x: number, y: number): void {
    this.setXY(x, y)
    this.updateThreeSpritePosition()
  }
}
