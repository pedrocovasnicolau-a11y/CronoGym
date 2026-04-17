// ═══════════════════════════════════════════════════════
// COUNTDOWN (cuenta atrás) — con presets y 3-2-1 prep
// ═══════════════════════════════════════════════════════
const { useState: useStateCD, useEffect: useEffectCD, useRef: useRefCD } = React;

function CountdownScreen({ back, initial = 90 }) {
  const [target, setTarget] = useStateCD(initial);
  const [remaining, setRemaining] = useStateCD(initial);
  const [running, setRunning] = useStateCD(false);

  // Presets típicos de descanso
  const presets = [30, 60, 90, 120, 180, 300];

  useEffectCD(() => { setRemaining(target); }, [target]);

  // Main tick
  useEffectCD(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining(r => {
        if (r <= 0.1) {
          clearInterval(id);
          setRunning(false);
          return 0;
        }
        return r - 0.1;
      });
    }, 100);
    return () => clearInterval(id);
  }, [running]);

  const toggle = () => {
    if (running) { setRunning(false); return; }
    if (remaining <= 0) setRemaining(target);
    setRunning(true);
  };
  const reset = () => { setRunning(false); setRemaining(target); };

  const pct = target > 0 ? (1 - remaining / target) * 100 : 0;
  const isFinal5 = running && remaining <= 5 && remaining > 0;

  return (
    <>
      <TopBar title="Cuenta atrás" onBack={back} right={
        <div className="press" style={{
          width: 36, height: 36, borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          color: 'var(--text)',
        }}><IconBell size={16}/></div>
      }/>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 20px', minHeight: 0, justifyContent: 'space-between' }}>
        {/* Big time */}
        <div style={{ textAlign: 'center', padding: '8px 0 0' }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Descanso</div>
          <div className="digits" style={{
            fontSize: 92,
            color: isFinal5 ? 'var(--work)' : remaining <= 0 ? 'var(--rest)' : 'var(--text)',
            transition: 'color 200ms',
          }}>
            {fmtMMSS(remaining)}
          </div>
          <div style={{
            marginTop: 6,
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            color: 'var(--text-dim)', letterSpacing: '0.1em',
          }}>
            {remaining <= 0 ? '¡HORA DE LA SIGUIENTE SERIE!' : `de ${fmtMMSS(target)}`}
          </div>
        </div>

        {/* Progress */}
        <div style={{ padding: '8px 0 14px' }}>
          <ProgressBar pct={pct} color={isFinal5 ? 'var(--work)' : remaining <= 0 ? 'var(--rest)' : 'var(--accent)'}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)', fontWeight: 700 }}>00:00</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)', fontWeight: 700 }}>{fmtMMSS(target)}</span>
          </div>
        </div>

        {/* Presets */}
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Presets</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {presets.map(p => (
              <div key={p} className="press" onClick={() => setTarget(p)} style={{
                padding: '8px 12px', borderRadius: 100,
                border: `1px solid ${target === p ? 'var(--accent)' : 'var(--border)'}`,
                background: target === p ? 'var(--accent)' : 'transparent',
                color: target === p ? 'var(--accent-ink)' : 'var(--text-dim)',
                fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                letterSpacing: '0.04em', cursor: 'pointer',
              }}>
                {p < 60 ? `${p}s` : `${p/60}m`}
              </div>
            ))}
          </div>
        </div>

        {/* Adjust */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
          <div className="press picker-btn" onClick={() => setTarget(Math.max(5, target - 5))} style={{ width: 44, height: 44 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700 }}>−5s</span>
          </div>
          <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Ajustar objetivo
          </div>
          <div className="press picker-btn" onClick={() => setTarget(Math.min(3600, target + 5))} style={{ width: 44, height: 44 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700 }}>+5s</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, padding: '8px 0 12px' }}>
          <RoundBtn size={56} onClick={reset} bg="var(--bg-card)" fg="var(--text-dim)"><IconReset size={20}/></RoundBtn>
          <RoundBtn size={84} onClick={toggle} bg="var(--accent)" fg="var(--accent-ink)" border="transparent">
            {running ? <IconPause size={30}/> : <IconPlay size={30}/>}
          </RoundBtn>
          <RoundBtn size={56} onClick={() => setRemaining(target)} bg="var(--bg-card)" fg="var(--text)"><IconStop size={18}/></RoundBtn>
        </div>
      </div>
      <TabBar active="timers" onChange={() => {}}/>
    </>
  );
}

Object.assign(window, { CountdownScreen });
