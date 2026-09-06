// Prueba de humo emulando Android (Chrome + Pixel 5) contra `npm run preview`.
//   node scripts/e2e-android.mjs http://localhost:4173
import { chromium, devices } from 'playwright';

const BASE = process.argv[2] || 'http://localhost:4173';
const pixel5 = devices['Pixel 5'];
const problems = [];
const log = (ok, msg) => {
  console.log(`${ok ? '  \u2713' : '  \u2717'} ${msg}`);
  if (!ok) problems.push(msg);
};

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ ...pixel5, serviceWorkers: 'allow' });
const page = await ctx.newPage();

const consoleErrors = [];
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));

// 1. Carga
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
log((await page.locator('.tab').count()) === 3, 'Home renderiza con barra de pestañas');

// 2. Sin scroll horizontal (viewport Android real, 393px)
const hOverflow = await page.evaluate(
  () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
);
log(!hOverflow, 'Sin scroll horizontal en la home');

// 3. Service worker registrado
const swReady = await page.evaluate(async () => {
  if (!('serviceWorker' in navigator)) return false;
  const reg = await navigator.serviceWorker.getRegistration();
  return !!reg;
});
log(swReady, 'Service worker registrado');

// 4. Manifest enlazado y con lo mínimo para instalar
const manifestHref = await page.getAttribute('link[rel="manifest"]', 'href');
let manifestOk = false;
if (manifestHref) {
  const m = await (await ctx.request.get(new URL(manifestHref, BASE).href)).json();
  manifestOk =
    !!m.name &&
    ['standalone', 'fullscreen', 'minimal-ui'].includes(m.display) &&
    (m.icons || []).some((i) => /(^|\s)512x512(\s|$)/.test(i.sizes)) &&
    (m.icons || []).some((i) => /(^|\s)192x192(\s|$)/.test(i.sizes));
}
log(manifestOk, 'Manifest válido para instalación (name, standalone, iconos 192+512)');

// 5. Recorrer timers con toques y comprobar que cuentan
async function tapText(t) {
  await page.getByText(t, { exact: false }).first().tap();
  await page.waitForTimeout(500);
}
async function tapPlay() {
  await page.locator('button.press').nth(1).tap();
}
async function goHome() {
  await page.locator('.tab', { hasText: 'Inicio' }).tap();
  await page.waitForTimeout(400);
}

// Cuenta atrás: preset 30s -> play -> tiene que bajar
await tapText('Cuenta atrás');
await page.getByText('30s', { exact: true }).tap();
await page.waitForTimeout(200);
const cdBefore = await page.locator('.digits').first().innerText();
await tapPlay();
await page.waitForTimeout(3000);
const cdAfter = await page.locator('.digits').first().innerText();
log(
  cdBefore === '00:30' && cdAfter !== '00:30' && cdAfter < '00:30',
  `Cuenta atrás avanza ${cdBefore} -> ${cdAfter}`,
);
await goHome();

// Tabata run
await tapText('Tabata');
await tapText('Empezar');
await page.waitForTimeout(2500);
const tb = await page.locator('.digits').first().innerText();
log(/^\d\d:\d\d$/.test(tb) && tb !== '00:10', `Tabata en marcha (${tb})`);
await page.locator('.tab', { hasText: 'Timers' }).tap();
await goHome();

// EMOM
await tapText('EMOM');
await tapPlay();
await page.waitForTimeout(2500);
const em = await page.locator('.digits').first().innerText();
log(/^00:5\d$/.test(em), `EMOM cuenta el minuto (${em})`);
await goHome();

// Tempo run
await tapText('Tempo');
await tapText('Empezar');
await page.waitForTimeout(2500);
const tm = await page.locator('.digits').first().innerText();
log(/^\d\d:\d\d$/.test(tm), `Tempo en marcha (${tm})`);
await goHome();

// 6. Background: ocultar pestaña 8s y comprobar fast-forward
await tapText('Cuenta atrás');
await page.getByText('30s', { exact: true }).tap();
await page.waitForTimeout(150);
await tapPlay();
await page.waitForTimeout(600);
await page.evaluate(() => {
  Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
  document.dispatchEvent(new Event('visibilitychange'));
});
await page.waitForTimeout(9000); // en background los timers del navegador se estrangulan
await page.evaluate(() => {
  Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
  document.dispatchEvent(new Event('visibilitychange'));
});
await page.waitForTimeout(400);
const bg = await page.locator('.digits').first().innerText();
const remain = parseInt(bg.split(':')[0], 10) * 60 + parseInt(bg.split(':')[1], 10);
log(remain <= 22 && remain >= 16, `Tras ~9s en background el restante es ${bg} (esperado ~00:20)`);
await goHome();

// 7. Offline: cortar red y recargar -> la PWA sigue cargando
await ctx.setOffline(true);
try {
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(800);
  const offlineOk = (await page.locator('.tab').count()) === 3;
  log(offlineOk, 'Carga sin conexión (offline) tras instalar el SW');
} catch (e) {
  log(false, 'Carga offline: ' + e.message.split('\n')[0]);
}
await ctx.setOffline(false);

// 8. Sin errores de consola
log(
  consoleErrors.length === 0,
  `Sin errores de consola${consoleErrors.length ? ': ' + consoleErrors.join(' | ') : ''}`,
);

await browser.close();
console.log(problems.length ? `\nFALLOS: ${problems.length}` : '\nTODO OK');
process.exit(problems.length ? 1 : 0);
