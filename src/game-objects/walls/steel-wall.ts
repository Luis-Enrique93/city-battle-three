import { Wall } from './wall'
import { EventManager } from '../../core/event-manager'
import * as THREE from 'three'

export class SteelWall extends Wall {
  constructor(eventManager: EventManager, threeScene: THREE.Scene) {
    super(eventManager, threeScene)
    this.invincibleForNormalBullets = true
  }

  protected getImageName(): string {
    return 'wall_steel'
  }
}
