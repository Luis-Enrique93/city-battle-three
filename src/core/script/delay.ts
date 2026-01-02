import type { Script } from './script'
import type { IScriptNode } from './script'

// Delay pattern del original - espera un número de frames antes de continuar
export class Delay implements IScriptNode {
  private script: Script
  private duration: number
  private timer: number = 0

  constructor(script: Script, duration: number) {
    this.script = script
    this.duration = duration
  }

  public update(): void {
    this.timer++
    if (this.timer > this.duration) {
      this.script.actionCompleted()
    }
  }
}
