import type { Tank } from './tank'
import type { ITankState } from './tank-state'
import { SpriteDirection } from '../../sprites/sprite'
import { Animation } from '../../core/animation/animation'

export class TankStateNormal implements ITankState {
  protected tank: Tank
  private trackAnimation: Animation
  private flashDuration: number = 7
  private flashTimer: number = 0
  private flashed: boolean = true

  constructor(tank: Tank) {
    this.tank = tank
    // Crear Animation con trackAnimationDuration del tanque (como en el original)
    // Esto lee el valor una sola vez al crear el estado
    this.trackAnimation = new Animation(
      [1, 2],
      this.tank.getTrackAnimationDuration(),
      true,
    )
  }

  public canMove(): boolean {
    return true
  }

  public canShoot(): boolean {
    return true
  }

  public canBeDestroyed(): boolean {
    return true
  }

  public isCollidable(): boolean {
    return true
  }

  public update(): void {
    this.updateTrackAnimation()
    this.updateFlash()
  }

  private updateTrackAnimation(): void {
    if (this.tank.getSpeed() === 0) {
      return
    }
    // Actualizar la animación (como en el original)
    this.trackAnimation.update()
  }

  private updateFlash(): void {
    if (!this.tank.isFlashing() || this.tank.getHitCount() > 0) {
      return
    }
    this.flashTimer++
    if (this.flashTimer >= this.flashDuration) {
      this.flashTimer = 0
      this.flashed = !this.flashed
    }
  }

  public getImageName(): string {
    const direction = this.tank.getDirection()
    const directionStr =
      direction === SpriteDirection.UP
        ? 'up'
        : direction === SpriteDirection.DOWN
        ? 'down'
        : direction === SpriteDirection.LEFT
        ? 'left'
        : 'right'
    let imageName = `tank_${this.tank.getType()}_${directionStr}_c${this.tank.getColorValue()}_t${this.trackAnimation.getFrame()}`
    // Agregar "_f" si está flashing y flashed es true
    if (this.tank.isFlashing() && this.flashed && this.tank.isNotHit()) {
      imageName += '_f'
    }
    // Agregar "_s1", "_s2", "_s3" según el nivel de mejora (solo para tanques del jugador)
    if (this.tank.isPlayer() && this.tank.getUpgradeLevel() > 0) {
      imageName += `_s${this.tank.getUpgradeLevel()}`
    }
    return imageName
  }
}
