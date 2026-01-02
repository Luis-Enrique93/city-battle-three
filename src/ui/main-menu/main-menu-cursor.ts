// MainMenuCursor pattern del original - maneja la animación del cursor
export class MainMenuCursor {
  private visible: boolean = false
  private animationFrame: number = 0
  private animationFrames: number[] = [1, 2]
  private frameDuration: number = 2
  private frameTimer: number = 0

  public getTrackFrame(): number {
    return this.animationFrames[this.animationFrame]
  }

  public update(): void {
    if (!this.visible) {
      return
    }

    this.frameTimer++
    if (this.frameTimer >= this.frameDuration) {
      this.frameTimer = 0
      this.animationFrame =
        (this.animationFrame + 1) % this.animationFrames.length
    }
  }

  public makeVisible(): void {
    this.visible = true
  }

  public isVisible(): boolean {
    return this.visible
  }
}
