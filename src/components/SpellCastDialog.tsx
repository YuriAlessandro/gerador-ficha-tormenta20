import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  Stack,
  Divider,
  Chip,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SettingsIcon from '@mui/icons-material/Settings';
import CasinoIcon from '@mui/icons-material/Casino';
import { DiceRoll } from '@/interfaces/DiceRoll';
import { executeMultipleDiceRolls } from '@/utils/diceRoller';
import { Spell, Aprimoramento } from '../interfaces/Spells';
import { manaExpenseByCircle } from '../data/systems/tormenta20/magias/generalSpells';
import { useDiceRoll } from '../premium/hooks/useDiceRoll';
import { RollGroup } from '../premium/services/socket.service';
import RollsEditDialog from './RollsEditDialog';

interface SpellCastDialogProps {
  open: boolean;
  onClose: () => void;
  spell: Spell;
  currentPM: number;
  maxPM: number;
  onCast: (pmSpent: number) => void;
  onUpdateRolls?: (spell: Spell, newRolls: DiceRoll[]) => void;
  characterName?: string;
}

const isStackable = (aprimoramento: Aprimoramento): boolean =>
  /^aumenta/i.test(aprimoramento.text);

const isTruque = (aprimoramento: Aprimoramento): boolean =>
  aprimoramento.addPm === 0;

const SpellCastDialog: React.FC<SpellCastDialogProps> = ({
  open,
  onClose,
  spell,
  currentPM,
  maxPM,
  onCast,
  onUpdateRolls,
  characterName,
}) => {
  const theme = useTheme();
  const { showDiceResult } = useDiceRoll();
  const isMobile = useMemo(() => window.innerWidth < 720, []);

  const [selections, setSelections] = useState<Map<number, number>>(new Map());
  const [shouldSpendPM, setShouldSpendPM] = useState(true);
  const [rollsDialogOpen, setRollsDialogOpen] = useState(false);
  const [localRolls, setLocalRolls] = useState<DiceRoll[]>([]);

  const basePM = useMemo(
    () => spell.manaExpense ?? manaExpenseByCircle[spell.spellCircle],
    [spell.manaExpense, spell.spellCircle]
  );

  const manaReduction = spell.manaReduction ?? 0;

  const effectiveBasePM = useMemo(
    () => Math.max(0, basePM - manaReduction),
    [basePM, manaReduction]
  );

  const hasTruqueSelected = useMemo(() => {
    let found = false;
    selections.forEach((count, index) => {
      const aprimoramento = spell.aprimoramentos?.[index];
      if (aprimoramento && count > 0 && isTruque(aprimoramento)) {
        found = true;
      }
    });
    return found;
  }, [selections, spell.aprimoramentos]);

  const hasNonTruqueSelected = useMemo(() => {
    let found = false;
    selections.forEach((count, index) => {
      const aprimoramento = spell.aprimoramentos?.[index];
      if (aprimoramento && count > 0 && !isTruque(aprimoramento)) {
        found = true;
      }
    });
    return found;
  }, [selections, spell.aprimoramentos]);

  const aprimoramentoCost = useMemo(() => {
    let total = 0;
    selections.forEach((count, index) => {
      const aprimoramento = spell.aprimoramentos?.[index];
      if (aprimoramento && count > 0) {
        total += aprimoramento.addPm * count;
      }
    });
    return total;
  }, [selections, spell.aprimoramentos]);

  const totalPMCost = useMemo(() => {
    if (hasTruqueSelected) {
      return 0;
    }
    return effectiveBasePM + aprimoramentoCost;
  }, [effectiveBasePM, aprimoramentoCost, hasTruqueSelected]);

  const insufficientPM = currentPM < totalPMCost;

  useEffect(() => {
    if (open) {
      setSelections(new Map());
      setShouldSpendPM(true);
      setLocalRolls(spell.rolls || []);
    }
  }, [open, spell.rolls]);

  const handleAprimoramentoToggle = useCallback((index: number) => {
    setSelections((prev) => {
      const newSelections = new Map(prev);
      const currentCount = newSelections.get(index) || 0;
      if (currentCount > 0) {
        newSelections.delete(index);
      } else {
        newSelections.set(index, 1);
      }
      return newSelections;
    });
  }, []);

  const handleStackableIncrement = useCallback((index: number) => {
    setSelections((prev) => {
      const newSelections = new Map(prev);
      const currentCount = newSelections.get(index) || 0;
      newSelections.set(index, currentCount + 1);
      return newSelections;
    });
  }, []);

  const handleStackableDecrement = useCallback((index: number) => {
    setSelections((prev) => {
      const newSelections = new Map(prev);
      const currentCount = newSelections.get(index) || 0;
      if (currentCount > 1) {
        newSelections.set(index, currentCount - 1);
      } else {
        newSelections.delete(index);
      }
      return newSelections;
    });
  }, []);

  const handleOpenRollsDialog = useCallback(() => {
    setRollsDialogOpen(true);
  }, []);

  const handleCloseRollsDialog = useCallback(() => {
    setRollsDialogOpen(false);
  }, []);

  const handleSaveRolls = useCallback(
    (newRolls: DiceRoll[]) => {
      setLocalRolls(newRolls);
      if (onUpdateRolls) {
        onUpdateRolls(spell, newRolls);
      }
    },
    [onUpdateRolls, spell]
  );

  const handleCast = useCallback(() => {
    if (localRolls.length > 0) {
      const rollResults = executeMultipleDiceRolls(localRolls);
      const rollGroups: RollGroup[] = rollResults.map((result) => ({
        label: result.label,
        diceNotation: result.dice,
        rolls: result.rolls,
        modifier: result.modifier,
        total: Math.max(1, result.total),
      }));
      showDiceResult(spell.nome, rollGroups, characterName);
    }

    if (shouldSpendPM && totalPMCost > 0) {
      onCast(totalPMCost);
    }

    onClose();
  }, [
    localRolls,
    shouldSpendPM,
    totalPMCost,
    onCast,
    onClose,
    showDiceResult,
    spell.nome,
    characterName,
  ]);

  const renderAprimoramento = (
    aprimoramento: Aprimoramento,
    index: number
  ): React.ReactNode => {
    const count = selections.get(index) || 0;
    const stackable = isStackable(aprimoramento);
    const thisTruque = isTruque(aprimoramento);
    const costText = thisTruque ? 'Truque' : `+${aprimoramento.addPm} PM`;

    // Truques cannot be combined with other aprimoramentos
    const isDisabled = thisTruque ? hasNonTruqueSelected : hasTruqueSelected;

    if (stackable) {
      return (
        <Box
          key={`${aprimoramento.addPm}-${aprimoramento.text.substring(0, 20)}`}
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            mb: 1.5,
            p: 1,
            borderRadius: 1,
            bgcolor: count > 0 ? 'action.selected' : 'transparent',
            opacity: isDisabled ? 0.5 : 1,
          }}
        >
          <Stack
            direction='row'
            alignItems='center'
            spacing={0.5}
            sx={{ mr: 1, flexShrink: 0 }}
          >
            <IconButton
              size='small'
              onClick={() => handleStackableDecrement(index)}
              disabled={count === 0 || isDisabled}
            >
              <RemoveIcon fontSize='small' />
            </IconButton>
            <Typography
              sx={{
                minWidth: 24,
                textAlign: 'center',
                fontWeight: 'bold',
              }}
            >
              {count}
            </Typography>
            <IconButton
              size='small'
              onClick={() => handleStackableIncrement(index)}
              disabled={isDisabled}
            >
              <AddIcon fontSize='small' />
            </IconButton>
          </Stack>
          <Box sx={{ flex: 1 }}>
            <Typography variant='body2'>
              <strong style={{ color: theme.palette.primary.main }}>
                {count > 0 ? `${count}× (${costText})` : costText}:
              </strong>{' '}
              {aprimoramento.text}
            </Typography>
            {count > 0 && aprimoramento.addPm > 0 && (
              <Typography variant='caption' color='text.secondary'>
                Total: +{aprimoramento.addPm * count} PM
              </Typography>
            )}
          </Box>
        </Box>
      );
    }

    return (
      <Box
        key={`${aprimoramento.addPm}-${aprimoramento.text.substring(0, 20)}`}
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          mb: 1,
          p: 1,
          borderRadius: 1,
          bgcolor: count > 0 ? 'action.selected' : 'transparent',
          opacity: isDisabled ? 0.5 : 1,
        }}
      >
        <Checkbox
          checked={count > 0}
          onChange={() => handleAprimoramentoToggle(index)}
          size='small'
          disabled={isDisabled}
          sx={{ p: 0, mr: 1 }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography variant='body2'>
            <strong style={{ color: theme.palette.primary.main }}>
              {costText}:
            </strong>{' '}
            {aprimoramento.text}
          </Typography>
          {thisTruque && count > 0 && (
            <Typography variant='caption' color='text.secondary'>
              Truques não podem ser combinados com outros aprimoramentos
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth='sm'
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Stack direction='row' alignItems='center' spacing={1}>
            <CasinoIcon color='primary' />
            <Typography variant='h6' component='span'>
              {spell.nome}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Box>
              <Typography variant='subtitle2' color='text.secondary'>
                {spell.spellCircle}
              </Typography>
              <Stack direction='row' spacing={2} alignItems='center'>
                <Typography>
                  <strong>Custo Base:</strong> {basePM} PM
                </Typography>
                {manaReduction > 0 && (
                  <Chip
                    label={`-${manaReduction} PM (redução)`}
                    size='small'
                    color='success'
                    variant='outlined'
                  />
                )}
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant='subtitle1' fontWeight='bold' sx={{ mb: 1 }}>
                Descrição
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  maxHeight: 150,
                  overflow: 'auto',
                  bgcolor: 'action.hover',
                  p: 1.5,
                  borderRadius: 1,
                }}
              >
                {spell.description}
              </Typography>
            </Box>

            {spell.aprimoramentos && spell.aprimoramentos.length > 0 && (
              <>
                <Divider />
                <Box>
                  <Typography
                    variant='subtitle1'
                    fontWeight='bold'
                    sx={{ mb: 1 }}
                  >
                    Aprimoramentos
                  </Typography>
                  {spell.aprimoramentos.map((apr, idx) =>
                    renderAprimoramento(apr, idx)
                  )}
                </Box>
              </>
            )}

            <Divider />

            <Box>
              <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='center'
                sx={{ mb: 1 }}
              >
                <Typography variant='subtitle1' fontWeight='bold'>
                  Rolagens
                </Typography>
                {onUpdateRolls && (
                  <Button
                    size='small'
                    startIcon={<SettingsIcon />}
                    onClick={handleOpenRollsDialog}
                  >
                    Configurar
                  </Button>
                )}
              </Stack>
              {localRolls.length > 0 ? (
                <Stack spacing={0.5}>
                  {localRolls.map((roll, idx) => (
                    <Typography
                      key={roll.id || idx}
                      variant='body2'
                      sx={{
                        p: 1,
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                      }}
                    >
                      <strong>{roll.label}:</strong> {roll.dice}
                      {roll.description && (
                        <Typography
                          component='span'
                          variant='caption'
                          color='text.secondary'
                          sx={{ ml: 1 }}
                        >
                          ({roll.description})
                        </Typography>
                      )}
                    </Typography>
                  ))}
                </Stack>
              ) : (
                <Typography variant='body2' color='text.secondary'>
                  Nenhuma rolagem configurada
                </Typography>
              )}
            </Box>

            <Divider />

            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={shouldSpendPM}
                    onChange={(e) => setShouldSpendPM(e.target.checked)}
                  />
                }
                label={`Gastar PM (PM Atual: ${currentPM}/${maxPM})`}
              />
              {insufficientPM && (
                <Typography variant='body2' color='error'>
                  {insufficientPM && ' (PM insuficiente!)'}
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            variant='contained'
            onClick={handleCast}
            startIcon={<CasinoIcon />}
            color={insufficientPM && shouldSpendPM ? 'warning' : 'primary'}
          >
            Usar magia com {totalPMCost} PM
          </Button>
        </DialogActions>
      </Dialog>

      {onUpdateRolls && (
        <RollsEditDialog
          open={rollsDialogOpen}
          onClose={handleCloseRollsDialog}
          rolls={localRolls}
          onSave={handleSaveRolls}
          title={`Rolagens: ${spell.nome}`}
        />
      )}
    </>
  );
};

export default SpellCastDialog;
