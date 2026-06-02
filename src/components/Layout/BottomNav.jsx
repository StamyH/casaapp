import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Paper, Typography } from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';

const TABS = [
  { path: '/',            Icon: HomeRoundedIcon,          label: 'Home'       },
  { path: '/spese',       Icon: ReceiptRoundedIcon,       label: 'Spese'      },
  { path: '/attivita',    Icon: CheckCircleRoundedIcon,   label: 'Attività'   },
  { path: '/calendario',  Icon: CalendarMonthRoundedIcon, label: 'Calendario' },
  { path: '/statistiche', Icon: BarChartRoundedIcon,      label: 'Statistiche'},
];

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const tabAttivo = TABS.map(t => t.path).findLast(p => location.pathname.startsWith(p));

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom)',
        borderTop: '0.5px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'stretch', height: 56 }}>
        {TABS.map(({ path, Icon, label }) => {
          const isAttivo = tabAttivo === path;
          return (
            <Box
              key={path}
              onClick={() => navigate(path)}
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                cursor: 'pointer',
                position: 'relative',
                WebkitTapHighlightColor: 'transparent',
                /* Press feedback: comprimi leggermente tutta la tab */
                '&:active': {
                  '& .tab-icon-wrap': {
                    transform: isAttivo
                      ? 'scale(0.88) translateY(-2px)'
                      : 'scale(0.88)',
                  },
                },
              }}
            >
              {/* Icona con spring */}
              <Box
                className="tab-icon-wrap"
                sx={{
                  display: 'flex',
                  color: isAttivo ? 'primary.main' : 'text.disabled',
                  transition: 'transform 380ms var(--spring), color 220ms var(--ease-out)',
                  transform: isAttivo ? 'scale(1.18) translateY(-2px)' : 'scale(1) translateY(0)',
                  willChange: 'transform',
                }}
              >
                <Icon sx={{ fontSize: '1.4rem' }} />
              </Box>

              {/* Label */}
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.58rem',
                  lineHeight: 1,
                  fontWeight: isAttivo ? 700 : 400,
                  color: isAttivo ? 'primary.main' : 'text.disabled',
                  transition: 'color 220ms var(--ease-out)',
                  userSelect: 'none',
                }}
              >
                {label}
              </Typography>

              {/* Pill indicator — morfa da scaleX(0) a scaleX(1) con spring */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  width: 22,
                  height: 3,
                  borderRadius: '0 0 3px 3px',
                  bgcolor: 'primary.main',
                  transformOrigin: 'center top',
                  transition: 'transform 380ms var(--spring), opacity 220ms var(--ease-out)',
                  transform: isAttivo ? 'translateX(-50%) scaleX(1)' : 'translateX(-50%) scaleX(0)',
                  opacity: isAttivo ? 1 : 0,
                  willChange: 'transform, opacity',
                }}
              />
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}

export default BottomNav;
