/**
 * GameEngine
 *
 * Abstract base class that every game engine in Vespers extends.
 * It defines a small, predictable lifecycle (start, pause, resume, stop,
 * reset) and a lightweight pub/sub mechanism so React components can
 * subscribe to engine state without the engine knowing anything about
 * React. This keeps game logic fully framework agnostic and unit
 * testable in isolation.
 */
export type EngineListener<TState> = (state: TState) => void;

export abstract class GameEngine<TState> {
  protected listeners: Set<EngineListener<TState>> = new Set();
  protected running = false;

  /** Returns an immutable snapshot of the current engine state. */
  public abstract getState(): TState;

  /** Starts or restarts the simulation/game loop. */
  public abstract start(): void;

  /** Resets the engine back to its initial state. */
  public abstract reset(): void;

  /** Stops any running timers/animation frames without resetting state. */
  public stop(): void {
    this.running = false;
  }

  public isRunning(): boolean {
    return this.running;
  }

  /** Subscribes to state changes. Returns an unsubscribe function. */
  public subscribe(listener: EngineListener<TState>): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  /** Notifies every subscriber with a fresh state snapshot. */
  protected emit(): void {
    const snapshot = this.getState();
    this.listeners.forEach((listener) => listener(snapshot));
  }

  /** Releases timers and listeners. Must be called on unmount. */
  public destroy(): void {
    this.stop();
    this.listeners.clear();
  }
}
