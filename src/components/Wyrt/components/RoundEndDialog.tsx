import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { RoundResult, WyrtPlayer, PlayerScore } from '../engine/types';
import CardComponent from './CardComponent';

interface RoundEndDialogProps {
  open: boolean;
  result: RoundResult | null;
  players: WyrtPlayer[];
  foxBlackDiscarded: boolean;
  foxRedDiscarded: boolean;
  onNextRound: () => void;
  onEndGame: () => void;
  isHost?: boolean;
  unlimitedMoney?: boolean;
}

function RoundEndDialog({
  open,
  result,
  players,
  foxBlackDiscarded,
  foxRedDiscarded,
  onNextRound,
  onEndGame,
  isHost = true,
  unlimitedMoney = false,
}: RoundEndDialogProps) {
  if (!result) return null;

  const activePlayers = players.filter((p) => p.status !== 'eliminated');
  const canContinue =
    unlimitedMoney || activePlayers.filter((p) => p.money > 0).length >= 2;

  const getScore = (playerId: string): PlayerScore | undefined =>
    result.scores.find((s) => s.playerId === playerId);

  return (
    <Dialog
      open={open}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(180deg, #2a3a2a 0%, #1a2a1a 100%)',
          border: '2px solid #d4a847',
          borderRadius: '12px',
          boxShadow:
            '0 0 40px rgba(212,168,71,0.2), 0 10px 50px rgba(0,0,0,0.6)',
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
        <Typography
          sx={{
            fontSize: '1.6rem',
            fontWeight: 900,
            color: '#d4a847',
            fontFamily: '"Tfont", serif',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          {result.isDoubleHit ? 'ACERTO DUPLO!' : 'Fim da Rodada'}
        </Typography>
        {result.isDoubleHit && (
          <Typography
            sx={{
              fontSize: '0.95rem',
              color: '#f0d060',
              animation: 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 0.7 },
                '50%': { opacity: 1 },
              },
            }}
          >
            Todos pagam o dobro ao vencedor!
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        {/* Fox Number */}
        <Box sx={{ textAlign: 'center', my: 1.5 }}>
          <Typography
            sx={{
              fontSize: '0.85rem',
              color: 'rgba(160,180,160,0.7)',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Número da Raposa
          </Typography>
          <Typography
            sx={{
              fontSize: '2.3rem',
              fontWeight: 900,
              color: '#d4a847',
              fontFamily: '"Tfont", serif',
            }}
          >
            {result.foxNumber}
          </Typography>
        </Box>

        {/* Results table */}
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  color: '#a0b0a0',
                  borderColor: 'rgba(60,80,60,0.3)',
                  fontSize: '0.85rem',
                }}
              >
                Jogador
              </TableCell>
              <TableCell
                align='center'
                sx={{
                  color: '#e07070',
                  borderColor: 'rgba(60,80,60,0.3)',
                  fontSize: '0.85rem',
                }}
              >
                Vermelho
              </TableCell>
              <TableCell
                align='center'
                sx={{
                  color: '#a0a0a0',
                  borderColor: 'rgba(60,80,60,0.3)',
                  fontSize: '0.85rem',
                }}
              >
                Preto
              </TableCell>
              <TableCell
                align='center'
                sx={{
                  color: '#a0b0a0',
                  borderColor: 'rgba(60,80,60,0.3)',
                  fontSize: '0.85rem',
                }}
              >
                Distância
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activePlayers
              .filter((p) => p.status !== 'eliminated')
              .map((player) => {
                const score = getScore(player.id);
                const isWinner = player.id === result.winnerId;

                return (
                  <TableRow
                    key={player.id}
                    sx={{
                      background: isWinner
                        ? 'rgba(212,168,71,0.1)'
                        : 'transparent',
                    }}
                  >
                    <TableCell
                      sx={{
                        borderColor: 'rgba(60,80,60,0.3)',
                        color: isWinner ? '#d4a847' : '#c0d0c0',
                        fontWeight: isWinner ? 700 : 400,
                        fontSize: '0.95rem',
                      }}
                    >
                      {isWinner ? '👑 ' : ''}
                      {player.name}

                      {/* Show hand cards */}
                      <Box sx={{ display: 'flex', gap: 0.3, mt: 0.5 }}>
                        {player.hand.map((card) => (
                          <CardComponent
                            key={card.id}
                            card={card}
                            size='small'
                            invalidated={
                              (card.color === 'black' && foxBlackDiscarded) ||
                              (card.color === 'red' && foxRedDiscarded)
                            }
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell
                      align='center'
                      sx={{
                        borderColor: 'rgba(60,80,60,0.3)',
                        color: foxRedDiscarded ? '#666' : '#e07070',
                        fontSize: '1.05rem',
                        fontWeight: 600,
                        textDecoration: foxRedDiscarded
                          ? 'line-through'
                          : 'none',
                      }}
                    >
                      {score?.redSum ?? '-'}
                    </TableCell>
                    <TableCell
                      align='center'
                      sx={{
                        borderColor: 'rgba(60,80,60,0.3)',
                        color: foxBlackDiscarded ? '#666' : '#ccc',
                        fontSize: '1.05rem',
                        fontWeight: 600,
                        textDecoration: foxBlackDiscarded
                          ? 'line-through'
                          : 'none',
                      }}
                    >
                      {score?.blackSum ?? '-'}
                    </TableCell>
                    <TableCell
                      align='center'
                      sx={{
                        borderColor: 'rgba(60,80,60,0.3)',
                        color: isWinner ? '#8fc98f' : '#c0d0c0',
                        fontSize: '1.05rem',
                        fontWeight: 600,
                      }}
                    >
                      {score?.bestDistance === Infinity
                        ? '-'
                        : score?.bestDistance ?? '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>

        {/* Winner summary */}
        <Box
          sx={{
            mt: 2,
            textAlign: 'center',
            background: 'rgba(212,168,71,0.08)',
            borderRadius: '8px',
            py: 1.5,
            border: '1px solid rgba(212,168,71,0.2)',
          }}
        >
          <Typography sx={{ color: '#a0b0a0', fontSize: '0.9rem' }}>
            Vencedor
          </Typography>
          <Typography
            sx={{
              color: '#d4a847',
              fontSize: '1.3rem',
              fontWeight: 700,
              fontFamily: '"Tfont", serif',
            }}
          >
            {players.find((p) => p.id === result.winnerId)?.name}
          </Typography>
          <Typography
            sx={{
              color: '#8fc98f',
              fontSize: '1.15rem',
              fontWeight: 600,
            }}
          >
            +T$ {result.winnings}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 1.5 }}>
        {isHost ? (
          <>
            <Button
              onClick={onEndGame}
              sx={{
                background: 'linear-gradient(180deg, #5a4a4a, #3a2a2a)',
                color: '#c0b0b0',
                border: '1px solid #6a5a5a',
                borderRadius: '6px',
                px: 2.5,
                py: 0.8,
                fontWeight: 600,
                fontSize: '0.95rem',
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(180deg, #6a5a5a, #4a3a3a)',
                },
              }}
            >
              Encerrar Jogo
            </Button>

            {canContinue && (
              <Button
                onClick={onNextRound}
                sx={{
                  background: 'linear-gradient(180deg, #d4a847, #b8922e)',
                  color: '#1a2a1a',
                  border: '1px solid #f0d060',
                  borderRadius: '6px',
                  px: 2.5,
                  py: 0.8,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  boxShadow: '0 0 12px rgba(212,168,71,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(180deg, #f0d060, #d4a847)',
                  },
                }}
              >
                Próxima Rodada
              </Button>
            )}
          </>
        ) : (
          <Typography
            sx={{
              color: 'rgba(160,180,160,0.7)',
              fontSize: '0.95rem',
              fontStyle: 'italic',
            }}
          >
            Aguardando o anfitrião...
          </Typography>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default RoundEndDialog;
