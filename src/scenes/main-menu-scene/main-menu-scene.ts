import type { IScene, ISceneManager } from '../../core/scene-manager'
import type { Renderer } from '../../core/renderer'
import type { IEventSubscriber, GameEvent } from '../../core/event-manager'
import { Keyboard } from '../../core/keyboard'
import { MainMenu } from '../../ui/main-menu/main-menu'
import * as THREE from 'three'

export class MainMenuScene implements IScene, IEventSubscriber {
  private mainMenu: MainMenu

  constructor(sceneManager: ISceneManager, _threeScene: THREE.Scene) {
    const eventManager = sceneManager.getEventManager()
    eventManager.addSubscriber(this, [Keyboard.Event.KEY_PRESSED])

    this.mainMenu = new MainMenu(sceneManager)
  }

  public update(): void {
    this.mainMenu.update()
  }

  public draw(_renderer: Renderer): void {
    // El renderizado se hace con HTML/CSS
  }

  public destroy(): void {
    if (this.mainMenu) {
      this.mainMenu.destroy()
    }
  }

  public notify(_event: GameEvent): void {
    // El controlador maneja el input directamente a través del EventManager
  }

  public nextMenuItem(): void {
    this.mainMenu.nextItem()
  }

  public arrived(): void {
    // Ya no necesario con HTML
  }
}
