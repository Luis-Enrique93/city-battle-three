import type { EventManager } from '../event-manager'
import type { GameEvent } from '../event-manager'
import type { IEventSubscriber } from '../event-manager'
import { PowerUpHandlerEvent } from '../power-up-handler'

export const FreezeTimerEvent = {
  UNFREEZE: 'FreezeTimer.Event.UNFREEZE',
} as const

export class FreezeTimer implements IEventSubscriber {
  private eventManager: EventManager
  private duration: number = 300
  private timer: number = 0
  private active: boolean = false

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager
    this.eventManager.addSubscriber(this, [PowerUpHandlerEvent.FREEZE])
  }

  public notify(event: GameEvent): void {
    if (event.name === PowerUpHandlerEvent.FREEZE) {
      this.start()
    }
  }

  public start(): void {
    this.active = true
    this.timer = 0
  }

  public unfreeze(): void {
    this.eventManager.fireEvent({ name: FreezeTimerEvent.UNFREEZE })
  }

  public setDuration(duration: number): void {
    this.duration = duration
  }

  public update(): void {
    if (!this.active) {
      return
    }
    this.timer++
    if (this.timer > this.duration) {
      this.active = false
      this.unfreeze()
    }
  }

  public isActive(): boolean {
    return this.active
  }
}
