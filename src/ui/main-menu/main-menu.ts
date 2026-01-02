import type { ISceneManager } from '../../core/scene-manager'
import { MainMenuModel } from './main-menu-model'
import { MainMenuController } from './main-menu-controller'
import { MainMenuView } from './main-menu-view'
import { MainMenuCursor } from './main-menu-cursor'
import { OnePlayerMenuItem, ConstructionMenuItem } from './main-menu-items'
import { Globals } from '../../core/globals'

// MainMenu pattern del original - coordina modelo, vista, controlador y cursor
export class MainMenu {
  private container!: HTMLDivElement
  private menuModel: MainMenuModel
  private menuController: MainMenuController
  private menuView: MainMenuView
  private cursor: MainMenuCursor
  private y: number = Globals.CANVAS_HEIGHT
  private speed: number = 3

  constructor(sceneManager: ISceneManager) {
    // Crear componentes siguiendo el patrón del original
    this.menuModel = new MainMenuModel()
    this.menuModel.setItems([
      new OnePlayerMenuItem(sceneManager),
      new ConstructionMenuItem(sceneManager),
    ])

    const eventManager = sceneManager.getEventManager()
    this.menuController = new MainMenuController(eventManager, this.menuModel)
    this.menuController.deactivate() // Se activa cuando llega arriba

    this.cursor = new MainMenuCursor()
    this.menuView = new MainMenuView(this.menuModel, this.cursor)

    this.createMenu()
  }

  private createMenu(): void {
    this.container = document.createElement('div')
    this.container.className = 'main-menu'
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
    this.container.style.transform = `translateY(${this.y}px)`
    this.container.style.transition = 'transform 0.1s linear'

    // Título Battle City
    const titleContainer = document.createElement('div')
    titleContainer.className = 'menu-title-container'
    const titleImg = document.createElement('img')
    titleImg.src = '/images/battle_city.png'
    titleImg.style.imageRendering = 'pixelated'
    titleImg.style.maxWidth = '400px'
    titleImg.style.height = 'auto'
    titleContainer.appendChild(titleImg)
    this.container.appendChild(titleContainer)

    // Scores
    const scoresContainer = document.createElement('div')
    scoresContainer.className = 'menu-scores'
    scoresContainer.style.display = 'flex'
    scoresContainer.style.gap = '80px'
    scoresContainer.style.marginTop = '40px'
    scoresContainer.style.fontSize = '16px'

    const scoreLabel = document.createElement('div')
    scoreLabel.innerHTML = `
      <img src="/images/roman_one_white.png" style="width: 16px; height: 16px; image-rendering: pixelated; vertical-align: middle; margin-right: 8px;">
      <span>-    00</span>
    `
    scoresContainer.appendChild(scoreLabel)

    const highScoreLabel = document.createElement('div')
    highScoreLabel.textContent = 'HI- 20000'
    scoresContainer.appendChild(highScoreLabel)

    this.container.appendChild(scoresContainer)

    // Menú de opciones (usando la vista)
    const menuContainer = this.menuView.getContainer()
    menuContainer.style.marginTop = '60px'
    this.container.appendChild(menuContainer)

    // Logo y copyright
    const footerContainer = document.createElement('div')
    footerContainer.className = 'menu-footer'
    footerContainer.style.marginTop = '120px'
    footerContainer.style.display = 'flex'
    footerContainer.style.flexDirection = 'column'
    footerContainer.style.alignItems = 'center'
    footerContainer.style.gap = '16px'
    footerContainer.style.fontSize = '12px'
    footerContainer.style.color = '#888888'

    const namcotImg = document.createElement('img')
    namcotImg.src = '/images/namcot.png'
    namcotImg.style.imageRendering = 'pixelated'
    namcotImg.style.maxWidth = '200px'
    namcotImg.style.height = 'auto'
    footerContainer.appendChild(namcotImg)

    const copyrightImg = document.createElement('img')
    copyrightImg.src = '/images/copyright.png'
    copyrightImg.style.imageRendering = 'pixelated'
    copyrightImg.style.maxWidth = '100px'
    copyrightImg.style.height = 'auto'
    footerContainer.appendChild(copyrightImg)

    const copyrightText1 = document.createElement('div')
    copyrightText1.textContent = '1980 1985 NAMCO LTD.'
    footerContainer.appendChild(copyrightText1)

    const copyrightText2 = document.createElement('div')
    copyrightText2.textContent = 'ALL RIGHTS RESERVED'
    footerContainer.appendChild(copyrightText2)

    this.container.appendChild(footerContainer)

    document.body.appendChild(this.container)
  }

  public update(): void {
    this.updatePosition()
    this.cursor.update()
    this.menuView.update()
  }

  private updatePosition(): void {
    if (this.y === 0) {
      this.menuController.activate()
      return
    }

    this.y -= this.speed
    if (this.y <= 0) {
      this.arrived()
    }

    this.container.style.transform = `translateY(${this.y}px)`
  }

  public arrived(): void {
    this.y = 0
    this.cursor.makeVisible()
    this.container.style.transform = 'translateY(0px)'
  }

  public nextMenuItem(): void {
    this.menuModel.nextItem()
  }

  public destroy(): void {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
  }
}
