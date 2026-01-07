import type { ISceneManager } from '../../core/scene-manager'
import type { Player } from '../../core/player'
import { Script } from '../../core/script/script'
import { Delay } from '../../core/script/delay'
import { SoundManager } from '../../core/sound-manager'
import { Keyboard } from '../../core/keyboard'

// GameOver pattern del original - muestra "GAME OVER" y el score final
export class GameOver {
  private sceneManager: ISceneManager
  private player: Player
  private container!: HTMLDivElement
  private script: Script
  private canContinue: boolean = false
  private continueText!: HTMLDivElement

  constructor(sceneManager: ISceneManager, player: Player) {
    this.sceneManager = sceneManager
    this.player = player

    // Crear script siguiendo el patrón del original
    this.script = new Script()

    // Reproducir sonido de game over
    this.script.enqueue({
      execute: () => {
        SoundManager.getInstance().play('game_over')
      },
    })

    // Delay antes de permitir continuar (como en el original)
    this.script.enqueue(new Delay(this.script, 120)) // ~2 segundos a 60fps

    this.script.enqueue({
      execute: () => {
        this.canContinue = true
        // Mostrar texto de continuar cuando esté listo
        if (this.continueText) {
          this.continueText.style.opacity = '1'
        }
      },
    })

    this.createGameOver()
  }

  private createGameOver(): void {
    this.container = document.createElement('div')
    this.container.className = 'game-over'
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

    // GAME OVER text
    const gameOverText = document.createElement('div')
    gameOverText.className = 'game-over-text'
    gameOverText.textContent = 'GAME OVER'
    gameOverText.style.fontSize = '48px'
    gameOverText.style.fontWeight = 'bold'
    gameOverText.style.marginBottom = '40px'
    gameOverText.style.textAlign = 'center'
    gameOverText.style.letterSpacing = '4px'
    gameOverText.style.textShadow = '2px 2px 4px rgba(255, 0, 0, 0.5)'

    // Score container
    const scoreContainer = document.createElement('div')
    scoreContainer.className = 'game-over-score'
    scoreContainer.style.display = 'flex'
    scoreContainer.style.flexDirection = 'column'
    scoreContainer.style.alignItems = 'center'
    scoreContainer.style.gap = '20px'
    scoreContainer.style.marginBottom = '40px'

    const scoreLabel = document.createElement('div')
    scoreLabel.textContent = 'SCORE'
    scoreLabel.style.fontSize = '24px'
    scoreLabel.style.fontWeight = 'bold'

    const scoreValue = document.createElement('div')
    scoreValue.className = 'game-over-score-value'
    scoreValue.textContent = this.player.getScore().toString().padStart(6, '0')
    scoreValue.style.fontSize = '32px'
    scoreValue.style.fontWeight = 'bold'
    scoreValue.style.color = '#ffff00'

    scoreContainer.appendChild(scoreLabel)
    scoreContainer.appendChild(scoreValue)

    // Continue text (aparece después del delay)
    this.continueText = document.createElement('div')
    this.continueText.className = 'game-over-continue'
    this.continueText.textContent = 'PRESS SPACE TO CONTINUE'
    this.continueText.style.fontSize = '18px'
    this.continueText.style.opacity = '0'
    this.continueText.style.transition = 'opacity 0.5s'
    this.continueText.style.marginTop = '20px'

    this.container.appendChild(gameOverText)
    this.container.appendChild(scoreContainer)
    this.container.appendChild(this.continueText)

    document.body.appendChild(this.container)
  }

  public update(): void {
    if (this.script.isActive()) {
      this.script.update()
    }
  }

  public handleKeyPress(key: number): void {
    if (this.canContinue && key === Keyboard.Key.SPACE) {
      // Volver al menú principal
      this.sceneManager.toMainMenuScene()
    }
  }

  public destroy(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
  }
}
