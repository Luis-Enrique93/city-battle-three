import { EventManager } from '../event-manager'
import type { IEventSubscriber, GameEvent } from '../event-manager'
import { Tank } from '../../game-objects/tank'
import { Point } from '../../geometry'
import { TankExplosionEvent } from '../../game-objects/explosions/tank-explosion'
import { TankExplosion } from '../../game-objects/explosions/tank-explosion'
import * as THREE from 'three'

export const EnemyFactoryEvent = {
  ENEMY_CREATED: 'EnemyFactory.Event.ENEMY_CREATED',
  LAST_ENEMY_DESTROYED: 'EnemyFactory.Event.LAST_ENEMY_DESTROYED',
} as const

export class EnemyFactory implements IEventSubscriber {
  private eventManager: EventManager
  private threeScene: THREE.Scene
  private positions: Point[] = []
  private positionIndex: number = 0
  private enemies: string[] = []
  private enemyIndex: number = 0
  private enemyCount: number = 0
  private enemyCountLimit: number = 4
  private interval: number = 150
  private timer: number = 150
  private flashingTanks: number[] = [4, 11, 18] // Tanques que sueltan power-ups (1-indexed)

  constructor(eventManager: EventManager, threeScene: THREE.Scene) {
    this.eventManager = eventManager
    this.threeScene = threeScene
    this.eventManager.addSubscriber(this, [TankExplosionEvent.DESTROYED])
  }

  public setEnemies(enemies: string[]): void {
    this.enemies = enemies
  }

  public setPositions(positions: Point[]): void {
    this.positions = positions
  }

  public setEnemyCountLimit(limit: number): void {
    this.enemyCountLimit = limit
  }

  public setInterval(interval: number): void {
    this.interval = interval
    this.timer = interval
  }

  public update(): void {
    this.timer++
    if (this.timer > this.interval) {
      this.create()
    }
  }

  public getEnemyCount(): number {
    return this.enemyCount
  }

  public getEnemiesToCreateCount(): number {
    return this.enemies.length - this.enemyIndex
  }

  private create(): void {
    if (this.noMoreEnemies() || this.enemyCountLimitReached()) {
      return
    }
    this.timer = 0
    this.createNextEnemy()
  }

  private createNextEnemy(): Tank {
    const type = this.getNextEnemy()
    const position = this.getNextPosition()
    const tank = this.createEnemy(type, position)
    this.nextEnemy()
    this.nextPosition()
    return tank
  }

  private createEnemy(type: string, position: Point): Tank {
    const tank = new Tank(this.eventManager, this.threeScene)
    tank.setIsPlayer(false)
    tank.setType(type)
    tank.setTankPosition(position.getX(), position.getY())

    // Configure tank based on type
    if (type === Tank.Type.BASIC) {
      tank.setNormalSpeed(2)
      tank.setValue(100)
    } else if (type === Tank.Type.FAST) {
      tank.setNormalSpeed(3)
      tank.setValue(200)
    } else if (type === Tank.Type.POWER) {
      tank.setBulletSpeed(4) // FAST speed
      tank.setValue(300)
    } else if (type === Tank.Type.ARMOR) {
      tank.setNormalSpeed(2)
      tank.setValue(400)
      // TODO: Implement hitLimit and colorValues
    }

    // Marcar tanques flashing (los que sueltan power-ups)
    if (this.flashingTanks.includes(this.enemyIndex + 1)) {
      tank.startFlashing()
    }

    this.eventManager.fireEvent({
      name: EnemyFactoryEvent.ENEMY_CREATED,
      enemy: tank,
    })
    this.enemyCount++

    return tank
  }

  private getNextEnemy(): string {
    return this.enemies[this.enemyIndex]
  }

  private nextEnemy(): void {
    this.enemyIndex++
  }

  private getNextPosition(): Point {
    return this.positions[this.positionIndex]
  }

  private nextPosition(): void {
    this.positionIndex++
    if (this.positionIndex >= this.positions.length) {
      this.positionIndex = 0
    }
  }

  private noMoreEnemies(): boolean {
    return this.enemyIndex >= this.enemies.length
  }

  private enemyCountLimitReached(): boolean {
    return this.enemyCount >= this.enemyCountLimit
  }

  public notify(event: GameEvent): void {
    if (event.name === TankExplosionEvent.DESTROYED) {
      const explosion = event.explosion as TankExplosion
      if (explosion.getTank().isEnemy()) {
        this.enemyCount--
      }
      if (
        explosion.getTank().isEnemy() &&
        this.enemyCount <= 0 &&
        this.getEnemiesToCreateCount() === 0
      ) {
        this.eventManager.fireEvent({
          name: EnemyFactoryEvent.LAST_ENEMY_DESTROYED,
        })
      }
    }
  }
}
