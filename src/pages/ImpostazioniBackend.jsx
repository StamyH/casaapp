import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, CardActionArea, Chip,
  TextField, Button, Alert, Divider, CircularProgress,
  Collapse, IconButton, Tooltip,
} from '@mui/material';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import CloudRoundedIcon from '@mui/icons-material/CloudRounded';
import DeveloperBoardRoundedIcon from '@mui/icons-material/DeveloperBoardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useBackend } from '../context/BackendContext';
import { useApp } from '../context/AppContext';

const OPZIONI = [
  {
    tipo: 'localStorage',
    titolo: 'Locale',
    descrizione: 'Dati salvati solo su questo dispositivo. Nessuna configurazione richiesta.',
    icona: <StorageRoundedIcon />,
    colore: '#5C6BC0',
    tag: 'Attuale default',
    pronto: true,
  },
  {
    tipo: 'firebase',
    titolo: 'Firebase',
    descrizione: 'Sincronizzazione cloud tramite Google Firebase Firestore. Dati accessibili da qualsiasi dispositivo.',
    icona: <CloudRoundedIcon />,
    colore: '#FF7043',
    tag: 'Richiede config',
    pronto: false,
  },
  {
    tipo: 'raspberryPi',
    titolo: 'Raspberry Pi',
    descrizione: 'Server locale auto-ospitato sul tuo Raspberry Pi. Massima privacy, nessun cloud.',
    icona: <DeveloperBoardRoundedIcon />,
    colore: '#C62828',
    tag: 'Richiede config',
    pronto: false,
  },
];

function CampoFirebase({ label, campo, value, onChange, placeholder, tooltip }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
      <TextField
        fullWidth
        size="small"
        label={label}
        value={value}
        onChange={(e) => onChange(campo, e.target.value)}
        placeholder={placeholder}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
      />
      {tooltip && (
        <Tooltip title={tooltip} placement="top">
          <IconButton size="small" sx={{ mt: 1 }}>
            <InfoOutlinedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

function FormFirebase({ valori, onChange }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Alert severity="info" sx={{ borderRadius: 2, fontSize: 12 }}>
        Trovi queste credenziali su{' '}
        <strong>console.firebase.google.com</strong> → Impostazioni progetto → Le tue app → SDK snippet.
      </Alert>
      <CampoFirebase label="API Key" campo="apiKey" value={valori.apiKey || ''} onChange={onChange} placeholder="AIzaSy..." />
      <CampoFirebase label="Auth Domain" campo="authDomain" value={valori.authDomain || ''} onChange={onChange} placeholder="mio-progetto.firebaseapp.com" />
      <CampoFirebase label="Project ID" campo="projectId" value={valori.projectId || ''} onChange={onChange} placeholder="mio-progetto" />
      <CampoFirebase label="Storage Bucket" campo="storageBucket" value={valori.storageBucket || ''} onChange={onChange} placeholder="mio-progetto.appspot.com" />
      <CampoFirebase label="Messaging Sender ID" campo="messagingSenderId" value={valori.messagingSenderId || ''} onChange={onChange} placeholder="123456789" />
      <CampoFirebase label="App ID" campo="appId" value={valori.appId || ''} onChange={onChange} placeholder="1:123:web:abc" />
      <CampoFirebase
        label="Nome Casa (namespace)"
        campo="nomeCasa"
        value={valori.nomeCasa || ''}
        onChange={onChange}
        placeholder="casa_mia"
        tooltip="Usato come percorso Firestore. Cambia solo se hai più case sullo stesso progetto."
      />
    </Box>
  );
}

function FormRaspberryPi({ valori, onChange }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Alert severity="info" sx={{ borderRadius: 2, fontSize: 12 }}>
        Assicurati che il server Node.js giri sul tuo Raspberry Pi.
        Vedi <strong>/docs/raspberry-pi-server/README.md</strong> per le istruzioni di setup.
      </Alert>
      <CampoFirebase
        label="URL Server"
        campo="url"
        value={valori.url || ''}
        onChange={onChange}
        placeholder="http://192.168.1.100:3001"
        tooltip="IP locale del Raspberry Pi o hostname (es. raspberrypi.local). Puoi anche usare Tailscale per accesso remoto."
      />
      <CampoFirebase
        label="Token di accesso (opzionale)"
        campo="token"
        value={valori.token || ''}
        onChange={onChange}
        placeholder="il-tuo-token-segreto"
        tooltip="Bearer token configurato sul server. Lascia vuoto se non usi autenticazione."
      />
    </Box>
  );
}

function ImpostazioniBackend() {
  const { config, aggiornaConfig, testConnessione, BACKEND_TYPES } = useBackend();
  const { utenteAttivo } = useApp();

  const [tipoSelezionato, setTipoSelezionato] = useState(config.tipo || BACKEND_TYPES.LOCAL);
  const [fbConfig, setFbConfig] = useState(config.firebase || {});
  const [rpiConfig, setRpiConfig] = useState(config.raspberryPi || {});
  const [testingConn, setTestingConn] = useState(false);
  const [risultatoTest, setRisultatoTest] = useState(null); // null | 'ok' | 'errore'
  const [salvato, setSalvato] = useState(false);

  const coloreApp = utenteAttivo?.coloreApp || '#5C6BC0';

  const handleChangeFb = (campo, valore) => {
    setFbConfig(prev => ({ ...prev, [campo]: valore }));
    setRisultatoTest(null);
  };

  const handleChangeRpi = (campo, valore) => {
    setRpiConfig(prev => ({ ...prev, [campo]: valore }));
    setRisultatoTest(null);
  };

  const handleSeleziona = (tipo) => {
    setTipoSelezionato(tipo);
    setRisultatoTest(null);
    setSalvato(false);
  };

  const buildNuovaConfig = () => ({
    tipo: tipoSelezionato,
    firebase: fbConfig,
    raspberryPi: rpiConfig,
  });

  const handleTest = async () => {
    setTestingConn(true);
    setRisultatoTest(null);
    // Applica temporaneamente la nuova config per il test
    aggiornaConfig(buildNuovaConfig());
    await new Promise(r => setTimeout(r, 100)); // lascia che il contesto si aggiorni
    const ok = await testConnessione();
    setRisultatoTest(ok ? 'ok' : 'errore');
    setTestingConn(false);
  };

  const handleSalva = () => {
    aggiornaConfig(buildNuovaConfig());
    setSalvato(true);
    setRisultatoTest(null);
  };

  const haModifiche = tipoSelezionato !== config.tipo ||
    JSON.stringify(fbConfig) !== JSON.stringify(config.firebase || {}) ||
    JSON.stringify(rpiConfig) !== JSON.stringify(config.raspberryPi || {});

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" mb={2}>
        Scegli dove vengono salvati i dati dell'app. Puoi cambiare in qualsiasi momento,
        ma dovrai migrare manualmente i dati tramite Backup &amp; Ripristino.
      </Typography>

      {/* Selezione backend */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
        {OPZIONI.map((opzione) => {
          const attivo = tipoSelezionato === opzione.tipo;
          return (
            <Card
              key={opzione.tipo}
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '2px solid',
                borderColor: attivo ? opzione.colore : 'divider',
                transition: 'border-color 0.2s',
              }}
            >
              <CardActionArea onClick={() => handleSeleziona(opzione.tipo)} sx={{ borderRadius: '10px' }}>
                <CardContent sx={{ p: 2, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{
                    width: 44, height: 44, borderRadius: 2, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: `${opzione.colore}18`, color: opzione.colore,
                  }}>
                    {opzione.icona}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                      <Typography fontWeight={700}>{opzione.titolo}</Typography>
                      <Chip
                        label={opzione.tipo === config.tipo ? '✓ Attivo' : opzione.tag}
                        size="small"
                        sx={{
                          height: 20, fontSize: 11,
                          bgcolor: opzione.tipo === config.tipo ? `${opzione.colore}20` : 'action.hover',
                          color: opzione.tipo === config.tipo ? opzione.colore : 'text.secondary',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {opzione.descrizione}
                    </Typography>
                  </Box>
                  <Box sx={{ alignSelf: 'center' }}>
                    {attivo
                      ? <CheckCircleRoundedIcon sx={{ color: opzione.colore }} />
                      : <RadioButtonUncheckedRoundedIcon sx={{ color: 'text.disabled' }} />
                    }
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>

      {/* Form configurazione Firebase */}
      <Collapse in={tipoSelezionato === BACKEND_TYPES.FIREBASE}>
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={700} mb={2}>🔥 Configurazione Firebase</Typography>
            <FormFirebase valori={fbConfig} onChange={handleChangeFb} />
          </CardContent>
        </Card>
      </Collapse>

      {/* Form configurazione Raspberry Pi */}
      <Collapse in={tipoSelezionato === BACKEND_TYPES.RASPBERRY_PI}>
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={700} mb={2}>🍓 Configurazione Raspberry Pi</Typography>
            <FormRaspberryPi valori={rpiConfig} onChange={handleChangeRpi} />
          </CardContent>
        </Card>
      </Collapse>

      {/* Feedback test/salvataggio */}
      {risultatoTest === 'ok' && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          ✅ Connessione riuscita! Il backend risponde correttamente.
        </Alert>
      )}
      {risultatoTest === 'errore' && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          ❌ Connessione fallita. Controlla URL, credenziali e che il server sia raggiungibile.
        </Alert>
      )}
      {salvato && !haModifiche && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          Configurazione salvata.
        </Alert>
      )}

      <Divider sx={{ mb: 2 }} />

      {/* Azioni */}
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        {tipoSelezionato !== BACKEND_TYPES.LOCAL && (
          <Button
            variant="outlined"
            onClick={handleTest}
            disabled={testingConn}
            sx={{ borderRadius: 2, py: 1, flex: 1 }}
            startIcon={testingConn ? <CircularProgress size={16} /> : null}
          >
            {testingConn ? 'Test...' : 'Testa connessione'}
          </Button>
        )}
        <Button
          variant="contained"
          onClick={handleSalva}
          disabled={!haModifiche}
          sx={{
            borderRadius: 2, py: 1, flex: 1,
            bgcolor: coloreApp,
            '&:hover': { bgcolor: coloreApp, opacity: 0.9 },
          }}
        >
          Salva
        </Button>
      </Box>

      {tipoSelezionato !== config.tipo && (
        <Alert severity="warning" sx={{ mt: 2, borderRadius: 2, fontSize: 12 }}>
          Dopo il salvataggio l'app userà il nuovo backend.
          I dati esistenti <strong>non vengono migrati automaticamente</strong>.
          Usa Backup &amp; Ripristino per trasferirli manualmente.
        </Alert>
      )}
    </Box>
  );
}

export default ImpostazioniBackend;
