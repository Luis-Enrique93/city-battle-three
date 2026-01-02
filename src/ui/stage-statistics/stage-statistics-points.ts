import type { Script } from '../../core/script/script'
import { Script as InternalScript } from '../../core/script/script'
import { Delay } from '../../core/script/delay'
import type { IScriptNode } from '../../core/script/script'
import { SoundManager } from '../../core/sound-manager'

// StageStatisticsPoints pattern del original - anima el conteo de puntos
// Cada StageStatisticsPoints tiene su propio Script interno
export class StageStatisticsPoints implements IScriptNode {
  private value: number
  private count: number
  private counter: number
  private visible: boolean = false
  private script: InternalScript // Script interno propio
  private listener: Script // Script principal (listener)

  constructor(value: number, count: number, listener: Script) {
    this.value = value
    this.count = count
    this.counter = count > 0 ? 1 : 0
    this.listener = listener

    // Crear script interno propio siguiendo el patrón del original
    this.script = new InternalScript()

    // Delay inicial de 15 frames (reducido a 10 para que sea más rápido)
    this.script.enqueue(new Delay(this.script, 10))

    // Incrementar contador para cada tanque (count - 1 veces, porque empieza en 1)
    for (let i = 1; i < this.count; i++) {
      this.script.enqueue({
        execute: () => {
          this.counter++
          SoundManager.getInstance().play('statistics_1')
        },
      })
      // Delay de 10 frames entre cada incremento (reducido a 5)
      this.script.enqueue(new Delay(this.script, 5))
    }

    // Delay final de 15 frames (reducido a 10)
    this.script.enqueue(new Delay(this.script, 10))
    this.script.enqueue({
      execute: () => {
        // Cuando termina, notificar al listener (script principal)
        this.listener.actionCompleted()
      },
    })
  }

  public update(): void {
    // Actualizar el script interno propio
    this.script.update()
  }

  public getDisplayText(): string {
    if (!this.visible) {
      return ''
    }
    const points = (this.counter * this.value).toString().padStart(5, ' ')
    const countStr = this.counter.toString().padStart(2, ' ')
    return `${points}     ${countStr}`
  }

  public show(): void {
    this.visible = true
  }

  public isVisible(): boolean {
    return this.visible
  }

  public getCounter(): number {
    return this.counter
  }

  public getValue(): number {
    return this.value
  }
}
