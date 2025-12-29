import {
  EventManager,
  Keyboard,
  SceneManager,
  Renderer,
  ImageManager,
} from '../core'

export class Game {
  private static instance: Game | null = null

  private eventManager: EventManager
  private keyboard: Keyboard
  private sceneManager: SceneManager
  private renderer: Renderer | null = null
  private animationFrameId: number | null = null
  private isRunning = false

  private constructor() {
    this.eventManager = new EventManager()
    this.keyboard = new Keyboard(this.eventManager)
    this.sceneManager = new SceneManager(this.eventManager)
  }

  public static getInstance(): Game {
    if (this.instance === null) {
      this.instance = new Game()
    }
    return this.instance
  }

  public initialize(container: HTMLElement): void {
    if (this.renderer) {
      return
    }

    // Inicializar ImageManager para comenzar carga de texturas
    ImageManager.getInstance()

    this.renderer = new Renderer(container)
    this.sceneManager.setRenderer(this.renderer)
    this.sceneManager.toLoadingScene()
    this.start()
  }

  private start(): void {
    if (this.isRunning) {
      return
    }

    this.isRunning = true
    this.gameLoop()
  }

  private gameLoop = (): void => {
    if (!this.isRunning || !this.renderer) {
      return
    }

    this.keyboard.fireEvents()
    this.sceneManager.update()
    this.sceneManager.draw(this.renderer)
    this.renderer.render()

    this.animationFrameId = requestAnimationFrame(this.gameLoop)
  }

  public stop(): void {
    this.isRunning = false
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  public getEventManager(): EventManager {
    return this.eventManager
  }

  public getSceneManager(): SceneManager {
    return this.sceneManager
  }

  public getRenderer(): Renderer | null {
    return this.renderer
  }
}
