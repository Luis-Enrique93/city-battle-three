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
      console.warn('BaseWallBuilder.buildWall: Missing required dependencies')
      return
    }

    console.log(
      `BaseWallBuilder.buildWall: Creating ${this.positions.length} walls with factory:`,
      this.wallFactory.constructor.name,
    )

    for (const position of this.positions) {
      const wall = this.wallFactory.create(this.eventManager, this.threeScene)
      // Usar setWallPosition para asegurar que la posición se actualice correctamente
      // incluso si el sprite se crea de forma asíncrona
      wall.setWallPosition(position.getX(), position.getY())
      console.log(
        `BaseWallBuilder.buildWall: Created wall at (${position.getX()}, ${position.getY()}), destroyed: ${wall.isDestroyed()}`,
      )
      // El wall disparará SpriteEvent.CREATED en su constructor
      // y se agregará automáticamente al SpriteContainer
    }

    // Verificar que los muros se agregaron al container
    setTimeout(() => {
      const walls = this.spriteContainer!.getWalls()
      console.log(
        `BaseWallBuilder.buildWall: Total walls in container: ${walls.length}`,
      )
      const wallsAtPositions = walls.filter(wall => {
        return this.positions.some(
          pos => wall.getX() === pos.getX() && wall.getY() === pos.getY(),
        )
      })
      console.log(
        `BaseWallBuilder.buildWall: Walls at target positions: ${wallsAtPositions.length}`,
      )
    }, 100)
  }

  public destroyWall(): void {
    if (!this.spriteContainer) {
      return
    }

    console.log('BaseWallBuilder.destroyWall: Starting destruction')

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

    console.log(
      `BaseWallBuilder.destroyWall: Found ${wallsToDestroy.length} walls to destroy`,
    )

    // Luego destruirlos
    for (const wall of wallsToDestroy) {
      if (!wall.isDestroyed()) {
        console.log(
          `BaseWallBuilder.destroyWall: Destroying wall at (${wall.getX()}, ${wall.getY()})`,
        )
        wall.destroy()
      }
    }
  }
}
