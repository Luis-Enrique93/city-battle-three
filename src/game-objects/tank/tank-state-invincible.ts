import { Tank } from './tank'
import { EventManager } from '../../core/event-manager'
import { ImageManager } from '../../core/image-manager'
import { Animation } from '../../core/animation'
import { Globals } from '../../core/globals'
import * as THREE from 'three'

export const TankStateInvincibleEvent = {
  END: 'TankStateInvincible.Event.END',
} as const

export class TankStateInvincible {
  private tank: Tank
  private eventManager: EventManager
  private shieldAnimation: Animation
  private stateDuration: number = 345
  private stateTimer: number = 0
  private shieldSprite: THREE.Sprite | null = null
  private threeScene: THREE.Scene

  constructor(tank: Tank, threeScene: THREE.Scene) {
    this.tank = tank
    this.eventManager = tank.getEventManager()
    this.threeScene = threeScene
    this.shieldAnimation = new Animation([1, 2], 2)
    this.createShieldSprite()
  }

  private createShieldSprite(): void {
    const imageManager = ImageManager.getInstance()
    const texture = imageManager.getTexture('shield_1' as any)
    if (texture) {
      this.shieldSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: texture }),
      )
      this.shieldSprite.scale.set(
        this.tank.getWidth(),
        this.tank.getHeight(),
        1,
      )
      this.shieldSprite.position.z = 1 // Por encima del tanque
      this.threeScene.add(this.shieldSprite)
      this.updateShieldPosition()
    } else {
      setTimeout(() => this.createShieldSprite(), 100)
    }
  }

  private updateShieldPosition(): void {
    if (!this.shieldSprite) {
      return
    }
    const centerX = this.tank.getX() + this.tank.getWidth() / 2
    const centerY = this.tank.getY() + this.tank.getHeight() / 2
    const x = centerX - Globals.CANVAS_WIDTH / 2
    const y = Globals.CANVAS_HEIGHT / 2 - centerY
    this.shieldSprite.position.set(x, y, 1)
  }

  private updateShieldTexture(): void {
    if (!this.shieldSprite) {
      return
    }
    const imageManager = ImageManager.getInstance()
    const frame = this.shieldAnimation.getFrame()
    const texture = imageManager.getTexture(`shield_${frame}` as any)
    if (texture && this.shieldSprite.material instanceof THREE.SpriteMaterial) {
      this.shieldSprite.material.map = texture
      this.shieldSprite.material.needsUpdate = true
    }
  }

  public update(): void {
    this.shieldAnimation.update()
    this.updateShieldTexture()
    this.updateShieldPosition()
    this.stateTimer++
    if (this.stateTimer > this.stateDuration) {
      this.eventManager.fireEvent({
        name: TankStateInvincibleEvent.END,
        tank: this.tank,
      })
      this.destroy()
    }
  }

  public setStateDuration(duration: number): void {
    this.stateDuration = duration
  }

  public canBeDestroyed(): boolean {
    return false
  }

  public destroy(): void {
    if (this.shieldSprite) {
      this.threeScene.remove(this.shieldSprite)
      if (this.shieldSprite.material instanceof THREE.SpriteMaterial) {
        this.shieldSprite.material.map?.dispose()
        this.shieldSprite.material.dispose()
      }
      this.shieldSprite = null
    }
  }
}
