import React, { useState } from 'react';
import { Box, Fab, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useAttivita } from '../context/AttivitaContext';
import TaskList from '../components/Attivita/TaskList';
import AggiuntaTask from '../components/Attivita/AggiuntaTask';

function Attivita() {
  const { attivita } = useAttivita();
  const [apriForm, setApriForm] = useState(false);
  const [filtroUtente, setFiltroUtente] = useState('tutti');
  const [attivitaInModifica, setAttivitaInModifica] = useState(null);
  const [mostraCompletate, setMostraCompletate] = useState(true);

  return (
    <Box sx={{ p: 2 }}>

      {/* Filtro utente */}
      <ToggleButtonGroup
        value={filtroUtente}
        exclusive
        onChange={(e, val) => val && setFiltroUtente(val)}
        fullWidth
        sx={{ mb: 3 }}
      >
        <ToggleButton value="tutti" sx={{ fontSize: '0.8rem', py: 1 }}>
          👥 Tutti
        </ToggleButton>
        <ToggleButton value="Riccardo" sx={{ fontSize: '0.8rem', py: 1 }}>
          👤 Riccardo
        </ToggleButton>
        <ToggleButton value="Federico" sx={{ fontSize: '0.8rem', py: 1 }}>
          👤 Federico
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Lista task */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Typography
          variant="caption"
          color="primary"
          sx={{ cursor: 'pointer', fontWeight: 600 }}
          onClick={() => setMostraCompletate(p => !p)}
        >
          {mostraCompletate ? 'Nascondi completate' : 'Mostra completate'}
        </Typography>
      </Box>
      <TaskList 
        attivita={attivita} 
        filtroUtente={filtroUtente} 
        onModifica={setAttivitaInModifica} 
        mostraCompletate={mostraCompletate} 
      />
      
      {/* Bottone aggiunta task — fisso in basso a destra */}
      <Fab
        color="primary"
        onClick={() => setApriForm(true)}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 24,
          boxShadow: 4,
        }}
      >
        <AddRoundedIcon />
      </Fab>

      {/* Form aggiunta task */}
      <AggiuntaTask
        aperto={apriForm || !!attivitaInModifica}
        onChiudi={() => { setApriForm(false); setAttivitaInModifica(null); }}
        attivitaInModifica={attivitaInModifica}
      />
    </Box>
  );
}

export default Attivita;