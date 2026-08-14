import React, { useState } from 'react';
import {
  Box,
  Chip,
  Divider,
  Grid,
  IconButton,
  Modal,
  Typography,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { Spell, spellsCircles } from '../../interfaces/Spells';

export interface SpellCardData extends Spell {
  spellTypes: ('arcane' | 'divine')[];
}

// Tamanho padronizado das cartas (proporção 5:7, estilo Magic/Pokémon)
const CARD_WIDTH = 224;
const ZOOM_WIDTH = '80%';

const getCircleNumber = (spellCircle: spellsCircles): number => {
  switch (spellCircle) {
    case spellsCircles.c1:
      return 1;
    case spellsCircles.c2:
      return 2;
    case spellsCircles.c3:
      return 3;
    case spellsCircles.c4:
      return 4;
    case spellsCircles.c5:
      return 5;
    default:
      return 1;
  }
};

export const SCHOOL_COLORS: Record<string, string> = {
  Abjur: '#2e6fd8',
  Adiv: '#d4a017',
  Conv: '#00a8a8',
  Encan: '#e052a0',
  Evoc: '#e53935',
  Ilusão: '#8e44ad',
  Necro: '#2c3e50',
  Trans: '#1b5e20',
};

const DEFAULT_SCHOOL_COLOR = '#9e9e9e';

const hexToRgb = (hex: string): [number, number, number] => {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

const blend = (hex: string, target: number, amount: number): string => {
  const [r, g, b] = hexToRgb(hex);
  const mix = (c: number) => Math.round(c + (target - c) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
};

const lighten = (hex: string, amount = 0.35) => blend(hex, 255, amount);
const darken = (hex: string, amount = 0.4) => blend(hex, 0, amount);

interface InfoRowProps {
  label: string;
  value: string;
  fontSize?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  fontSize = '0.62rem',
}) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
    <Typography
      component='span'
      sx={{
        fontWeight: 700,
        opacity: 0.6,
        fontSize,
        lineHeight: 1.35,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </Typography>
    <Typography
      component='span'
      sx={{ fontSize, lineHeight: 1.35, textAlign: 'right' }}
    >
      {value || '-'}
    </Typography>
  </Box>
);

// Arte superior: imagem real (quando a magia tiver) ou gradiente da escola
const CardArt: React.FC<{ spell: SpellCardData; zoom?: boolean }> = ({
  spell,
  zoom = false,
}) => {
  const [imgError, setImgError] = useState(false);
  const schoolColor = SCHOOL_COLORS[spell.school] ?? DEFAULT_SCHOOL_COLOR;
  const imageUrl = spell.imageUrl && !imgError ? spell.imageUrl : undefined;

  return (
    <Box
      sx={{
        position: 'relative',
        height: zoom ? '40%' : '50%',
        flexShrink: 0,
        background: `linear-gradient(155deg, ${lighten(
          schoolColor,
          0.15
        )} 0%, ${schoolColor} 45%, ${darken(schoolColor, 0.45)} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {imageUrl ? (
        <Box
          component='img'
          src={imageUrl}
          alt={spell.nome}
          onError={() => setImgError(true)}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <>
          <Box
            sx={{
              position: 'absolute',
              top: zoom ? -40 : -30,
              right: zoom ? -28 : -20,
              width: zoom ? 150 : 110,
              height: zoom ? 150 : 110,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(255,255,255,.25), transparent 70%)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: zoom ? -55 : -40,
              left: zoom ? -40 : -30,
              width: zoom ? 170 : 130,
              height: zoom ? 170 : 130,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(255,255,255,.18), transparent 70%)',
            }}
          />
          <AutoFixHighIcon
            sx={{
              fontSize: zoom ? 56 : 44,
              color: 'rgba(255,255,255,.75)',
              transform: 'rotate(-8deg)',
            }}
          />
        </>
      )}

      {/* Círculo com o círculo da magia (canto superior esquerdo) */}
      <Box
        sx={{
          position: 'absolute',
          top: zoom ? 10 : 8,
          left: zoom ? 10 : 8,
          zIndex: 2,
          width: zoom ? 40 : 34,
          height: zoom ? 40 : 34,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(0,0,0,.72)',
          border: `2px solid ${lighten(schoolColor, 0.35)}`,
          boxShadow: '0 2px 6px rgba(0,0,0,.5)',
        }}
      >
        <Typography
          sx={{
            color: '#fff',
            fontWeight: 800,
            fontSize: zoom ? '1.15rem' : '0.95rem',
            lineHeight: 1,
            fontFamily: 'Tfont, serif',
          }}
        >
          {getCircleNumber(spell.spellCircle)}
        </Typography>
      </Box>

      {/* Nome da magia (topo centralizado, sobreposto à imagem) */}
      <Typography
        sx={{
          position: 'absolute',
          top: zoom ? 14 : 10,
          left: 0,
          right: 0,
          zIndex: 2,
          textAlign: 'center',
          color: '#fff',
          fontWeight: 800,
          fontSize: zoom ? '1rem' : '0.82rem',
          fontFamily: 'Tfont, serif',
          lineHeight: 1.15,
          textShadow: '1px 1px 0 rgba(0,0,0,.85), 0 0 6px rgba(0,0,0,.7)',
          px: zoom ? 7 : 5,
        }}
      >
        {spell.nome}
      </Typography>
    </Box>
  );
};

// Carta pequena (grade)
interface SpellCardProps {
  spell: SpellCardData;
  onSelect: (spell: SpellCardData) => void;
}

const SpellCard: React.FC<SpellCardProps> = ({ spell, onSelect }) => {
  const theme = useTheme();
  const schoolColor = SCHOOL_COLORS[spell.school] ?? DEFAULT_SCHOOL_COLOR;

  return (
    <Box
      onClick={() => onSelect(spell)}
      sx={{
        width: CARD_WIDTH,
        maxWidth: 'calc(100vw - 32px)',
        aspectRatio: '5 / 7',
        maxHeight: 'calc(100vh - 32px)',
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'transform .15s ease, box-shadow .15s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 10px 20px rgba(0,0,0,.35)',
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'inherit',
          overflow: 'hidden',
          border: `2px solid ${schoolColor}`,
          boxShadow: `inset 0 0 0 2px rgba(0,0,0,.85), inset 0 0 0 3px ${lighten(
            schoolColor,
            0.2
          )}, 0 4px 10px rgba(0,0,0,.45)`,
          bgcolor: theme.palette.background.paper,
        }}
      >
        <CardArt spell={spell} />

        {/* Parte inferior: informações (sem descrição — só aparece no zoom) */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            p: 0.75,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.25,
            overflow: 'hidden',
            bgcolor: theme.palette.background.paper,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 0.5,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.68rem',
                color: schoolColor,
                fontFamily: 'Tfont, serif',
                textTransform: 'uppercase',
                letterSpacing: 0.3,
              }}
            >
              {spell.school}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.3 }}>
              {spell.spellTypes.map((type) => (
                <Chip
                  key={type}
                  label={type === 'arcane' ? 'Arcana' : 'Divina'}
                  size='small'
                  color={type === 'arcane' ? 'primary' : 'secondary'}
                  variant='outlined'
                  sx={{
                    fontSize: '0.55rem',
                    height: 18,
                    fontFamily: 'Tfont, serif',
                  }}
                />
              ))}
            </Box>
          </Box>

          <Divider sx={{ opacity: 0.5 }} />

          <InfoRow label='Execução' value={spell.execucao} />
          <InfoRow label='Alcance' value={spell.alcance} />
          <InfoRow label='Duração' value={spell.duracao} />
          <InfoRow label='Alvo' value={spell.alvo || '-'} />
          <InfoRow label='Resistência' value={spell.resistencia} />
        </Box>
      </Box>
    </Box>
  );
};

// Carta em zoom (overlay)
const ZoomCard: React.FC<{ spell: SpellCardData; onClose: () => void }> = ({
  spell,
  onClose,
}) => {
  const theme = useTheme();
  const schoolColor = SCHOOL_COLORS[spell.school] ?? DEFAULT_SCHOOL_COLOR;

  return (
    <Box
      sx={{
        position: 'relative',
        width: ZOOM_WIDTH,
        maxWidth: 'calc(100vw - 32px)',
        aspectRatio: '5 / 7',
        maxHeight: 'calc(100vh - 32px)',
      }}
    >
      {/* X vermelho no canto superior direito */}
      <IconButton
        onClick={onClose}
        aria-label='Fechar'
        sx={{
          position: 'absolute',
          top: -12,
          right: -12,
          zIndex: 5,
          width: 32,
          height: 32,
          bgcolor: '#e74c3c',
          color: '#fff',
          border: '2px solid rgba(255,255,255,.85)',
          boxShadow: '0 2px 10px rgba(0,0,0,.5)',
          '&:hover': { bgcolor: '#c0392b' },
        }}
      >
        <CloseIcon sx={{ fontSize: 20 }} />
      </IconButton>

      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2.5,
          overflow: 'hidden',
          border: `2px solid ${schoolColor}`,
          boxShadow: `inset 0 0 0 2px rgba(0,0,0,.85), inset 0 0 0 3px ${lighten(
            schoolColor,
            0.2
          )}, 0 20px 60px rgba(0,0,0,.6)`,
          bgcolor: theme.palette.background.paper,
        }}
      >
        <CardArt spell={spell} zoom />

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.8rem',
                color: schoolColor,
                fontFamily: 'Tfont, serif',
                textTransform: 'uppercase',
                letterSpacing: 0.4,
              }}
            >
              {spell.school}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {spell.spellTypes.map((type) => (
                <Chip
                  key={type}
                  label={type === 'arcane' ? 'Arcana' : 'Divina'}
                  size='small'
                  color={type === 'arcane' ? 'primary' : 'secondary'}
                  variant='outlined'
                  sx={{
                    fontSize: '0.65rem',
                    height: 22,
                    fontFamily: 'Tfont, serif',
                  }}
                />
              ))}
            </Box>
          </Box>

          <Divider sx={{ my: 1, opacity: 0.6 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <InfoRow
              label='Execução'
              value={spell.execucao}
              fontSize='0.72rem'
            />
            <InfoRow label='Alcance' value={spell.alcance} fontSize='0.72rem' />
            <InfoRow
              label='Alvo'
              value={spell.alvo || '-'}
              fontSize='0.72rem'
            />
            <InfoRow
              label='Área'
              value={spell.area || '-'}
              fontSize='0.72rem'
            />
            <InfoRow label='Duração' value={spell.duracao} fontSize='0.72rem' />
            <InfoRow
              label='Resistência'
              value={spell.resistencia}
              fontSize='0.72rem'
            />
          </Box>

          <Divider sx={{ my: 1, opacity: 0.6 }} />

          {/* Descrição — visível apenas no zoom */}
          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.5 }}>
            <Typography sx={{ fontSize: '0.78rem', lineHeight: 1.45 }}>
              {spell.description}
            </Typography>

            {spell.aprimoramentos && spell.aprimoramentos.length > 0 && (
              <Box sx={{ mt: 1.5 }}>
                <Typography
                  sx={{ fontWeight: 700, fontSize: '0.72rem', mb: 0.5 }}
                >
                  Aprimoramentos
                </Typography>
                {spell.aprimoramentos.map((apr, idx) => (
                  <Typography
                    key={idx}
                    sx={{ fontSize: '0.72rem', lineHeight: 1.4, mb: 0.5 }}
                  >
                    <Box
                      component='span'
                      sx={{ fontWeight: 700, color: schoolColor }}
                    >
                      {apr.trick ? 'TRUQUE' : `+${apr.addPm} PM`}:
                    </Box>{' '}
                    {apr.text}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// Grade de cartas com zoom
interface SpellCardsViewProps {
  spells: SpellCardData[];
}

const SpellCardsView: React.FC<SpellCardsViewProps> = ({ spells }) => {
  const [selectedSpell, setSelectedSpell] = useState<SpellCardData | null>(
    null
  );
  const handleClose = () => setSelectedSpell(null);

  if (spells.length === 0) {
    return (
      <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
        Nenhuma magia encontrada. Tente ajustar os filtros.
      </Typography>
    );
  }

  return (
    <>
      <Box sx={{ px: 0.5, pb: 2 }}>
        <Grid container spacing={1.5} justifyContent='center'>
          {spells.map((spell) => (
            <Grid
              item
              key={`${spell.nome}-${getCircleNumber(spell.spellCircle)}`}
              sx={{ display: 'flex', justifyContent: 'center' }}
            >
              <SpellCard spell={spell} onSelect={setSelectedSpell} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Zoom: clica no X, fora da carta ou Esc para fechar */}
      <Modal open={!!selectedSpell} onClose={handleClose}>
        <Box
          onClick={handleClose}
          sx={{
            width: '100%',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
          }}
        >
          {selectedSpell && (
            <Box onClick={(e) => e.stopPropagation()}>
              <ZoomCard spell={selectedSpell} onClose={handleClose} />
            </Box>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default SpellCardsView;
