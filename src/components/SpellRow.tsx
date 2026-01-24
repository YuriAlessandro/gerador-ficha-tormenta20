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
  Badge,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import { DiceRoll } from '@/interfaces/DiceRoll';
import { manaExpenseByCircle } from '../data/systems/tormenta20/magias/generalSpells';
import { Spell } from '../interfaces/Spells';
import RollsEditDialog from './RollsEditDialog';
import RollButton from './RollButton';

interface SpellProps {
  spell: Spell;
  onUpdateRolls?: (spell: Spell, newRolls: DiceRoll[]) => void;
  characterName?: string;
}

const SpellRow: React.FC<SpellProps> = React.memo((props) => {
  const { spell, onUpdateRolls, characterName } = props;

  const [isExpanded, setIsExpanded] = React.useState(false);
  const [rollsDialogOpen, setRollsDialogOpen] = useState(false);
  const theme = useTheme();

  const isMobile = useMemo(() => window.innerWidth < 720, []);

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleOpenRollsDialog = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setRollsDialogOpen(true);
  }, []);

  const handleCloseRollsDialog = useCallback(() => {
    setRollsDialogOpen(false);
  }, []);

  const handleSaveRolls = useCallback(
    (newRolls: DiceRoll[]) => {
      if (onUpdateRolls) {
        onUpdateRolls(spell, newRolls);
      }
    },
    [spell, onUpdateRolls]
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
          <Grid size={2}>
            <Stack direction='row' alignItems='center' spacing={0.5}>
              {spell.rolls && spell.rolls.length > 0 && (
                <Box onClick={(e) => e.stopPropagation()}>
                  <RollButton
                    rolls={spell.rolls}
                    iconOnly
                    size='small'
                    characterName={characterName}
                  />
                </Box>
              )}
              <Typography
                sx={{
                  flexShrink: 0,
                  fontWeight: 'semi-bold',
                  color: theme.palette.primary.main,
                  fontSize: '0.9rem',
                }}
              >
                {spell.nome} {spell.customKeyAttr && `(${spell.customKeyAttr})`}
              </Typography>
            </Stack>
          </Grid>
          {!isMobile && (
            <>
              <Grid size={2}>
                <Typography>{spell.school}</Typography>
              </Grid>
              <Grid size={2}>
                <Typography>{spell.execucao}</Typography>
              </Grid>
              <Grid size={2}>
                <Typography>{spell.alcance}</Typography>
              </Grid>
              <Grid size={2}>
                <Typography>{spell.alvo || spell.area || '-'}</Typography>
              </Grid>
              <Grid size={2}>
                <Typography>{spell.resistencia || '-'}</Typography>
              </Grid>
            </>
          )}
        </Grid>
      </AccordionSummary>
      <AccordionDetails>
        {onUpdateRolls && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <IconButton
              size='small'
              onClick={handleOpenRollsDialog}
              title='Configurar rolagens'
            >
              <Badge
                badgeContent={spell.rolls?.length || 0}
                color='primary'
                invisible={!spell.rolls || spell.rolls.length === 0}
              >
                <SettingsIcon fontSize='small' />
              </Badge>
            </IconButton>
          </Box>
        )}
        {isMobile && (
          <>
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
              <Grid size={12}>
                <Typography variant='caption' fontWeight='bold'>
                  Resistência:
                </Typography>
                <Typography>{spell.resistencia || '-'}</Typography>
              </Grid>
            </Grid>
          </>
        )}
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
                  {aprimoramento.addPm === 0
                    ? 'Truque:'
                    : `+${aprimoramento.addPm} PM:`}
                </strong>{' '}
                {aprimoramento.text}
              </Typography>
            ))}
          </div>
        )}
      </AccordionDetails>
      {onUpdateRolls && (
        <RollsEditDialog
          open={rollsDialogOpen}
          onClose={handleCloseRollsDialog}
          rolls={spell.rolls || []}
          onSave={handleSaveRolls}
          title={`Rolagens: ${spell.nome}`}
        />
      )}
    </Accordion>
  );
});

SpellRow.displayName = 'SpellRow';

export default SpellRow;
