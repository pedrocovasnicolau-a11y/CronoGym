// Dashboard / inicio
import { TabBar, TopBar } from '../components/ui.jsx';
import {
  IconCountdown,
  IconEmom,
  IconStopwatch,
  IconTabata,
  IconTempo,
} from '../components/icons.jsx';

const QUICK_TIMERS = [
  { id: 'stopwatch', label: 'Cronómetro', hint: 'Cuenta ascendente', Icon: IconStopwatch },
  { id: 'countdown', label: 'Cuenta atrás', hint: 'Timer simple', Icon: IconCountdown },
  { id: 'tabata', label: 'Tabata / HIIT', hint: '8×20/10', Icon: IconTabata },
  { id: 'emom', label: 'EMOM', hint: 'Cada minuto', Icon: IconEmom },
  { id: 'tempo', label: 'Tempo', hint: 'Ritmo de fuerza', Icon: IconTempo },
];

export function HomeScreen({ go, onTab }) {
  return (
    <>
      <TopBar title="CronoGym · Dashboard" right={<div className="live-dot" />} />
      <div className="scroll-area" style={{ padding: '4px 18px 16px' }}>
        <div style={{ padding: '4px 0 18px' }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            Tu entreno
          </div>
          <h1 className="title-xl" style={{ fontSize: 32 }}>
            Vamos<span style={{ color: 'var(--accent)' }}>.</span>
          </h1>
          <div style={{ color: 'var(--text-dim)', fontSize: 14, marginTop: 4 }}>
            Elige un timer y empieza
          </div>
        </div>

        <div className="eyebrow" style={{ marginBottom: 10 }}>
          Timers
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            marginBottom: 8,
          }}
        >
          {QUICK_TIMERS.map((t, i) => (
            <div
              key={t.id}
              className="press card"
              onClick={() => go(t.id)}
              style={{
                padding: 14,
                cursor: 'pointer',
                ...(i === QUICK_TIMERS.length - 1 && QUICK_TIMERS.length % 2 === 1
                  ? { gridColumn: 'span 2' }
                  : {}),
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: 'var(--accent)',
                  color: 'var(--accent-ink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                }}
              >
                <t.Icon size={18} />
              </div>
              <div className="title-md">{t.label}</div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-dim)',
                  marginTop: 2,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.04em',
                }}
              >
                {t.hint}
              </div>
            </div>
          ))}
        </div>
      </div>
      <TabBar active="home" onChange={onTab} />
    </>
  );
}
