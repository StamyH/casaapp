import React, { useState } from 'react';
import { Box, Typography, Avatar, TextField, Button, InputAdornment } from '@mui/material';
import { useApp } from '../context/AppContext';
import { useSpese } from '../context/SpeseContext';
import { useAttivita } from '../context/AttivitaContext';

const MAX_NOME = 20;

function ImpostazioniProfilo() {
  const { utenteAttivo, modificaUtente } = useApp();
  const { aggiornaRiferimentiUtente: aggiornaSpese } = useSpese();
  const { aggiornaRiferimentiUtente: aggiornaAttivita } = useAttivita();

  const [nome, setNome] = useState(utenteAttivo?.nome || '');
  const [salvato, setSalvato] = useState(false);

  const nomeCambiato = nome.trim() !== utenteAttivo?.nome && nome.trim().length > 0;

  const salva = () => {
    const nuovoNome = nome.trim();
    if (!nuovoNome || nuovoNome === utenteAttivo?.nome) return;
    const vecchioNome = utenteAttivo.nome;
    modificaUtente(utenteAttivo.id, { nome: nuovoNome });
    aggiornaSpese(vecchioNome, nuovoNome);
    aggiornaAttivita(vecchioNome, nuovoNome);
    setSalvato(true);
    setTimeout(() => setSalvato(false), 2000);
  };

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Avatar sx={{ width: 80, height: 80, bgcolor: utenteAttivo?.coloreAvatar, fontSize: '2rem', fontWeight: 700 }}>
          {nome.trim()[0] || utenteAttivo?.nome?.[0]}
        </Avatar>
      </Box>

      <Box>
        <Typography variant="subtitle2" fontWeight={700} mb={1}>Nome</Typography>
        <TextField
          fullWidth
          size="small"
          value={nome}
          onChange={e => { if (e.target.value.length <= MAX_NOME) setNome(e.target.value); }}
          onKeyDown={e => e.key === 'Enter' && nomeCambiato && salva()}
          inputProps={{ maxLength: MAX_NOME }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Typography variant="caption" color={nome.length >= MAX_NOME ? 'error' : 'text.disabled'}>
                  {nome.length}/{MAX_NOME}
                </Typography>
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          onClick={salva}
          disabled={!nomeCambiato}
          sx={{ mt: 1.5, borderRadius: 2 }}
        >
          {salvato ? 'Salvato ✓' : 'Salva nome'}
        </Button>
      </Box>

      <Typography variant="caption" color="text.secondary">
        Per cambiare il colore del tuo avatar vai su Tema.
      </Typography>

    </Box>
  );
}

export default ImpostazioniProfilo;
