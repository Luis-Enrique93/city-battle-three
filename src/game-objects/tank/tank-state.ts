export interface ITankState {
  canMove(): boolean
  canShoot(): boolean
  canBeDestroyed(): boolean
  isCollidable(): boolean
  update(): void
  getImageName(): string
}
