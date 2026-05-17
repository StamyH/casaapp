import React, { useState } from 'react';
import { Box, Fab, ToggleButton, ToggleButtonGroup } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useApp } from '../context/AppContext';
import { useAttivita } from '../context/AttivitaContext';
import TaskList from '../components/Attivita/TaskList';
import AggiuntaTask from '../components/Attivita/AggiuntaTask';

function Attivita() {
  const { utente } = useApp();
  const { attivita } = useAttivita();
  const [apriForm, setApriForm] = useState(false);
  const [filtroUtente, setFiltroUtente] = useState('tutti');

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
      <TaskList attivita={attivita} filtroUtente={filtroUtente} />

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
        aperto={apriForm}
        onChiudi={() => setApriForm(false)}
      />
    </Box>
  );
}

export default Attivita;