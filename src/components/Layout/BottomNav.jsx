import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';

const TABS = ['/', '/spese', '/attivita', '/statistiche'];

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const tabAttivo = TABS.findLast(p => location.pathname.startsWith(p));

  return (
    <Paper
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }}
      elevation={8}
    >
      <BottomNavigation
        value={tabAttivo}
        onChange={(event, newPath) => navigate(newPath)}
        sx={{ borderRadius: '16px 16px 0 0' }}
      >
        <BottomNavigationAction label="Home" value="/" icon={<HomeRoundedIcon />} />
        <BottomNavigationAction label="Spese" value="/spese" icon={<ReceiptRoundedIcon />} />
        <BottomNavigationAction label="Attività" value="/attivita" icon={<CheckCircleRoundedIcon />} />
        <BottomNavigationAction label="Statistiche" value="/statistiche" icon={<BarChartRoundedIcon />} />
      </BottomNavigation>
    </Paper>
  );
}

export default BottomNav;
