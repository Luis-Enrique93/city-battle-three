import type { IScene, ISceneManager } from '../../core/scene-manager'
import type { Renderer } from '../../core/renderer'
import type { IEventSubscriber, GameEvent } from '../../core/event-manager'
import type { Player } from '../../core/player'
import { Keyboard } from '../../core/keyboard'
import { GameOver } from '../../ui/game-over/game-over'
import * as THREE from 'three'

export class GameOverScene implements IScene, IEventSubscriber {
  private gameOver: GameOver

  constructor(
    sceneManager: ISceneManager,
    _threeScene: THREE.Scene,
    player: Player,
  ) {
    const eventManager = sceneManager.getEventManager()
    eventManager.addSubscriber(this, [Keyboard.Event.KEY_PRESSED])

    this.gameOver = new GameOver(sceneManager, player)
  }

  public update(): void {
    this.gameOver.update()
  }

  public draw(_renderer: Renderer): void {
    // El renderizado se hace con HTML/CSS
  }

  public destroy(): void {
    if (this.gameOver) {
      this.gameOver.destroy()
    }
  }

  public notify(event: GameEvent): void {
    if (event.name === Keyboard.Event.KEY_PRESSED) {
      const key = (event as any).key as number
      this.gameOver.handleKeyPress(key)
    }
  }
}
