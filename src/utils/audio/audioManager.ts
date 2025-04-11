class AudioManager {
  private static instance: AudioManager;
  private backgroundMusic: HTMLAudioElement | null = null;
  private soundEffects: Map<string, HTMLAudioElement> = new Map();
  private isMuted: boolean = false;

  private constructor() {
    // Initialize audio files
    this.loadAudioFiles();
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private loadAudioFiles() {
    // Background music
    const bgMusic = new Audio('/audio/background/ambient.mp3');
    bgMusic.loop = true;
    this.backgroundMusic = bgMusic;

    // Sound effects
    const effects = {
      'dice': '/audio/effects/dice-roll.mp3',
      'success': '/audio/effects/success.mp3',
      'failure': '/audio/effects/failure.mp3',
      'achievement': '/audio/effects/achievement.mp3',
      'button': '/audio/effects/button-click.mp3',
      'scene': '/audio/effects/scene-change.mp3',
    };

    for (const [key, path] of Object.entries(effects)) {
      const audio = new Audio(path);
      this.soundEffects.set(key, audio);
    }
  }

  public playBackgroundMusic() {
    if (!this.isMuted && this.backgroundMusic) {
      this.backgroundMusic.play();
    }
  }

  public pauseBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
    }
  }

  public playEffect(effectName: string) {
    if (!this.isMuted) {
      const effect = this.soundEffects.get(effectName);
      if (effect) {
        effect.currentTime = 0; // Reset to start
        effect.play();
      }
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.pauseBackgroundMusic();
      // Stop all currently playing sound effects
      this.soundEffects.forEach(effect => {
        effect.pause();
        effect.currentTime = 0;
      });
    } else {
      this.playBackgroundMusic();
    }
    return this.isMuted;
  }

  public setVolume(volume: number) {
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = volume;
    }
    this.soundEffects.forEach(effect => {
      effect.volume = volume;
    });
  }
}

export default AudioManager; 