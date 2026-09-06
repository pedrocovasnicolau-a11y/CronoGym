// Alertas de audio + vibración

// AudioContext compartido — evita la restricción de iOS de crear contextos
// fuera de un gesto de usuario.
let _audioCtx = null;
function getCtx() {
  if (!_audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    _audioCtx = new Ctx();
  }
  return _audioCtx;
}

// Desbloquea el AudioContext en el primer toque/clic (iOS lo exige)
function installUnlock() {
  const unlock = async () => {
    try {
      const ctx = getCtx();
      if (ctx.state === 'suspended') await ctx.resume();
      // Buffer silencioso para desbloquear del todo el audio en iOS
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
    } catch {
      /* noop */
    }
  };
  document.addEventListener('touchstart', unlock, { once: true, passive: true });
  document.addEventListener('click', unlock, { once: true });
}
installUnlock();

// type: 'work' | 'rest' | 'end' | 'alert'
export async function playBeep(type = 'alert') {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') await ctx.resume();

    const tone = (freq, startT, dur, vol = 0.4) => {
      const osc = ctx.createOscillator();
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
      tone(880, t, 0.09);
      tone(880, t + 0.14, 0.09);
    } else if (type === 'rest') {
      // Un pitido largo y grave — inicio de descanso
      tone(440, t, 0.35, 0.35);
    } else if (type === 'end') {
      // Tres tonos ascendentes — fin de entrenamiento
      tone(523, t, 0.18);
      tone(659, t + 0.2, 0.18);
      tone(784, t + 0.4, 0.28);
    } else {
      // Pitido simple de aviso
      tone(660, t, 0.22);
    }
  } catch {
    /* noop */
  }
}

const VIBRATION_PATTERNS = {
  work: [80, 40, 80],
  rest: [200],
  end: [150, 80, 150, 80, 300],
  alert: [200, 100, 200],
};

export function triggerAlert(settings, type = 'alert') {
  if (settings?.audioAlert) playBeep(type);
  if (settings?.vibration) {
    try {
      navigator.vibrate?.(VIBRATION_PATTERNS[type] ?? VIBRATION_PATTERNS.alert);
    } catch {
      /* noop */
    }
  }
}
