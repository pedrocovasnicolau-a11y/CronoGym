// Cronómetro — cuenta ascendente con series (laps)
import { ProgressBar, RoundBtn, TabBar, TopBar } from '../components/ui.jsx';
import { IconFlag, IconPause, IconPlay, IconReset } from '../components/icons.jsx';
import { fmtHMS } from '../lib/time.js';
import { useStopwatch } from '../lib/useStopwatch.js';

export function StopwatchScreen({ back, onTab }) {
  const { running, elapsed, laps, partial, toggle, reset, lap } = useStopwatch();

  return (
    <>
      <TopBar title="Cronómetro" onBack={back} />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '0 20px',
          minHeight: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: running ? 'var(--accent)' : 'var(--text-faint)',
              animation: running ? 'pulse-dot 1s infinite ease-in-out' : 'none',
            }}
          />
          <span className="eyebrow">
            {running ? 'En marcha' : elapsed > 0 ? 'Pausado' : 'Listo'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
          <div style={{ textAlign: 'center', padding: '14px 0 10px' }}>
            <div className="eyebrow" style={{ marginBottom: 6, fontSize: 10 }}>
              Tiempo total
            </div>
            <div className="digits" style={{ fontSize: 62, color: 'var(--text)' }}>
              {fmtHMS(elapsed)}
            </div>
          </div>
          <div
            style={{
              textAlign: 'center',
              padding: '12px 0',
              background: 'color-mix(in oklab, var(--accent) 10%, var(--bg-card))',
              border: '1px solid color-mix(in oklab, var(--accent) 30%, var(--border))',
              borderRadius: 18,
            }}
          >
            <div
              className="eyebrow"
              style={{ marginBottom: 6, fontSize: 10, color: 'var(--accent)' }}
            >
              Tiempo parcial
            </div>
            <div className="digits" style={{ fontSize: 46, color: 'var(--accent)' }}>
              {fmtHMS(partial)}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: 'var(--accent)',
                opacity: 0.7,
                marginTop: 4,
                letterSpacing: '0.1em',
              }}
            >
              {laps.length === 0 ? 'desde el inicio' : `desde serie ${laps[0].n}`}
            </div>
          </div>
        </div>

        <div style={{ padding: '0 0 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span className="eyebrow" style={{ fontSize: 10 }}>
              Minuto actual
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-dim)',
                fontWeight: 700,
              }}
            >
              {String(Math.floor(elapsed / 60) + 1).padStart(2, '0')}
            </span>
          </div>
          <ProgressBar pct={((elapsed % 60) / 60) * 100} color="var(--accent)" />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {laps.length === 0 ? (
            <div
              style={{
                border: '1px dashed var(--border)',
                borderRadius: 14,
                padding: '18px 16px',
                textAlign: 'center',
                color: 'var(--text-faint)',
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Sin series — toca <IconFlag size={12} /> para marcar
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {laps.map((l, i) => (
                <div
                  key={l.n}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 2px',
                    borderBottom: i === laps.length - 1 ? 'none' : '1px solid var(--border)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--text-dim)',
                      letterSpacing: '0.1em',
                    }}
                  >
                    SERIE {String(l.n).padStart(2, '0')}
                  </span>
                  <span className="digits" style={{ fontSize: 16, color: 'var(--text)' }}>
                    {fmtHMS(l.t)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 18,
            padding: '14px 0 10px',
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
          <RoundBtn size={56} onClick={lap} bg="var(--bg-card)" fg="var(--text)">
            <IconFlag size={20} />
          </RoundBtn>
        </div>
      </div>
      <TabBar active="timers" onChange={onTab} />
    </>
  );
}
