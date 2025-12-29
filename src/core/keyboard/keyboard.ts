import { EventManager } from '../event-manager'
import type { GameEvent } from '../event-manager'

export class Keyboard {
  public static readonly Key = {
    SPACE: 32,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    S: 83,
    SELECT: 17,
    START: 13,
  } as const

  public static readonly Event = {
    KEY_PRESSED: 'Keyboard.Event.KEY_PRESSED',
    KEY_RELEASED: 'Keyboard.Event.KEY_RELEASED',
  } as const

  private eventManager: EventManager
  private events: GameEvent[] = []
  private keys: Map<number, boolean> = new Map()

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager
    this.listen()
  }

  private listen(): void {
    document.addEventListener('keydown', event => {
      if (!this.keys.get(event.keyCode)) {
        this.keys.set(event.keyCode, true)
        this.events.push({
          name: Keyboard.Event.KEY_PRESSED,
          key: event.keyCode,
        })
      }
      event.preventDefault()
    })

    document.addEventListener('keyup', event => {
      if (this.keys.get(event.keyCode)) {
        this.keys.set(event.keyCode, false)
        this.events.push({
          name: Keyboard.Event.KEY_RELEASED,
          key: event.keyCode,
        })
      }
      event.preventDefault()
    })
  }

  public fireEvents(): void {
    for (const event of this.events) {
      this.eventManager.fireEvent(event)
    }
    this.events = []
  }
}
