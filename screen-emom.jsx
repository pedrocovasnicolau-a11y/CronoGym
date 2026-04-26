// ═══════════════════════════════════════════════════════
// EMOM — Every Minute On the Minute · pantalla dedicada
// ═══════════════════════════════════════════════════════
const { useState: useStateEM, useEffect: useEffectEM, useRef: useRefEM } = React;

function EmomScreen({ back, onTab, settings }) {
  const [minuteSec, setMinuteSecRaw] = useStateEM(() => lsGet('reps_emom_interval', 60));
  const [totalMinutes, setTotalMinutesRaw] = useStateEM(() => lsGet('reps_emom_rounds', 10));

  const setMinuteSec    = (v) => { setMinuteSecRaw(v);    lsSet('reps_emom_interval', v); };
  const setTotalMinutes = (v) => { setTotalMinutesRaw(v); lsSet('reps_emom_rounds',   v); };
  const [running, setRunning] = useStateEM(false);
  const [elapsed, setElapsed] = useStateEM(0);
  const [showIntervalPicker, setShowIntervalPicker] = useStateEM(false);
  const lastMinuteRef = useRefEM(-1);

  useEffectEM(() => {
    if (!running) return;
    const id = setInterval(() => {
      setElapsed(e => {
        const total = minuteSec * totalMinutes;
        if (e >= total) {
          setRunning(false);
          triggerAlert(settings);
          return total;
        }
        // alert at each minute boundary
        const prevMin = Math.floor(e / minuteSec);
        const nextE = e + 0.1;
        const nextMin = Math.floor(nextE / minuteSec);
        if (nextMin > prevMin && nextE < total) {
          if (lastMinuteRef.current !== nextMin) {
            lastMinuteRef.current = nextMin;
            triggerAlert(settings);
          }
        }
        return nextE;
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

  const isAlert = running && remainingInMinute <= 5 && remainingInMinute > 0;
  const done = elapsed >= total;

  const reset = () => { setRunning(false); setElapsed(0); lastMinuteRef.current = -1; };

  return (
    <>
      <TopBar title="EMOM" onBack={back}/>

      {showIntervalPicker && (
        <TimeDrumPicker
          value={minuteSec}
          label="Duración del intervalo"
          maxMinutes={4}
          onChange={v => setMinuteSec(Math.max(15, Math.min(300, v || 15)))}
          onClose={() => setShowIntervalPicker(false)}
        />
      )}

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

        {/* Config — tap interval time to open drum picker */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div className={`card${!running ? ' press' : ''}`} style={{ padding: 10, cursor: !running ? 'pointer' : 'default' }}
            onClick={() => { if (!running) setShowIntervalPicker(true); }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="eyebrow" style={{ fontSize: 9 }}>Intervalo</div>
                <div className="digits" style={{ fontSize: 20, color: 'var(--text)', marginTop: 2 }}>{fmtMMSS(minuteSec)}</div>
              </div>
              {!running && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div className="press picker-btn" style={{ width: 26, height: 26 }} onClick={e => { e.stopPropagation(); if (!running) setMinuteSec(Math.min(300, minuteSec + 15)); }}><IconPlus size={12}/></div>
                  <div className="press picker-btn" style={{ width: 26, height: 26 }} onClick={e => { e.stopPropagation(); if (!running) setMinuteSec(Math.max(15, minuteSec - 15)); }}><IconMinus size={12}/></div>
                </div>
              )}
            </div>
            {!running && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)', marginTop: 4, letterSpacing: '0.08em' }}>toca para editar</div>}
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
            const next = (Math.floor(elapsed / minuteSec) + 1) * minuteSec;
            setElapsed(Math.min(total, next));
          }} bg="var(--bg-card)" fg="var(--text)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5 5v14l9-7zM16 5h2v14h-2z"/></svg>
          </RoundBtn>
        </div>
      </div>
      <TabBar active="timers" onChange={onTab}/>
    </>
  );
}

Object.assign(window, { EmomScreen });
