import type { Tank } from './tank'
import type { ITankState } from './tank-state'
import { EventManager } from '../../core/event-manager'
import { Animation } from '../../core/animation'

export const TankStateAppearingEvent = {
  END: 'TankStateAppearing.Event.END',
} as const

export class TankStateAppearing implements ITankState {
  private tank: Tank
  private eventManager: EventManager
  private animation: Animation

  constructor(tank: Tank) {
    this.tank = tank
    this.eventManager = tank.getEventManager()
    // Animación: [1,2,3,4,3,2,1,2,3,4,3,2,1] con duración de 3 frames por frame
    this.animation = new Animation([1, 2, 3, 4, 3, 2, 1, 2, 3, 4, 3, 2, 1], 3)
  }

  public canMove(): boolean {
    return false
  }

  public canShoot(): boolean {
    return false
  }

  public canBeDestroyed(): boolean {
    return false
  }

  public isCollidable(): boolean {
    return false
  }

  public update(): void {
    this.animation.update()
    if (this.animation.isCompleted()) {
      this.eventManager.fireEvent({
        name: TankStateAppearingEvent.END,
        tank: this.tank,
      })
    }
  }

  public getImageName(): string {
    const frame = this.animation.getFrame()
    return `appear_${frame}`
  }
}
