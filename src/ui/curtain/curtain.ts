// Curtain pattern del original - cortina gris que cubre la pantalla
export class Curtain {
  private height: number
  private speed: number = 15
  private position: number = 0
  private topCurtain!: HTMLDivElement
  private bottomCurtain!: HTMLDivElement

  constructor() {
    // La altura debe ser la mitad de la altura visible de la pantalla
    // Usar document.documentElement.clientHeight para obtener la altura del viewport sin scrollbars
    this.height = Math.floor(document.documentElement.clientHeight / 2)
    this.createCurtain()
  }

  private createCurtain(): void {
    const container = document.createElement('div')
    container.className = 'curtain-container'
    container.style.position = 'fixed'
    container.style.top = '0'
    container.style.left = '0'
    container.style.width = '100%'
    container.style.height = '100%'
    container.style.zIndex = '2500'
    container.style.pointerEvents = 'none'

    this.topCurtain = document.createElement('div')
    this.topCurtain.className = 'curtain-top'
    this.topCurtain.style.position = 'absolute'
    this.topCurtain.style.top = '0'
    this.topCurtain.style.left = '0'
    this.topCurtain.style.width = '100%'
    this.topCurtain.style.height = '0px'
    this.topCurtain.style.backgroundColor = '#808080'
    container.appendChild(this.topCurtain)

    this.bottomCurtain = document.createElement('div')
    this.bottomCurtain.className = 'curtain-bottom'
    this.bottomCurtain.style.position = 'absolute'
    this.bottomCurtain.style.bottom = '0'
    this.bottomCurtain.style.left = '0'
    this.bottomCurtain.style.width = '100%'
    this.bottomCurtain.style.height = '0px'
    this.bottomCurtain.style.backgroundColor = '#808080'
    container.appendChild(this.bottomCurtain)

    document.body.appendChild(container)
  }

  public setHeight(height: number): void {
    this.height = height
  }

  public setSpeed(speed: number): void {
    this.speed = speed
  }

  public getPosition(): number {
    return this.position
  }

  public setPosition(position: number): void {
    this.position = position
    this.updateCurtain()
  }

  public fall(): void {
    if (this.isFallen()) {
      return
    }

    this.position += this.speed

    if (this.isFallen()) {
      this.position = this.height
    }

    this.updateCurtain()
  }

  public rise(): void {
    if (this.isRisen()) {
      return
    }

    this.position -= this.speed

    if (this.isRisen()) {
      this.position = 0
    }

    this.updateCurtain()
  }

  private updateCurtain(): void {
    this.topCurtain.style.height = `${this.position}px`
    this.bottomCurtain.style.height = `${this.position}px`
  }

  public isFallen(): boolean {
    return this.position >= this.height
  }

  public isRisen(): boolean {
    return this.position <= 0
  }

  public destroy(): void {
    const container = this.topCurtain.parentNode
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
  }
}
