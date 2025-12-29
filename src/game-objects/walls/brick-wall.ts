import { Wall } from './wall'
import { EventManager } from '../../core/event-manager'
import * as THREE from 'three'

export class BrickWall extends Wall {
  constructor(eventManager: EventManager, threeScene: THREE.Scene) {
    super(eventManager, threeScene)
  }

  protected getImageName(): string {
    return 'wall_brick'
  }
}
