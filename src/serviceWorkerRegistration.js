const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) return;

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log('App servita dalla cache dal service worker.');
        });
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      // Caso 1: il SW nuovo era già in attesa da una visita precedente
      // (onupdatefound non rifirisce, quindi va controllato esplicitamente)
      if (registration.waiting && navigator.serviceWorker.controller) {
        if (config?.onUpdate) config.onUpdate(registration);
        return;
      }

      // Caso 2: il SW nuovo sta ancora installando quando arriviamo qui
      if (registration.installing) {
        trackInstalling(registration.installing, registration, config);
      }

      // Caso 3: il SW nuovo viene trovato durante questa sessione
      registration.onupdatefound = () => {
        if (registration.installing) {
          trackInstalling(registration.installing, registration, config);
        }
      };

      // Forza il browser a controllare subito se c'è un nuovo SW
      // (utile quando l'utente riapre l'app dopo un po')
      registration.update();
    })
    .catch((error) => {
      console.error('Errore durante la registrazione del service worker:', error);
    });
}

function trackInstalling(installingWorker, registration, config) {
  installingWorker.onstatechange = () => {
    if (installingWorker.state === 'installed') {
      if (navigator.serviceWorker.controller) {
        // Nuovo SW pronto in attesa — notifica l'utente
        if (config?.onUpdate) config.onUpdate(registration);
      } else {
        // Prima installazione — l'app è ora disponibile offline
        if (config?.onSuccess) config.onSuccess(registration);
      }
    }
  };
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (response.status === 404 || (contentType && !contentType.includes('javascript'))) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => window.location.reload());
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('Nessuna connessione internet. App in modalità offline.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => registration.unregister())
      .catch((error) => console.error(error.message));
  }
}
