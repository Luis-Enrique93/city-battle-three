import type { ISceneManager } from '../../core/scene-manager'
import type { IMenuItem } from './main-menu-model'

// MenuItem pattern del original - cada item tiene nombre y acción
export class OnePlayerMenuItem implements IMenuItem {
  private sceneManager: ISceneManager

  constructor(sceneManager: ISceneManager) {
    this.sceneManager = sceneManager
  }

  public getName(): string {
    return '1 PLAYER'
  }

  public execute(): void {
    this.sceneManager.toGameScene(1)
  }
}

export class ConstructionMenuItem implements IMenuItem {
  private sceneManager: ISceneManager

  constructor(sceneManager: ISceneManager) {
    this.sceneManager = sceneManager
  }

  public getName(): string {
    return 'CONSTRUCTION'
  }

  public execute(): void {
    // Por ahora solo inicia el juego
    this.sceneManager.toGameScene(1)
  }
}
