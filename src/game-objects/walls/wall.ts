import { Sprite } from '../../sprites/sprite'
import { EventManager } from '../../core/event-manager'
import type { GameEvent } from '../../core/event-manager'
import { ImageManager } from '../../core/image-manager'
import { Globals } from '../../core/globals'
import { CollisionDetectorEvent } from '../../core/collision-detector'
import { Bullet } from '../bullet/bullet'
import { BulletType } from '../bullet/bullet'
import { SpriteDirection } from '../../sprites/sprite'
import * as THREE from 'three'

export abstract class Wall extends Sprite {
  protected invincibleForNormalBullets = false
  private hitLeft = false
  private hitRight = false
  private hitTop = false
  private hitBottom = false
  private maskSprites: THREE.Sprite[] = []

  constructor(eventManager: EventManager, threeScene: THREE.Scene) {
    super(eventManager, threeScene)
    this.setDimensions(Globals.TILE_SIZE, Globals.TILE_SIZE)
    this.eventManager.addSubscriber(this, [CollisionDetectorEvent.COLLISION])
    this.createWallSprite()
  }

  protected abstract getImageName(): string

  private createWallSprite(): void {
    const imageManager = ImageManager.getInstance()
    const texture = imageManager.getTexture(this.getImageName() as any)
    if (texture) {
      this.createThreeSprite(texture)
      // Asegurar que la posición se actualice después de crear el sprite
      this.updateThreeSpritePosition()
    } else {
      setTimeout(() => this.createWallSprite(), 100)
    }
  }

  public setWallPosition(x: number, y: number): void {
    this.setXY(x, y)
    this.updateThreeSpritePosition()
  }

  public notify(event: GameEvent): void {
    if (
      event.name === CollisionDetectorEvent.COLLISION &&
      event.initiator instanceof Bullet &&
      event.sprite === this
    ) {
      this.hitByBullet(event.initiator as Bullet)
    }
  }

  protected hitByBullet(bullet: Bullet): void {
    // Balas mejoradas destruyen cualquier muro instantáneamente
    if (bullet.getBulletType() === BulletType.ENHANCED) {
      this.destroy()
      return
    }

    // Muros invencibles no se destruyen con balas normales
    if (this.isInvincibleForNormalBullets()) {
      return
    }

    // Marcar el lado golpeado según la dirección de la bala
    const direction = bullet.getDirection()
    if (direction === SpriteDirection.RIGHT) {
      this.markHitLeft()
    } else if (direction === SpriteDirection.LEFT) {
      this.markHitRight()
    } else if (direction === SpriteDirection.DOWN) {
      this.markHitTop()
    } else if (direction === SpriteDirection.UP) {
      this.markHitBottom()
    }
  }

  private markHitLeft(): void {
    if (this.hitLeft) {
      // Ya fue golpeado en este lado, destruir
      this.destroy()
      return
    }
    if (this.hitRight) {
      // Ya fue golpeado en el lado opuesto, destruir
      this.destroy()
      return
    }
    this.hitLeft = true
    this.updateWallVisual()
  }

  private markHitRight(): void {
    if (this.hitRight) {
      // Ya fue golpeado en este lado, destruir
      this.destroy()
      return
    }
    if (this.hitLeft) {
      // Ya fue golpeado en el lado opuesto, destruir
      this.destroy()
      return
    }
    this.hitRight = true
    this.updateWallVisual()
  }

  private markHitTop(): void {
    if (this.hitTop) {
      // Ya fue golpeado en este lado, destruir
      this.destroy()
      return
    }
    if (this.hitBottom) {
      // Ya fue golpeado en el lado opuesto, destruir
      this.destroy()
      return
    }
    this.hitTop = true
    this.updateWallVisual()
  }

  private markHitBottom(): void {
    if (this.hitBottom) {
      // Ya fue golpeado en este lado, destruir
      this.destroy()
      return
    }
    if (this.hitTop) {
      // Ya fue golpeado en el lado opuesto, destruir
      this.destroy()
      return
    }
    this.hitBottom = true
    this.updateWallVisual()
  }

  public isHitLeft(): boolean {
    return this.hitLeft
  }

  public isHitRight(): boolean {
    return this.hitRight
  }

  public isHitTop(): boolean {
    return this.hitTop
  }

  public isHitBottom(): boolean {
    return this.hitBottom
  }

  public isInvincibleForNormalBullets(): boolean {
    return this.invincibleForNormalBullets
  }

  protected makeInvincibleForNormalBullets(): void {
    this.invincibleForNormalBullets = true
  }

  private updateWallVisual(): void {
    this.updateThreeSpritePosition()
    this.updateMaskSprites()
  }

  private updateMaskSprites(): void {
    // Limpiar máscaras existentes
    this.removeMaskSprites()

    const tileSize = Globals.TILE_SIZE
    const x = this.getX()
    const y = this.getY()

    // Crear sprites negros para ocultar partes destruidas
    if (this.hitTop) {
      const maskSprite = this.createMaskSprite(x, y, tileSize, tileSize / 2)
      this.maskSprites.push(maskSprite)
    }

    if (this.hitBottom) {
      const maskSprite = this.createMaskSprite(
        x,
        y + tileSize / 2,
        tileSize,
        tileSize / 2,
      )
      this.maskSprites.push(maskSprite)
    }

    if (this.hitLeft) {
      const maskSprite = this.createMaskSprite(x, y, tileSize / 2, tileSize)
      this.maskSprites.push(maskSprite)
    }

    if (this.hitRight) {
      const maskSprite = this.createMaskSprite(
        x + tileSize / 2,
        y,
        tileSize / 2,
        tileSize,
      )
      this.maskSprites.push(maskSprite)
    }
  }

  private createMaskSprite(
    x: number,
    y: number,
    width: number,
    height: number,
  ): THREE.Sprite {
    // Crear textura negra
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, width, height)

    const texture = new THREE.CanvasTexture(canvas)
    texture.flipY = true

    const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
    const sprite = new THREE.Sprite(spriteMaterial)

    // Usar la misma lógica de conversión de coordenadas que updateThreeSpritePosition
    const centerX = x + width / 2
    const centerY = y + height / 2
    const threeX = centerX - Globals.CANVAS_WIDTH / 2
    const threeY = Globals.CANVAS_HEIGHT / 2 - centerY

    sprite.position.set(threeX, threeY, this.getZIndex() + 1)
    sprite.scale.set(width, height, 1)

    if (this.threeScene) {
      this.threeScene.add(sprite)
    }

    return sprite
  }

  private removeMaskSprites(): void {
    for (const maskSprite of this.maskSprites) {
      if (this.threeScene) {
        this.threeScene.remove(maskSprite)
      }
      maskSprite.material.dispose()
      maskSprite.material.map?.dispose()
    }
    this.maskSprites = []
  }

  protected destroyHook(): void {
    this.removeMaskSprites()
  }
}
