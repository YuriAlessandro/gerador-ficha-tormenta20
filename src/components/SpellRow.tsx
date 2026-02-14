import React, { useCallback, useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  Typography,
  useTheme,
  IconButton,
  Stack,
  Checkbox,
  Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CasinoIcon from '@mui/icons-material/Casino';
import { DiceRoll } from '@/interfaces/DiceRoll';
import { manaExpenseByCircle } from '../data/systems/tormenta20/magias/generalSpells';
import { Spell } from '../interfaces/Spells';
import SpellCastDialog from './SpellCastDialog';

interface SpellProps {
  spell: Spell;
  onUpdateRolls?: (spell: Spell, newRolls: DiceRoll[]) => void;
  characterName?: string;
  currentPM?: number;
  maxPM?: number;
  onSpellCast?: (pmSpent: number) => void;
  isMago?: boolean;
  onToggleMemorized?: (spell: Spell) => void;
}

const SpellRow: React.FC<SpellProps> = React.memo((props) => {
  const {
    spell,
    onUpdateRolls,
    characterName,
    currentPM,
    maxPM,
    onSpellCast,
    isMago,
    onToggleMemorized,
  } = props;

  const [isExpanded, setIsExpanded] = React.useState(false);
  const [castDialogOpen, setCastDialogOpen] = useState(false);
  const theme = useTheme();

  const isMobile = useMemo(() => window.innerWidth < 720, []);

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleOpenCastDialog = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCastDialogOpen(true);
  }, []);

  const handleCloseCastDialog = useCallback(() => {
    setCastDialogOpen(false);
  }, []);

  const handleSpellCast = useCallback(
    (pmSpent: number) => {
      if (onSpellCast) {
        onSpellCast(pmSpent);
      }
    },
    [onSpellCast]
  );

  return (
    <Accordion expanded={isExpanded} onChange={handleToggle}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        id={spell.nome}
        sx={{
          '& .MuiAccordionSummary-content': {
            width: '100%',
            margin: 0,
          },
        }}
      >
        <Grid container spacing={2} sx={{ width: '100%' }}>
          <Grid size={isMobile ? 12 : 2.5}>
            <Stack direction='row' alignItems='center' spacing={0.5}>
              {isMago && onToggleMemorized && (
                <Tooltip title='Memorizar magia' arrow>
                  <Checkbox
                    size='small'
                    checked={spell.memorized ?? false}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => onToggleMemorized(spell)}
                    sx={{ p: 0, flexShrink: 0 }}
                  />
                </Tooltip>
              )}
              <Box onClick={(e) => e.stopPropagation()} sx={{ flexShrink: 0 }}>
                <IconButton
                  size='small'
                  onClick={handleOpenCastDialog}
                  color={spell.rolls?.length ? 'primary' : 'default'}
                  title='Usar magia'
                >
                  <CasinoIcon fontSize='small' />
                </IconButton>
              </Box>
              <Typography
                sx={{
                  fontWeight: 'semi-bold',
                  color: theme.palette.primary.main,
                  fontSize: '0.9rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {spell.nome} {spell.customKeyAttr && `(${spell.customKeyAttr})`}
              </Typography>
            </Stack>
          </Grid>
          {!isMobile && (
            <>
              <Grid size={1}>
                <Typography noWrap>{spell.school}</Typography>
              </Grid>
              <Grid size={1.5}>
                <Typography noWrap>{spell.execucao}</Typography>
              </Grid>
              <Grid size={1}>
                <Typography noWrap>{spell.alcance}</Typography>
              </Grid>
              <Grid size={2}>
                <Typography noWrap>
                  {spell.alvo || spell.area || '-'}
                </Typography>
              </Grid>
              <Grid size={2}>
                <Typography noWrap>{spell.duracao}</Typography>
              </Grid>
              <Grid size={2}>
                <Typography noWrap>{spell.resistencia || '-'}</Typography>
              </Grid>
            </>
          )}
        </Grid>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2} marginBottom={1}>
          <Grid size={6}>
            <Typography variant='caption' fontWeight='bold'>
              Escola:
            </Typography>
            <Typography>{spell.school}</Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant='caption' fontWeight='bold'>
              Execução:
            </Typography>
            <Typography>{spell.execucao}</Typography>
          </Grid>
        </Grid>
        <Grid container spacing={2} marginBottom={2}>
          <Grid size={6}>
            <Typography variant='caption' fontWeight='bold'>
              Alcance:
            </Typography>
            <Typography>{spell.alcance}</Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant='caption' fontWeight='bold'>
              Alvo/Área:
            </Typography>
            <Typography>{spell.alvo || spell.area || '-'}</Typography>
          </Grid>
        </Grid>
        <Grid container spacing={2} marginBottom={2}>
          <Grid size={6}>
            <Typography variant='caption' fontWeight='bold'>
              Duração:
            </Typography>
            <Typography>{spell.duracao}</Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant='caption' fontWeight='bold'>
              Resistência:
            </Typography>
            <Typography>{spell.resistencia || '-'}</Typography>
          </Grid>
        </Grid>
        <Grid container>
          <Grid size={10}>
            <Typography fontWeight='bold'>{spell.spellCircle}</Typography>
          </Grid>
          <Grid size={2}>
            <Typography
              sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}
            >
              Custo: {manaExpenseByCircle[spell.spellCircle]} PM
            </Typography>
          </Grid>
        </Grid>
        {spell.manaReduction && (
          <Typography sx={{ marginTop: '10px' }}>
            - Você tem {spell.manaReduction} de redução de mana para a magia{' '}
            {spell.nome}
          </Typography>
        )}
        <p>{spell.description}</p>
        {spell.aprimoramentos && spell.aprimoramentos.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            {spell.aprimoramentos.map((aprimoramento) => (
              <Typography
                key={`${aprimoramento.addPm}-${aprimoramento.text.substring(
                  0,
                  20
                )}`}
                sx={{ marginBottom: '8px' }}
              >
                <strong style={{ color: theme.palette.primary.main }}>
                  {aprimoramento.trick
                    ? 'Truque:'
                    : `+${aprimoramento.addPm} PM:`}
                </strong>{' '}
                {aprimoramento.text}
              </Typography>
            ))}
          </div>
        )}
      </AccordionDetails>
      <SpellCastDialog
        open={castDialogOpen}
        onClose={handleCloseCastDialog}
        spell={spell}
        currentPM={currentPM ?? 0}
        maxPM={maxPM ?? 0}
        onCast={handleSpellCast}
        onUpdateRolls={onUpdateRolls}
        characterName={characterName}
      />
    </Accordion>
  );
});

SpellRow.displayName = 'SpellRow';

export default SpellRow;
