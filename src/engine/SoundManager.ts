/**
 * SoundManager
 *
 * Small wrapper around the WebAudio API used to play short synthesized
 * square wave beeps for in-game feedback (drop, rotate, clear, game over).
 * Centralising this logic avoids duplicating raw AudioContext handling
 * across every game engine and lets the user mute all sound effects
 * from a single toggle.
 */
export class SoundManager {
  private context: AudioContext | null = null;
  private enabled = true;

  private ensureContext(): AudioContext {
    if (!this.context) {
      const AudioContextCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.context = new AudioContextCtor();
    }
    if (this.context.state === "suspended") {
      void this.context.resume();
    }
    return this.context;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public beep(frequency: number, duration: number, volume = 0.08): void {
    if (!this.enabled) return;

    try {
      const ctx = this.ensureContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = "square";
      oscillator.frequency.value = frequency;

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      oscillator.start();
      oscillator.stop(ctx.currentTime + duration);
    } catch {
      // Audio is a progressive enhancement; failures are silently ignored.
    }
  }

  public dispose(): void {
    this.context?.close().catch(() => undefined);
    this.context = null;
  }
}
