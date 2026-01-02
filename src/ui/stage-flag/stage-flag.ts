export class StageFlag {
  private container: HTMLDivElement
  private stageText: HTMLSpanElement
  private flagImg: HTMLImageElement | null = null

  constructor(stage: number) {
    this.container = document.createElement('div')
    this.container.className = 'stage-flag'

    // Crear label "STAGE"
    const label = document.createElement('div')
    label.className = 'stage-label'
    label.textContent = 'STAGE'
    this.container.appendChild(label)

    // Crear imagen de la bandera
    this.flagImg = document.createElement('img')
    this.flagImg.style.imageRendering = 'pixelated'
    this.flagImg.style.width = '32px'
    this.flagImg.style.height = '32px'
    this.loadFlagImage()
    this.container.appendChild(this.flagImg)

    // Crear texto del stage
    this.stageText = document.createElement('span')
    this.stageText.className = 'stage-number'
    this.setStage(stage)
    this.container.appendChild(this.stageText)

    // Agregar al contenedor UI si existe, sino al body
    const uiContainer = document.querySelector('.game-ui-container')
    if (uiContainer) {
      uiContainer.appendChild(this.container)
    } else {
      document.body.appendChild(this.container)
    }
  }

  private loadFlagImage(): void {
    if (!this.flagImg) return
    this.flagImg.onload = () => {
      // La imagen se carga correctamente
    }
    this.flagImg.onerror = () => {
      setTimeout(() => this.loadFlagImage(), 100)
    }
    this.flagImg.src = '/images/flag.png'
  }

  public setStage(stage: number): void {
    this.stageText.textContent = stage.toString().padStart(2, ' ')
  }

  public destroy(): void {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
  }
}
