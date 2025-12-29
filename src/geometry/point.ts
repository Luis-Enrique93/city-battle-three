export class Point {
  protected _x: number
  protected _y: number

  constructor(x = 0, y = 0) {
    this._x = x
    this._y = y
  }

  public getX(): number {
    return this._x
  }

  public setX(x: number): void {
    this._x = x
  }

  public getY(): number {
    return this._y
  }

  public setY(y: number): void {
    this._y = y
  }

  public getPosition(): Point {
    return new Point(this._x, this._y)
  }

  public setPosition(position: Point): void {
    this._x = position.getX()
    this._y = position.getY()
  }

  public setXY(x: number, y: number): void {
    this._x = x
    this._y = y
  }
}
