// Script pattern del original - sistema de cola para secuenciar animaciones y comandos
export interface IScriptNode {
  execute?(): void
  update?(): void
}

export class Script {
  private nodes: IScriptNode[] = []
  private active: boolean = true

  public enqueue(node: IScriptNode): void {
    this.nodes.push(node)
  }

  public update(): void {
    if (!this.active) {
      return
    }

    while (true) {
      if (this.nodes.length === 0) {
        return
      }

      const currentNode = this.nodes[0]

      // Si tiene update, es una acción que se ejecuta cada frame
      if (currentNode.update !== undefined) {
        break
      }

      // Si solo tiene execute, es un comando que se ejecuta inmediatamente
      if (currentNode.execute !== undefined) {
        currentNode.execute()
      }

      this.nodes.shift()
    }

    // Ejecutar update del nodo actual
    const currentNode = this.nodes[0]
    if (currentNode.update) {
      currentNode.update()
    }
  }

  public actionCompleted(): void {
    this.nodes.shift()
  }

  public setActive(active: boolean): void {
    this.active = active
  }

  public isActive(): boolean {
    return this.active
  }
}
