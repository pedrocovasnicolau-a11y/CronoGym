# CronoGym

App web de temporizadores de entreno (Tabata/HIIT, EMOM, Tempo, cuenta atrás, cronómetro),
pensada para móvil y funcional como **PWA instalable y offline**.

## Stack

- **Vite 7** + **React 18** (módulos ES, JSX precompilado — sin Babel en el navegador).
- **vite-plugin-pwa** (Workbox, `registerType: autoUpdate`) para service worker + manifest + precache.
- Fuentes self-hosted vía `@fontsource` (importadas en `src/main.jsx`) — funcionan sin red.
- ESLint 9 (flat config, `react-hooks`) + Prettier + Vitest (jsdom).
- Sin backend. Todo el estado vive en `localStorage` con prefijo `cg_`.

## Scripts

| comando | qué hace |
| --- | --- |
| `npm run dev` | servidor de desarrollo (Vite) |
| `npm run build` | build de producción a `dist/` (genera también el service worker) |
| `npm run preview` | sirve `dist/` para probar la build / la PWA |
| `npm run lint` | ESLint sobre todo el repo |
| `npm run format` | Prettier `--write` |
| `npm test` | Vitest (una pasada) · `npm run test:watch` para modo watch |
| `npm run gen-icons` | regenera los iconos PWA desde `assets/icon.svg` (requiere `sharp`) |

## Estructura

```
index.html            entry de Vite
src/
  main.jsx            createRoot + imports de fuentes + registro del SW
  App.jsx             router por estado (useState 'screen'); carga cfg de localStorage
  styles.css          design tokens en :root (tema claro único) + clases utilitarias
  lib/
    usePhaseTimer.js  ⭐ temporizador de fases por timestamp (Tabata/EMOM/Tempo/cuenta atrás)
    useStopwatch.js   cronómetro ascendente con laps (performance.now())
    useWakeLock.js    mantiene la pantalla encendida (setting "alwaysOn")
    time.js           fmtMMSS, fmtHMS
    audio.js          playBeep / triggerAlert (WebAudio + navigator.vibrate)
    storage.js        lsGet / lsSet / loadConfig (fusiona con defaults)
  components/
    icons.jsx         iconos SVG (export por nombre)
    ui.jsx            ProgressBar, RoundBtn, TopBar, TabBar, TimeDrumPicker, NumberPicker
  screens/            Home, Stopwatch, Countdown, Tabata, Emom, Tempo, Settings
test/                 Vitest (test principal: usePhaseTimer)
assets/icon.svg       fuente de los iconos PWA
public/               iconos generados + favicon (servidos tal cual)
```

Convención: un fichero por pantalla; los componentes se importan/exportan por nombre
(no hay globales en `window`). Las pantallas de config y de ejecución de Tabata/Tempo
conviven en el mismo fichero (`TabataConfigScreen` + `TabataRunScreen`).

## usePhaseTimer (lo importante)

Es el corazón de la app. En vez de un contador que se decrementa con `setInterval`
(que el navegador estrangula con la pantalla bloqueada o la app en segundo plano),
guarda el **timestamp absoluto en que termina la fase actual** y calcula el restante
contra `Date.now()`. El `setInterval(100ms)` sólo dispara re-render. Al volver de
segundo plano (`visibilitychange`) recalcula cuántas fases han pasado de verdad y
hace fast-forward disparando las alertas pendientes.

```js
const { index, remaining, running, done, phase, totalDuration, elapsedTotal,
        toggle, reset, skip, prev } = usePhaseTimer(phases, {
  onPhaseEnter: (i, phase) => triggerAlert(settings, 'work'),
  onComplete:   () => triggerAlert(settings, 'end'),
  autostart: true,
});
```

- `phases`: `[{ dur: <segundos>, ...metadatos }]`. Construir con `useMemo` a partir de `cfg`.
- Timers de configuración en la misma pantalla (cuenta atrás, EMOM): pasar `autostart: false`
  y llamar a `reset()` en un `useEffect` cuando cambie el objetivo/intervalo.
- `toggle()` reinicia desde el principio si ya estaba `done`.
- El botón *skip* dispara `onPhaseEnter` de la nueva fase (alerta incluida).

## Claves de localStorage

`cg_settings`, `cg_tabata_cfg`, `cg_tempo_cfg`, `cg_countdown_target`,
`cg_emom_interval`, `cg_emom_rounds`. Al añadir un campo a un objeto de config, usar
`loadConfig(key, defaults)` para que las versiones antiguas no den `undefined`.

## Tema

**Sólo tema claro** (fondo beige/gris). Los tokens están en `:root` de `src/styles.css`.
No hay tema oscuro ni conmutador — decisión de producto, no reintroducir.

## Probar la PWA

`npm run build && npm run preview`, abrir en el móvil (misma red o túnel), instalar en
pantalla de inicio, activar modo avión y comprobar que sigue cargando. Lighthouse →
categoría PWA para validar "installable" + "works offline".
