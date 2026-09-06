import { useEffect, useState } from 'react';
import { HomeScreen } from './screens/Home.jsx';
import { StopwatchScreen } from './screens/Stopwatch.jsx';
import { CountdownScreen } from './screens/Countdown.jsx';
import { TabataConfigScreen, TabataRunScreen } from './screens/Tabata.jsx';
import { EmomScreen } from './screens/Emom.jsx';
import { TempoConfigScreen, TempoRunScreen } from './screens/Tempo.jsx';
import { SettingsScreen } from './screens/Settings.jsx';
import { loadConfig, lsSet } from './lib/storage.js';
import { useWakeLock } from './lib/useWakeLock.js';

const DEFAULT_TABATA = {
  prep: 10,
  work: 20,
  rest: 10,
  rounds: 8,
  sets: 1,
  setRest: 60,
  cooldown: 0,
};
const DEFAULT_TEMPO = {
  prep: 10,
  sets: 4,
  reps: 8,
  rest: 90,
  ecc: 3,
  pauseB: 1,
  con: 2,
  pauseT: 0,
};
const DEFAULT_SETTINGS = { alwaysOn: false, audioAlert: true, vibration: true };

export default function App() {
  const [screen, setScreen] = useState('home');
  const [cfg, setCfg] = useState(() => loadConfig('cg_tabata_cfg', DEFAULT_TABATA));
  const [tempoCfg, setTempoCfg] = useState(() => loadConfig('cg_tempo_cfg', DEFAULT_TEMPO));
  const [settings, setSettings] = useState(() => loadConfig('cg_settings', DEFAULT_SETTINGS));

  useEffect(() => lsSet('cg_settings', settings), [settings]);
  useEffect(() => lsSet('cg_tabata_cfg', cfg), [cfg]);
  useEffect(() => lsSet('cg_tempo_cfg', tempoCfg), [tempoCfg]);

  useWakeLock(settings.alwaysOn);

  const go = (s) => setScreen(s);
  const back = () => setScreen('home');

  const handleTab = (tab) => {
    if (tab === 'home' || tab === 'timers') setScreen('home');
    else if (tab === 'settings') setScreen('settings');
  };

  let content;
  if (screen === 'stopwatch') content = <StopwatchScreen back={back} onTab={handleTab} />;
  else if (screen === 'countdown')
    content = <CountdownScreen back={back} onTab={handleTab} settings={settings} />;
  else if (screen === 'tabata')
    content = (
      <TabataConfigScreen
        back={back}
        onStart={() => setScreen('tabata-run')}
        cfg={cfg}
        setCfg={setCfg}
        onTab={handleTab}
      />
    );
  else if (screen === 'tabata-run')
    content = (
      <TabataRunScreen
        back={() => setScreen('tabata')}
        cfg={cfg}
        onTab={handleTab}
        settings={settings}
      />
    );
  else if (screen === 'emom')
    content = <EmomScreen back={back} onTab={handleTab} settings={settings} />;
  else if (screen === 'tempo')
    content = (
      <TempoConfigScreen
        back={back}
        onStart={() => setScreen('tempo-run')}
        cfg={tempoCfg}
        setCfg={setTempoCfg}
        onTab={handleTab}
      />
    );
  else if (screen === 'tempo-run')
    content = (
      <TempoRunScreen
        back={() => setScreen('tempo')}
        cfg={tempoCfg}
        onTab={handleTab}
        settings={settings}
      />
    );
  else if (screen === 'settings')
    content = <SettingsScreen onTab={handleTab} settings={settings} setSettings={setSettings} />;
  else content = <HomeScreen go={go} onTab={handleTab} />;

  return (
    <div className="app-root">
      {content}
      {settings.alwaysOn && (
        <div
          style={{
            position: 'fixed',
            top: 'max(env(safe-area-inset-top, 0px), 8px)',
            right: 14,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 7px',
            borderRadius: 100,
            background: 'color-mix(in oklab, var(--accent) 18%, transparent)',
            border: '1px solid color-mix(in oklab, var(--accent) 40%, transparent)',
            pointerEvents: 'none',
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'var(--accent)',
              textTransform: 'uppercase',
            }}
          >
            ON
          </span>
        </div>
      )}
    </div>
  );
}
