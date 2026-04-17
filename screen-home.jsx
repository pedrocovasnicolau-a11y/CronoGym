// ═══════════════════════════════════════════════════════
// HOME / DASHBOARD
// ═══════════════════════════════════════════════════════
const { useState: useStateH, useEffect: useEffectH } = React;

function HomeScreen({ go, ringMode }) {
  const today = { sessions: 4, totalMin: 48, bestRest: '01:30' };
  const quickTimers = [
    { id: 'stopwatch', label: 'Cronómetro', hint: 'Cuenta ascendente', Icon: IconStopwatch, tone: 'accent' },
    { id: 'countdown', label: 'Cuenta atrás', hint: 'Timer simple', Icon: IconCountdown, tone: 'neutral' },
    { id: 'tabata',    label: 'Tabata',       hint: '8×20/10',      Icon: IconTabata,    tone: 'accent' },
    { id: 'emom',      label: 'EMOM',         hint: 'Cada minuto',  Icon: IconEmom,      tone: 'neutral' },
  ];

  return (
    <>
      <TopBar title="REPS · Dashboard" right={<div className="live-dot"/>}/>
      <div className="scroll-area" style={{ padding: '4px 18px 16px' }}>
        {/* Hero greeting */}
        <div style={{ padding: '4px 0 18px' }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Sábado · 17 abr</div>
          <h1 className="title-xl" style={{ fontSize: 32 }}>
            Vamos<span style={{ color: 'rgb(7, 35, 219)' }}>.</span>
          </h1>
          <div style={{ color: 'var(--text-dim)', fontSize: 14, marginTop: 4 }}>
            Sesión #128 · listo cuando tú lo estés
          </div>
        </div>

        {/* Today stats strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: 8, marginBottom: 18,
        }}>
          {[
            { k: 'Sesiones', v: today.sessions, sub: 'esta semana' },
            { k: 'Minutos',  v: today.totalMin, sub: 'entrenando' },
            { k: 'Mejor',    v: today.bestRest, sub: 'descanso',   mono: true },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: 12 }}>
              <div className="eyebrow" style={{ fontSize: 9 }}>{s.k}</div>
              <div className="digits" style={{ fontSize: s.mono ? 20 : 26, marginTop: 6, color: 'var(--text)' }}>{s.v}</div>
              <div style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Primary CTA: Quick rest timer */}
        <div className="press" onClick={() => go('countdown')} style={{
          background: 'var(--accent)', color: 'var(--accent-ink)',
          borderRadius: 22, padding: '18px 20px', marginBottom: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer',
        }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--accent-ink)', opacity: 0.7 }}>Descanso rápido</div>
            <div className="digits" style={{ fontSize: 32, marginTop: 4 }}>01:30</div>
            <div style={{ fontSize: 11, fontWeight: 600, marginTop: 2 }}>toca para iniciar</div>
          </div>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--accent-ink)', color: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><IconPlay size={22}/></div>
        </div>

        {/* Quick timer grid */}
        <div className="eyebrow" style={{ marginBottom: 10 }}>Timers</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
          {quickTimers.map(t => (
            <div key={t.id} className="press card" onClick={() => go(t.id)} style={{ padding: 14, cursor: 'pointer' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 12,
                background: t.tone === 'accent' ? 'var(--accent)' : 'var(--bg-elev)',
                color: t.tone === 'accent' ? 'var(--accent-ink)' : 'var(--text)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 14,
                border: t.tone === 'accent' ? 'none' : '1px solid var(--border)',
              }}>
                <t.Icon size={18}/>
              </div>
              <div className="title-md">{t.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>{t.hint}</div>
            </div>
          ))}
        </div>
      </div>
      <TabBar active="home" onChange={() => {}}/>
    </>
  );
}

Object.assign(window, { HomeScreen });
