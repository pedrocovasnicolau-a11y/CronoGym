import { useEffect, useRef } from 'react';

/**
 * Mantiene la pantalla encendida mientras `enabled` sea true.
 * Re-solicita el bloqueo al volver a primer plano (el navegador lo suelta al
 * ocultar la pestaña).
 */
export function useWakeLock(enabled) {
  const lockRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;
    let released = false;

    const request = async () => {
      if (released) return;
      try {
        lockRef.current = await navigator.wakeLock?.request('screen');
      } catch {
        /* API no soportada o denegada */
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') request();
    };

    request();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      released = true;
      document.removeEventListener('visibilitychange', onVisibility);
      lockRef.current?.release().catch(() => {});
      lockRef.current = null;
    };
  }, [enabled]);
}
