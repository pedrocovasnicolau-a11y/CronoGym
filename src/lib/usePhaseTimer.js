import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Temporizador de fases basado en reloj absoluto (`Date.now()`).
 *
 * La fuente de verdad es el timestamp en que termina la fase actual, no un
 * contador que se decrementa. Así no acumula deriva y, al volver de segundo
 * plano (donde el navegador estrangula `setInterval`), recalcula cuántas fases
 * han pasado realmente y hace fast-forward disparando las alertas pendientes.
 *
 * @param {Array<{dur:number}>} phases  Fases en segundos. Puede llevar metadatos extra.
 * @param {object} options
 * @param {(index:number, phase:object)=>void} [options.onPhaseEnter]  Al entrar en una fase (no la inicial).
 * @param {()=>void} [options.onComplete]  Al terminar la última fase.
 * @param {boolean} [options.autostart=true]
 */
export function usePhaseTimer(phases, options = {}) {
  const { onPhaseEnter, onComplete, autostart = true } = options;

  const cbRef = useRef({});
  cbRef.current = { onPhaseEnter, onComplete };

  const total = phases.length;

  const [index, setIndexState] = useState(0);
  const [remaining, setRemainingState] = useState(() => phases[0]?.dur ?? 0);
  const [running, setRunningState] = useState(autostart && total > 0);

  // Espejos síncronos para leer dentro del intervalo
  const indexRef = useRef(0);
  const remainingRef = useRef(remaining);
  const runningRef = useRef(running);
  const phaseEndRef = useRef(0); // Date.now() (ms) al final de la fase actual

  const setIndex = (v) => {
    indexRef.current = v;
    setIndexState(v);
  };
  const setRemaining = (v) => {
    remainingRef.current = v;
    setRemainingState(v);
  };
  const setRunning = (v) => {
    runningRef.current = v;
    setRunningState(v);
  };

  // Sincroniza el fin de la fase actual a un "restante" concreto (segundos)
  const arm = useCallback((remSec) => {
    phaseEndRef.current = Date.now() + Math.max(0, remSec) * 1000;
  }, []);

  const tick = useCallback(() => {
    if (!runningRef.current) return;
    let i = indexRef.current;
    if (i >= total) return;

    const now = Date.now();

    if (now >= phaseEndRef.current) {
      let end = phaseEndRef.current;
      while (i < total && now >= end) {
        i += 1;
        if (i < total) {
          end += phases[i].dur * 1000;
          cbRef.current.onPhaseEnter?.(i, phases[i]);
        }
      }
      if (i >= total) {
        setIndex(total);
        setRemaining(0);
        setRunning(false);
        cbRef.current.onComplete?.();
        return;
      }
      phaseEndRef.current = end;
      setIndex(i);
    }

    setRemaining(Math.max(0, (phaseEndRef.current - now) / 1000));
  }, [phases, total]);

  // Arranca el reloj de la primera fase al montar
  useEffect(() => {
    if (autostart && total > 0) arm(phases[0].dur);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bucle de re-render (la precisión la da el timestamp, no la cadencia)
  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [running, tick]);

  // Al volver de segundo plano, recalcula de inmediato
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [tick]);

  const toggle = useCallback(() => {
    if (runningRef.current) {
      // Pausa
      setRemaining(Math.max(0, (phaseEndRef.current - Date.now()) / 1000));
      setRunning(false);
      return;
    }
    if (indexRef.current >= total) {
      // Reinicia desde el principio tras completar
      const d = phases[0]?.dur ?? 0;
      setIndex(0);
      setRemaining(d);
      arm(d);
    } else {
      arm(remainingRef.current);
    }
    setRunning(true);
  }, [phases, total, arm]);

  const reset = useCallback(() => {
    const d = phases[0]?.dur ?? 0;
    setIndex(0);
    setRemaining(d);
    arm(d);
    setRunning(false);
  }, [phases, arm]);

  const skip = useCallback(() => {
    const ni = indexRef.current + 1;
    if (ni < total) {
      setIndex(ni);
      setRemaining(phases[ni].dur);
      arm(phases[ni].dur);
      cbRef.current.onPhaseEnter?.(ni, phases[ni]);
    } else {
      setIndex(total);
      setRemaining(0);
      setRunning(false);
      cbRef.current.onComplete?.();
    }
  }, [phases, total, arm]);

  const prev = useCallback(() => {
    if (total === 0) return;
    const pi = Math.max(0, Math.min(indexRef.current, total - 1) - 1);
    setIndex(pi);
    setRemaining(phases[pi].dur);
    arm(phases[pi].dur);
  }, [phases, total, arm]);

  const done = index >= total;
  const totalDuration = phases.reduce((s, p) => s + p.dur, 0);
  const curDur = phases[Math.min(index, total - 1)]?.dur ?? 0;
  const elapsedBefore = phases.slice(0, Math.min(index, total)).reduce((s, p) => s + p.dur, 0);
  const elapsedTotal = done ? totalDuration : elapsedBefore + (curDur - remaining);

  return {
    index,
    remaining,
    running,
    done,
    phase: phases[index] ?? null,
    totalDuration,
    elapsedTotal,
    toggle,
    reset,
    skip,
    prev,
  };
}
