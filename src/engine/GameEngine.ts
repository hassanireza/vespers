export type EngineListener<TState> = (state: TState) => void;

export abstract class GameEngine<TState> {
  protected listeners: Set<EngineListener<TState>> = new Set();
  protected running = false;

  public abstract getState(): TState;

  public abstract start(): void;

  public abstract reset(): void;

  public stop(): void {
    this.running = false;
  }

  public isRunning(): boolean {
    return this.running;
  }

  public subscribe(listener: EngineListener<TState>): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  protected emit(): void {
    const snapshot = this.getState();
    this.listeners.forEach((listener) => listener(snapshot));
  }

  public destroy(): void {
    this.stop();
    this.listeners.clear();
  }
}
