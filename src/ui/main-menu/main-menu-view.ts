import type { MainMenuModel } from './main-menu-model'
import type { MainMenuCursor } from './main-menu-cursor'

// MainMenuView pattern del original - renderiza el menú (adaptado a HTML/CSS)
export class MainMenuView {
  private menu: MainMenuModel
  private cursor: MainMenuCursor
  private menuContainer!: HTMLDivElement
  private cursorElement!: HTMLDivElement

  constructor(menu: MainMenuModel, cursor: MainMenuCursor) {
    this.menu = menu
    this.cursor = cursor
    this.createView()
  }

  private createView(): void {
    // El contenedor principal se crea en MainMenuScene
    // Aquí solo creamos la parte del menú
    this.menuContainer = document.createElement('div')
    this.menuContainer.className = 'menu-options'
    this.menuContainer.style.position = 'relative'

    this.cursorElement = document.createElement('div')
    this.cursorElement.className = 'menu-cursor'
    this.cursorElement.textContent = '>'
    this.cursorElement.style.position = 'absolute'
    this.cursorElement.style.left = '-30px'
    this.cursorElement.style.fontSize = '18px'
    this.cursorElement.style.color = '#feac4e'
    this.cursorElement.style.transition = 'top 0.2s'
    this.cursorElement.style.opacity = '0'
    this.menuContainer.appendChild(this.cursorElement)

    this.update()
  }

  public update(): void {
    const itemsInfo = this.menu.getItemsInfo()

    // Limpiar items existentes
    const existingItems = this.menuContainer.querySelectorAll('.menu-item')
    existingItems.forEach(item => item.remove())

    // Crear items
    itemsInfo.forEach(info => {
      const menuItem = document.createElement('div')
      menuItem.className = 'menu-item'
      menuItem.textContent = info.name
      menuItem.style.padding = '12px 24px'
      menuItem.style.cursor = 'pointer'
      menuItem.style.fontSize = '18px'
      menuItem.style.transition = 'color 0.2s'
      menuItem.style.color = info.isCurrent ? '#feac4e' : '#ffffff'

      if (info.isCurrent) {
        const itemRect = menuItem.getBoundingClientRect()
        const containerRect = this.menuContainer.getBoundingClientRect()
        this.cursorElement.style.top = `${
          itemRect.top - containerRect.top + itemRect.height / 2 - 10
        }px`
        this.cursorElement.style.opacity = this.cursor.isVisible() ? '1' : '0'
      }

      this.menuContainer.appendChild(menuItem)
    })
  }

  public getContainer(): HTMLDivElement {
    return this.menuContainer
  }
}
