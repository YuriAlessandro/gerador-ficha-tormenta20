import React from 'react';
import {
  Box,
  Typography,
  Button,
  Slider,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { WyrtRoomInfo } from '../engine/types';
import { MIN_PLAYERS, MAX_PLAYERS } from '../engine/constants';
import tavernBg from '../../../assets/images/wyrt/2208_w015_n003_966b_p15_966.jpg';
import logoSmall from '../../../assets/images/logoFichasDeNimbSmall.svg';
import { useWyrtAmbience } from '../hooks/useWyrtSounds';

interface WaitingRoomProps {
  roomInfo: WyrtRoomInfo;
  isConnected: boolean;
  isHost: boolean;
  onLeave: () => void;
  onStart: () => void;
  onUpdateBots: (botCount: number) => void;
}

function WaitingRoom({
  roomInfo,
  isConnected,
  isHost,
  onLeave,
  onStart,
  onUpdateBots,
}: WaitingRoomProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  useWyrtAmbience();

  const totalPlayers = roomInfo.players.length + roomInfo.botCount;
  const canStart = totalPlayers >= MIN_PLAYERS;
  const maxBots = MAX_PLAYERS - roomInfo.players.length;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomInfo.code);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `url(${tavernBg}) center center / cover no-repeat fixed`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, rgba(15,32,13,0.75) 0%, rgba(10,21,8,0.88) 60%, rgba(5,10,4,0.95) 100%)',
          zIndex: 0,
        },
        '& > *': {
          position: 'relative',
          zIndex: 1,
        },
      }}
    >
      {/* Back button + logo */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          left: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        <IconButton
          onClick={onLeave}
          sx={{
            color: '#a0b0a0',
            '&:hover': { color: '#d4a847' },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box
          component='img'
          src={logoSmall}
          alt='Fichas de Nimb'
          sx={{
            height: 32,
            width: 32,
            opacity: 0.7,
            transition: 'opacity 0.2s',
            '&:hover': { opacity: 1 },
          }}
        />
      </Box>

      {/* Connection indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        <FiberManualRecordIcon
          sx={{
            fontSize: '0.75rem',
            color: isConnected ? '#4caf50' : '#ff9800',
          }}
        />
        <Typography
          sx={{
            fontSize: '0.75rem',
            color: 'rgba(160,180,160,0.5)',
          }}
        >
          {isConnected ? 'Conectado' : 'Reconectando...'}
        </Typography>
      </Box>

      <Box
        sx={{
          width: '100%',
          maxWidth: 440,
          background:
            'linear-gradient(180deg, rgba(30,45,25,0.95) 0%, rgba(20,32,18,0.95) 100%)',
          border: '2px solid rgba(212,168,71,0.4)',
          borderRadius: '16px',
          boxShadow: '0 0 60px rgba(0,0,0,0.5), 0 0 20px rgba(212,168,71,0.08)',
          p: isMobile ? 3 : 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background:
              'linear-gradient(90deg, transparent, #d4a847, transparent)',
          },
        }}
      >
        {/* Title */}
        <Typography
          sx={{
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'rgba(160,180,160,0.6)',
            textTransform: 'uppercase',
            letterSpacing: 3,
            mb: 1,
          }}
        >
          Sala de Espera
        </Typography>

        {/* Room code */}
        <Box
          sx={{
            textAlign: 'center',
            mb: 3,
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(212,168,71,0.3)',
              borderRadius: '12px',
              px: 3,
              py: 1.5,
            }}
          >
            <Typography
              sx={{
                fontSize: '2.3rem',
                fontWeight: 900,
                color: '#d4a847',
                fontFamily: '"Tfont", serif',
                letterSpacing: 8,
                textShadow: '0 0 20px rgba(212,168,71,0.3)',
              }}
            >
              {roomInfo.code}
            </Typography>
            <IconButton
              onClick={handleCopyCode}
              size='small'
              sx={{
                color: 'rgba(160,180,160,0.5)',
                '&:hover': { color: '#d4a847' },
              }}
            >
              <ContentCopyIcon fontSize='small' />
            </IconButton>
          </Box>
          <Typography
            sx={{
              fontSize: '0.8rem',
              color: 'rgba(160,180,160,0.4)',
              mt: 0.5,
            }}
          >
            Compartilhe este código para seus amigos entrarem
          </Typography>
        </Box>

        {/* Player list */}
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontSize: '0.9rem',
              color: '#a0b0a0',
              mb: 1,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Jogadores ({totalPlayers}/{MAX_PLAYERS})
          </Typography>

          {roomInfo.players.map((player) => (
            <Box
              key={player.odUserId}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 0.8,
                px: 1,
                borderBottom: '1px solid rgba(60,80,60,0.15)',
              }}
            >
              {/* Avatar */}
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: player.isHost
                    ? 'linear-gradient(135deg, #d4a847, #b8922e)'
                    : 'rgba(80,100,80,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: player.isHost ? '#1a2a1a' : '#c0d0c0',
                  flexShrink: 0,
                }}
              >
                {player.username.charAt(0).toUpperCase()}
              </Box>

              {/* Name */}
              <Typography
                sx={{
                  flex: 1,
                  fontSize: '1rem',
                  color: '#c0d0c0',
                  fontWeight: player.isHost ? 700 : 400,
                }}
              >
                {player.username}
              </Typography>

              {/* Host badge */}
              {player.isHost && (
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: '#d4a847',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    fontWeight: 600,
                  }}
                >
                  Anfitrião
                </Typography>
              )}

              {/* Connection dot */}
              <FiberManualRecordIcon
                sx={{
                  fontSize: '0.65rem',
                  color: player.isConnected ? '#4caf50' : '#ff9800',
                }}
              />
            </Box>
          ))}

          {/* Bot slots */}
          {roomInfo.botCount > 0 && (
            <Box
              sx={{
                py: 0.8,
                px: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  color: 'rgba(140,160,140,0.5)',
                  fontStyle: 'italic',
                }}
              >
                + {roomInfo.botCount} bot{roomInfo.botCount > 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Bot slider (host only) */}
        {isHost && maxBots > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                fontSize: '0.9rem',
                color: '#a0b0a0',
                mb: 0.5,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Bots: {roomInfo.botCount}
            </Typography>
            <Slider
              value={roomInfo.botCount}
              onChange={(_e, val) => onUpdateBots(val as number)}
              min={0}
              max={maxBots}
              step={1}
              sx={{
                color: '#d4a847',
                '& .MuiSlider-track': {
                  background: 'linear-gradient(90deg, #b8922e, #d4a847)',
                },
                '& .MuiSlider-rail': {
                  background: 'rgba(80,100,80,0.4)',
                },
                '& .MuiSlider-thumb': {
                  background: '#d4a847',
                  border: '2px solid #f0d060',
                  '&:hover': {
                    boxShadow: '0 0 8px rgba(212,168,71,0.4)',
                  },
                },
              }}
            />
          </Box>
        )}

        {/* Actions */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
          {isHost ? (
            <Button
              onClick={onStart}
              disabled={!canStart}
              fullWidth
              sx={{
                background: canStart
                  ? 'linear-gradient(180deg, #d4a847 0%, #b8922e 100%)'
                  : 'rgba(80,80,80,0.3)',
                color: canStart ? '#1a2a1a' : '#666',
                border: canStart
                  ? '1px solid #f0d060'
                  : '1px solid rgba(80,80,80,0.3)',
                borderRadius: '8px',
                py: 1.3,
                fontSize: '1.15rem',
                fontWeight: 800,
                textTransform: 'none',
                fontFamily: '"Tfont", serif',
                letterSpacing: 1,
                boxShadow: canStart
                  ? '0 0 20px rgba(212,168,71,0.2), 0 4px 12px rgba(0,0,0,0.3)'
                  : 'none',
                '&:hover': canStart
                  ? {
                      background:
                        'linear-gradient(180deg, #f0d060 0%, #d4a847 100%)',
                    }
                  : {},
                '&.Mui-disabled': {
                  color: '#666',
                },
              }}
            >
              {canStart ? 'Iniciar Jogo' : `Mínimo ${MIN_PLAYERS} jogadores`}
            </Button>
          ) : (
            <Box
              sx={{
                textAlign: 'center',
                py: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: '1rem',
                  color: 'rgba(160,180,160,0.7)',
                  fontStyle: 'italic',
                }}
              >
                Aguardando o anfitrião iniciar...
              </Typography>
            </Box>
          )}

          <Button
            onClick={onLeave}
            fullWidth
            sx={{
              background: 'transparent',
              color: '#a0b0a0',
              border: '1px solid rgba(100,120,100,0.3)',
              borderRadius: '8px',
              py: 0.8,
              fontSize: '0.95rem',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                borderColor: '#e07070',
                color: '#e07070',
                background: 'rgba(224,112,112,0.05)',
              },
            }}
          >
            Sair da Sala
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default WaitingRoom;
