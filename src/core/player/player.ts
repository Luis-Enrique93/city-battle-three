import type { EventManager } from '../event-manager'
import type { GameEvent } from '../event-manager'
import type { IEventSubscriber } from '../event-manager'
import { PointsFactoryEvent } from '../points-factory'
import { TankEvent } from '../bullet-factory'
import { Tank } from '../../game-objects/tank'

export const PlayerEvent = {
  OUT_OF_LIVES: 'Player.Event.OUT_OF_LIVES',
} as const

export class Player implements IEventSubscriber {
  private eventManager: EventManager | null = null
  private lives: number = 2
  private score: number = 0
  private tanks: Record<string, number> = {}

  constructor() {
    this.resetTanks()
  }

  public resetTanks(): void {
    this.tanks = {}
    this.tanks[Tank.Type.BASIC] = 0
    this.tanks[Tank.Type.FAST] = 0
    this.tanks[Tank.Type.POWER] = 0
    this.tanks[Tank.Type.ARMOR] = 0
  }

  public setEventManager(eventManager: EventManager): void {
    this.eventManager = eventManager
    this.eventManager.addSubscriber(this, [
      PointsFactoryEvent.POINTS_CREATED,
      TankEvent.PLAYER_DESTROYED,
      TankEvent.ENEMY_DESTROYED,
    ])
  }

  public notify(event: GameEvent): void {
    if (event.name === PointsFactoryEvent.POINTS_CREATED) {
      this.score += (event.points as any).getValue()
    } else if (event.name === TankEvent.PLAYER_DESTROYED) {
      if (this.lives === 0) {
        this.eventManager?.fireEvent({ name: PlayerEvent.OUT_OF_LIVES })
      } else {
        this.lives--
      }
    } else if (event.name === TankEvent.ENEMY_DESTROYED) {
      const tank = event.tank as Tank
      if (tank.getValue() > 0) {
        this.tanks[tank.getType()]++
      }
    }
  }

  public getScore(): number {
    return this.score
  }

  public getLives(): number {
    return this.lives
  }

  public getTanks(type: string): number {
    return this.tanks[type] || 0
  }

  public getTanksCount(): number {
    return (
      this.tanks[Tank.Type.BASIC] +
      this.tanks[Tank.Type.FAST] +
      this.tanks[Tank.Type.POWER] +
      this.tanks[Tank.Type.ARMOR]
    )
  }
}
