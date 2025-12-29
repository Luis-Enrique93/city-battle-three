import type { IScene, ISceneManager } from '../../core/scene-manager'
import type { Renderer } from '../../core/renderer'
import type { IEventSubscriber, GameEvent } from '../../core/event-manager'
import { Keyboard } from '../../core/keyboard'
import { ImageManager } from '../../core/image-manager'
import { Globals } from '../../core/globals'
import * as THREE from 'three'

export class MainMenuScene implements IScene, IEventSubscriber {
  private sceneManager: ISceneManager
  private threeScene: THREE.Scene
  private y = Globals.CANVAS_HEIGHT
  private speed = 3
  private sprites: THREE.Sprite[] = []

  constructor(sceneManager: ISceneManager, threeScene: THREE.Scene) {
    this.sceneManager = sceneManager
    this.threeScene = threeScene

    const eventManager = sceneManager.getEventManager()
    eventManager.addSubscriber(this, [Keyboard.Event.KEY_PRESSED])

    this.createSprites()
  }

  private createSprites(): void {
    const imageManager = ImageManager.getInstance()

    // Score (posición original: x=36, y=32)
    const romanOneWhiteTexture = imageManager.getTexture('roman_one_white')
    if (romanOneWhiteTexture) {
      this.createImageSprite(
        romanOneWhiteTexture,
        36 - Globals.CANVAS_WIDTH / 2,
        Globals.CANVAS_HEIGHT / 2 - 32,
      )
    }
    this.createTextSprite(
      '-    00',
      50 - Globals.CANVAS_WIDTH / 2,
      Globals.CANVAS_HEIGHT / 2 - 46,
      80,
      16,
    )
    this.createTextSprite(
      'HI- 20000',
      178 - Globals.CANVAS_WIDTH / 2,
      Globals.CANVAS_HEIGHT / 2 - 46,
      120,
      16,
    )

    // Título Battle City (posición original: 56, 80)
    // La imagen battle_city probablemente es más ancha, ajustar posición X al centro
    const battleCityTexture = imageManager.getTexture('battle_city')
    if (battleCityTexture) {
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: battleCityTexture }),
      )

      // Obtener dimensiones reales de la imagen primero
      const updateScaleAndPosition = () => {
        if (battleCityTexture.image) {
          const img = battleCityTexture.image as HTMLImageElement
          // Usar dimensiones reales de la imagen
          sprite.scale.set(img.width, img.height, 1)
          // Centrar la imagen horizontalmente (el x original 56 es el punto izquierdo)
          // Ajustar para que el centro de la imagen esté en la posición correcta
          const x = 56 + img.width / 2 - Globals.CANVAS_WIDTH / 2
          const y = Globals.CANVAS_HEIGHT / 2 - 80
          sprite.position.set(x, y, 0)
          sprite.userData.baseY = y
        } else {
          // Tamaño por defecto si no está disponible aún
          sprite.scale.set(400, 100, 1)
          const x = 56 - Globals.CANVAS_WIDTH / 2
          const y = Globals.CANVAS_HEIGHT / 2 - 80
          sprite.position.set(x, y, 0)
          sprite.userData.baseY = y
        }
      }

      // Posición inicial temporal
      sprite.position.set(
        56 - Globals.CANVAS_WIDTH / 2,
        Globals.CANVAS_HEIGHT / 2 - 80,
        0,
      )
      sprite.userData.baseY = Globals.CANVAS_HEIGHT / 2 - 80

      // Intentar actualizar escala y posición inmediatamente
      updateScaleAndPosition()

      // Si la imagen aún se está cargando, esperar
      if (battleCityTexture.image) {
        const img = battleCityTexture.image as HTMLImageElement
        if (!img.complete) {
          img.onload = updateScaleAndPosition
        }
      } else {
        // Si no hay imagen aún, esperar a que la textura se actualice
        setTimeout(updateScaleAndPosition, 100)
        setTimeout(updateScaleAndPosition, 500) // Segundo intento por si acaso
      }

      this.sprites.push(sprite)
      this.threeScene.add(sprite)
    }

    // Texto del menú (usando canvas como textura)
    // Posición original aproximada: x=178, y=270
    const menuY1 = Globals.CANVAS_HEIGHT / 2 - 270
    const menuY2 = Globals.CANVAS_HEIGHT / 2 - 302
    const menuX = 178 - Globals.CANVAS_WIDTH / 2

    this.createTextSprite('1 PLAYER', menuX, menuY1, 150, 20)
    this.createTextSprite('CONSTRUCTION', menuX, menuY2, 150, 20)

    // Logo namcot (posición original: x=176, y=352)
    const namcotTexture = imageManager.getTexture('namcot')
    if (namcotTexture) {
      this.createImageSprite(
        namcotTexture,
        176 - Globals.CANVAS_WIDTH / 2,
        Globals.CANVAS_HEIGHT / 2 - 352,
      )
    }

    // Copyright (posición original: x=64, y=384)
    const copyrightTexture = imageManager.getTexture('copyright')
    if (copyrightTexture) {
      this.createImageSprite(
        copyrightTexture,
        64 - Globals.CANVAS_WIDTH / 2,
        Globals.CANVAS_HEIGHT / 2 - 384,
      )
    }
    this.createTextSprite(
      '1980 1985 NAMCO LTD.',
      98 - Globals.CANVAS_WIDTH / 2,
      Globals.CANVAS_HEIGHT / 2 - 398,
      200,
      16,
    )
    this.createTextSprite(
      'ALL RIGHTS RESERVED',
      98 - Globals.CANVAS_WIDTH / 2,
      Globals.CANVAS_HEIGHT / 2 - 430,
      200,
      16,
    )
  }

  private createImageSprite(
    texture: THREE.Texture,
    x: number,
    y: number,
  ): void {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }))
    sprite.position.set(x, y, 0)

    const updateScale = () => {
      if (texture.image) {
        const img = texture.image as HTMLImageElement
        sprite.scale.set(img.width, img.height, 1)
      }
    }

    updateScale()
    if (texture.image) {
      const img = texture.image as HTMLImageElement
      if (!img.complete) {
        img.onload = updateScale
      }
    } else {
      setTimeout(updateScale, 100)
    }

    sprite.userData.baseY = y
    this.sprites.push(sprite)
    this.threeScene.add(sprite)
  }

  private createTextSprite(
    text: string,
    x: number,
    y: number,
    width = 150,
    height = 20,
  ): void {
    const canvas = document.createElement('canvas')
    // Canvas del tamaño exacto que necesitamos (sin multiplicar)
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!

    // Limpiar canvas (transparente)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Dibujar texto
    ctx.fillStyle = '#ffffff'
    ctx.font = `${Math.floor(height * 0.8)}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, canvas.width / 2, canvas.height / 2)

    const texture = new THREE.CanvasTexture(canvas)
    // Para CanvasTexture en sprites, usar flipY = true para que coincida con las imágenes PNG
    texture.flipY = true
    texture.needsUpdate = true

    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }))
    sprite.position.set(x, y, 0)
    // Escala 1:1 con el canvas (sin multiplicar)
    sprite.scale.set(width, height, 1)
    sprite.userData.baseY = y
    this.sprites.push(sprite)
    this.threeScene.add(sprite)
  }

  public update(): void {
    this.updatePosition()
  }

  private updatePosition(): void {
    if (this.y === 0) {
      return
    }
    this.y -= this.speed
    if (this.y <= 0) {
      this.arrived()
    }

    // Actualizar posición de sprites basado en y (animación de deslizamiento)
    // y empieza en CANVAS_HEIGHT (448) y baja hasta 0
    // Los sprites empiezan fuera de la pantalla (abajo) y suben
    // En Three.js, y negativo = abajo, y positivo = arriba
    const offsetY = -this.y // Empieza en -448, termina en 0
    for (let i = 0; i < this.sprites.length; i++) {
      const sprite = this.sprites[i]
      if (sprite.userData.baseY !== undefined) {
        sprite.position.y = sprite.userData.baseY + offsetY
      }
    }
  }

  public draw(_renderer: Renderer): void {
    // El renderizado se hace automáticamente por Three.js
  }

  public notify(event: GameEvent): void {
    if (event.name === Keyboard.Event.KEY_PRESSED) {
      this.keyPressed(event.key as number)
    }
  }

  private keyPressed(key: number): void {
    // START = Enter (13), SELECT = Ctrl (17)
    // También permitir cualquier tecla cuando el menú ya llegó
    if (key === Keyboard.Key.START || key === Keyboard.Key.SELECT) {
      if (this.y === 0) {
        // Si ya llegó, iniciar juego
        this.sceneManager.toGameScene()
      } else {
        this.arrived()
      }
    } else if (this.y === 0) {
      // Si el menú ya llegó, cualquier tecla inicia el juego
      this.sceneManager.toGameScene()
    }
  }

  public nextMenuItem(): void {
    // TODO: Implementar navegación del menú
  }

  public arrived(): void {
    this.y = 0
  }
}
