// Piezas de UI compartidas — barras, controles, pickers
import { useEffect, useRef, useState } from 'react';
import { IconBack, IconHome, IconList, IconMinus, IconPlus, IconSettings } from './icons.jsx';

// ── Barra de progreso horizontal
export function ProgressBar({ pct, color }) {
  return (
    <div className="bar-track" style={{ height: 10 }}>
      <div
        className="bar-fill"
        style={{
          width: `${Math.min(100, Math.max(0, pct))}%`,
          background: color || 'var(--accent)',
        }}
      />
    </div>
  );
}

// ── Botón circular
export function RoundBtn({
  size = 64,
  children,
  onClick,
  bg = 'var(--bg-card)',
  fg = 'var(--text)',
  border = 'var(--border)',
}) {
  return (
    <button
      className="press"
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        color: fg,
        border: `1px solid ${border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

// ── Barra superior dentro del teléfono
export function TopBar({ title, onBack, right }) {
  return (
    <div
      style={{
        height: 52,
        padding: '0 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
      }}
    >
      {onBack ? (
        <div
          className="press"
          onClick={onBack}
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            cursor: 'pointer',
          }}
        >
          <IconBack size={18} />
        </div>
      ) : (
        <div style={{ width: 36 }} />
      )}
      <div
        style={{
          flex: 1,
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--text-dim)',
        }}
      >
        {title}
      </div>
      <div style={{ width: 36, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
    </div>
  );
}

// ── Barra de pestañas inferior
export function TabBar({ active, onChange }) {
  const items = [
    { id: 'home', label: 'Inicio', icon: IconHome },
    { id: 'timers', label: 'Timers', icon: IconList },
    { id: 'settings', label: 'Ajustes', icon: IconSettings },
  ];
  return (
    <div className="tabbar" style={{ flexShrink: 0 }}>
      {items.map((it) => {
        const I = it.icon;
        const on = active === it.id;
        return (
          <div
            key={it.id}
            className={`tab ${on ? 'active' : ''} press`}
            onClick={() => onChange && onChange(it.id)}
          >
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

// ── Rueda de un dígito para el picker de tiempo
function DrumWheel({ values, selected, onSelect }) {
  const ITEM_H = 48;
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const idx = values.indexOf(selected);
    if (idx >= 0) ref.current.scrollTop = idx * ITEM_H;
    // Solo posiciona en el montaje
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div style={{ height: ITEM_H * 2, flexShrink: 0 }} />
      {values.map((v) => (
        <div
          key={v}
          style={{
            height: ITEM_H,
            scrollSnapAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: v === selected ? 'var(--text)' : 'var(--text-faint)',
            transition: 'color 80ms',
            flexShrink: 0,
          }}
        >
          {String(v).padStart(2, '0')}
        </div>
      ))}
      <div style={{ height: ITEM_H * 2, flexShrink: 0 }} />
    </div>
  );
}

// ── Picker de tiempo (MM:SS) — hoja inferior con ruedas
export function TimeDrumPicker({ value, onChange, onClose, label, maxMinutes = 59 }) {
  const [mins, setMins] = useState(Math.floor(value / 60));
  const [secs, setSecs] = useState(value % 60);

  const minuteValues = Array.from({ length: maxMinutes + 1 }, (_, i) => i);
  const secondValues = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-end',
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
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px 4px',
          }}
        >
          {label ? <div className="eyebrow">{label}</div> : <div />}
          <div
            className="press"
            onClick={onClose}
            style={{
              color: 'var(--text-dim)',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
            }}
          >
            Cancelar
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 220,
              height: 48,
              borderTop: '2px solid var(--accent)',
              borderBottom: '2px solid var(--accent)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
          <DrumWheel values={minuteValues} selected={mins} onSelect={setMins} />
          <div
            className="digits"
            style={{ fontSize: 34, color: 'var(--text-dim)', padding: '0 2px', lineHeight: 1 }}
          >
            :
          </div>
          <DrumWheel values={secondValues} selected={secs} onSelect={setSecs} />
        </div>

        <div style={{ padding: '10px 20px' }}>
          <button
            className="btn btn-primary press"
            style={{ width: '100%', fontSize: 16 }}
            onClick={() => {
              onChange(mins * 60 + secs);
              onClose();
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Selector numérico (±)
export function NumberPicker({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max = 999,
  suffix = '',
}) {
  return (
    <div className="picker-col">
      <div className="picker-btn press" onClick={() => onChange(Math.min(max, value + step))}>
        <IconPlus size={16} />
      </div>
      <div className="picker-val">
        {value}
        {suffix}
      </div>
      <div className="picker-lbl">{label}</div>
      <div className="picker-btn press" onClick={() => onChange(Math.max(min, value - step))}>
        <IconMinus size={16} />
      </div>
    </div>
  );
}
