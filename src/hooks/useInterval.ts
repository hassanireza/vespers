import { useEffect, useRef } from "react";

/**
 * Declarative setInterval. Pass `null` as the delay to pause.
 * The callback is read through a ref, so it never restarts the timer.
 */
export function useInterval(callback: () => void, delayMs: number | null): void {
  const saved = useRef(callback);

  useEffect(() => {
    saved.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delayMs === null) return;
    const id = window.setInterval(() => saved.current(), delayMs);
    return () => window.clearInterval(id);
  }, [delayMs]);
}
