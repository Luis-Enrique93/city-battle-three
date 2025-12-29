import type { IScene, ISceneManager } from '../../core/scene-manager'
import type { Renderer } from '../../core/renderer'
import * as THREE from 'three'
import { Globals } from '../../core/globals'
import { ImageManager } from '../../core/image-manager'

export class LoadingScene implements IScene {
  private _sceneManager: ISceneManager
  private loadingProgress = 0
  private textSprite: THREE.Sprite | null = null
  private threeScene: THREE.Scene

  constructor(sceneManager: ISceneManager, threeScene: THREE.Scene) {
    this._sceneManager = sceneManager
    this.threeScene = threeScene
    this.createTextSprite()
  }

  private createTextSprite(): void {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 64
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = '#ffffff'
    ctx.font = '16px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('LOADING 0%', canvas.width / 2, canvas.height / 2)

    const texture = new THREE.CanvasTexture(canvas)
    texture.flipY = true // Coincidir con el comportamiento de las imágenes PNG
    const material = new THREE.SpriteMaterial({ map: texture })
    this.textSprite = new THREE.Sprite(material)
    this.textSprite.position.set(0, 0, 0)
    this.textSprite.scale.set(
      Globals.CANVAS_WIDTH * 0.6,
      Globals.CANVAS_HEIGHT * 0.1,
      1,
    )

    this.threeScene.add(this.textSprite)
  }

  public update(): void {
    const imageManager = ImageManager.getInstance()
    this.loadingProgress = imageManager.getLoadingProgress()

    if (this.loadingProgress >= 100) {
      this._sceneManager.toMainMenuScene(false)
    }

    // Actualizar texto
    if (this.textSprite) {
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 64
      const ctx = canvas.getContext('2d')!

      ctx.fillStyle = '#ffffff'
      ctx.font = '16px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const progressText = `LOADING ${Math.floor(this.loadingProgress)
        .toString()
        .padStart(3, ' ')}%`
      ctx.fillText(progressText, canvas.width / 2, canvas.height / 2)

      const texture = new THREE.CanvasTexture(canvas)
      texture.flipY = true // Coincidir con el comportamiento de las imágenes PNG
      ;(this.textSprite.material as THREE.SpriteMaterial).map = texture
      ;(this.textSprite.material as THREE.SpriteMaterial).needsUpdate = true
    }
  }

  public draw(_renderer: Renderer): void {
    // El renderizado se hace automáticamente por Three.js
  }
}
