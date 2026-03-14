import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Slider,
  useMediaQuery,
  useTheme,
  IconButton,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import LoginIcon from '@mui/icons-material/Login';
import { useHistory } from 'react-router-dom';
import {
  DEFAULT_BOT_COUNT,
  INITIAL_MONEY,
  MIN_PLAYERS,
  MAX_PLAYERS,
  MONEY_OPTIONS,
} from '../engine/constants';
import { useAuthContext } from '../../../contexts/AuthContext';
import WyrtRulesDialog from './WyrtRulesDialog';
import { useWyrtAmbience } from '../hooks/useWyrtSounds';
import tavernBg from '../../../assets/images/wyrt/2208_w015_n003_966b_p15_966.jpg';
import logoSmall from '../../../assets/images/logoFichasDeNimbSmall.svg';

type LobbyView = 'menu' | 'solo' | 'joinCode';

interface GameSetupProps {
  onStartGame: (
    playerName: string,
    botCount: number,
    initialMoney: number
  ) => void;
  onCreateRoom?: (botCount: number, initialMoney: number) => void;
  onJoinRoom?: (code: string) => void;
  isAuthenticated?: boolean;
  onlineUserName?: string;
  error?: string | null;
  onClearError?: () => void;
}

function GameSetup({
  onStartGame,
  onCreateRoom,
  onJoinRoom,
  isAuthenticated = false,
  onlineUserName,
  error,
  onClearError,
}: GameSetupProps) {
  const [view, setView] = useState<LobbyView>('menu');
  const [playerName, setPlayerName] = useState('');
  const [botCount, setBotCount] = useState(DEFAULT_BOT_COUNT);
  const [initialMoney, setInitialMoney] = useState(INITIAL_MONEY);
  const [roomCode, setRoomCode] = useState('');
  const [showRules, setShowRules] = useState(false);
  const { openLoginModal } = useAuthContext();
  useWyrtAmbience();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const history = useHistory();

  const handleStartSolo = () => {
    const name = playerName.trim() || 'Aventureiro';
    onStartGame(name, botCount, initialMoney);
  };

  const handleCreateRoom = () => {
    if (!onCreateRoom) return;
    onCreateRoom(DEFAULT_BOT_COUNT, initialMoney);
  };

  const handleJoinRoom = () => {
    if (!onJoinRoom) return;
    const code = roomCode.toUpperCase().trim();
    if (code.length !== 4) return;
    onJoinRoom(code);
  };

  const handleBack = () => {
    if (onClearError) onClearError();
    setView('menu');
  };

  const totalPlayers = botCount + 1;

  const moneyLabel = (value: number) =>
    value === 0 ? 'ILIMITADO' : `T$ ${value}`;

  // Money selector shared UI
  const moneySelector = (
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
        Dinheiro Inicial
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.8,
          justifyContent: 'center',
        }}
      >
        {MONEY_OPTIONS.map((value) => {
          const isSelected = initialMoney === value;
          return (
            <Button
              key={value}
              onClick={() => setInitialMoney(value)}
              sx={{
                minWidth: value === 0 ? 110 : 80,
                py: 0.6,
                px: 1.5,
                fontSize: '0.88rem',
                fontWeight: isSelected ? 800 : 500,
                borderRadius: '20px',
                textTransform: 'none',
                fontFamily: value === 0 ? '"Tfont", serif' : 'inherit',
                background: isSelected
                  ? 'linear-gradient(180deg, #d4a847, #b8922e)'
                  : 'rgba(0,0,0,0.25)',
                color: isSelected ? '#1a2a1a' : '#a0b0a0',
                border: isSelected
                  ? '1px solid #f0d060'
                  : '1px solid rgba(100,120,100,0.25)',
                boxShadow: isSelected
                  ? '0 0 10px rgba(212,168,71,0.2)'
                  : 'none',
                '&:hover': {
                  background: isSelected
                    ? 'linear-gradient(180deg, #f0d060, #d4a847)'
                    : 'rgba(212,168,71,0.1)',
                  borderColor: '#d4a847',
                },
              }}
            >
              {moneyLabel(value)}
            </Button>
          );
        })}
      </Box>
      {initialMoney === 0 && (
        <Typography
          sx={{
            fontSize: '0.8rem',
            color: 'rgba(212,168,71,0.6)',
            textAlign: 'center',
            mt: 0.8,
            fontStyle: 'italic',
          }}
        >
          O jogo só termina quando os jogadores decidirem
        </Typography>
      )}
    </Box>
  );

  // Shared card wrapper style
  const cardSx = {
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
      background: 'linear-gradient(90deg, transparent, #d4a847, transparent)',
    },
  };

  // Shared name input
  const nameInput = (
    <Box sx={{ mb: 3 }}>
      <Typography
        sx={{
          fontSize: '0.9rem',
          color: '#a0b0a0',
          mb: 0.8,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        Seu nome
      </Typography>
      <TextField
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder='Aventureiro'
        fullWidth
        variant='outlined'
        inputProps={{ maxLength: 20 }}
        sx={{
          '& .MuiOutlinedInput-root': {
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '8px',
            color: '#c0d0c0',
            fontSize: '1.1rem',
            '& fieldset': { borderColor: 'rgba(100,120,100,0.3)' },
            '&:hover fieldset': { borderColor: 'rgba(212,168,71,0.4)' },
            '&.Mui-focused fieldset': { borderColor: '#d4a847' },
          },
          '& .MuiInputBase-input::placeholder': {
            color: 'rgba(140,160,140,0.5)',
            opacity: 1,
          },
        }}
      />
    </Box>
  );

  // Error display
  const errorDisplay = error ? (
    <Box
      sx={{
        background: 'rgba(224,112,112,0.1)',
        border: '1px solid rgba(224,112,112,0.3)',
        borderRadius: '8px',
        p: 1.5,
        mb: 2,
      }}
    >
      <Typography sx={{ fontSize: '0.95rem', color: '#e07070' }}>
        {error}
      </Typography>
    </Box>
  ) : null;

  // Title block
  const titleBlock = (
    <Box sx={{ textAlign: 'center', mb: 3 }}>
      <Typography
        sx={{
          fontSize: isMobile ? '2.3rem' : '2.8rem',
          fontWeight: 900,
          color: '#d4a847',
          fontFamily: '"Tfont", serif',
          textShadow:
            '0 0 20px rgba(212,168,71,0.3), 0 3px 6px rgba(0,0,0,0.5)',
          letterSpacing: 4,
          lineHeight: 1,
        }}
      >
        WYRT
      </Typography>
      <Typography
        sx={{
          fontSize: '0.85rem',
          color: 'rgba(160,180,160,0.6)',
          textTransform: 'uppercase',
          letterSpacing: 3,
          mt: 0.5,
        }}
      >
        Jogo de Cartas de Arton
      </Typography>
    </Box>
  );

  // Fox watermark
  const foxWatermark = (
    <Box
      sx={{
        position: 'absolute',
        top: -20,
        right: -20,
        width: 160,
        height: 160,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 15 L30 5 L35 30 L20 45 L35 50 L30 70 L40 65 L50 85 L60 65 L70 70 L65 50 L80 45 L65 30 L70 5 Z' fill='%23d4a84708'/%3E%3C/svg%3E")`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        opacity: 0.5,
        pointerEvents: 'none',
      }}
    />
  );

  // Gold button style
  const goldButtonSx = {
    background: 'linear-gradient(180deg, #d4a847 0%, #b8922e 100%)',
    color: '#1a2a1a',
    border: '1px solid #f0d060',
    borderRadius: '8px',
    py: 1.3,
    fontSize: '1.15rem',
    fontWeight: 800,
    textTransform: 'none',
    fontFamily: '"Tfont", serif',
    letterSpacing: 1,
    boxShadow: '0 0 20px rgba(212,168,71,0.2), 0 4px 12px rgba(0,0,0,0.3)',
    '&:hover': {
      background: 'linear-gradient(180deg, #f0d060 0%, #d4a847 100%)',
      boxShadow: '0 0 30px rgba(212,168,71,0.3), 0 6px 16px rgba(0,0,0,0.3)',
      transform: 'translateY(-1px)',
    },
    '&:active': { transform: 'translateY(1px)' },
  };

  const outlineButtonSx = {
    background: 'transparent',
    color: '#a0b0a0',
    border: '1px solid rgba(100,120,100,0.3)',
    borderRadius: '8px',
    py: 0.8,
    fontSize: '0.95rem',
    fontWeight: 600,
    textTransform: 'none',
    '&:hover': {
      borderColor: '#d4a847',
      color: '#d4a847',
      background: 'rgba(212,168,71,0.05)',
    },
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
          onClick={view === 'menu' ? () => history.push('/') : handleBack}
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

      {/* --- MENU VIEW --- */}
      {view === 'menu' && (
        <Box sx={cardSx}>
          {foxWatermark}
          {titleBlock}

          {/* Info box */}
          <Box
            sx={{
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '8px',
              p: 1.5,
              mb: 3,
              border: '1px solid rgba(60,80,60,0.2)',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.88rem',
                color: 'rgba(160,180,160,0.7)',
                lineHeight: 1.6,
              }}
            >
              Aposte, blefe e tente acertar o Número da Raposa!
            </Typography>
          </Box>

          {moneySelector}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
            {/* Online options */}
            {isAuthenticated ? (
              <>
                {onlineUserName && (
                  <Typography
                    sx={{
                      textAlign: 'center',
                      fontSize: '0.88rem',
                      color: 'rgba(160,180,160,0.6)',
                    }}
                  >
                    Jogando como{' '}
                    <strong style={{ color: '#d4a847' }}>
                      {onlineUserName}
                    </strong>
                  </Typography>
                )}
                <Button
                  onClick={handleCreateRoom}
                  fullWidth
                  startIcon={<GroupIcon />}
                  sx={goldButtonSx}
                >
                  Criar Sala Online
                </Button>
                <Button
                  onClick={() => setView('joinCode')}
                  fullWidth
                  startIcon={<LoginIcon />}
                  sx={outlineButtonSx}
                >
                  Entrar em Sala
                </Button>
              </>
            ) : (
              <Button
                onClick={openLoginModal}
                fullWidth
                startIcon={<LoginIcon />}
                sx={goldButtonSx}
              >
                Faça login para jogar online
              </Button>
            )}

            {/* Solo play */}
            <Button
              onClick={() => setView('solo')}
              fullWidth
              startIcon={<PersonIcon />}
              sx={outlineButtonSx}
            >
              Jogar Solo
            </Button>

            <Button
              onClick={() => setShowRules(true)}
              fullWidth
              startIcon={<HelpOutlineIcon />}
              sx={outlineButtonSx}
            >
              Ver Regras
            </Button>
          </Box>
        </Box>
      )}

      {/* --- SOLO VIEW --- */}
      {view === 'solo' && (
        <Box sx={cardSx}>
          {foxWatermark}
          {titleBlock}
          {nameInput}

          {/* Bot count */}
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
              Oponentes: {botCount} bots ({totalPlayers} jogadores)
            </Typography>
            <Slider
              value={botCount}
              onChange={(_e, val) => setBotCount(val as number)}
              min={MIN_PLAYERS - 1}
              max={MAX_PLAYERS - 1}
              step={1}
              marks={[
                { value: 2, label: '2' },
                { value: 3, label: '3' },
                { value: 4, label: '4' },
                { value: 5, label: '5' },
              ]}
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
                '& .MuiSlider-mark': {
                  background: 'rgba(100,120,100,0.5)',
                },
                '& .MuiSlider-markLabel': {
                  color: 'rgba(140,160,140,0.6)',
                  fontSize: '0.85rem',
                },
              }}
            />
          </Box>

          {moneySelector}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
            <Button onClick={handleStartSolo} fullWidth sx={goldButtonSx}>
              Iniciar Jogo
            </Button>
            <Button onClick={handleBack} fullWidth sx={outlineButtonSx}>
              Voltar
            </Button>
          </Box>
        </Box>
      )}

      {/* --- JOIN CODE VIEW --- */}
      {view === 'joinCode' && (
        <Box sx={cardSx}>
          {foxWatermark}
          {titleBlock}

          {errorDisplay}

          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                fontSize: '0.9rem',
                color: '#a0b0a0',
                mb: 0.8,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Código da Sala
            </Typography>
            <TextField
              value={roomCode}
              onChange={(e) =>
                setRoomCode(e.target.value.toUpperCase().slice(0, 4))
              }
              placeholder='EX: A3K9'
              fullWidth
              variant='outlined'
              inputProps={{
                maxLength: 4,
                style: {
                  textAlign: 'center',
                  fontSize: '1.7rem',
                  fontWeight: 900,
                  letterSpacing: 8,
                  fontFamily: '"Tfont", serif',
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '8px',
                  color: '#d4a847',
                  '& fieldset': { borderColor: 'rgba(100,120,100,0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(212,168,71,0.4)' },
                  '&.Mui-focused fieldset': { borderColor: '#d4a847' },
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(140,160,140,0.3)',
                  opacity: 1,
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
            <Button
              onClick={handleJoinRoom}
              fullWidth
              disabled={roomCode.length !== 4}
              sx={{
                ...goldButtonSx,
                ...(roomCode.length !== 4 && {
                  background: 'rgba(80,80,80,0.3)',
                  color: '#666',
                  border: '1px solid rgba(80,80,80,0.3)',
                  boxShadow: 'none',
                  '&:hover': {},
                  '&.Mui-disabled': { color: '#666' },
                }),
              }}
            >
              Entrar na Sala
            </Button>
            <Button onClick={handleBack} fullWidth sx={outlineButtonSx}>
              Voltar
            </Button>
          </Box>
        </Box>
      )}

      <WyrtRulesDialog open={showRules} onClose={() => setShowRules(false)} />
    </Box>
  );
}

export default GameSetup;
