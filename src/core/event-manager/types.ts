export interface IEventSubscriber {
  notify(event: GameEvent): void
}

export interface GameEvent {
  name: string
  [key: string]: unknown
}
