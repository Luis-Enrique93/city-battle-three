import type { EventManager } from '../event-manager'

export interface IScene {
  update(): void
  draw(renderer: unknown): void
}

export interface ISceneManager {
  getEventManager(): EventManager
  toMainMenuScene(arrived?: boolean): void
  toGameScene(stage?: number, player?: unknown): void
  toStageStatisticsScene(
    stage?: number,
    player?: unknown,
    gameOver?: boolean,
  ): void
}
