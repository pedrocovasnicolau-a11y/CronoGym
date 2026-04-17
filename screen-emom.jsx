// ═══════════════════════════════════════════════════════
// EMOM — Every Minute On the Minute · pantalla dedicada
// ═══════════════════════════════════════════════════════
const { useState: useStateEM, useEffect: useEffectEM, useRef: useRefEM } = React;

function EmomScreen({ back }) {
  const [minuteSec, setMinuteSec] = useStateEM(60); // duración de cada intervalo
  const [totalMinutes, setTotalMinutes] = useStateEM(10);
  const [running, setRunning] = useStateEM(false);
  const [elapsed, setElapsed] = useStateEM(0); // total elapsed seconds

  useEffectEM(() => {
    if (!running) return;
    const id = setInterval(() => {
      setElapsed(e => {
        const total = minuteSec * totalMinutes;
        if (e >= total) { setRunning(false); return total; }
        return e + 0.1;
      });
    }, 100);
    return () => clearInterval(id);
  }, [running, minuteSec, totalMinutes]);

  const total = minuteSec * totalMinutes;
  const remainingTotal = Math.max(0, total - elapsed);
  const currentMinute = Math.min(totalMinutes, Math.floor(elapsed / minuteSec) + 1);
  const secInMinute = elapsed % minuteSec;
  const remainingInMinute = Math.max(0, minuteSec - secInMinute);
  const pctMinute = (secInMinute / minuteSec) * 100;
  const pctTotal = total > 0 ? (elapsed / total) * 100 : 0;

  // Alert tint in last 5 seconds of each minute
  const isAlert = running && remainingInMinute <= 5 && remainingInMinute > 0;
  const done = elapsed >= total;

  const reset = () => { setRunning(false); setElapsed(0); };

  return (
    <>
      <TopBar title="EMOM" onBack={back} right={
        <div className="press" style={{
          width: 36, height: 36, borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          color: 'var(--text)',
        }}><IconEmom size={16}/></div>
      }/>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 20px', minHeight: 0, justifyContent: 'space-between' }}>
        {/* Banner */}
        <div className="card" style={{ padding: '10px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--accent)', color: 'var(--accent-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconEmom size={16}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Every Minute On the Minute</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>
              {totalMinutes} rondas · {fmtMMSS(minuteSec)} c/u
            </div>
          </div>
        </div>

        {/* Big minute timer */}
        <div style={{ textAlign: 'center', padding: '4px 0 0' }}>
          <div className="eyebrow" style={{ marginBottom: 8, color: isAlert ? 'var(--work)' : 'var(--text-dim)' }}>
            {done ? 'Completado' : `Minuto ${currentMinute} de ${totalMinutes}`}
          </div>
          <div className="digits" style={{
            fontSize: 100,
            color: done ? 'var(--rest)' : isAlert ? 'var(--work)' : 'var(--text)',
            transition: 'color 200ms',
          }}>
            {fmtMMSS(remainingInMinute)}
          </div>
          <div style={{
            marginTop: 4,
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            color: 'var(--text-dim)', letterSpacing: '0.1em',
          }}>
            {done ? '¡ENTRENO TERMINADO!' : isAlert ? '¡PREPÁRATE PARA LA SIGUIENTE!' : 'ronda en curso'}
          </div>
        </div>

        {/* Minute progress */}
        <div style={{ padding: '8px 0 0' }}>
          <ProgressBar pct={pctMinute} color={isAlert ? 'var(--work)' : 'var(--accent)'}/>
        </div>

        {/* Minute dots */}
        <div style={{ padding: '12px 0' }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {Array.from({ length: totalMinutes }).map((_, i) => {
              const doneDot = i + 1 < currentMinute || done;
              const active = i + 1 === currentMinute && !done;
              return (
                <div key={i} style={{
                  flex: 1, height: 6, borderRadius: 3,
                  background: doneDot ? 'var(--accent)' : active ? 'var(--text-dim)' : 'var(--border)',
                  minWidth: 8,
                }}/>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)', fontWeight: 700, letterSpacing: '0.1em' }}>TRANSCURRIDO {fmtMMSS(elapsed)}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)', fontWeight: 700, letterSpacing: '0.1em' }}>RESTA {fmtMMSS(remainingTotal)}</span>
          </div>
        </div>

        {/* Config */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div className="card" style={{ padding: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="eyebrow" style={{ fontSize: 9 }}>Intervalo</div>
                <div className="digits" style={{ fontSize: 20, color: 'var(--text)', marginTop: 2 }}>{fmtMMSS(minuteSec)}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div className="press picker-btn" style={{ width: 26, height: 26 }} onClick={() => { if (!running) setMinuteSec(Math.min(300, minuteSec + 15)); }}><IconPlus size={12}/></div>
                <div className="press picker-btn" style={{ width: 26, height: 26 }} onClick={() => { if (!running) setMinuteSec(Math.max(15, minuteSec - 15)); }}><IconMinus size={12}/></div>
              </div>
            </div>
          </div>
          <div className="card" style={{ padding: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="eyebrow" style={{ fontSize: 9 }}>Rondas</div>
                <div className="digits" style={{ fontSize: 20, color: 'var(--text)', marginTop: 2 }}>{totalMinutes}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div className="press picker-btn" style={{ width: 26, height: 26 }} onClick={() => { if (!running) setTotalMinutes(Math.min(60, totalMinutes + 1)); }}><IconPlus size={12}/></div>
                <div className="press picker-btn" style={{ width: 26, height: 26 }} onClick={() => { if (!running) setTotalMinutes(Math.max(1, totalMinutes - 1)); }}><IconMinus size={12}/></div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, padding: '12px 0 12px' }}>
          <RoundBtn size={56} onClick={reset} bg="var(--bg-card)" fg="var(--text-dim)"><IconReset size={20}/></RoundBtn>
          <RoundBtn size={84} onClick={() => setRunning(r => !r)} bg="var(--accent)" fg="var(--accent-ink)" border="transparent">
            {running ? <IconPause size={30}/> : <IconPlay size={30}/>}
          </RoundBtn>
          <RoundBtn size={56} onClick={() => {
            // skip to next minute
            const next = (Math.floor(elapsed / minuteSec) + 1) * minuteSec;
            setElapsed(Math.min(total, next));
          }} bg="var(--bg-card)" fg="var(--text)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5 5v14l9-7zM16 5h2v14h-2z"/></svg>
          </RoundBtn>
        </div>
      </div>
      <TabBar active="timers" onChange={() => {}}/>
    </>
  );
}

Object.assign(window, { EmomScreen });
