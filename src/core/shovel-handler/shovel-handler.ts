import type { EventManager } from '../event-manager'
import type { GameEvent } from '../event-manager'
import type { IEventSubscriber } from '../event-manager'
import { PowerUpHandlerEvent } from '../power-up-handler'
import {
  BaseWallBuilder,
  BrickWallFactory,
  SteelWallFactory,
} from '../base-wall-builder'

export class ShovelHandler implements IEventSubscriber {
  private eventManager: EventManager
  private baseWallBuilder: BaseWallBuilder | null = null
  private duration: number = 300
  private timer: number = 0
  private active: boolean = false

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager
    this.eventManager.addSubscriber(this, [PowerUpHandlerEvent.SHOVEL_START])
  }

  public setBaseWallBuilder(builder: BaseWallBuilder): void {
    this.baseWallBuilder = builder
  }

  public setDuration(duration: number): void {
    this.duration = duration
  }

  public notify(event: GameEvent): void {
    if (event.name === PowerUpHandlerEvent.SHOVEL_START) {
      this.start()
    }
  }

  public start(): void {
    // Si ya está activo, no hacer nada (evitar múltiples activaciones)
    if (this.active) {
      return
    }
    this.active = true
    this.timer = 0
    this.rebuildWall(new SteelWallFactory())
  }

  public end(): void {
    this.rebuildWall(new BrickWallFactory())
  }

  private rebuildWall(wallFactory: BrickWallFactory | SteelWallFactory): void {
    if (!this.baseWallBuilder) {
      return
    }
    this.baseWallBuilder.destroyWall()
    this.baseWallBuilder.setWallFactory(wallFactory)
    this.baseWallBuilder.buildWall()
  }

  public update(): void {
    if (!this.active) {
      return
    }
    this.timer++
    if (this.timer > this.duration) {
      this.active = false
      this.end()
    }
  }

  public isActive(): boolean {
    return this.active
  }
}
