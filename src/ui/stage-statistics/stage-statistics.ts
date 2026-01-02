import type { Player } from '../../core/player'
import type { ISceneManager } from '../../core/scene-manager'
import { Tank } from '../../game-objects/tank'
import { Script } from '../../core/script/script'
import { Delay } from '../../core/script/delay'
import { StageStatisticsPoints } from './stage-statistics-points'

// StageStatisticsScene pattern del original - usa Script para secuenciar animaciones
export class StageStatistics {
  private sceneManager: ISceneManager
  private player: Player
  private stage: number
  private gameOver: boolean
  private container!: HTMLDivElement
  private script: Script
  private basicTankPoints!: StageStatisticsPoints
  private fastTankPoints!: StageStatisticsPoints
  private powerTankPoints!: StageStatisticsPoints
  private armorTankPoints!: StageStatisticsPoints
  private drawTotal: boolean = false

  constructor(
    sceneManager: ISceneManager,
    stage: number,
    player: Player,
    gameOver: boolean,
  ) {
    this.sceneManager = sceneManager
    this.stage = stage
    this.player = player
    this.gameOver = gameOver

    // Crear script siguiendo el patrón del original
    this.script = new Script()

    // Crear StageStatisticsPoints para cada tipo de tanque
    this.basicTankPoints = new StageStatisticsPoints(
      100,
      player.getTanks(Tank.Type.BASIC),
      this.script,
    )
    this.fastTankPoints = new StageStatisticsPoints(
      200,
      player.getTanks(Tank.Type.FAST),
      this.script,
    )
    this.powerTankPoints = new StageStatisticsPoints(
      300,
      player.getTanks(Tank.Type.POWER),
      this.script,
    )
    this.armorTankPoints = new StageStatisticsPoints(
      400,
      player.getTanks(Tank.Type.ARMOR),
      this.script,
    )

    // Secuenciar animaciones siguiendo el patrón del original
    // Delay inicial reducido de 30 a 15 frames
    this.script.enqueue(new Delay(this.script, 15))
    this.script.enqueue({
      execute: () => {
        this.basicTankPoints.show()
      },
    })
    this.script.enqueue(this.basicTankPoints)
    this.script.enqueue({
      execute: () => {
        this.fastTankPoints.show()
      },
    })
    this.script.enqueue(this.fastTankPoints)
    this.script.enqueue({
      execute: () => {
        this.powerTankPoints.show()
      },
    })
    this.script.enqueue(this.powerTankPoints)
    this.script.enqueue({
      execute: () => {
        this.armorTankPoints.show()
      },
    })
    this.script.enqueue(this.armorTankPoints)
    this.script.enqueue({
      execute: () => {
        this.drawTotal = true
      },
    })
    // Delay final reducido de 60 a 30 frames
    this.script.enqueue(new Delay(this.script, 30))
    this.script.enqueue({
      execute: () => {
        this.player.resetTanks()
        if (this.gameOver) {
          // TODO: Ir a Game Over Scene
          this.sceneManager.toMainMenuScene()
        } else {
          this.sceneManager.toGameScene(this.stage + 1, this.player)
        }
      },
    })

    this.createStatistics()
  }

  private createStatistics(): void {
    this.container = document.createElement('div')
    this.container.className = 'stage-statistics'
    this.container.style.position = 'fixed'
    this.container.style.top = '0'
    this.container.style.left = '0'
    this.container.style.width = '100%'
    this.container.style.height = '100%'
    this.container.style.backgroundColor = '#000000'
    this.container.style.display = 'flex'
    this.container.style.flexDirection = 'column'
    this.container.style.alignItems = 'center'
    this.container.style.justifyContent = 'center'
    this.container.style.zIndex = '2000'
    this.container.style.fontFamily = "'Courier New', monospace"
    this.container.style.color = '#ffffff'
    this.container.style.padding = '40px'

    // High Score
    const highScoreContainer = document.createElement('div')
    highScoreContainer.className = 'statistics-high-score'
    highScoreContainer.style.position = 'absolute'
    highScoreContainer.style.top = '20px'
    highScoreContainer.style.right = '40px'
    highScoreContainer.style.fontSize = '16px'
    highScoreContainer.style.color = '#feac4e'
    highScoreContainer.textContent = '20000'
    this.container.appendChild(highScoreContainer)

    // Stage
    const stageContainer = document.createElement('div')
    stageContainer.className = 'statistics-stage'
    stageContainer.style.fontSize = '24px'
    stageContainer.style.fontWeight = 'bold'
    stageContainer.style.marginBottom = '40px'
    stageContainer.textContent = `STAGE ${this.stage
      .toString()
      .padStart(2, ' ')}`
    this.container.appendChild(stageContainer)

    // Player info
    const playerContainer = document.createElement('div')
    playerContainer.className = 'statistics-player'
    playerContainer.style.display = 'flex'
    playerContainer.style.alignItems = 'center'
    playerContainer.style.gap = '16px'
    playerContainer.style.marginBottom = '60px'

    const romanOneImg = document.createElement('img')
    romanOneImg.src = '/images/roman_one_red.png'
    romanOneImg.style.imageRendering = 'pixelated'
    romanOneImg.style.width = '32px'
    romanOneImg.style.height = '32px'
    playerContainer.appendChild(romanOneImg)

    const playerLabel = document.createElement('div')
    playerLabel.style.fontSize = '18px'
    playerLabel.style.color = '#e44437'
    playerLabel.textContent = '-PLAYER'
    playerContainer.appendChild(playerLabel)

    const playerScore = document.createElement('div')
    playerScore.className = 'statistics-player-score'
    playerScore.style.fontSize = '20px'
    playerScore.style.color = '#feac4e'
    playerScore.textContent = this.player.getScore().toString().padStart(7, ' ')
    playerContainer.appendChild(playerScore)

    this.container.appendChild(playerContainer)

    // Tank statistics - siguiendo el patrón del original
    const tanksContainer = document.createElement('div')
    tanksContainer.className = 'statistics-tanks'
    tanksContainer.style.display = 'flex'
    tanksContainer.style.flexDirection = 'column'
    tanksContainer.style.gap = '24px'
    tanksContainer.style.width = '100%'
    tanksContainer.style.maxWidth = '600px'

    // BASIC
    const basicRow = this.createTankRow('basic', this.basicTankPoints)
    tanksContainer.appendChild(basicRow)

    // FAST
    const fastRow = this.createTankRow('fast', this.fastTankPoints)
    tanksContainer.appendChild(fastRow)

    // POWER
    const powerRow = this.createTankRow('power', this.powerTankPoints)
    tanksContainer.appendChild(powerRow)

    // ARMOR
    const armorRow = this.createTankRow('armor', this.armorTankPoints)
    tanksContainer.appendChild(armorRow)

    this.container.appendChild(tanksContainer)

    // Total
    const totalContainer = document.createElement('div')
    totalContainer.className = 'statistics-total'
    totalContainer.style.display = 'flex'
    totalContainer.style.alignItems = 'center'
    totalContainer.style.gap = '16px'
    totalContainer.style.marginTop = '40px'
    totalContainer.style.opacity = '0'
    totalContainer.style.transition = 'opacity 0.3s'

    const totalLabel = document.createElement('div')
    totalLabel.style.fontSize = '18px'
    totalLabel.style.fontWeight = 'bold'
    totalLabel.textContent = 'TOTAL'
    totalContainer.appendChild(totalLabel)

    const lineImg = document.createElement('img')
    lineImg.src = '/images/white_line.png'
    lineImg.style.imageRendering = 'pixelated'
    lineImg.style.width = '100px'
    lineImg.style.height = '2px'
    totalContainer.appendChild(lineImg)

    const totalCount = document.createElement('div')
    totalCount.className = 'statistics-total-count'
    totalCount.style.fontSize = '18px'
    totalCount.style.fontWeight = 'bold'
    totalCount.textContent = '0'
    totalContainer.appendChild(totalCount)

    this.container.appendChild(totalContainer)

    document.body.appendChild(this.container)
  }

  private createTankRow(
    type: string,
    _points: StageStatisticsPoints,
  ): HTMLDivElement {
    const tankRow = document.createElement('div')
    tankRow.className = `tank-stat-row tank-stat-${type}`
    tankRow.style.display = 'flex'
    tankRow.style.alignItems = 'center'
    tankRow.style.gap = '16px'
    tankRow.style.opacity = '0'
    tankRow.style.transition = 'opacity 0.3s'

    // Points label
    const pointsLabel = document.createElement('div')
    pointsLabel.style.fontSize = '16px'
    pointsLabel.style.minWidth = '60px'
    pointsLabel.textContent = 'PTS'
    tankRow.appendChild(pointsLabel)

    // Count (se actualiza desde StageStatisticsPoints)
    const countContainer = document.createElement('div')
    countContainer.className = `tank-count-${type}`
    countContainer.style.fontSize = '16px'
    countContainer.style.minWidth = '120px'
    countContainer.textContent = ''
    tankRow.appendChild(countContainer)

    // Tank image
    const tankImg = document.createElement('img')
    tankImg.src = `/images/tank_${type}_up_c0_t1.png`
    tankImg.style.imageRendering = 'pixelated'
    tankImg.style.width = '32px'
    tankImg.style.height = '32px'
    tankRow.appendChild(tankImg)

    // Arrow
    const arrowImg = document.createElement('img')
    arrowImg.src = '/images/arrow.png'
    arrowImg.style.imageRendering = 'pixelated'
    arrowImg.style.width = '16px'
    arrowImg.style.height = '16px'
    tankRow.appendChild(arrowImg)

    return tankRow
  }

  public update(): void {
    // Actualizar script principal siguiendo el patrón del original
    // El script principal encola los StageStatisticsPoints, y cada uno actualiza su script interno
    this.script.update()

    // Actualizar visualización de cada tanque
    // Los scripts internos de cada StageStatisticsPoints se actualizan cuando están en la cola del script principal
    this.updateTankRow('basic', this.basicTankPoints)
    this.updateTankRow('fast', this.fastTankPoints)
    this.updateTankRow('power', this.powerTankPoints)
    this.updateTankRow('armor', this.armorTankPoints)

    // Actualizar total
    if (this.drawTotal) {
      const totalCount = this.container.querySelector(
        '.statistics-total-count',
      ) as HTMLDivElement
      if (totalCount) {
        totalCount.textContent = this.player
          .getTanksCount()
          .toString()
          .padStart(2, ' ')
      }
      const totalContainer = this.container.querySelector(
        '.statistics-total',
      ) as HTMLDivElement
      if (totalContainer) {
        totalContainer.style.opacity = '1'
      }
    }
  }

  private updateTankRow(type: string, points: StageStatisticsPoints): void {
    const row = this.container.querySelector(
      `.tank-stat-${type}`,
    ) as HTMLDivElement
    const countElement = this.container.querySelector(
      `.tank-count-${type}`,
    ) as HTMLDivElement

    if (row && countElement) {
      if (points.isVisible()) {
        row.style.opacity = '1'
        countElement.textContent = points.getDisplayText()
      }
    }
  }

  public destroy(): void {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
  }
}
