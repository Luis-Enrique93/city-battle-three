import * as THREE from 'three'

type ImageName =
  | 'tank_player1_down_c0_t1'
  | 'tank_player1_down_c0_t2'
  | 'tank_player1_left_c0_t1'
  | 'tank_player1_left_c0_t2'
  | 'tank_player1_right_c0_t1'
  | 'tank_player1_right_c0_t2'
  | 'tank_player1_up_c0_t1'
  | 'tank_player1_up_c0_t2'
  | 'tank_player1_down_c0_t1_s1'
  | 'tank_player1_down_c0_t2_s1'
  | 'tank_player1_left_c0_t1_s1'
  | 'tank_player1_left_c0_t2_s1'
  | 'tank_player1_right_c0_t1_s1'
  | 'tank_player1_right_c0_t2_s1'
  | 'tank_player1_up_c0_t1_s1'
  | 'tank_player1_up_c0_t2_s1'
  | 'tank_player1_down_c0_t1_s2'
  | 'tank_player1_down_c0_t2_s2'
  | 'tank_player1_left_c0_t1_s2'
  | 'tank_player1_left_c0_t2_s2'
  | 'tank_player1_right_c0_t1_s2'
  | 'tank_player1_right_c0_t2_s2'
  | 'tank_player1_up_c0_t1_s2'
  | 'tank_player1_up_c0_t2_s2'
  | 'tank_player1_down_c0_t1_s3'
  | 'tank_player1_down_c0_t2_s3'
  | 'tank_player1_left_c0_t1_s3'
  | 'tank_player1_left_c0_t2_s3'
  | 'tank_player1_right_c0_t1_s3'
  | 'tank_player1_right_c0_t2_s3'
  | 'tank_player1_up_c0_t1_s3'
  | 'tank_player1_up_c0_t2_s3'
  | 'tank_basic_down_c0_t1'
  | 'tank_basic_down_c0_t2'
  | 'tank_basic_left_c0_t1'
  | 'tank_basic_left_c0_t2'
  | 'tank_basic_right_c0_t1'
  | 'tank_basic_right_c0_t2'
  | 'tank_basic_up_c0_t1'
  | 'tank_basic_up_c0_t2'
  | 'tank_basic_down_c0_t1_f'
  | 'tank_basic_down_c0_t2_f'
  | 'tank_basic_left_c0_t1_f'
  | 'tank_basic_left_c0_t2_f'
  | 'tank_basic_right_c0_t1_f'
  | 'tank_basic_right_c0_t2_f'
  | 'tank_basic_up_c0_t1_f'
  | 'tank_basic_up_c0_t2_f'
  | 'tank_fast_down_c0_t1'
  | 'tank_fast_down_c0_t2'
  | 'tank_fast_left_c0_t1'
  | 'tank_fast_left_c0_t2'
  | 'tank_fast_right_c0_t1'
  | 'tank_fast_right_c0_t2'
  | 'tank_fast_up_c0_t1'
  | 'tank_fast_up_c0_t2'
  | 'tank_fast_down_c0_t1_f'
  | 'tank_fast_down_c0_t2_f'
  | 'tank_fast_left_c0_t1_f'
  | 'tank_fast_left_c0_t2_f'
  | 'tank_fast_right_c0_t1_f'
  | 'tank_fast_right_c0_t2_f'
  | 'tank_fast_up_c0_t1_f'
  | 'tank_fast_up_c0_t2_f'
  | 'tank_power_down_c0_t1'
  | 'tank_power_down_c0_t2'
  | 'tank_power_left_c0_t1'
  | 'tank_power_left_c0_t2'
  | 'tank_power_right_c0_t1'
  | 'tank_power_right_c0_t2'
  | 'tank_power_up_c0_t1'
  | 'tank_power_up_c0_t2'
  | 'tank_power_down_c0_t1_f'
  | 'tank_power_down_c0_t2_f'
  | 'tank_power_left_c0_t1_f'
  | 'tank_power_left_c0_t2_f'
  | 'tank_power_right_c0_t1_f'
  | 'tank_power_right_c0_t2_f'
  | 'tank_power_up_c0_t1_f'
  | 'tank_power_up_c0_t2_f'
  | 'tank_armor_down_c0_t1'
  | 'tank_armor_down_c0_t1_f'
  | 'tank_armor_down_c0_t2'
  | 'tank_armor_down_c0_t2_f'
  | 'tank_armor_down_c1_t1'
  | 'tank_armor_down_c1_t2'
  | 'tank_armor_down_c2_t1'
  | 'tank_armor_down_c2_t2'
  | 'tank_armor_left_c0_t1'
  | 'tank_armor_left_c0_t1_f'
  | 'tank_armor_left_c0_t2'
  | 'tank_armor_left_c0_t2_f'
  | 'tank_armor_left_c1_t1'
  | 'tank_armor_left_c1_t2'
  | 'tank_armor_left_c2_t1'
  | 'tank_armor_left_c2_t2'
  | 'tank_armor_right_c0_t1'
  | 'tank_armor_right_c0_t1_f'
  | 'tank_armor_right_c0_t2'
  | 'tank_armor_right_c0_t2_f'
  | 'tank_armor_right_c1_t1'
  | 'tank_armor_right_c1_t2'
  | 'tank_armor_right_c2_t1'
  | 'tank_armor_right_c2_t2'
  | 'tank_armor_up_c0_t1'
  | 'tank_armor_up_c0_t1_f'
  | 'tank_armor_up_c0_t2'
  | 'tank_armor_up_c0_t2_f'
  | 'tank_armor_up_c1_t1'
  | 'tank_armor_up_c1_t2'
  | 'tank_armor_up_c2_t1'
  | 'tank_armor_up_c2_t2'
  | 'appear_1'
  | 'appear_2'
  | 'appear_3'
  | 'appear_4'
  | 'big_explosion_1'
  | 'big_explosion_2'
  | 'big_explosion_3'
  | 'big_explosion_4'
  | 'big_explosion_5'
  | 'shield_1'
  | 'shield_2'
  | 'bullet_up'
  | 'bullet_down'
  | 'bullet_left'
  | 'bullet_right'
  | 'bullet_explosion_1'
  | 'bullet_explosion_2'
  | 'bullet_explosion_3'
  | 'wall_brick'
  | 'wall_steel'
  | 'trees'
  | 'water_1'
  | 'water_2'
  | 'base'
  | 'base_destroyed'
  | 'enemy'
  | 'lives'
  | 'flag'
  | 'roman_one'
  | 'roman_one_white'
  | 'roman_one_red'
  | 'points_100'
  | 'points_200'
  | 'points_300'
  | 'points_400'
  | 'points_500'
  | 'powerup_grenade'
  | 'powerup_helmet'
  | 'powerup_shovel'
  | 'powerup_star'
  | 'powerup_tank'
  | 'powerup_timer'
  | 'battle_city'
  | 'namcot'
  | 'copyright'
  | 'white_line'
  | 'arrow'
  | 'game_over'

export class ImageManager {
  private static instance: ImageManager | null = null

  private textures: Map<ImageName, THREE.Texture> = new Map()
  private imagesLoaded = 0
  private imagesCount = 0
  private imageNames: ImageName[] = []

  private constructor() {
    this.initializeImages()
  }

  public static getInstance(): ImageManager {
    if (this.instance === null) {
      this.instance = new ImageManager()
    }
    return this.instance
  }

  private initializeImages(): void {
    this.imageNames = [
      'tank_player1_down_c0_t1',
      'tank_player1_down_c0_t2',
      'tank_player1_left_c0_t1',
      'tank_player1_left_c0_t2',
      'tank_player1_right_c0_t1',
      'tank_player1_right_c0_t2',
      'tank_player1_up_c0_t1',
      'tank_player1_up_c0_t2',
      'tank_player1_down_c0_t1_s1',
      'tank_player1_down_c0_t2_s1',
      'tank_player1_left_c0_t1_s1',
      'tank_player1_left_c0_t2_s1',
      'tank_player1_right_c0_t1_s1',
      'tank_player1_right_c0_t2_s1',
      'tank_player1_up_c0_t1_s1',
      'tank_player1_up_c0_t2_s1',
      'tank_player1_down_c0_t1_s2',
      'tank_player1_down_c0_t2_s2',
      'tank_player1_left_c0_t1_s2',
      'tank_player1_left_c0_t2_s2',
      'tank_player1_right_c0_t1_s2',
      'tank_player1_right_c0_t2_s2',
      'tank_player1_up_c0_t1_s2',
      'tank_player1_up_c0_t2_s2',
      'tank_player1_down_c0_t1_s3',
      'tank_player1_down_c0_t2_s3',
      'tank_player1_left_c0_t1_s3',
      'tank_player1_left_c0_t2_s3',
      'tank_player1_right_c0_t1_s3',
      'tank_player1_right_c0_t2_s3',
      'tank_player1_up_c0_t1_s3',
      'tank_player1_up_c0_t2_s3',
      'tank_basic_down_c0_t1',
      'tank_basic_down_c0_t2',
      'tank_basic_left_c0_t1',
      'tank_basic_left_c0_t2',
      'tank_basic_right_c0_t1',
      'tank_basic_right_c0_t2',
      'tank_basic_up_c0_t1',
      'tank_basic_up_c0_t2',
      'tank_basic_down_c0_t1_f',
      'tank_basic_down_c0_t2_f',
      'tank_basic_left_c0_t1_f',
      'tank_basic_left_c0_t2_f',
      'tank_basic_right_c0_t1_f',
      'tank_basic_right_c0_t2_f',
      'tank_basic_up_c0_t1_f',
      'tank_basic_up_c0_t2_f',
      'tank_fast_down_c0_t1',
      'tank_fast_down_c0_t2',
      'tank_fast_left_c0_t1',
      'tank_fast_left_c0_t2',
      'tank_fast_right_c0_t1',
      'tank_fast_right_c0_t2',
      'tank_fast_up_c0_t1',
      'tank_fast_up_c0_t2',
      'tank_fast_down_c0_t1_f',
      'tank_fast_down_c0_t2_f',
      'tank_fast_left_c0_t1_f',
      'tank_fast_left_c0_t2_f',
      'tank_fast_right_c0_t1_f',
      'tank_fast_right_c0_t2_f',
      'tank_fast_up_c0_t1_f',
      'tank_fast_up_c0_t2_f',
      'tank_power_down_c0_t1',
      'tank_power_down_c0_t2',
      'tank_power_left_c0_t1',
      'tank_power_left_c0_t2',
      'tank_power_right_c0_t1',
      'tank_power_right_c0_t2',
      'tank_power_up_c0_t1',
      'tank_power_up_c0_t2',
      'tank_power_down_c0_t1_f',
      'tank_power_down_c0_t2_f',
      'tank_power_left_c0_t1_f',
      'tank_power_left_c0_t2_f',
      'tank_power_right_c0_t1_f',
      'tank_power_right_c0_t2_f',
      'tank_power_up_c0_t1_f',
      'tank_power_up_c0_t2_f',
      'tank_armor_down_c0_t1',
      'tank_armor_down_c0_t1_f',
      'tank_armor_down_c0_t2',
      'tank_armor_down_c0_t2_f',
      'tank_armor_down_c1_t1',
      'tank_armor_down_c1_t2',
      'tank_armor_down_c2_t1',
      'tank_armor_down_c2_t2',
      'tank_armor_left_c0_t1',
      'tank_armor_left_c0_t1_f',
      'tank_armor_left_c0_t2',
      'tank_armor_left_c0_t2_f',
      'tank_armor_left_c1_t1',
      'tank_armor_left_c1_t2',
      'tank_armor_left_c2_t1',
      'tank_armor_left_c2_t2',
      'tank_armor_right_c0_t1',
      'tank_armor_right_c0_t1_f',
      'tank_armor_right_c0_t2',
      'tank_armor_right_c0_t2_f',
      'tank_armor_right_c1_t1',
      'tank_armor_right_c1_t2',
      'tank_armor_right_c2_t1',
      'tank_armor_right_c2_t2',
      'tank_armor_up_c0_t1',
      'tank_armor_up_c0_t1_f',
      'tank_armor_up_c0_t2',
      'tank_armor_up_c0_t2_f',
      'tank_armor_up_c1_t1',
      'tank_armor_up_c1_t2',
      'tank_armor_up_c2_t1',
      'tank_armor_up_c2_t2',
      'appear_1',
      'appear_2',
      'appear_3',
      'appear_4',
      'big_explosion_1',
      'big_explosion_2',
      'big_explosion_3',
      'big_explosion_4',
      'big_explosion_5',
      'shield_1',
      'shield_2',
      'bullet_up',
      'bullet_down',
      'bullet_left',
      'bullet_right',
      'bullet_explosion_1',
      'bullet_explosion_2',
      'bullet_explosion_3',
      'wall_brick',
      'wall_steel',
      'trees',
      'water_1',
      'water_2',
      'base',
      'base_destroyed',
      'enemy',
      'lives',
      'flag',
      'roman_one',
      'roman_one_white',
      'roman_one_red',
      'points_100',
      'points_200',
      'points_300',
      'points_400',
      'points_500',
      'powerup_grenade',
      'powerup_helmet',
      'powerup_shovel',
      'powerup_star',
      'powerup_tank',
      'powerup_timer',
      'battle_city',
      'namcot',
      'copyright',
      'white_line',
      'arrow',
      'game_over',
    ]

    this.imagesCount = this.imageNames.length
    this.loadImages()
  }

  private loadImages(): void {
    const loader = new THREE.TextureLoader()

    for (const name of this.imageNames) {
      loader.load(
        `/images/${name}.png`,
        texture => {
          // Para sprites en Three.js con cámara ortográfica, necesitamos flipY = true
          // porque las imágenes PNG tienen coordenadas Y invertidas respecto a WebGL
          texture.flipY = true
          texture.needsUpdate = true
          this.textures.set(name, texture)
          this.imagesLoaded++
        },
        undefined,
        () => {
          // Error loading, pero contamos como cargada para no bloquear
          this.imagesLoaded++
        },
      )
    }
  }

  public getTexture(name: ImageName): THREE.Texture | undefined {
    return this.textures.get(name)
  }

  public getLoadingProgress(): number {
    if (this.imagesCount === 0) {
      return 100
    }
    return Math.floor((this.imagesLoaded / this.imagesCount) * 100)
  }
}
