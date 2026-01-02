import type { Player } from '../../core/player'

export class LivesView {
  private player: Player
  private container: HTMLDivElement
  private livesText: HTMLSpanElement
  private livesImg: HTMLImageElement | null = null

  constructor(player: Player) {
    this.player = player
    this.container = document.createElement('div')
    this.container.className = 'lives-view'

    // Crear label "LIVES"
    const label = document.createElement('div')
    label.className = 'lives-label'
    label.textContent = 'LIVES'
    this.container.appendChild(label)

    // Crear icono "lives"
    this.livesImg = document.createElement('img')
    this.livesImg.style.imageRendering = 'pixelated'
    this.livesImg.style.width = '32px'
    this.livesImg.style.height = '32px'
    this.loadLivesImage()
    this.container.appendChild(this.livesImg)

    // Crear número de vidas
    this.livesText = document.createElement('div')
    this.livesText.className = 'lives-count'
    this.update()
    this.container.appendChild(this.livesText)

    // Agregar al contenedor UI si existe, sino al body
    const uiContainer = document.querySelector('.game-ui-container')
    if (uiContainer) {
      uiContainer.appendChild(this.container)
    } else {
      document.body.appendChild(this.container)
    }
  }

  private loadLivesImage(): void {
    if (!this.livesImg) return
    // Usar directamente la ruta de la imagen
    this.livesImg.onload = () => {
      // La imagen se carga correctamente
    }
    this.livesImg.onerror = () => {
      setTimeout(() => this.loadLivesImage(), 100)
    }
    this.livesImg.src = '/images/lives.png'
  }

  public update(): void {
    this.livesText.textContent = this.player.getLives().toString()
  }

  public destroy(): void {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
  }
}
