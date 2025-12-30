import type { EventManager } from '../event-manager'
import type { GameEvent } from '../event-manager'
import type { IEventSubscriber } from '../event-manager'
import { SpriteEvent } from '../../sprites/sprite'
import type { Sprite } from '../../sprites/sprite'
import { Tank } from '../../game-objects/tank'
import { Wall } from '../../game-objects/walls/wall'
import { Base } from '../../game-objects/base/base'

export class SpriteContainer implements IEventSubscriber {
  private eventManager: EventManager
  private sprites: Sprite[] = []

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager
    this.eventManager.addSubscriber(this, [
      SpriteEvent.CREATED,
      SpriteEvent.DESTROYED,
    ])
  }

  public addSprite(sprite: Sprite): void {
    this.sprites.push(sprite)
    this.sortSpritesByZIndex()
  }

  public removeSprite(sprite: Sprite): void {
    const index = this.sprites.indexOf(sprite)
    if (index !== -1) {
      this.sprites.splice(index, 1)
    }
  }

  public containsSprite(sprite: Sprite): boolean {
    return this.sprites.includes(sprite)
  }

  public getSprites(): Sprite[] {
    return this.sprites
  }

  public getTanks(): Tank[] {
    return this.sprites.filter(sprite => sprite instanceof Tank) as Tank[]
  }

  public getEnemyTanks(): Tank[] {
    return this.sprites.filter(
      sprite => sprite instanceof Tank && (sprite as Tank).isEnemy(),
    ) as Tank[]
  }

  public getWalls(): Wall[] {
    return this.sprites.filter(sprite => sprite instanceof Wall) as Wall[]
  }

  public getBase(): Base | null {
    for (const sprite of this.sprites) {
      if (sprite instanceof Base) {
        return sprite as Base
      }
    }
    return null
  }

  public notify(event: GameEvent): void {
    if (event.name === SpriteEvent.CREATED) {
      this.addSprite(event.sprite as Sprite)
    } else if (event.name === SpriteEvent.DESTROYED) {
      this.removeSprite(event.sprite as Sprite)
    }
  }

  private sortSpritesByZIndex(): void {
    this.sprites.sort((a, b) => {
      const zA = a.getZIndex()
      const zB = b.getZIndex()
      if (zA < zB) {
        return -1
      }
      if (zA > zB) {
        return 1
      }
      return 0
    })
  }
}
