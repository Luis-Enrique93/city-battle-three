// Animation pattern del original - maneja animaciones de frames con duración
export class Animation {
  private frames: number[]
  private frameDuration: number
  private loop: boolean
  private frame: number = 0
  private timer: number = 0
  private completed: boolean = false
  private active: boolean = true

  constructor(frames?: number[], frameDuration?: number, loop?: boolean) {
    this.frames = frames !== undefined ? frames : []
    this.frameDuration = frameDuration !== undefined ? frameDuration : 1
    this.loop = loop !== undefined ? loop : false
  }

  public setActive(active: boolean): void {
    this.active = active
  }

  public update(): void {
    if (!this.active || this.completed) {
      return
    }

    this.timer++
    if (this.timer >= this.frameDuration) {
      this.timer = 0
      this.frame++
      if (this.frame >= this.frames.length) {
        if (this.loop) {
          this.frame = 0
        } else {
          this.frame = this.frames.length - 1
          this.completed = true
        }
      }
    }
  }

  public getFrame(): number {
    return this.frames[this.frame]
  }

  public setFrames(frames: number[]): void {
    this.frames = frames
  }

  public setFrameDuration(duration: number): void {
    this.frameDuration = duration
  }

  public isCompleted(): boolean {
    return this.completed
  }
}
