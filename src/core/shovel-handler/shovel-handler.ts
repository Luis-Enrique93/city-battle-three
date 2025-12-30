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
    // Si ya está activo, resetear el timer y reconstruir los muros de acero
    if (this.active) {
      console.log(
        'ShovelHandler.start: Already active, resetting timer and rebuilding steel walls',
      )
      this.timer = 0
      this.rebuildWall(new SteelWallFactory())
      return
    }
    this.active = true
    this.timer = 0
    console.log('ShovelHandler.start: Activating shovel, creating steel walls')
    this.rebuildWall(new SteelWallFactory())
  }

  public end(): void {
    console.log('ShovelHandler.end: Deactivating shovel, restoring brick walls')
    this.rebuildWall(new BrickWallFactory())
  }

  private rebuildWall(wallFactory: BrickWallFactory | SteelWallFactory): void {
    if (!this.baseWallBuilder) {
      return
    }
    const factoryName = wallFactory.constructor.name
    console.log(
      `ShovelHandler.rebuildWall: Rebuilding with ${factoryName}, active: ${this.active}`,
    )
    this.baseWallBuilder.destroyWall()
    // Delay para asegurar que la destrucción se complete antes de crear nuevos muros
    // Usar requestAnimationFrame para esperar al siguiente frame
    requestAnimationFrame(() => {
      if (this.baseWallBuilder) {
        console.log(
          `ShovelHandler.rebuildWall: Creating walls with ${factoryName}`,
        )
        this.baseWallBuilder.setWallFactory(wallFactory)
        this.baseWallBuilder.buildWall()
      }
    })
  }

  public update(): void {
    if (!this.active) {
      return
    }
    this.timer++
    if (this.timer > this.duration) {
      console.log(
        `ShovelHandler.update: Timer expired (${this.timer} > ${this.duration}), ending shovel effect`,
      )
      this.active = false
      this.end()
    }
  }

  public isActive(): boolean {
    return this.active
  }
}
