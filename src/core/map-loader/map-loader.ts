import { EventManager } from '../event-manager'
import { BrickWall } from '../../game-objects/walls'
import { SteelWall } from '../../game-objects/walls'
import { Base } from '../../game-objects/base'
import { Trees } from '../../game-objects/trees'
import { Water } from '../../game-objects/water'
import * as THREE from 'three'

export class MapLoader {
  private eventManager: EventManager
  private threeScene: THREE.Scene

  constructor(eventManager: EventManager, threeScene: THREE.Scene) {
    this.eventManager = eventManager
    this.threeScene = threeScene
  }

  public loadMap(mapString: string): void {
    const items = mapString.split(';')

    for (const item of items) {
      const match = item.match(/(\w+)\((\d+),(\d+)\)/)
      if (!match) {
        continue
      }

      const className = match[1]
      const x = parseInt(match[2], 10)
      const y = parseInt(match[3], 10)

      let sprite: any = null

      switch (className) {
        case 'BrickWall':
          sprite = new BrickWall(this.eventManager, this.threeScene)
          sprite.setWallPosition(x, y)
          break
        case 'SteelWall':
          sprite = new SteelWall(this.eventManager, this.threeScene)
          sprite.setWallPosition(x, y)
          break
        case 'Base':
          sprite = new Base(this.eventManager, this.threeScene)
          sprite.setBasePosition(x, y)
          break
        case 'Trees':
          sprite = new Trees(this.eventManager, this.threeScene)
          sprite.setTreesPosition(x, y)
          break
        case 'Water':
          sprite = new Water(this.eventManager, this.threeScene)
          sprite.setWaterPosition(x, y)
          break
      }
    }
  }
}
