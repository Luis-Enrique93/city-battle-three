// StageMessage pattern del original - muestra "STAGE X" antes de cada nivel
export class StageMessage {
  private stage: number
  private visible: boolean = false
  private container!: HTMLDivElement

  constructor(stage: number) {
    this.stage = stage
    this.createMessage()
  }

  private createMessage(): void {
    this.container = document.createElement('div')
    this.container.className = 'stage-message'
    this.container.style.position = 'fixed'
    this.container.style.top = '50%'
    this.container.style.left = '50%'
    this.container.style.transform = 'translate(-50%, -50%)'
    this.container.style.zIndex = '3000'
    this.container.style.fontFamily = "'Courier New', monospace"
    this.container.style.fontSize = '32px'
    this.container.style.fontWeight = 'bold'
    this.container.style.color = '#000000'
    this.container.style.backgroundColor = 'transparent'
    this.container.style.pointerEvents = 'none'
    this.container.style.opacity = '0'
    this.container.style.transition = 'opacity 0.2s'
    this.container.textContent = `STAGE ${this.stage
      .toString()
      .padStart(2, ' ')}`

    document.body.appendChild(this.container)
  }

  public show(): void {
    this.visible = true
    this.container.style.opacity = '1'
  }

  public hide(): void {
    this.visible = false
    this.container.style.opacity = '0'
  }

  public isVisible(): boolean {
    return this.visible
  }

  public destroy(): void {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
  }
}
