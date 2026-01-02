import type { SpriteContainer } from '../sprite-container'
import { Point } from '../../geometry'
import { BrickWall } from '../../game-objects/walls/brick-wall'
import { SteelWall } from '../../game-objects/walls/steel-wall'
import { Wall } from '../../game-objects/walls/wall'
import type { EventManager } from '../event-manager'
import * as THREE from 'three'

export interface IWallFactory {
  create(
    eventManager: EventManager,
    threeScene: THREE.Scene,
  ): BrickWall | SteelWall
}

export class BrickWallFactory implements IWallFactory {
  public create(
    eventManager: EventManager,
    threeScene: THREE.Scene,
  ): BrickWall {
    return new BrickWall(eventManager, threeScene)
  }
}

export class SteelWallFactory implements IWallFactory {
  public create(
    eventManager: EventManager,
    threeScene: THREE.Scene,
  ): SteelWall {
    return new SteelWall(eventManager, threeScene)
  }
}

export class BaseWallBuilder {
  private positions: Point[] = []
  private wallFactory: IWallFactory | null = null
  private spriteContainer: SpriteContainer | null = null
  private eventManager: EventManager | null = null
  private threeScene: THREE.Scene | null = null

  public setWallPositions(positions: Point[]): void {
    this.positions = positions
  }

  public setWallFactory(factory: IWallFactory): void {
    this.wallFactory = factory
  }

  public setSpriteContainer(container: SpriteContainer): void {
    this.spriteContainer = container
  }

  public setEventManager(eventManager: EventManager): void {
    this.eventManager = eventManager
  }

  public setThreeScene(threeScene: THREE.Scene): void {
    this.threeScene = threeScene
  }

  public buildWall(): void {
    if (
      !this.wallFactory ||
      !this.eventManager ||
      !this.threeScene ||
      !this.spriteContainer
    ) {
      return
    }

    for (const position of this.positions) {
      const wall = this.wallFactory.create(this.eventManager, this.threeScene)
      // Usar setWallPosition para asegurar que la posición se actualice correctamente
      // incluso si el sprite se crea de forma asíncrona
      wall.setWallPosition(position.getX(), position.getY())
      // El wall disparará SpriteEvent.CREATED en su constructor
      // y se agregará automáticamente al SpriteContainer
    }
  }

  public destroyWall(): void {
    if (!this.spriteContainer) {
      return
    }

    // Crear una copia del array para evitar modificar mientras iteramos
    const walls = [...this.spriteContainer.getWalls()]
    const wallsToDestroy: Wall[] = []

    // Primero identificar qué muros destruir
    for (const wall of walls) {
      if (wall.isDestroyed()) {
        continue // Saltar muros ya destruidos
      }
      for (const position of this.positions) {
        if (
          wall.getX() === position.getX() &&
          wall.getY() === position.getY()
        ) {
          wallsToDestroy.push(wall)
          break
        }
      }
    }

    // Luego destruirlos
    for (const wall of wallsToDestroy) {
      if (!wall.isDestroyed()) {
        wall.destroy()
      }
    }
  }
}
