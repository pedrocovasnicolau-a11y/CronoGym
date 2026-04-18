// ═══════════════════════════════════════════════════════
// SETTINGS — ajustes de la app
// ═══════════════════════════════════════════════════════

function SettingsScreen({ onTab, settings, setSettings }) {
  const update = (key, val) => setSettings(s => ({ ...s, [key]: val }));

  const Toggle = ({ value, onChange }) => (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 50, height: 28, borderRadius: 14,
        background: value ? 'var(--accent)' : 'var(--border)',
        position: 'relative', cursor: 'pointer',
        transition: 'background 200ms',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 3,
        left: value ? 25 : 3,
        width: 22, height: 22, borderRadius: '50%',
        background: value ? 'var(--accent-ink)' : 'var(--bg-card)',
        transition: 'left 200ms',
        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
      }}/>
    </div>
  );

  const Row = ({ label, sub, value, onChange }) => (
    <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 3, lineHeight: 1.4 }}>{sub}</div>}
      </div>
      <Toggle value={value} onChange={onChange}/>
    </div>
  );

  return (
    <>
      <TopBar title="Ajustes"/>
      <div className="scroll-area" style={{ padding: '8px 16px 24px' }}>

        <div className="eyebrow" style={{ marginBottom: 10 }}>Pantalla</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          <Row
            label="Pantalla siempre visible"
            sub="Evita que la pantalla se apague mientras el timer está activo"
            value={settings.alwaysOn}
            onChange={v => update('alwaysOn', v)}
          />
        </div>

        <div className="eyebrow" style={{ marginBottom: 10 }}>Alertas al finalizar</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          <Row
            label="Aviso sonoro"
            sub="Pitido al terminar cada fase o temporizador"
            value={settings.audioAlert}
            onChange={v => update('audioAlert', v)}
          />
          <Row
            label="Vibración"
            sub="El móvil vibra al terminar cada fase o temporizador"
            value={settings.vibration}
            onChange={v => update('vibration', v)}
          />
        </div>

        <div style={{
          background: 'color-mix(in oklab, var(--accent) 10%, var(--bg))',
          border: '1px solid color-mix(in oklab, var(--accent) 30%, var(--border))',
          borderRadius: 16, padding: '12px 16px',
          fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)',
          letterSpacing: '0.06em', lineHeight: 1.6,
        }}>
          La vibración requiere que el móvil tenga el sonido en silencio o vibración activada. El aviso sonoro funciona aunque el móvil esté en silencio.
        </div>
      </div>
      <TabBar active="settings" onChange={onTab}/>
    </>
  );
}

Object.assign(window, { SettingsScreen });
