import type { EventManager } from '../../core/event-manager'
import type { GameEvent } from '../../core/event-manager'
import type { IEventSubscriber } from '../../core/event-manager'
import { Keyboard } from '../../core/keyboard'
import type { MainMenuModel } from './main-menu-model'

// MainMenuController pattern del original - maneja el input del menú
export class MainMenuController implements IEventSubscriber {
  private eventManager: EventManager
  private menu: MainMenuModel
  private active: boolean = true

  constructor(eventManager: EventManager, menu: MainMenuModel) {
    this.eventManager = eventManager
    this.menu = menu
    this.eventManager.addSubscriber(this, [Keyboard.Event.KEY_PRESSED])
  }

  public notify(event: GameEvent): void {
    if (event.name === Keyboard.Event.KEY_PRESSED) {
      this.keyPressed(event.key as number)
    }
  }

  private keyPressed(key: number): void {
    if (!this.active) {
      return
    }

    if (
      key === Keyboard.Key.SELECT ||
      key === Keyboard.Key.UP ||
      key === Keyboard.Key.DOWN
    ) {
      if (key === Keyboard.Key.UP) {
        this.menu.previousItem()
      } else {
        this.menu.nextItem()
      }
    } else if (key === Keyboard.Key.START) {
      this.menu.executeCurrentItem()
    }
  }

  public activate(): void {
    this.active = true
  }

  public deactivate(): void {
    this.active = false
  }

  public isActive(): boolean {
    return this.active
  }
}
