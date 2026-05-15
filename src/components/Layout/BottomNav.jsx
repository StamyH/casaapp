import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Paper
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }}
      elevation={8}
    >
      <BottomNavigation
        value={location.pathname}
        onChange={(event, newPath) => navigate(newPath)}
        sx={{ borderRadius: '16px 16px 0 0' }}
      >
        <BottomNavigationAction
          label="Home"
          value="/"
          icon={<HomeRoundedIcon />}
        />
        <BottomNavigationAction
          label="Spese"
          value="/spese"
          icon={<ReceiptRoundedIcon />}
        />
        <BottomNavigationAction
          label="Attività"
          value="/attivita"
          icon={<CheckCircleRoundedIcon />}
        />
        <BottomNavigationAction
          label="Impostazioni"
          value="/impostazioni"
          icon={<SettingsRoundedIcon />}
        />
      </BottomNavigation>
    </Paper>
  );
}

export default BottomNav;