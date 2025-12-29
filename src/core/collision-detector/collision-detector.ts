import type { EventManager } from '../event-manager'
import type { GameEvent } from '../event-manager'
import type { IEventSubscriber } from '../event-manager'
import { SpriteEvent } from '../../sprites/sprite'
import type { Sprite } from '../../sprites/sprite'
import { SpriteContainer } from '../sprite-container'
import { Rect } from '../../geometry/rect'

export class CollisionDetectorEvent {
  public static readonly COLLISION = 'CollisionDetector.Event.COLLISION'
  public static readonly OUT_OF_BOUNDS = 'CollisionDetector.Event.OUT_OF_BOUNDS'
}

export class CollisionDetector implements IEventSubscriber {
  private eventManager: EventManager
  private bounds: Rect
  private spriteContainer: SpriteContainer

  constructor(
    eventManager: EventManager,
    bounds: Rect,
    spriteContainer: SpriteContainer,
  ) {
    this.eventManager = eventManager
    this.bounds = bounds
    this.spriteContainer = spriteContainer
    this.eventManager.addSubscriber(this, [SpriteEvent.MOVED])
  }

  public notify(event: GameEvent): void {
    if (event.name === SpriteEvent.MOVED) {
      this.detectCollisionsForSprite(event.sprite as Sprite)
      this.detectOutOfBoundsForSprite(event.sprite as Sprite)
    }
  }

  private detectCollisionsForSprite(sprite: Sprite): void {
    const sprites = this.spriteContainer.getSprites()
    for (const other of sprites) {
      if (sprite === other) {
        continue
      }
      if (sprite.intersects(other)) {
        this.eventManager.fireEvent({
          name: CollisionDetectorEvent.COLLISION,
          initiator: sprite,
          sprite: other,
        })
      }
    }
  }

  private detectOutOfBoundsForSprite(sprite: Sprite): void {
    if (!this.bounds.containsWhole(sprite)) {
      this.eventManager.fireEvent({
        name: CollisionDetectorEvent.OUT_OF_BOUNDS,
        sprite: sprite,
        bounds: this.bounds,
      })
    }
  }
}
