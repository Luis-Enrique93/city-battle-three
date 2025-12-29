import { EventManager } from '../event-manager'
import type { IScene, ISceneManager } from './types'
import type { Renderer } from '../renderer'
import { LoadingScene } from '../../scenes/loading-scene'
import { MainMenuScene } from '../../scenes/main-menu-scene'
import { GameScene } from '../../scenes/game-scene'

export class SceneManager implements ISceneManager {
  private eventManager: EventManager
  private scene: IScene | null = null
  private renderer: Renderer | null = null

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager
  }

  public setRenderer(renderer: Renderer): void {
    this.renderer = renderer
  }

  public setScene(scene: IScene): void {
    // Limpiar escena anterior si existe
    if (this.renderer && this.scene) {
      const threeScene = this.renderer.getScene()
      while (threeScene.children.length > 0) {
        threeScene.remove(threeScene.children[0])
      }
    }
    this.scene = scene
  }

  public getScene(): IScene | null {
    return this.scene
  }

  public toLoadingScene(): void {
    this.eventManager.removeAllSubscribers()
    if (this.renderer) {
      // Limpiar escena primero
      const threeScene = this.renderer.getScene()
      while (threeScene.children.length > 0) {
        threeScene.remove(threeScene.children[0])
      }
      // Luego crear la nueva escena
      const loadingScene = new LoadingScene(this, threeScene)
      this.scene = loadingScene
    }
  }

  public toMainMenuScene(arrived?: boolean): void {
    this.eventManager.removeAllSubscribers()
    if (this.renderer) {
      // Limpiar escena primero
      const threeScene = this.renderer.getScene()
      while (threeScene.children.length > 0) {
        threeScene.remove(threeScene.children[0])
      }
      // Luego crear la nueva escena (que agregará sus sprites)
      const mainMenuScene = new MainMenuScene(this, threeScene)
      this.scene = mainMenuScene
      if (arrived) {
        mainMenuScene.nextMenuItem()
        mainMenuScene.arrived()
      }
    }
  }

  public toGameScene(stage?: number, player?: unknown): void {
    this.eventManager.removeAllSubscribers()
    if (this.renderer) {
      // Limpiar escena primero
      const threeScene = this.renderer.getScene()
      while (threeScene.children.length > 0) {
        threeScene.remove(threeScene.children[0])
      }
      // Crear GameScene con stage (default 1)
      const gameScene = new GameScene(this, threeScene, stage || 1)
      this.scene = gameScene
    }
  }

  public toConstructionScene(): void {
    this.eventManager.removeAllSubscribers()
    // TODO: Implement ConstructionScene
    // this.scene = new Construction(this)
  }

  public toStageStatisticsScene(
    stage?: number,
    player?: unknown,
    gameOver?: boolean,
  ): void {
    this.eventManager.removeAllSubscribers()
    // TODO: Implement StageStatisticsScene
    // this.scene = new StageStatisticsScene(this, stage, player, gameOver)
  }

  public toGameOverScene(): void {
    this.eventManager.removeAllSubscribers()
    // TODO: Implement GameOverScene
    // this.scene = new GameOverScene(this)
  }

  public update(): void {
    if (this.scene) {
      this.scene.update()
    }
  }

  public draw(renderer: unknown): void {
    if (this.scene) {
      this.scene.draw(renderer)
    }
  }

  public getEventManager(): EventManager {
    return this.eventManager
  }
}
