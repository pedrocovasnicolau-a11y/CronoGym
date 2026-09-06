// Cuenta atrás — presets + drum picker
import { useEffect, useMemo, useState } from 'react';
import { ProgressBar, RoundBtn, TabBar, TimeDrumPicker, TopBar } from '../components/ui.jsx';
import { IconPause, IconPlay, IconReset } from '../components/icons.jsx';
import { fmtMMSS } from '../lib/time.js';
import { lsGet, lsSet } from '../lib/storage.js';
import { triggerAlert } from '../lib/audio.js';
import { usePhaseTimer } from '../lib/usePhaseTimer.js';

const PRESETS = [30, 60, 90, 120, 180, 300];

export function CountdownScreen({ back, onTab, settings, initialTarget = 90 }) {
  const [target, setTargetRaw] = useState(() => lsGet('cg_countdown_target', initialTarget));
  const [showPicker, setShowPicker] = useState(false);

  const setTarget = (v) => {
    const clamped = Math.max(5, Math.min(3600, v));
    setTargetRaw(clamped);
    lsSet('cg_countdown_target', clamped);
  };

  const phases = useMemo(() => [{ dur: target }], [target]);
  const { remaining, running, done, toggle, reset } = usePhaseTimer(phases, {
    autostart: false,
    onComplete: () => triggerAlert(settings, 'end'),
  });

  // Al cambiar el objetivo (presets, ±, picker) se rearma la cuenta atrás
  useEffect(() => {
    reset();
  }, [target, reset]);

  const pct = target > 0 ? (1 - remaining / target) * 100 : 0;
  const isFinal5 = running && remaining <= 5 && remaining > 0;
  const finished = done && !running;

  return (
    <>
      <TopBar title="Cuenta atrás" onBack={back} />

      {showPicker && (
        <TimeDrumPicker
          value={target}
          label="Duración"
          maxMinutes={59}
          onChange={(v) => setTarget(v)}
          onClose={() => setShowPicker(false)}
        />
      )}

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '0 20px',
          minHeight: 0,
          justifyContent: 'space-between',
        }}
      >
        <div style={{ textAlign: 'center', padding: '8px 0 0' }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Descanso
          </div>
          <div
            className={!running ? 'press' : ''}
            onClick={() => {
              if (!running) setShowPicker(true);
            }}
            style={{ cursor: !running ? 'pointer' : 'default' }}
          >
            <div
              className="digits"
              style={{
                fontSize: 92,
                color: isFinal5 ? 'var(--work)' : finished ? 'var(--rest)' : 'var(--text)',
                transition: 'color 200ms',
              }}
            >
              {fmtMMSS(remaining)}
            </div>
          </div>
          <div
            style={{
              marginTop: 6,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--text-dim)',
              letterSpacing: '0.1em',
            }}
          >
            {finished
              ? '¡HORA DE LA SIGUIENTE SERIE!'
              : running
                ? `de ${fmtMMSS(target)}`
                : 'toca el tiempo para editar'}
          </div>
        </div>

        <div style={{ padding: '8px 0 14px' }}>
          <ProgressBar
            pct={pct}
            color={isFinal5 ? 'var(--work)' : finished ? 'var(--rest)' : 'var(--accent)'}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-faint)',
                fontWeight: 700,
              }}
            >
              00:00
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-faint)',
                fontWeight: 700,
              }}
            >
              {fmtMMSS(target)}
            </span>
          </div>
        </div>

        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>
            Presets
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {PRESETS.map((p) => (
              <div
                key={p}
                className="press"
                onClick={() => setTarget(p)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 100,
                  border: `1px solid ${target === p ? 'var(--accent)' : 'var(--border)'}`,
                  background: target === p ? 'var(--accent)' : 'transparent',
                  color: target === p ? 'var(--accent-ink)' : 'var(--text-dim)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                }}
              >
                {p < 60 ? `${p}s` : `${p / 60}m`}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '6px 0',
          }}
        >
          <div
            className="press picker-btn"
            onClick={() => setTarget(target - 5)}
            style={{ width: 44, height: 44 }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700 }}>
              −5s
            </span>
          </div>
          <div
            style={{
              textAlign: 'center',
              fontSize: 11,
              color: 'var(--text-dim)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Ajustar objetivo
          </div>
          <div
            className="press picker-btn"
            onClick={() => setTarget(target + 5)}
            style={{ width: 44, height: 44 }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700 }}>
              +5s
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 22,
            padding: '8px 0 12px',
          }}
        >
          <RoundBtn size={56} onClick={reset} bg="var(--bg-card)" fg="var(--text-dim)">
            <IconReset size={20} />
          </RoundBtn>
          <RoundBtn
            size={84}
            onClick={toggle}
            bg="var(--accent)"
            fg="var(--accent-ink)"
            border="transparent"
          >
            {running ? <IconPause size={30} /> : <IconPlay size={30} />}
          </RoundBtn>
        </div>
      </div>
      <TabBar active="timers" onChange={onTab} />
    </>
  );
}
