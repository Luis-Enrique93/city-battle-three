import type { Script } from './script'
import type { IScriptNode } from './script'

// MoveFn pattern del original - mueve una propiedad de un objeto hacia un valor final
export class MoveFn implements IScriptNode {
  private object: any
  private property: string
  private endValue: number
  private duration: number
  private script: Script
  private active: boolean = true
  private increment: number

  constructor(
    object: any,
    property: string,
    endValue: number,
    duration: number,
    script: Script,
  ) {
    this.object = object
    this.property = property
    this.endValue = endValue
    this.duration = duration
    this.script = script
    this.increment = (endValue - this.object[this.property]) / duration
  }

  public update(): void {
    if (!this.active) {
      return
    }
    this.object[this.property] += this.increment
    if (this.isCompleted()) {
      this.active = false
      this.script.actionCompleted()
    }
  }

  private isCompleted(): boolean {
    if (this.increment > 0 && this.object[this.property] >= this.endValue) {
      return true
    } else if (
      this.increment < 0 &&
      this.object[this.property] <= this.endValue
    ) {
      return true
    }
    return false
  }
}
