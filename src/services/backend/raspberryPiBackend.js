/**
 * Backend: Raspberry Pi (REST API locale)
 *
 * Questo backend parla con un server REST che gira sul tuo Raspberry Pi
 * sulla rete locale (o esposto via Tailscale/ngrok).
 *
 * API attesa sul server RPi:
 *   GET    /data/:key          → { value: <dati> }
 *   PUT    /data/:key          → body: { value: <dati> }  → 200 OK
 *   DELETE /data/:key          → 200 OK
 *   GET    /health             → { ok: true }
 *
 * Autenticazione: Bearer token nell'header Authorization.
 *
 * Server di esempio (Node.js / Express) disponibile in:
 *   /docs/raspberry-pi-server/README.md
 *
 * TODO: aggiungere WebSocket per sincronizzazione real-time tra dispositivi.
 */

function buildBackend(config) {
  const baseUrl = (config.url || 'http://raspberrypi.local:3001').replace(/\/$/, '');
  const token = config.token || '';

  function headers() {
    const h = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }

  async function request(method, path, body) {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: headers(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`[RPi] ${method} ${path} → HTTP ${res.status}`);
    return res;
  }

  return {
    name: 'raspberryPi',
    label: 'Raspberry Pi',

    async isAvailable() {
      try {
        const res = await fetch(`${baseUrl}/health`, {
          headers: headers(),
          signal: AbortSignal.timeout(3000),
        });
        return res.ok;
      } catch {
        return false;
      }
    },

    async get(key) {
      try {
        const res = await request('GET', `/data/${encodeURIComponent(key)}`);
        const json = await res.json();
        return json.value ?? null;
      } catch (e) {
        console.error('[RPi] get error:', e);
        return null;
      }
    },

    async set(key, value) {
      try {
        await request('PUT', `/data/${encodeURIComponent(key)}`, { value });
      } catch (e) {
        console.error('[RPi] set error:', e);
        throw e;
      }
    },

    async remove(key) {
      try {
        await request('DELETE', `/data/${encodeURIComponent(key)}`);
      } catch (e) {
        console.error('[RPi] remove error:', e);
        throw e;
      }
    },

    /**
     * Polling ogni 2 secondi (finché non implementi WebSocket lato server).
     * Sostituisci con WebSocket per sync real-time.
     */
    subscribe(key, callback) {
      let last = undefined;
      const interval = setInterval(async () => {
        try {
          const res = await request('GET', `/data/${encodeURIComponent(key)}`);
          const json = await res.json();
          const current = JSON.stringify(json.value);
          if (current !== last) {
            last = current;
            callback(json.value ?? null);
          }
        } catch {}
      }, 2000);
      return () => clearInterval(interval);
    },
  };
}

export default buildBackend;

/**
 * Struttura config Raspberry Pi attesa:
 * {
 *   url:   "http://192.168.1.100:3001",   // IP locale o hostname RPi
 *   token: "il-tuo-token-segreto"         // Bearer token (lascia vuoto se non usi auth)
 * }
 */
