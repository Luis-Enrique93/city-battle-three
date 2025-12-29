import type { EventManager } from '../event-manager'
import type { GameEvent } from '../event-manager'
import type { IEventSubscriber } from '../event-manager'
import { AITankController } from '../ai-tank-controller'
import { AITankControllerEvent } from '../ai-tank-controller'

export class AITankControllerContainer implements IEventSubscriber {
  private eventManager: EventManager
  private controllers: AITankController[] = []

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager
    this.eventManager.addSubscriber(this, [
      AITankControllerEvent.CREATED,
      AITankControllerEvent.DESTROYED,
    ])
  }

  public addController(controller: AITankController): void {
    this.controllers.push(controller)
  }

  public removeController(controller: AITankController): void {
    const index = this.controllers.indexOf(controller)
    if (index > -1) {
      this.controllers.splice(index, 1)
    }
  }

  public getControllers(): AITankController[] {
    return this.controllers
  }

  public update(): void {
    this.controllers.forEach(controller => {
      controller.update()
    })
  }

  public notify(event: GameEvent): void {
    if (event.name === AITankControllerEvent.CREATED) {
      this.addController(event.controller as AITankController)
    } else if (event.name === AITankControllerEvent.DESTROYED) {
      this.removeController(event.controller as AITankController)
    }
  }
}
