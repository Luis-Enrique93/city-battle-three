import { Point } from './point'

export class Rect extends Point {
  protected _w: number
  protected _h: number

  constructor(x = 0, y = 0, w = 1, h = 1) {
    super(x, y)
    this._w = w
    this._h = h
  }

  public setRect(rect: Rect): void {
    this._x = rect.getX()
    this._y = rect.getY()
    this._w = rect.getWidth()
    this._h = rect.getHeight()
  }

  public getRect(): Rect {
    return new Rect(this._x, this._y, this._w, this._h)
  }

  public setWidth(width: number): void {
    this._w = width
  }

  public getWidth(): number {
    return this._w
  }

  public setHeight(height: number): void {
    this._h = height
  }

  public getHeight(): number {
    return this._h
  }

  public setDimensions(width: number, height: number): void {
    this._w = width
    this._h = height
  }

  public getLeft(): number {
    return this._x
  }

  public getRight(): number {
    return this._x + this._w - 1
  }

  public getTop(): number {
    return this._y
  }

  public getBottom(): number {
    return this._y + this._h - 1
  }

  public getCenter(): Point {
    return new Point(this._x + this._w / 2, this._y + this._h / 2)
  }

  public intersects(other: Rect): boolean {
    return !(
      this.getLeft() > other.getRight() ||
      this.getRight() < other.getLeft() ||
      this.getTop() > other.getBottom() ||
      this.getBottom() < other.getTop()
    )
  }

  public containsWhole(other: Rect): boolean {
    return (
      other.getLeft() >= this.getLeft() &&
      other.getRight() <= this.getRight() &&
      other.getBottom() <= this.getBottom() &&
      other.getTop() >= this.getTop()
    )
  }
}
