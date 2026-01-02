// SoundManager pattern del original - singleton para reproducir efectos de sonido
export class SoundManager {
  private static instance: SoundManager | null = null
  private sounds: Record<string, HTMLAudioElement> = {}

  private constructor() {
    // Cargar todos los sonidos (como en el original)
    const soundNames = [
      'stage_start',
      'game_over',
      'bullet_shot',
      'bullet_hit_1',
      'bullet_hit_2',
      'explosion_1',
      'explosion_2',
      'pause',
      'powerup_appear',
      'powerup_pick',
      'statistics_1',
    ]

    soundNames.forEach(soundName => {
      const audio = new Audio(`/sound/${soundName}.ogg`)
      // Preload los sonidos
      audio.preload = 'auto'
      this.sounds[soundName] = audio
    })
  }

  public static getInstance(): SoundManager {
    if (SoundManager.instance === null) {
      SoundManager.instance = new SoundManager()
    }
    return SoundManager.instance
  }

  public play(sound: string): void {
    const audio = this.sounds[sound]
    if (audio) {
      // Reiniciar el audio si ya está reproduciéndose (como en el original)
      audio.currentTime = 0
      audio.play().catch(error => {
        // Ignorar errores de reproducción (puede ser que el usuario no haya interactuado aún)
        console.warn(`Error playing sound ${sound}:`, error)
      })
    }
  }
}
