// MainMenu model pattern del original - maneja el estado del menú
export interface IMenuItem {
  getName(): string
  execute(): void
}

export class MainMenuModel {
  private items: IMenuItem[] = []
  private currentItemIndex: number = 0

  public setItems(items: IMenuItem[]): void {
    this.items = items
  }

  public getCurrentItem(): IMenuItem | null {
    return this.items[this.currentItemIndex] || null
  }

  public isCurrent(item: IMenuItem): boolean {
    return item === this.getCurrentItem()
  }

  public nextItem(): void {
    this.currentItemIndex++
    if (this.currentItemIndex >= this.items.length) {
      this.currentItemIndex = 0
    }
  }

  public previousItem(): void {
    this.currentItemIndex--
    if (this.currentItemIndex < 0) {
      this.currentItemIndex = this.items.length - 1
    }
  }

  public executeCurrentItem(): void {
    const currentItem = this.getCurrentItem()
    if (currentItem) {
      currentItem.execute()
    }
  }

  public getItemsInfo(): Array<{ name: string; isCurrent: boolean }> {
    return this.items.map((item, index) => ({
      name: item.getName(),
      isCurrent: index === this.currentItemIndex,
    }))
  }
}
