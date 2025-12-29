import type { EventManager } from '../event-manager'
import type { GameEvent } from '../event-manager'
import type { IEventSubscriber } from '../event-manager'
import { AITankController } from '../ai-tank-controller'
import { EnemyFactoryEvent } from '../enemy-factory'
import { SpriteContainer } from '../sprite-container'
import { Random } from '../random'
import { Tank } from '../../game-objects/tank'

export class AITankControllerFactory implements IEventSubscriber {
  private eventManager: EventManager
  private spriteContainer: SpriteContainer
  private freezed: boolean = false

  constructor(eventManager: EventManager, spriteContainer: SpriteContainer) {
    this.eventManager = eventManager
    this.spriteContainer = spriteContainer
    this.eventManager.addSubscriber(this, [EnemyFactoryEvent.ENEMY_CREATED])
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

  public freeze(): void {
    this.freezed = true
  }

  public unfreeze(): void {
    this.freezed = false
  }

  public notify(event: GameEvent): void {
    if (event.name === EnemyFactoryEvent.ENEMY_CREATED) {
      this.createController(event.enemy as Tank)
    }
  }
}
