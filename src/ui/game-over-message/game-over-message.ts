// GameOverMessage pattern del original - mensaje que aparece desde abajo cuando pierdes
export class GameOverMessage {
  public x: number
  public y: number
  private container!: HTMLDivElement

  constructor() {
    // Empezar fuera de la pantalla abajo (como en el original)
    this.x = 210 // Posición X fija (centro aproximado)
    this.y = document.documentElement.clientHeight + 16
    this.createMessage()
  }

  private createMessage(): void {
    this.container = document.createElement('div')
    this.container.className = 'game-over-message'
    this.container.style.position = 'fixed'
    this.container.style.left = `${this.x}px`
    this.container.style.top = `${this.y}px`
    this.container.style.fontFamily = "'Courier New', monospace"
    this.container.style.fontSize = '16px'
    this.container.style.fontWeight = 'bold'
    this.container.style.color = '#e44437'
    this.container.style.whiteSpace = 'nowrap'
    this.container.style.pointerEvents = 'none'
    this.container.style.zIndex = '1500'
    this.container.style.transform = 'translateY(-50%)'

    const gameText = document.createElement('div')
    gameText.textContent = 'GAME'
    gameText.style.lineHeight = '16px'

    const overText = document.createElement('div')
    overText.textContent = 'OVER'
    overText.style.lineHeight = '16px'
    overText.style.marginTop = '0px'

    this.container.appendChild(gameText)
    this.container.appendChild(overText)

    document.body.appendChild(this.container)
  }

  public updatePosition(): void {
    if (this.container) {
      this.container.style.left = `${this.x}px`
      this.container.style.top = `${this.y}px`
    }
  }

  public destroy(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
  }
}
