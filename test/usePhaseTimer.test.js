import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePhaseTimer } from '../src/lib/usePhaseTimer.js';

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('usePhaseTimer', () => {
  it('no acumula deriva a lo largo del tiempo', () => {
    const { result } = renderHook(() => usePhaseTimer([{ dur: 60 }], { autostart: true }));

    act(() => vi.advanceTimersByTime(10_000));
    expect(result.current.remaining).toBeCloseTo(50, 0);

    act(() => vi.advanceTimersByTime(20_000));
    expect(result.current.remaining).toBeCloseTo(30, 0);
  });

  it('avanza de fase y dispara onPhaseEnter / onComplete', () => {
    const onPhaseEnter = vi.fn();
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      usePhaseTimer(
        [
          { dur: 5, type: 'a' },
          { dur: 5, type: 'b' },
        ],
        {
          autostart: true,
          onPhaseEnter,
          onComplete,
        },
      ),
    );

    act(() => vi.advanceTimersByTime(5_100));
    expect(onPhaseEnter).toHaveBeenCalledWith(1, expect.objectContaining({ type: 'b' }));
    expect(result.current.index).toBe(1);

    act(() => vi.advanceTimersByTime(5_100));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(result.current.done).toBe(true);
  });

  it('hace fast-forward al volver de segundo plano', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      usePhaseTimer([{ dur: 5 }, { dur: 5 }, { dur: 5 }], { autostart: true, onComplete }),
    );

    // El navegador estranguló setInterval: sólo salta el reloj y luego vuelve el foco
    act(() => {
      vi.setSystemTime(Date.now() + 20_000);
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(result.current.done).toBe(true);
  });

  it('la pausa congela el restante y reanuda desde ahí', () => {
    const { result } = renderHook(() => usePhaseTimer([{ dur: 60 }], { autostart: true }));

    act(() => vi.advanceTimersByTime(10_000));
    act(() => result.current.toggle()); // pausa
    const rem = result.current.remaining;
    expect(rem).toBeCloseTo(50, 0);

    act(() => vi.advanceTimersByTime(30_000)); // el tiempo en pausa no cuenta
    expect(result.current.remaining).toBeCloseTo(rem, 3);

    act(() => result.current.toggle()); // reanuda
    act(() => vi.advanceTimersByTime(5_000));
    expect(result.current.remaining).toBeCloseTo(45, 0);
  });

  it('skip salta a la fase siguiente y dispara su alerta', () => {
    const onPhaseEnter = vi.fn();
    const { result } = renderHook(() =>
      usePhaseTimer(
        [
          { dur: 30, type: 'a' },
          { dur: 30, type: 'b' },
        ],
        {
          autostart: true,
          onPhaseEnter,
        },
      ),
    );

    act(() => result.current.skip());
    expect(result.current.index).toBe(1);
    expect(result.current.remaining).toBe(30);
    expect(onPhaseEnter).toHaveBeenCalledWith(1, expect.objectContaining({ type: 'b' }));
  });

  it('toggle reinicia tras completar', () => {
    const { result } = renderHook(() => usePhaseTimer([{ dur: 5 }], { autostart: true }));

    act(() => vi.advanceTimersByTime(5_100));
    expect(result.current.done).toBe(true);

    act(() => result.current.toggle());
    expect(result.current.done).toBe(false);
    expect(result.current.index).toBe(0);
    expect(result.current.running).toBe(true);
  });
});
