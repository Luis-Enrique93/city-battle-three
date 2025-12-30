import type { EventManager } from '../event-manager'
import type { GameEvent } from '../event-manager'
import type { IEventSubscriber } from '../event-manager'
import { Tank } from '../../game-objects/tank'
import { SpriteContainer } from '../sprite-container'
import { SpriteDirection } from '../../sprites/sprite'
import { Random } from '../random'
import { TankEvent } from '../bullet-factory'
import { PowerUpHandlerEvent } from '../power-up-handler'
import { FreezeTimerEvent } from '../freeze-timer'

export const AITankControllerEvent = {
  CREATED: 'AITankController.Event.CREATED',
  DESTROYED: 'AITankController.Event.DESTROYED',
} as const

export class AITankController implements IEventSubscriber {
  private tank: Tank
  private random: Random
  private spriteContainer: SpriteContainer
  private eventManager: EventManager
  private shootInterval: number = 15
  private shootTimer: number = 0
  private shootProbability: number = 0.7
  private directionUpdateInterval: number = 20
  private directionTimer: number = 0
  private directionUpdateProbability: number = 0.6
  private freezed: boolean = false

  constructor(
    tank: Tank,
    random: Random,
    spriteContainer: SpriteContainer,
    eventManager: EventManager,
  ) {
    this.tank = tank
    this.random = random
    this.spriteContainer = spriteContainer
    this.eventManager = eventManager

    this.tank.setNormalSpeed(this.tank.getNormalSpeed())

    this.eventManager.addSubscriber(this, [
      TankEvent.DESTROYED,
      PowerUpHandlerEvent.FREEZE,
      FreezeTimerEvent.UNFREEZE,
    ])

    this.eventManager.fireEvent({
      name: AITankControllerEvent.CREATED,
      controller: this,
    })
  }

  public update(): void {
    if (this.freezed) {
      return
    }
    this.updateShoot()
    this.updateDirection()
  }

  private updateShoot(): void {
    this.shootTimer++
    if (this.shootTimer >= this.shootInterval) {
      this.shootTimer = 0
      if (this.random.getNumber() < this.shootProbability) {
        this.tank.shoot()
      }
    }
  }

  private updateDirection(): void {
    this.directionTimer++
    if (this.directionTimer >= this.directionUpdateInterval) {
      this.directionTimer = 0
      if (this.random.getNumber() < this.directionUpdateProbability) {
        const base = this.spriteContainer.getBase()
        if (!base) {
          return
        }

        const n = this.random.getNumber()
        let dir: SpriteDirection = SpriteDirection.DOWN

        if (base.getY() > this.tank.getY()) {
          dir = SpriteDirection.DOWN
          if (n < 0.4) {
            dir = this.randomDirection([
              SpriteDirection.UP,
              SpriteDirection.LEFT,
              SpriteDirection.RIGHT,
            ])
          }
        } else if (base.getY() === this.tank.getY()) {
          if (base.getX() < this.tank.getX()) {
            dir = SpriteDirection.LEFT
            if (n < 0.4) {
              dir = this.randomDirection([
                SpriteDirection.UP,
                SpriteDirection.DOWN,
                SpriteDirection.RIGHT,
              ])
            }
          } else if (base.getX() > this.tank.getX()) {
            dir = SpriteDirection.RIGHT
            if (n < 0.4) {
              dir = this.randomDirection([
                SpriteDirection.UP,
                SpriteDirection.LEFT,
                SpriteDirection.DOWN,
              ])
            }
          }
        } else {
          dir = this.randomDirection([
            SpriteDirection.UP,
            SpriteDirection.DOWN,
            SpriteDirection.LEFT,
            SpriteDirection.RIGHT,
          ])
        }

        this.tank.setDirection(dir)
        this.tank.setSpeed(this.tank.getNormalSpeed())
      }
    }
  }

  private randomDirection(directions: SpriteDirection[]): SpriteDirection {
    const index = Math.floor(this.random.getNumber() * directions.length)
    return directions[index]
  }

  public freeze(): void {
    this.freezed = true
  }

  public unfreeze(): void {
    this.freezed = false
  }

  public notify(event: GameEvent): void {
    if (event.name === TankEvent.DESTROYED && event.tank === this.tank) {
      this.destroy()
    } else if (event.name === PowerUpHandlerEvent.FREEZE) {
      this.freeze()
    } else if (event.name === FreezeTimerEvent.UNFREEZE) {
      this.unfreeze()
    }
  }

  private destroy(): void {
    this.eventManager.removeSubscriber(this)
    this.eventManager.fireEvent({
      name: AITankControllerEvent.DESTROYED,
      controller: this,
    })
  }
}
