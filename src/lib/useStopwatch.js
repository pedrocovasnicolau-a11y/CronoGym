import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Cronómetro de cuenta ascendente con vueltas (laps).
 * Basado en `performance.now()` contra un timestamp de inicio → sin deriva.
 */
export function useStopwatch() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState([]);
  const [lapStartElapsed, setLapStartElapsed] = useState(0);

  const startRef = useRef(0);
  const accumRef = useRef(0);

  useEffect(() => {
    if (!running) return undefined;
    startRef.current = performance.now();
    const id = setInterval(() => {
      setElapsed(accumRef.current + (performance.now() - startRef.current) / 1000);
    }, 50);
    return () => clearInterval(id);
  }, [running]);

  const toggle = useCallback(() => {
    setRunning((r) => {
      if (r) accumRef.current = accumRef.current + (performance.now() - startRef.current) / 1000;
      return !r;
    });
  }, []);

  const reset = useCallback(() => {
    setRunning(false);
    setElapsed(0);
    accumRef.current = 0;
    setLaps([]);
    setLapStartElapsed(0);
  }, []);

  const lap = useCallback(() => {
    setElapsed((cur) => {
      setLaps((l) => [{ n: l.length + 1, t: cur, split: cur - (l[0]?.t || 0) }, ...l]);
      setLapStartElapsed(cur);
      return cur;
    });
  }, []);

  return {
    running,
    elapsed,
    laps,
    partial: elapsed - lapStartElapsed,
    toggle,
    reset,
    lap,
  };
}
