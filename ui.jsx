// Shared UI pieces — timers, bars, controls
const { useState: useStateS, useEffect: useEffectS, useRef: useRefS } = React;

// ── Hook: interval with accurate wall-clock ticking
function useTicker(running, onTick, ms = 100) {
  const cb = useRefS(onTick);
  cb.current = onTick;
  useEffectS(() => {
    if (!running) return;
    const id = setInterval(() => cb.current(), ms);
    return () => clearInterval(id);
  }, [running, ms]);
}

// ── Format helpers
function fmtMMSS(totalSec) {
  const s = Math.max(0, Math.ceil(totalSec));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}
function fmtHMS(totalSec) {
  const s = Math.max(0, totalSec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const cs = Math.floor((s * 100) % 100);
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}.${String(cs).padStart(2,'0')}`;
}

// ── Horizontal progress bar (theme-aware)
function ProgressBar({ pct, color }) {
  return (
    <div className="bar-track" style={{ height: 10 }}>
      <div className="bar-fill" style={{
        width: `${Math.min(100, Math.max(0, pct))}%`,
        background: color || 'var(--accent)',
      }}/>
    </div>
  );
}

// ── Circular pill control
function RoundBtn({ size = 64, children, onClick, bg = 'var(--bg-card)', fg = 'var(--text)', border = 'var(--border)' }) {
  return (
    <button className="press" onClick={onClick} style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color: fg, border: `1px solid ${border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
    }}>{children}</button>
  );
}

// ── Top bar inside phone (not the status bar)
function TopBar({ title, onBack, right }) {
  return (
    <div style={{
      height: 52, padding: '0 14px',
      display: 'flex', alignItems: 'center', gap: 8,
      flexShrink: 0,
    }}>
      {onBack ? (
        <div className="press" onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          color: 'var(--text)', cursor: 'pointer',
        }}><IconBack size={18}/></div>
      ) : <div style={{ width: 36 }}/>}
      <div style={{
        flex: 1, textAlign: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'var(--text-dim)',
      }}>{title}</div>
      <div style={{ width: 36, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
    </div>
  );
}

// ── Tab bar
function TabBar({ active, onChange }) {
  const items = [
    { id: 'home', label: 'Inicio', icon: IconHome },
    { id: 'timers', label: 'Timers', icon: IconList },
    { id: 'stats', label: 'Stats', icon: IconFlag },
    { id: 'settings', label: 'Ajustes', icon: IconSettings },
  ];
  return (
    <div className="tabbar" style={{ flexShrink: 0 }}>
      {items.map(it => {
        const I = it.icon;
        const on = active === it.id;
        return (
          <div key={it.id} className={`tab ${on ? 'active' : ''} press`} onClick={() => onChange && onChange(it.id)}>
            <div className="tab-icon">
              <I size={16} stroke={on ? 'var(--accent-ink)' : 'var(--text-faint)'} />
            </div>
            <span>{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Number picker (±)
function NumberPicker({ label, value, onChange, step = 1, min = 0, max = 999, suffix = '' }) {
  return (
    <div className="picker-col">
      <div className="picker-btn press" onClick={() => onChange(Math.min(max, value + step))}><IconPlus size={16}/></div>
      <div className="picker-val">{value}{suffix}</div>
      <div className="picker-lbl">{label}</div>
      <div className="picker-btn press" onClick={() => onChange(Math.max(min, value - step))}><IconMinus size={16}/></div>
    </div>
  );
}

// ── Time picker (MM:SS)
function TimePicker({ label, seconds, onChange, min = 0, max = 3600 }) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const bump = (delta) => onChange(Math.max(min, Math.min(max, seconds + delta)));
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 10,
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 16, padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="eyebrow">{label}</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <div className="picker-btn press" style={{ width: 28, height: 28 }} onClick={() => bump(-5)}><IconMinus size={14}/></div>
          <div className="picker-btn press" style={{ width: 28, height: 28 }} onClick={() => bump(5)}><IconPlus size={14}/></div>
        </div>
      </div>
      <div className="digits" style={{ fontSize: 44, color: 'var(--text)' }}>
        {String(m).padStart(2,'0')}<span style={{ opacity: 0.3 }}>:</span>{String(s).padStart(2,'0')}
      </div>
    </div>
  );
}

Object.assign(window, {
  useTicker, fmtMMSS, fmtHMS, ProgressBar, RoundBtn, TopBar, TabBar, NumberPicker, TimePicker,
});
