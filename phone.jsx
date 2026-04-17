// REPS custom phone frame — minimal Android shell, theme-aware
const { useState, useEffect, useRef, useCallback } = React;

const FRAME_W = 340;
const FRAME_H = 720;

function Phone({ children, theme = 'dark', label }) {
  const border = theme === 'dark' ? '#2a2a33' : '#d4d0c4';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {label && <div className="frame-label">{label}</div>}
      <div style={{
        width: FRAME_W,
        height: FRAME_H,
        borderRadius: 44,
        padding: 8,
        background: border,
        boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03) inset',
      }}>
        <div className={`app-root theme-${theme}`} style={{
          width: '100%',
          height: '100%',
          borderRadius: 36,
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* status bar */}
          <StatusBar theme={theme} />
          {/* camera punch hole */}
          <div style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 10, height: 10, borderRadius: '50%',
            background: '#000',
            zIndex: 10,
          }}/>
          {/* content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
            {children}
          </div>
          {/* nav pill */}
          <div style={{
            height: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <div style={{
              width: 100, height: 3, borderRadius: 100,
              background: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
            }}/>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBar({ theme }) {
  const c = theme === 'dark' ? '#F5F5F7' : '#0B0B0E';
  return (
    <div style={{
      height: 28,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 18px',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 12,
      fontWeight: 700,
      color: c,
      flexShrink: 0,
    }}>
      <span>9:41</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="14" height="10" viewBox="0 0 14 10" fill={c}><path d="M7 9.5L.3 2.8a9.4 9.4 0 0 1 13.4 0L7 9.5z"/></svg>
        <svg width="14" height="10" viewBox="0 0 14 10" fill={c}><path d="M13 9V1L1 9h12z"/></svg>
        <svg width="20" height="10" viewBox="0 0 20 10" fill="none" stroke={c} strokeWidth="1"><rect x="1" y="1.5" width="16" height="7" rx="1.5"/><rect x="17.5" y="4" width="1.5" height="2" fill={c}/><rect x="2.5" y="3" width="12" height="4" fill={c}/></svg>
      </div>
    </div>
  );
}

Object.assign(window, { Phone, StatusBar, FRAME_W, FRAME_H });
