export class BlinkTimer {
  private duration: number
  private timer: number = 0
  private visible: boolean = true

  constructor(duration: number) {
    this.duration = duration
  }

  public update(): void {
    this.timer++
    if (this.timer === this.duration) {
      this.timer = 0
      this.visible = !this.visible
    }
  }

  public setDuration(duration: number): void {
    this.duration = duration
  }

  public isVisible(): boolean {
    return this.visible
  }
}
