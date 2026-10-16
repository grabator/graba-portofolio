/*
 * Vrijeme u Mostaru: sat (Europe/Sarajevo), doba dana za svjetlo kroz krovni prozor
 * i kiša sa Open-Meteo (keš 15 minuta u sessionStorage, odustaje poslije 4 sekunde).
 * Za probu: ?hour=7.5 postavlja sat, ?rain=1 ili ?rain=0 kišu.
 */
const TZ = 'Europe/Sarajevo';
// okvirni izlazak i zalazak sunca u Mostaru po mjesecima (lokalno vrijeme, sati)
const SUN = [[7.2, 16.4], [6.8, 17.1], [6.0, 17.7], [6.2, 19.3], [5.5, 19.9], [5.1, 20.3], [5.3, 20.3], [5.8, 19.8], [6.4, 19.0], [7.0, 18.1], [6.6, 16.4], [7.1, 16.1]];

function params() { try { return new URLSearchParams(location.search); } catch (e) { return new URLSearchParams(); } }

export function mostarTime() {
  const q = params().get('hour');
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: 'numeric', minute: 'numeric', month: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
  const get = (k) => Number((parts.find((p) => p.type === k) || {}).value || 0);
  let h = get('hour'), m = get('minute');
  if (q != null && q !== '' && !isNaN(+q)) { h = Math.floor(+q) % 24; m = Math.round((+q % 1) * 60); }
  return { h, m, month: get('month') || 1 };
}

// day: 0 noć .. 1 dan; dusk: 0..1 koliko je toplo nebo (svitanje ili sumrak)
export function dayPhase({ h, m, month }) {
  const t = h + m / 60, [rise, set] = SUN[(month - 1 + 12) % 12];
  const ramp = (x, a, b) => Math.min(1, Math.max(0, (x - a) / (b - a)));
  const day = Math.min(ramp(t, rise - 0.6, rise + 0.9), 1 - ramp(t, set - 0.9, set + 0.6));
  const dusk = Math.max(0, 1 - Math.abs(t - rise) / 1.1) + Math.max(0, 1 - Math.abs(t - set) / 1.1);
  return { day, dusk: Math.min(1, dusk) };
}

// vrijeme u Mostaru (kiša i temperatura), jedan poziv, keš 15 minuta
let wxPromise = null;
export function mostarWeather() {
  if (wxPromise) return wxPromise;
  const qt = params().get('temp');
  wxPromise = (async () => {
    const q = params().get('rain');
    try {
      const c = JSON.parse(sessionStorage.getItem('graba-wx2') || 'null');
      if (c && Date.now() - c.at < 15 * 60 * 1000) return { rain: q === '1' ? true : q === '0' ? false : c.rain, temp: c.temp };
    } catch (e) { /* bez keša */ }
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 4000);
    try {
      const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=43.34&longitude=17.81&current=temperature_2m,precipitation,rain,showers,weather_code&timezone=Europe%2FSarajevo', { signal: ctl.signal });
      if (!r.ok) throw new Error('http ' + r.status);
      const j = await r.json(), c = j.current || {};
      const code = c.weather_code;
      const rain = (c.precipitation || 0) > 0 || (c.rain || 0) > 0 || (c.showers || 0) > 0 || (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95;
      const temp = typeof c.temperature_2m === 'number' ? Math.round(c.temperature_2m) : null;
      try { sessionStorage.setItem('graba-wx2', JSON.stringify({ at: Date.now(), rain, temp })); } catch (e) { /* nije bitno */ }
      return { rain: q === '1' ? true : q === '0' ? false : rain, temp };
    } catch (e) {
      return { rain: q === '1', temp: null };
    } finally {
      clearTimeout(timer);
    }
  })().then((w) => (qt != null && qt !== '' && !isNaN(+qt) ? { ...w, temp: Math.round(+qt) } : w));
  return wxPromise;
}
export async function mostarRain() { return (await mostarWeather()).rain; }
