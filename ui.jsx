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

// ── Audio + vibration alerts
// Single shared AudioContext — avoids iOS restriction of creating new ones outside gestures
let _audioCtx = null;
function _getCtx() {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _audioCtx;
}

// Unlock AudioContext on first user touch/click (iOS requires this)
;(function() {
  const unlock = async () => {
    try {
      const ctx = _getCtx();
      if (ctx.state === 'suspended') await ctx.resume();
      // Play a silent buffer to fully unlock iOS audio
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
    } catch(e) {}
  };
  document.addEventListener('touchstart', unlock, { once: true, passive: true });
  document.addEventListener('click',      unlock, { once: true });
})();

// type: 'work' | 'rest' | 'end' | 'alert'
async function playBeep(type = 'alert') {
  try {
    const ctx = _getCtx();
    if (ctx.state === 'suspended') await ctx.resume();

    const tone = (freq, startT, dur, vol = 0.4) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + dur);
      osc.start(startT);
      osc.stop(startT + dur);
    };

    const t = ctx.currentTime;
    if (type === 'work') {
      // Dos pitidos cortos y agudos — inicio de serie de trabajo
      tone(880, t,        0.09);
      tone(880, t + 0.14, 0.09);
    } else if (type === 'rest') {
      // Un pitido largo y grave — inicio de descanso
      tone(440, t, 0.35, 0.35);
    } else if (type === 'end') {
      // Tres tonos ascendentes — fin de entrenamiento
      tone(523, t,        0.18);
      tone(659, t + 0.20, 0.18);
      tone(784, t + 0.40, 0.28);
    } else {
      // Pitido simple de aviso
      tone(660, t, 0.22);
    }
  } catch(e) {}
}

function triggerAlert(settings, type = 'alert') {
  if (settings?.audioAlert) playBeep(type);
  if (settings?.vibration) {
    const patterns = {
      work:  [80, 40, 80],
      rest:  [200],
      end:   [150, 80, 150, 80, 300],
      alert: [200, 100, 200],
    };
    try { navigator.vibrate?.(patterns[type] ?? patterns.alert); } catch(e) {}
  }
}

// ── localStorage helpers (available globally via window)
function lsGet(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
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

// ── Tab bar (stats tab removed)
function TabBar({ active, onChange }) {
  const items = [
    { id: 'home',     label: 'Inicio',  icon: IconHome },
    { id: 'timers',   label: 'Timers',  icon: IconList },
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

// ── Drum wheel — single column for time picker
function DrumWheel({ values, selected, onSelect }) {
  const ITEM_H = 48;
  const ref = useRefS(null);

  useEffectS(() => {
    if (!ref.current) return;
    const idx = values.indexOf(selected);
    if (idx >= 0) ref.current.scrollTop = idx * ITEM_H;
  }, []); // scroll to initial position on mount only

  const onScroll = () => {
    if (!ref.current) return;
    const idx = Math.round(ref.current.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(values.length - 1, idx));
    if (values[clamped] !== selected) onSelect(values[clamped]);
  };

  return (
    <div
      ref={ref}
      onScroll={onScroll}
      style={{
        height: ITEM_H * 5,
        width: 90,
        overflowY: 'scroll',
        scrollSnapType: 'y mandatory',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <div style={{ height: ITEM_H * 2, flexShrink: 0 }}/>
      {values.map(v => (
        <div key={v} style={{
          height: ITEM_H,
          scrollSnapAlign: 'center',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 34, fontWeight: 700,
          letterSpacing: '-0.02em',
          color: v === selected ? 'var(--text)' : 'var(--text-faint)',
          transition: 'color 80ms',
          flexShrink: 0,
        }}>
          {String(v).padStart(2, '0')}
        </div>
      ))}
      <div style={{ height: ITEM_H * 2, flexShrink: 0 }}/>
    </div>
  );
}

// ── Time drum picker — bottom sheet with MM:SS wheels
function TimeDrumPicker({ value, onChange, onClose, label, maxMinutes = 59 }) {
  const [mins, setMins] = useStateS(Math.floor(value / 60));
  const [secs, setSecs] = useStateS(value % 60);

  const minuteValues = Array.from({ length: maxMinutes + 1 }, (_, i) => i);
  const secondValues = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.55)', zIndex: 200,
        display: 'flex', alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          background: 'var(--bg-elev)',
          border: '1px solid var(--border)',
          borderRadius: '24px 24px 0 0',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 4px' }}>
          {label
            ? <div className="eyebrow">{label}</div>
            : <div/>
          }
          <div className="press" onClick={onClose} style={{ color: 'var(--text-dim)', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>Cancelar</div>
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Selection highlight lines */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 220, height: 48,
            borderTop: '2px solid var(--accent)',
            borderBottom: '2px solid var(--accent)',
            pointerEvents: 'none', zIndex: 1,
          }}/>
          <DrumWheel values={minuteValues} selected={mins} onSelect={setMins}/>
          <div className="digits" style={{ fontSize: 34, color: 'var(--text-dim)', padding: '0 2px', lineHeight: 1 }}>:</div>
          <DrumWheel values={secondValues} selected={secs} onSelect={setSecs}/>
        </div>

        <div style={{ padding: '10px 20px' }}>
          <button
            className="btn btn-primary press"
            style={{ width: '100%', fontSize: 16 }}
            onClick={() => { onChange(mins * 60 + secs); onClose(); }}
          >
            Confirmar
          </button>
        </div>
      </div>
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

// ── Time picker (MM:SS) — legacy inline picker kept for back-compat
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
  useTicker, fmtMMSS, fmtHMS,
  playBeep, triggerAlert,
  lsGet, lsSet,
  ProgressBar, RoundBtn, TopBar, TabBar,
  DrumWheel, TimeDrumPicker,
  NumberPicker, TimePicker,
});
