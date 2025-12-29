export class Animation {
  private frames: number[]
  private currentFrame: number = 0
  private frameTimer: number = 0
  private frameDuration: number = 1
  private completed: boolean = false

  constructor(frames: number[], frameDuration: number = 1) {
    this.frames = frames
    this.frameDuration = frameDuration
  }

  public update(): void {
    if (this.completed) {
      return
    }

    this.frameTimer++
    if (this.frameTimer >= this.frameDuration) {
      this.frameTimer = 0
      this.currentFrame++
      if (this.currentFrame >= this.frames.length) {
        this.currentFrame = this.frames.length - 1
        this.completed = true
      }
    }
  }

  public getFrame(): number {
    return this.frames[this.currentFrame]
  }

  public reset(): void {
    this.currentFrame = 0
    this.frameTimer = 0
    this.completed = false
  }

  public isCompleted(): boolean {
    return this.completed
  }
}
