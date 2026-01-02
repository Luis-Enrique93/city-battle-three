import * as THREE from 'three'
import { Globals } from '../globals'

export class Renderer {
  private scene: THREE.Scene
  private camera: THREE.OrthographicCamera
  private renderer: THREE.WebGLRenderer
  private container: HTMLElement

  constructor(container: HTMLElement) {
    this.container = container

    // Escena
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x000000)

    // Cámara ortográfica para 2D
    this.camera = new THREE.OrthographicCamera(
      -Globals.CANVAS_WIDTH / 2,
      Globals.CANVAS_WIDTH / 2,
      Globals.CANVAS_HEIGHT / 2,
      -Globals.CANVAS_HEIGHT / 2,
      0.1,
      1000,
    )
    this.camera.position.z = 100

    // Renderer WebGL
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
    })
    this.renderer.setSize(Globals.CANVAS_WIDTH, Globals.CANVAS_HEIGHT)
    this.renderer.setPixelRatio(window.devicePixelRatio)

    // Configurar color space y tone mapping para colores más vibrantes
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.NoToneMapping
    this.renderer.toneMappingExposure = 1.0

    // Agregar canvas al contenedor
    container.appendChild(this.renderer.domElement)
  }

  public getScene(): THREE.Scene {
    return this.scene
  }

  public getCamera(): THREE.OrthographicCamera {
    return this.camera
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera)
  }

  public resize(width: number, height: number): void {
    this.camera.left = -width / 2
    this.camera.right = width / 2
    this.camera.top = height / 2
    this.camera.bottom = -height / 2
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  public dispose(): void {
    this.renderer.dispose()
    this.container.removeChild(this.renderer.domElement)
  }
}
