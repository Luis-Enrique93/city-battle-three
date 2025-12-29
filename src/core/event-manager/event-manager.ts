import type { IEventSubscriber, GameEvent } from './types'

export class EventManager {
  private subscribers: Map<string, IEventSubscriber[]> = new Map()

  public addSubscriber(subscriber: IEventSubscriber, events: string[]): void {
    for (const eventName of events) {
      if (!this.subscribers.has(eventName)) {
        this.subscribers.set(eventName, [])
      }
      this.subscribers.get(eventName)!.push(subscriber)
    }
  }

  public removeSubscriber(subscriber: IEventSubscriber): void {
    for (const subscribers of this.subscribers.values()) {
      const index = subscribers.indexOf(subscriber)
      if (index !== -1) {
        subscribers.splice(index, 1)
      }
    }
  }

  public removeAllSubscribers(): void {
    this.subscribers.clear()
  }

  public fireEvent(event: GameEvent): void {
    const subscribers = this.subscribers.get(event.name)
    if (subscribers) {
      for (const subscriber of subscribers) {
        subscriber.notify(event)
      }
    }
  }
}
