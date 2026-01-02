import type { IScene, ISceneManager } from '../../core/scene-manager'
import type { Renderer } from '../../core/renderer'
import { StageStatistics } from '../../ui/stage-statistics/stage-statistics'
import type { Player } from '../../core/player'
import * as THREE from 'three'

export class StageStatisticsScene implements IScene {
  private stageStatistics: StageStatistics

  constructor(
    sceneManager: ISceneManager,
    _threeScene: THREE.Scene,
    stage: number,
    player: Player,
    gameOver: boolean,
  ) {
    this.stageStatistics = new StageStatistics(
      sceneManager,
      stage,
      player,
      gameOver,
    )
  }

  public update(): void {
    this.stageStatistics.update()
  }

  public draw(_renderer: Renderer): void {
    // El renderizado se hace con HTML/CSS
  }

  public destroy(): void {
    if (this.stageStatistics) {
      this.stageStatistics.destroy()
    }
  }
}
