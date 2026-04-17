// ═══════════════════════════════════════════════════════
// STOPWATCH (cronómetro) — cuenta ascendente, con laps
// ═══════════════════════════════════════════════════════
const { useState: useStateSW, useEffect: useEffectSW, useRef: useRefSW } = React;

function StopwatchScreen({ back, ringMode }) {
  const [running, setRunning] = useStateSW(false);
  const [elapsed, setElapsed] = useStateSW(0); // seconds
  const startRef = useRefSW(null);
  const accumRef = useRefSW(0);
  const [laps, setLaps] = useStateSW([]);

  useEffectSW(() => {
    if (!running) return;
    startRef.current = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      setElapsed(accumRef.current + (now - startRef.current) / 1000);
    }, 50);
    return () => clearInterval(id);
  }, [running]);

  const toggle = () => {
    if (running) {
      accumRef.current = elapsed;
      setRunning(false);
    } else {
      setRunning(true);
    }
  };
  const reset = () => { setRunning(false); setElapsed(0); accumRef.current = 0; setLaps([]); };
  const lap = () => setLaps(l => [{ n: l.length + 1, t: elapsed, split: elapsed - (l[0]?.t || 0) }, ...l]);

  return (
    <>
      <TopBar title="Cronómetro" onBack={back}/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 20px', minHeight: 0 }}>
        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: running ? 'var(--accent)' : 'var(--text-faint)',
            animation: running ? 'pulse-dot 1s infinite ease-in-out' : 'none',
          }}/>
          <span className="eyebrow">{running ? 'En marcha' : elapsed > 0 ? 'Pausado' : 'Listo'}</span>
        </div>

        {/* Big time */}
        <div style={{ textAlign: 'center', padding: '20px 0 12px' }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Tiempo total</div>
          <div className="digits" style={{ fontSize: 64, color: 'var(--text)' }}>
            {fmtHMS(elapsed)}
          </div>
        </div>

        {/* Progress indicator (minute-based visual) */}
        <div style={{ padding: '14px 0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span className="eyebrow" style={{ fontSize: 10 }}>Minuto actual</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', fontWeight: 700 }}>
              {String(Math.floor(elapsed / 60) + (elapsed % 60 > 0 ? 1 : 1)).padStart(2,'0')}
            </span>
          </div>
          <ProgressBar pct={(elapsed % 60) / 60 * 100} color="var(--accent)"/>
        </div>

        {/* Laps list */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {laps.length === 0 ? (
            <div style={{
              border: '1px dashed var(--border)', borderRadius: 14,
              padding: '22px 16px', textAlign: 'center',
              color: 'var(--text-faint)', fontSize: 12, fontFamily: 'var(--font-mono)',
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              Sin series — toca <IconFlag size={12}/> para marcar
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {laps.map((l, i) => (
                <div key={l.n} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 2px',
                  borderBottom: i === laps.length - 1 ? 'none' : '1px solid var(--border)',
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
                    SERIE {String(l.n).padStart(2,'0')}
                  </span>
                  <span className="digits" style={{ fontSize: 16, color: 'var(--text)' }}>{fmtHMS(l.t)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, padding: '16px 0 10px' }}>
          <RoundBtn size={56} onClick={reset} bg="var(--bg-card)" fg="var(--text-dim)"><IconReset size={20}/></RoundBtn>
          <RoundBtn size={84} onClick={toggle} bg="var(--accent)" fg="var(--accent-ink)" border="transparent">
            {running ? <IconPause size={30}/> : <IconPlay size={30}/>}
          </RoundBtn>
          <RoundBtn size={56} onClick={lap} bg="var(--bg-card)" fg="var(--text)"><IconFlag size={20}/></RoundBtn>
        </div>
      </div>
      <TabBar active="timers" onChange={() => {}}/>
    </>
  );
}

Object.assign(window, { StopwatchScreen });
