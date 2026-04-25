// ═══════════════════════════════════════════════════════
// TABATA / HIIT — config + run
// ═══════════════════════════════════════════════════════
const { useState: useStateTB, useEffect: useEffectTB, useRef: useRefTB } = React;

function TabataConfigScreen({ back, onStart, cfg, setCfg, onTab }) {
  const [pickerTarget, setPickerTarget] = useStateTB(null);

  // prep + (work+rest)*rounds - rest (per set) * sets + setRest*(sets-1) + cooldown
  const total = cfg.prep
    + cfg.sets * ((cfg.work + cfg.rest) * cfg.rounds - cfg.rest)
    + (cfg.sets - 1) * cfg.setRest
    + cfg.cooldown;

  const stepper = (onMinus, onPlus) => (
    <div style={{ display: 'flex', gap: 4 }}>
      <div className="press picker-btn" style={{ width: 26, height: 26 }} onClick={onMinus}><IconMinus size={12}/></div>
      <div className="press picker-btn" style={{ width: 26, height: 26 }} onClick={onPlus}><IconPlus size={12}/></div>
    </div>
  );

  const compactRow = (label, valueText, onMinus, onPlus) => (
    <div className="card" style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ minWidth: 0 }}>
        <div className="eyebrow" style={{ fontSize: 9 }}>{label}</div>
        <div className="digits" style={{ fontSize: 20, color: 'var(--text)', marginTop: 2 }}>{valueText}</div>
      </div>
      {stepper(onMinus, onPlus)}
    </div>
  );

  const accentRow = (label, valueText, onMinus, onPlus, onTap) => (
    <div className={`card${onTap ? ' press' : ''}`} style={{
      padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: 'color-mix(in oklab, var(--accent) 8%, var(--bg-card))',
      border: '1px solid color-mix(in oklab, var(--accent) 25%, var(--border))',
      cursor: onTap ? 'pointer' : 'default',
    }} onClick={onTap}>
      <div style={{ minWidth: 0 }}>
        <div className="eyebrow" style={{ fontSize: 9, color: 'var(--accent)' }}>{label}</div>
        <div className="digits" style={{ fontSize: 20, color: 'var(--text)', marginTop: 2 }}>{valueText}</div>
        {onTap && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)', marginTop: 2, letterSpacing: '0.08em' }}>toca para editar</div>}
      </div>
      {stepper(onMinus, onPlus)}
    </div>
  );

  const pickerValue =
    pickerTarget === 'work'     ? cfg.work     :
    pickerTarget === 'rest'     ? cfg.rest     :
    pickerTarget === 'setRest'  ? cfg.setRest  :
    pickerTarget === 'prep'     ? cfg.prep     :
    pickerTarget === 'cooldown' ? cfg.cooldown : 0;

  const pickerLabel =
    pickerTarget === 'work'     ? 'Tiempo de trabajo'      :
    pickerTarget === 'rest'     ? 'Tiempo de descanso'     :
    pickerTarget === 'setRest'  ? 'Descanso entre sets'    :
    pickerTarget === 'prep'     ? 'Tiempo de preparación'  :
    pickerTarget === 'cooldown' ? 'Tiempo de recuperación' : '';

  const handlePickerConfirm = (v) => {
    if      (pickerTarget === 'work')     setCfg(c => ({ ...c, work:     Math.max(5,  Math.min(600, v)) }));
    else if (pickerTarget === 'rest')     setCfg(c => ({ ...c, rest:     Math.max(0,  Math.min(600, v)) }));
    else if (pickerTarget === 'setRest')  setCfg(c => ({ ...c, setRest:  Math.max(0,  Math.min(600, v)) }));
    else if (pickerTarget === 'prep')     setCfg(c => ({ ...c, prep:     Math.max(0,  Math.min(120, v)) }));
    else if (pickerTarget === 'cooldown') setCfg(c => ({ ...c, cooldown: Math.max(0,  Math.min(300, v)) }));
    setPickerTarget(null);
  };

  return (
    <>
      <TopBar title="Configurar Tabata / HIIT" onBack={back}/>

      {pickerTarget && (
        <TimeDrumPicker
          value={pickerValue}
          label={pickerLabel}
          maxMinutes={9}
          onChange={handlePickerConfirm}
          onClose={() => setPickerTarget(null)}
        />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 16px 10px', minHeight: 0, overflow: 'hidden' }}>
        {/* Overview banner */}
        <div style={{
          padding: '10px 14px', marginBottom: 10, borderRadius: 16,
          background: 'var(--accent)', color: 'var(--accent-ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--accent-ink)', opacity: 0.7, fontSize: 9 }}>Duración total</div>
            <div className="digits" style={{ fontSize: 28, marginTop: 2 }}>{fmtMMSS(total)}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 11, fontWeight: 600 }}>
            {cfg.sets} sets · {cfg.rounds} rondas
          </div>
        </div>

        {/* Work / Rest pickers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <div className="press" style={{
            background: 'color-mix(in oklab, var(--work) 15%, var(--bg))',
            border: '1px solid color-mix(in oklab, var(--work) 40%, var(--border))',
            borderRadius: 14, padding: '8px 10px',
            display: 'flex', flexDirection: 'column', gap: 4, cursor: 'pointer',
          }} onClick={() => setPickerTarget('work')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="eyebrow" style={{ color: 'var(--work)', fontSize: 9 }}>Trabajo</div>
              {stepper(
                e => { e.stopPropagation(); setCfg(c => ({ ...c, work: Math.max(5, c.work - 5) })); },
                e => { e.stopPropagation(); setCfg(c => ({ ...c, work: Math.min(600, c.work + 5) })); },
              )}
            </div>
            <div className="digits" style={{ fontSize: 24, color: 'var(--text)' }}>{fmtMMSS(cfg.work)}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--work)', letterSpacing: '0.08em' }}>toca para editar</div>
          </div>
          <div className="press" style={{
            background: 'color-mix(in oklab, var(--rest) 15%, var(--bg))',
            border: '1px solid color-mix(in oklab, var(--rest) 40%, var(--border))',
            borderRadius: 14, padding: '8px 10px',
            display: 'flex', flexDirection: 'column', gap: 4, cursor: 'pointer',
          }} onClick={() => setPickerTarget('rest')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="eyebrow" style={{ color: 'var(--rest)', fontSize: 9 }}>Descanso</div>
              {stepper(
                e => { e.stopPropagation(); setCfg(c => ({ ...c, rest: Math.max(0, c.rest - 5) })); },
                e => { e.stopPropagation(); setCfg(c => ({ ...c, rest: Math.min(600, c.rest + 5) })); },
              )}
            </div>
            <div className="digits" style={{ fontSize: 24, color: 'var(--text)' }}>{fmtMMSS(cfg.rest)}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--rest)', letterSpacing: '0.08em' }}>toca para editar</div>
          </div>
        </div>

        {/* Config rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
          {accentRow('Preparación', fmtMMSS(cfg.prep),
            e => { e.stopPropagation(); setCfg(c => ({ ...c, prep: Math.max(0, c.prep - 5) })); },
            e => { e.stopPropagation(); setCfg(c => ({ ...c, prep: Math.min(120, c.prep + 5) })); },
            () => setPickerTarget('prep'),
          )}
          {compactRow('Rondas por set', cfg.rounds,
            () => setCfg(c => ({ ...c, rounds: Math.max(1, c.rounds - 1) })),
            () => setCfg(c => ({ ...c, rounds: Math.min(30, c.rounds + 1) })))}
          {compactRow('Sets', cfg.sets,
            () => setCfg(c => ({ ...c, sets: Math.max(1, c.sets - 1) })),
            () => setCfg(c => ({ ...c, sets: Math.min(20, c.sets + 1) })))}
          <div className="press card" style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setPickerTarget('setRest')}>
            <div style={{ minWidth: 0 }}>
              <div className="eyebrow" style={{ fontSize: 9 }}>Descanso entre sets</div>
              <div className="digits" style={{ fontSize: 20, color: 'var(--text)', marginTop: 2 }}>{fmtMMSS(cfg.setRest)}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)', marginTop: 2, letterSpacing: '0.08em' }}>toca para editar</div>
            </div>
            {stepper(
              e => { e.stopPropagation(); setCfg(c => ({ ...c, setRest: Math.max(0, c.setRest - 15) })); },
              e => { e.stopPropagation(); setCfg(c => ({ ...c, setRest: Math.min(600, c.setRest + 15) })); },
            )}
          </div>
          {accentRow('Recuperación final', fmtMMSS(cfg.cooldown),
            e => { e.stopPropagation(); setCfg(c => ({ ...c, cooldown: Math.max(0, c.cooldown - 15) })); },
            e => { e.stopPropagation(); setCfg(c => ({ ...c, cooldown: Math.min(300, c.cooldown + 15) })); },
            () => setPickerTarget('cooldown'),
          )}
        </div>

        {/* Preset chips */}
        <div className="eyebrow" style={{ marginBottom: 6, fontSize: 9 }}>Presets</div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
          {[
            { n: 'Clásico', c: { prep: 10, work: 20, rest: 10, rounds: 8, sets: 1, setRest: 60, cooldown: 0 } },
            { n: 'HIIT',    c: { prep: 10, work: 40, rest: 20, rounds: 6, sets: 3, setRest: 60, cooldown: 30 } },
            { n: 'EMOM 10', c: { prep: 0,  work: 45, rest: 15, rounds: 10, sets: 1, setRest: 0, cooldown: 0 } },
            { n: 'Quemar',  c: { prep: 10, work: 30, rest: 10, rounds: 10, sets: 2, setRest: 90, cooldown: 60 } },
          ].map(p => (
            <div key={p.n} className="press" onClick={() => setCfg(p.c)} style={{
              padding: '5px 10px', borderRadius: 100,
              border: '1px solid var(--border)',
              color: 'var(--text-dim)',
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.06em', cursor: 'pointer', textTransform: 'uppercase',
            }}>{p.n}</div>
          ))}
        </div>

        <button className="btn btn-primary press" style={{ width: '100%', marginTop: 'auto', padding: '14px 20px' }} onClick={onStart}>
          <IconPlay size={16}/> Empezar
        </button>
      </div>
      <TabBar active="timers" onChange={onTab}/>
    </>
  );
}

// ─── TABATA RUN ───
function TabataRunScreen({ back, cfg, onTab, settings }) {
  const phases = useRefTB([]);
  if (phases.current.length === 0) {
    const arr = [];
    if (cfg.prep > 0) arr.push({ type: 'prep', dur: cfg.prep, round: 0, set: 1 });
    for (let s = 1; s <= cfg.sets; s++) {
      for (let r = 1; r <= cfg.rounds; r++) {
        arr.push({ type: 'work', dur: cfg.work, round: r, set: s });
        if (r < cfg.rounds && cfg.rest > 0) arr.push({ type: 'rest', dur: cfg.rest, round: r, set: s });
      }
      if (s < cfg.sets && cfg.setRest > 0) arr.push({ type: 'setRest', dur: cfg.setRest, round: 0, set: s });
    }
    if (cfg.cooldown > 0) arr.push({ type: 'cooldown', dur: cfg.cooldown, round: 0, set: cfg.sets });
    phases.current = arr;
  }
  const list = phases.current;
  const [idx, setIdx] = useStateTB(0);
  const [remaining, setRemaining] = useStateTB(list[0].dur);
  const [running, setRunning] = useStateTB(true);
  const done = idx >= list.length;

  useEffectTB(() => {
    if (!running || done) return;
    const id = setInterval(() => {
      setRemaining(r => {
        if (r <= 0.1) {
          setIdx(i => {
            const ni = i + 1;
            if (ni < list.length) {
              setRemaining(list[ni].dur);
              triggerAlert(settings);
            } else {
              triggerAlert(settings);
            }
            return ni;
          });
          return 0;
        }
        return r - 0.1;
      });
    }, 100);
    return () => clearInterval(id);
  }, [running, idx, done]);

  const cur = done ? { type: 'done', dur: 0, round: 0, set: cfg.sets } : list[idx];
  const phaseColor = {
    prep: 'accent', work: 'work', rest: 'rest', setRest: 'rest', cooldown: 'accent', done: 'accent',
  }[cur.type];
  const bgType = {
    prep: 'accent', work: 'work', rest: 'rest', setRest: 'rest', cooldown: 'accent', done: 'accent',
  }[cur.type];
  const phaseLabel = {
    prep: 'Preparados', work: 'TRABAJO', rest: 'Descanso', setRest: 'Descanso largo',
    cooldown: 'Recuperación', done: '¡COMPLETADO!',
  }[cur.type];
  const pct = cur.dur > 0 ? (1 - remaining / cur.dur) * 100 : 100;

  const totalTime = list.reduce((s, p) => s + p.dur, 0);
  const elapsedTotal = list.slice(0, idx).reduce((s, p) => s + p.dur, 0) + (cur.dur - remaining);
  const overallPct = totalTime > 0 ? elapsedTotal / totalTime * 100 : 0;

  const workRoundNum = cur.type === 'work' ? cur.round : cur.type === 'rest' ? cur.round : 0;

  const roundPct = done ? 100 : cfg.rounds > 0 ? (
    cur.type === 'rest' ? Math.min(100, cur.round / cfg.rounds * 100) :
    Math.min(100, Math.max(0, workRoundNum - 1) / cfg.rounds * 100)
  ) : 0;
  const setPct = done ? 100 : cfg.sets > 0 ? Math.min(100, (cur.set - 1) / cfg.sets * 100) : 0;

  const nextLabel = list[idx + 1]
    ? { prep: 'PREP', work: 'TRAB', rest: 'DESC', setRest: 'PAUSA', cooldown: 'COOL' }[list[idx + 1].type]
    : '—';

  return (
    <>
      <TopBar title="Tabata · En marcha" onBack={back}/>
      <div className={`phase-bg-${bgType}`} style={{
        flex: 1, display: 'flex', flexDirection: 'column', padding: '0 20px', minHeight: 0,
      }}>
        {/* Overall progress */}
        <div style={{ padding: '4px 0 10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span className="eyebrow" style={{ fontSize: 10 }}>Progreso total</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', fontWeight: 700 }}>
              {fmtMMSS(elapsedTotal)} / {fmtMMSS(totalTime)}
            </span>
          </div>
          <ProgressBar pct={overallPct} color="var(--text)"/>
        </div>

        {/* Phase badge */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{
            display: 'inline-block', padding: '6px 16px', borderRadius: 100,
            background: `var(--${phaseColor})`, color: '#0B0B0E',
            fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 800,
            letterSpacing: '0.14em', textTransform: 'uppercase',
          }}>{phaseLabel}</div>
        </div>

        {/* Big timer */}
        <div style={{ textAlign: 'center', padding: '8px 0 8px' }}>
          <div className="digits" style={{
            fontSize: 90,
            color: `var(--${phaseColor})`,
            textShadow: '0 0 40px color-mix(in oklab, currentColor 20%, transparent)',
          }}>
            {done ? '00:00' : fmtMMSS(remaining)}
          </div>
        </div>

        {/* Phase progress */}
        <div style={{ padding: '0 0 12px' }}>
          <ProgressBar pct={pct} color={`var(--${phaseColor})`}/>
        </div>

        {/* Info blocks — vertical, full-width with progress bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {/* Ronda */}
          <div className="card" style={{ padding: '10px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div className="eyebrow" style={{ fontSize: 9 }}>Ronda</div>
              <div className="digits" style={{ fontSize: 28, color: 'var(--text)' }}>
                {workRoundNum || '—'}
                <span style={{ color: 'var(--text-faint)', fontSize: 16 }}>/{cfg.rounds}</span>
              </div>
            </div>
            <ProgressBar pct={roundPct} color="var(--work)"/>
          </div>
          {/* Set */}
          <div className="card" style={{ padding: '10px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div className="eyebrow" style={{ fontSize: 9 }}>Set</div>
              <div className="digits" style={{ fontSize: 28, color: 'var(--text)' }}>
                {cur.set}
                <span style={{ color: 'var(--text-faint)', fontSize: 16 }}>/{cfg.sets}</span>
              </div>
            </div>
            <ProgressBar pct={setPct} color="var(--accent)"/>
          </div>
          {/* Siguiente */}
          <div className="card" style={{ padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="eyebrow" style={{ fontSize: 9 }}>Siguiente</div>
            <div className="digits" style={{ fontSize: 18, color: 'var(--text-dim)' }}>{nextLabel}</div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, padding: '6px 0 10px' }}>
          <RoundBtn size={56} onClick={() => {
            setIdx(0); setRemaining(list[0].dur); setRunning(false);
          }} bg="var(--bg-card)" fg="var(--text-dim)"><IconReset size={20}/></RoundBtn>
          <RoundBtn size={84} onClick={() => setRunning(r => !r)} bg="var(--accent)" fg="var(--accent-ink)" border="transparent">
            {running ? <IconPause size={30}/> : <IconPlay size={30}/>}
          </RoundBtn>
          <RoundBtn size={56} onClick={() => {
            if (idx < list.length - 1) { setIdx(idx + 1); setRemaining(list[idx + 1].dur); }
          }} bg="var(--bg-card)" fg="var(--text)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5 5v14l9-7zM16 5h2v14h-2z"/></svg>
          </RoundBtn>
        </div>
      </div>
      <TabBar active="timers" onChange={onTab}/>
    </>
  );
}

Object.assign(window, { TabataConfigScreen, TabataRunScreen });
