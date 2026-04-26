// ═══════════════════════════════════════════════════════
// COUNTDOWN (cuenta atrás) — presets + drum picker
// ═══════════════════════════════════════════════════════
const { useState: useStateCD, useEffect: useEffectCD, useRef: useRefCD } = React;

function CountdownScreen({ back, onTab, settings, initial = 90 }) {
  const [target, setTargetRaw] = useStateCD(() => lsGet('reps_countdown_target', initial));
  const [remaining, setRemaining] = useStateCD(() => lsGet('reps_countdown_target', initial));
  const [running, setRunning] = useStateCD(false);
  const [showPicker, setShowPicker] = useStateCD(false);
  const alertedRef = useRefCD(false);

  const setTarget = (v) => { setTargetRaw(v); lsSet('reps_countdown_target', v); };

  const presets = [30, 60, 90, 120, 180, 300];

  useEffectCD(() => { setRemaining(target); alertedRef.current = false; }, [target]);

  useEffectCD(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining(r => {
        if (r <= 0.1) {
          clearInterval(id);
          setRunning(false);
          if (!alertedRef.current) {
            alertedRef.current = true;
            triggerAlert(settings);
          }
          return 0;
        }
        return r - 0.1;
      });
    }, 100);
    return () => clearInterval(id);
  }, [running]);

  const toggle = () => {
    if (running) { setRunning(false); return; }
    if (remaining <= 0) { setRemaining(target); alertedRef.current = false; }
    setRunning(true);
  };
  const reset = () => { setRunning(false); setRemaining(target); alertedRef.current = false; };

  const pct = target > 0 ? (1 - remaining / target) * 100 : 0;
  const isFinal5 = running && remaining <= 5 && remaining > 0;

  return (
    <>
      <TopBar title="Cuenta atrás" onBack={back}/>

      {showPicker && (
        <TimeDrumPicker
          value={target}
          label="Duración"
          maxMinutes={59}
          onChange={v => setTarget(Math.max(5, Math.min(3600, v)))}
          onClose={() => setShowPicker(false)}
        />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 20px', minHeight: 0, justifyContent: 'space-between' }}>
        {/* Big time — tap to edit when stopped */}
        <div style={{ textAlign: 'center', padding: '8px 0 0' }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Descanso</div>
          <div
            className={!running ? 'press' : ''}
            onClick={() => { if (!running) setShowPicker(true); }}
            style={{ cursor: !running ? 'pointer' : 'default' }}
          >
            <div className="digits" style={{
              fontSize: 92,
              color: isFinal5 ? 'var(--work)' : remaining <= 0 ? 'var(--rest)' : 'var(--text)',
              transition: 'color 200ms',
            }}>
              {fmtMMSS(remaining)}
            </div>
          </div>
          <div style={{
            marginTop: 6,
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            color: 'var(--text-dim)', letterSpacing: '0.1em',
          }}>
            {remaining <= 0
              ? '¡HORA DE LA SIGUIENTE SERIE!'
              : running
                ? `de ${fmtMMSS(target)}`
                : 'toca el tiempo para editar'}
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
          <RoundBtn size={56} onClick={() => { setRunning(false); setRemaining(target); alertedRef.current = false; }} bg="var(--bg-card)" fg="var(--text)"><IconStop size={18}/></RoundBtn>
        </div>
      </div>
      <TabBar active="timers" onChange={onTab}/>
    </>
  );
}

Object.assign(window, { CountdownScreen });
