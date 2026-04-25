// ═══════════════════════════════════════════════════════
// TEMPO — temporizador de ritmo para entrenamiento de fuerza
// cfg: { prep, sets, reps, rest, ecc, pauseB, con, pauseT }
// ═══════════════════════════════════════════════════════
const { useState: useStateTM, useEffect: useEffectTM, useRef: useRefTM } = React;

function TempoConfigScreen({ back, onStart, cfg, setCfg, onTab }) {
  const [pickerTarget, setPickerTarget] = useStateTM(null); // 'prep' | 'rest'

  const repDur = cfg.ecc + cfg.pauseB + cfg.con + cfg.pauseT;
  const total = cfg.prep + cfg.sets * cfg.reps * repDur + Math.max(0, cfg.sets - 1) * cfg.rest;

  const phases = [
    { key: 'ecc',    label: 'Bajar', dir: '↓', color: 'var(--work)' },
    { key: 'pauseB', label: 'Pausa', dir: '—', color: 'var(--prep)' },
    { key: 'con',    label: 'Subir', dir: '↑', color: 'var(--rest)' },
    { key: 'pauseT', label: 'Pausa', dir: '—', color: 'var(--prep)' },
  ];

  return (
    <>
      <TopBar title="Tempo" onBack={back}/>

      {pickerTarget && (
        <TimeDrumPicker
          value={pickerTarget === 'prep' ? cfg.prep : cfg.rest}
          label={pickerTarget === 'prep' ? 'Preparación' : 'Descanso entre series'}
          maxMinutes={9}
          onChange={v => {
            if (pickerTarget === 'prep') setCfg(c => ({ ...c, prep: Math.max(0, Math.min(120, v)) }));
            else setCfg(c => ({ ...c, rest: Math.max(0, Math.min(600, v)) }));
            setPickerTarget(null);
          }}
          onClose={() => setPickerTarget(null)}
        />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 16px 10px', minHeight: 0, overflow: 'hidden' }}>
        {/* Overview */}
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
            {cfg.sets} series · {cfg.reps} reps<br/>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              {cfg.ecc}-{cfg.pauseB}-{cfg.con}-{cfg.pauseT}
            </span>
          </div>
        </div>

        {/* Tempo picker — 4-column grid */}
        <div className="card" style={{ padding: '10px 12px', marginBottom: 8 }}>
          <div className="eyebrow" style={{ fontSize: 9, marginBottom: 8 }}>Tempo por repetición</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
            {phases.map(ph => (
              <div key={ph.key} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, marginBottom: 2, color: ph.color, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{ph.dir}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: ph.color, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 4 }}>{ph.label}</div>
                <div className="digits" style={{ fontSize: 28, color: 'var(--text)', marginBottom: 6 }}>{cfg[ph.key]}</div>
                <div style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
                  <div className="press picker-btn" style={{ width: 26, height: 26 }}
                    onClick={() => setCfg(c => ({ ...c, [ph.key]: Math.max(0, c[ph.key] - 1) }))}>
                    <IconMinus size={11}/>
                  </div>
                  <div className="press picker-btn" style={{ width: 26, height: 26 }}
                    onClick={() => setCfg(c => ({ ...c, [ph.key]: Math.min(10, c[ph.key] + 1) }))}>
                    <IconPlus size={11}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-faint)', letterSpacing: '0.06em' }}>
            {repDur > 0 ? `${repDur}s por rep · ${fmtMMSS(repDur * cfg.reps)} por serie` : 'configura el tempo arriba'}
          </div>
        </div>

        {/* Series, Reps */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6 }}>
          <div className="card" style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="eyebrow" style={{ fontSize: 9 }}>Series</div>
              <div className="digits" style={{ fontSize: 22, color: 'var(--text)', marginTop: 2 }}>{cfg.sets}</div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <div className="press picker-btn" style={{ width: 26, height: 26 }} onClick={() => setCfg(c => ({ ...c, sets: Math.max(1, c.sets - 1) }))}><IconMinus size={12}/></div>
              <div className="press picker-btn" style={{ width: 26, height: 26 }} onClick={() => setCfg(c => ({ ...c, sets: Math.min(20, c.sets + 1) }))}><IconPlus size={12}/></div>
            </div>
          </div>
          <div className="card" style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="eyebrow" style={{ fontSize: 9 }}>Reps/serie</div>
              <div className="digits" style={{ fontSize: 22, color: 'var(--text)', marginTop: 2 }}>{cfg.reps}</div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <div className="press picker-btn" style={{ width: 26, height: 26 }} onClick={() => setCfg(c => ({ ...c, reps: Math.max(1, c.reps - 1) }))}><IconMinus size={12}/></div>
              <div className="press picker-btn" style={{ width: 26, height: 26 }} onClick={() => setCfg(c => ({ ...c, reps: Math.min(30, c.reps + 1) }))}><IconPlus size={12}/></div>
            </div>
          </div>
        </div>

        {/* Prep */}
        <div className="press card" style={{
          padding: '8px 12px', marginBottom: 6,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
          background: 'color-mix(in oklab, var(--accent) 8%, var(--bg-card))',
          border: '1px solid color-mix(in oklab, var(--accent) 25%, var(--border))',
        }} onClick={() => setPickerTarget('prep')}>
          <div>
            <div className="eyebrow" style={{ fontSize: 9, color: 'var(--accent)' }}>Preparación</div>
            <div className="digits" style={{ fontSize: 20, color: 'var(--text)', marginTop: 2 }}>{fmtMMSS(cfg.prep)}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)', marginTop: 2, letterSpacing: '0.08em' }}>toca para editar</div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <div className="press picker-btn" style={{ width: 26, height: 26 }} onClick={e => { e.stopPropagation(); setCfg(c => ({ ...c, prep: Math.max(0, c.prep - 5) })); }}><IconMinus size={12}/></div>
            <div className="press picker-btn" style={{ width: 26, height: 26 }} onClick={e => { e.stopPropagation(); setCfg(c => ({ ...c, prep: Math.min(120, c.prep + 5) })); }}><IconPlus size={12}/></div>
          </div>
        </div>

        {/* Rest */}
        <div className="press card" style={{
          padding: '8px 12px', marginBottom: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
        }} onClick={() => setPickerTarget('rest')}>
          <div>
            <div className="eyebrow" style={{ fontSize: 9 }}>Descanso entre series</div>
            <div className="digits" style={{ fontSize: 20, color: 'var(--text)', marginTop: 2 }}>{fmtMMSS(cfg.rest)}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)', marginTop: 2, letterSpacing: '0.08em' }}>toca para editar</div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <div className="press picker-btn" style={{ width: 26, height: 26 }} onClick={e => { e.stopPropagation(); setCfg(c => ({ ...c, rest: Math.max(0, c.rest - 15) })); }}><IconMinus size={12}/></div>
            <div className="press picker-btn" style={{ width: 26, height: 26 }} onClick={e => { e.stopPropagation(); setCfg(c => ({ ...c, rest: Math.min(600, c.rest + 15) })); }}><IconPlus size={12}/></div>
          </div>
        </div>

        <button className="btn btn-primary press" style={{ width: '100%', marginTop: 'auto', padding: '14px 20px' }} onClick={onStart}>
          <IconPlay size={16}/> Empezar
        </button>
      </div>
      <TabBar active="timers" onChange={onTab}/>
    </>
  );
}

// ─── TEMPO RUN ───
function TempoRunScreen({ back, cfg, onTab, settings }) {
  const phases = useRefTM([]);

  if (phases.current.length === 0) {
    const arr = [];
    if (cfg.prep > 0) arr.push({ type: 'prep', dur: cfg.prep, set: 1, rep: 1 });
    for (let s = 1; s <= cfg.sets; s++) {
      for (let r = 1; r <= cfg.reps; r++) {
        if (cfg.ecc    > 0) arr.push({ type: 'ecc',    dur: cfg.ecc,    set: s, rep: r });
        if (cfg.pauseB > 0) arr.push({ type: 'pauseB', dur: cfg.pauseB, set: s, rep: r });
        if (cfg.con    > 0) arr.push({ type: 'con',    dur: cfg.con,    set: s, rep: r });
        if (cfg.pauseT > 0) arr.push({ type: 'pauseT', dur: cfg.pauseT, set: s, rep: r });
      }
      if (s < cfg.sets && cfg.rest > 0) arr.push({ type: 'rest', dur: cfg.rest, set: s, rep: cfg.reps });
    }
    phases.current = arr;
  }

  const list = phases.current;
  const [idx, setIdx] = useStateTM(0);
  const [remaining, setRemaining] = useStateTM(list[0]?.dur || 0);
  const [running, setRunning] = useStateTM(true);
  const done = idx >= list.length;

  useEffectTM(() => {
    if (!running || done) return;
    const id = setInterval(() => {
      setRemaining(r => {
        if (r <= 0.1) {
          setIdx(i => {
            const ni = i + 1;
            if (ni < list.length) {
              setRemaining(list[ni].dur);
              const t = list[ni].type;
              if (t === 'ecc' && (i < 0 || list[i].rep !== list[ni].rep || list[i].set !== list[ni].set)) {
                triggerAlert(settings);
              } else if (t === 'rest') {
                triggerAlert(settings);
              }
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

  const cur = done ? null : list[idx];

  const phaseInfo = {
    prep:   { label: 'Prepárate', dir: null,  color: 'accent', bgType: 'accent' },
    ecc:    { label: 'BAJA',      dir: '↓',   color: 'work',   bgType: 'work'   },
    pauseB: { label: 'PAUSA ↓',  dir: null,   color: 'prep',   bgType: 'prep'   },
    con:    { label: 'SUBE',      dir: '↑',   color: 'rest',   bgType: 'rest'   },
    pauseT: { label: 'PAUSA ↑',  dir: null,   color: 'prep',   bgType: 'prep'   },
    rest:   { label: 'Descanso',  dir: null,  color: 'accent', bgType: 'accent' },
  };

  const info = done
    ? { label: '¡COMPLETADO!', dir: null, color: 'accent', bgType: 'accent' }
    : phaseInfo[cur.type];

  const pct = cur && cur.dur > 0 ? (1 - remaining / cur.dur) * 100 : 100;

  const totalTime = list.reduce((s, p) => s + p.dur, 0);
  const elapsedTotal = list.slice(0, idx).reduce((s, p) => s + p.dur, 0) + (cur ? cur.dur - remaining : 0);
  const overallPct = totalTime > 0 ? elapsedTotal / totalTime * 100 : 0;

  const curSet = cur?.set ?? cfg.sets;
  const curRep = cur?.rep ?? cfg.reps;
  const repPct  = done ? 100 : cfg.reps > 0  ? (curRep - 1)  / cfg.reps  * 100 : 0;
  const setPct  = done ? 100 : cfg.sets > 0  ? (curSet - 1)  / cfg.sets  * 100 : 0;

  return (
    <>
      <TopBar title="Tempo · En marcha" onBack={back}/>
      <div className={`phase-bg-${info.bgType}`} style={{
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

        {/* Phase badge + direction */}
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <div style={{
            display: 'inline-block', padding: '6px 18px', borderRadius: 100,
            background: `var(--${info.color})`, color: '#0B0B0E',
            fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 800,
            letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>{info.label}</div>
        </div>

        {/* Direction indicator */}
        {info.dir && (
          <div style={{
            textAlign: 'center', fontSize: 36, lineHeight: 1, marginBottom: 2,
            color: `var(--${info.color})`, fontWeight: 800,
          }}>{info.dir}</div>
        )}

        {/* Big timer */}
        <div style={{ textAlign: 'center', padding: '4px 0 8px' }}>
          <div className="digits" style={{
            fontSize: 88,
            color: `var(--${info.color})`,
            textShadow: '0 0 40px color-mix(in oklab, currentColor 20%, transparent)',
          }}>
            {done ? '✓' : fmtMMSS(remaining)}
          </div>
        </div>

        {/* Phase progress */}
        <div style={{ padding: '0 0 12px' }}>
          <ProgressBar pct={pct} color={`var(--${info.color})`}/>
        </div>

        {/* Info blocks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {/* Rep */}
          <div className="card" style={{ padding: '10px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div className="eyebrow" style={{ fontSize: 9 }}>Repetición</div>
              <div className="digits" style={{ fontSize: 28, color: 'var(--text)' }}>
                {curRep}<span style={{ color: 'var(--text-faint)', fontSize: 16 }}>/{cfg.reps}</span>
              </div>
            </div>
            <ProgressBar pct={repPct} color="var(--work)"/>
          </div>
          {/* Set */}
          <div className="card" style={{ padding: '10px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div className="eyebrow" style={{ fontSize: 9 }}>Serie</div>
              <div className="digits" style={{ fontSize: 28, color: 'var(--text)' }}>
                {curSet}<span style={{ color: 'var(--text-faint)', fontSize: 16 }}>/{cfg.sets}</span>
              </div>
            </div>
            <ProgressBar pct={setPct} color="var(--accent)"/>
          </div>
        </div>

        {/* Controls */}
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, padding: '6px 0 10px' }}>
          <RoundBtn size={56} onClick={() => {
            setIdx(0); setRemaining(list[0]?.dur || 0); setRunning(false);
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

Object.assign(window, { TempoConfigScreen, TempoRunScreen });
