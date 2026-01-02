import type { EnemyFactory } from '../../core/enemy-factory'

export class EnemyFactoryView {
  private enemyFactory: EnemyFactory
  private container: HTMLDivElement
  private enemyIcons: HTMLImageElement[] = []

  constructor(enemyFactory: EnemyFactory) {
    this.enemyFactory = enemyFactory
    this.container = document.createElement('div')
    this.container.className = 'enemy-factory-view'

    // Crear label "ENEMIES"
    const label = document.createElement('div')
    label.className = 'enemy-label'
    label.textContent = 'ENEMIES'
    this.container.appendChild(label)

    // Crear grid de enemigos
    const grid = document.createElement('div')
    grid.className = 'enemy-grid'
    this.container.appendChild(grid)

    // Agregar al contenedor UI si existe, sino al body
    const uiContainer = document.querySelector('.game-ui-container')
    if (uiContainer) {
      uiContainer.appendChild(this.container)
    } else {
      document.body.appendChild(this.container)
    }
    this.update()
  }

  public update(): void {
    const count = this.enemyFactory.getEnemiesToCreateCount()

    // Obtener el grid (debe existir porque se crea en el constructor)
    const grid = this.container.querySelector('.enemy-grid') as HTMLDivElement
    if (!grid) return

    // Solo actualizar si el número de enemigos cambió
    if (this.enemyIcons.length === count) {
      return
    }

    // Limpiar iconos existentes
    this.enemyIcons.forEach(icon => {
      if (icon.parentNode) {
        icon.parentNode.removeChild(icon)
      }
    })
    this.enemyIcons = []

    // Crear iconos para cada enemigo restante
    for (let i = 0; i < count; i++) {
      const icon = document.createElement('img')
      icon.className = 'enemy-icon'
      icon.style.imageRendering = 'pixelated'
      icon.style.imageRendering = 'crisp-edges'
      icon.style.objectFit = 'contain'
      icon.style.display = 'block' // Mostrar inmediatamente
      icon.style.visibility = 'visible'
      icon.style.opacity = '0' // Invisible hasta que se cargue

      // Cargar imagen de enemigo
      this.loadEnemyImage(icon)

      grid.appendChild(icon)
      this.enemyIcons.push(icon)
    }
  }

  private loadEnemyImage(img: HTMLImageElement): void {
    // Configurar handlers antes de establecer src
    img.onload = () => {
      img.style.opacity = '1'
      img.style.visibility = 'visible'
    }
    img.onerror = () => {
      // Si falla, mantener invisible y reintentar
      img.style.opacity = '0'
      img.style.visibility = 'hidden'
      setTimeout(() => this.loadEnemyImage(img), 100)
    }
    // Usar enemy.png para los enemigos (el sprite correcto)
    // Establecer src después de los handlers
    img.src = '/images/enemy.png'
    img.alt = 'enemy'
  }

  public destroy(): void {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
  }
}
