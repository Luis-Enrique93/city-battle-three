import type { EventManager } from '../event-manager'
import type { GameEvent } from '../event-manager'
import type { IEventSubscriber } from '../event-manager'
import { AITankController } from '../ai-tank-controller'
import { EnemyFactoryEvent } from '../enemy-factory'
import { SpriteContainer } from '../sprite-container'
import { Random } from '../random'
import { Tank } from '../../game-objects/tank'
import { PowerUpHandlerEvent } from '../power-up-handler'
import { FreezeTimerEvent } from '../freeze-timer'
import type { AITankControllerContainer } from '../ai-tank-controller-container'

export class AITankControllerFactory implements IEventSubscriber {
  private eventManager: EventManager
  private spriteContainer: SpriteContainer
  private controllersContainer: AITankControllerContainer | null = null
  private freezed: boolean = false

  constructor(eventManager: EventManager, spriteContainer: SpriteContainer) {
    this.eventManager = eventManager
    this.spriteContainer = spriteContainer
    this.eventManager.addSubscriber(this, [
      EnemyFactoryEvent.ENEMY_CREATED,
      PowerUpHandlerEvent.FREEZE,
      FreezeTimerEvent.UNFREEZE,
    ])
  }

  public createController(tank: Tank): AITankController {
    const random = new Random()
    const controller = new AITankController(
      tank,
      random,
      this.spriteContainer,
      this.eventManager,
    )
    if (this.isFreezed()) {
      controller.freeze()
    }
    return controller
  }

  public isFreezed(): boolean {
    return this.freezed
  }

  public setControllersContainer(container: AITankControllerContainer): void {
    this.controllersContainer = container
  }

  public freeze(): void {
    this.freezed = true
    // Congelar todos los controladores existentes
    if (this.controllersContainer) {
      const controllers = this.controllersContainer.getControllers()
      for (const controller of controllers) {
        controller.freeze()
      }
    }
  }

  public unfreeze(): void {
    this.freezed = false
    // Descongelar todos los controladores existentes
    if (this.controllersContainer) {
      const controllers = this.controllersContainer.getControllers()
      for (const controller of controllers) {
        controller.unfreeze()
      }
    }
  }

  public notify(event: GameEvent): void {
    if (event.name === EnemyFactoryEvent.ENEMY_CREATED) {
      this.createController(event.enemy as Tank)
    } else if (event.name === PowerUpHandlerEvent.FREEZE) {
      this.freeze()
    } else if (event.name === FreezeTimerEvent.UNFREEZE) {
      this.unfreeze()
    }
  }
}
