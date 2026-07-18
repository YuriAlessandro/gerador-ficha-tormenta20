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
  Tooltip,
  useTheme,
  Alert,
} from '@mui/material';
import { v4 as uuid } from 'uuid';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SettingsIcon from '@mui/icons-material/Settings';
import CasinoIcon from '@mui/icons-material/Casino';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { getActiveEffectForSpell } from '@/premium/data/activePowers';
import { ACTIVE_EFFECT_COLOR } from '@/premium/functions/activeEffectHighlights';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { DiceRoll } from '@/interfaces/DiceRoll';
import { executeMultipleDamageRolls } from '@/utils/diceRoller';
import {
  augmentSpellRolls,
  AprimoramentoSelection,
  AugmentedRoll,
} from '@/functions/spellRollAugmentation';
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
  tempPM?: number;
  onCast: (pmSpent: number, spell: Spell) => void;
  onUpdateRolls?: (spell: Spell, newRolls: DiceRoll[]) => void;
  characterName?: string;
}

const isStackable = (aprimoramento: Aprimoramento): boolean =>
  /^aumenta/i.test(aprimoramento.text);

const isTruque = (aprimoramento: Aprimoramento): boolean =>
  aprimoramento.trick === true;

// Remove os campos derivados do augment antes de semear o editor / persistir.
const toPlainRoll = (roll: DiceRoll): DiceRoll => ({
  id: roll.id,
  label: roll.label,
  dice: roll.dice,
  description: roll.description,
  damageType: roll.damageType,
});

const SpellCastDialog: React.FC<SpellCastDialogProps> = ({
  open,
  onClose,
  spell,
  currentPM,
  maxPM,
  tempPM,
  onCast,
  onUpdateRolls,
  characterName,
}) => {
  const theme = useTheme();
  const { showDiceResult } = useDiceRoll();
  const isMobile = useMemo(() => window.innerWidth < 720, []);

  // Indicador de que a magia possui um efeito ativo (será oferecido para
  // aplicar na ficha após confirmar o lançamento). Só exibido quando o
  // recurso de efeitos ativos está disponível, para não confundir.
  const { hasAccess: canUseActiveEffects } = useFeatureAccess('activeEffects');
  const activeEffectDef = useMemo(
    () => getActiveEffectForSpell(spell.nome),
    [spell.nome]
  );
  const showActiveEffectHint = canUseActiveEffects && !!activeEffectDef;

  const [selections, setSelections] = useState<Map<number, number>>(new Map());
  const [shouldSpendPM, setShouldSpendPM] = useState(true);
  const [baseRollsDialogOpen, setBaseRollsDialogOpen] = useState(false);
  const [overrideRollsDialogOpen, setOverrideRollsDialogOpen] = useState(false);
  const [localRolls, setLocalRolls] = useState<DiceRoll[]>([]);
  // Edição manual efêmera desta janela de lançamento. Quando definida,
  // sobrepõe as rolagens aumentadas automaticamente e NUNCA é persistida.
  const [overriddenRolls, setOverriddenRolls] = useState<DiceRoll[] | null>(
    null
  );
  const [selectedRollIds, setSelectedRollIds] = useState<Set<string>>(
    new Set()
  );

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

  const effectivePM = currentPM + (tempPM ?? 0);
  const insufficientPM = effectivePM < totalPMCost;

  // Aprimoramentos ativos, no formato consumido pelo motor de aumento.
  const activeSelections = useMemo<AprimoramentoSelection[]>(() => {
    const result: AprimoramentoSelection[] = [];
    selections.forEach((count, index) => {
      const aprimoramento = spell.aprimoramentos?.[index];
      if (aprimoramento && count > 0) {
        result.push({ aprimoramento, count });
      }
    });
    return result;
  }, [selections, spell.aprimoramentos]);

  // Rolagens aumentadas automaticamente pelos aprimoramentos ativos.
  const effectiveRolls = useMemo(
    () => augmentSpellRolls(localRolls, activeSelections),
    [localRolls, activeSelections]
  );

  // Rolagens exibidas/executadas: edição manual quando houver, senão o
  // aumento automático. Normalizadas para AugmentedRoll para simplificar o
  // render (a edição manual não é considerada "aumentada").
  const displayedRolls: AugmentedRoll[] = useMemo(
    () =>
      overriddenRolls
        ? overriddenRolls.map((roll) => ({
            ...roll,
            baseDice: roll.dice,
            isAugmented: false,
          }))
        : effectiveRolls,
    [overriddenRolls, effectiveRolls]
  );

  const hasDamageAugment = useMemo(
    () => effectiveRolls.some((roll) => roll.isAugmented),
    [effectiveRolls]
  );

  useEffect(() => {
    if (open) {
      setSelections(new Map());
      setShouldSpendPM(true);
      setOverriddenRolls(null);
      // Ensure all rolls have IDs
      const rollsWithIds = (spell.rolls || []).map((roll) => ({
        ...roll,
        id: roll.id || uuid(),
      }));
      setLocalRolls(rollsWithIds);
      // Select all rolls by default
      setSelectedRollIds(new Set(rollsWithIds.map((r) => r.id as string)));
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

  const handleToggleRoll = useCallback((rollId: string) => {
    setSelectedRollIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rollId)) {
        newSet.delete(rollId);
      } else {
        newSet.add(rollId);
      }
      return newSet;
    });
  }, []);

  const handleToggleAllRolls = useCallback(() => {
    const allIds = displayedRolls.map((r) => r.id as string).filter(Boolean);
    setSelectedRollIds((prev) =>
      prev.size === allIds.length ? new Set() : new Set(allIds)
    );
  }, [displayedRolls]);

  // Persiste a rolagem BASE da magia (via onUpdateRolls). Não confundir com a
  // edição manual efêmera.
  const handleSaveBaseRolls = useCallback(
    (newRolls: DiceRoll[]) => {
      const rollsWithIds = newRolls.map((roll) => ({
        ...roll,
        id: roll.id || uuid(),
      }));
      setLocalRolls(rollsWithIds);
      // Voltar ao automático: a rolagem base mudou, então descarta override.
      setOverriddenRolls(null);
      setSelectedRollIds(new Set(rollsWithIds.map((r) => r.id as string)));
      if (onUpdateRolls) {
        onUpdateRolls(spell, rollsWithIds);
      }
    },
    [onUpdateRolls, spell]
  );

  // Edição manual APENAS deste lançamento — não persiste na ficha.
  const handleSaveOverride = useCallback((newRolls: DiceRoll[]) => {
    const rollsWithIds = newRolls.map((roll) => ({
      ...roll,
      id: roll.id || uuid(),
    }));
    setOverriddenRolls(rollsWithIds);
    setSelectedRollIds(new Set(rollsWithIds.map((r) => r.id as string)));
  }, []);

  const handleResetOverride = useCallback(() => {
    setOverriddenRolls(null);
    setSelectedRollIds(
      new Set(effectiveRolls.map((r) => r.id as string).filter(Boolean))
    );
  }, [effectiveRolls]);

  const handleCast = useCallback(() => {
    // Executa somente as rolagens selecionadas (edição manual quando houver,
    // senão o aumento automático), suportando notação multi-grupo.
    const rollsToExecute = displayedRolls
      .filter((roll) => roll.id && selectedRollIds.has(roll.id))
      .map(toPlainRoll);

    if (rollsToExecute.length > 0) {
      const damageTypeById = new Map(
        rollsToExecute.map((roll) => [roll.id, roll.damageType])
      );
      const rollResults = executeMultipleDamageRolls(rollsToExecute);
      const rollGroups: RollGroup[] = rollResults.map((result) => ({
        label: result.label,
        diceNotation: result.dice,
        rolls: result.rolls,
        modifier: result.modifier,
        total: Math.max(1, result.total),
        damageType: damageTypeById.get(result.rollId),
      }));
      showDiceResult(spell.nome, rollGroups, characterName);
    }

    // Sempre repassa o lançamento (com 0 PM quando o jogador opta por não
    // gastar) para que o efeito ativo da magia, se houver, seja oferecido.
    onCast(shouldSpendPM ? totalPMCost : 0, spell);

    onClose();
  }, [
    displayedRolls,
    selectedRollIds,
    shouldSpendPM,
    totalPMCost,
    onCast,
    onClose,
    showDiceResult,
    spell,
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
            spacing={0.5}
            sx={{
              alignItems: 'center',
              mr: 1,
              flexShrink: 0,
            }}
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
              <Typography
                variant='caption'
                sx={{
                  color: 'text.secondary',
                }}
              >
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
            <Typography
              variant='caption'
              sx={{
                color: 'text.secondary',
              }}
            >
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
          <Stack
            direction='row'
            spacing={1}
            sx={{
              alignItems: 'center',
            }}
          >
            <CasinoIcon color='primary' />
            <Typography variant='h6' component='span'>
              {spell.nome}
            </Typography>
            {showActiveEffectHint && (
              <Tooltip title='Esta magia possui um efeito que poderá ser aplicado à sua ficha (e ofertado aos aliados da mesa) após confirmar o lançamento.'>
                <Chip
                  icon={<AutoAwesomeIcon />}
                  label='Efeito ativo'
                  size='small'
                  variant='outlined'
                  sx={{
                    color: ACTIVE_EFFECT_COLOR,
                    borderColor: ACTIVE_EFFECT_COLOR,
                    '& .MuiChip-icon': { color: ACTIVE_EFFECT_COLOR },
                  }}
                />
              </Tooltip>
            )}
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Box>
              <Typography
                variant='subtitle2'
                sx={{
                  color: 'text.secondary',
                }}
              >
                {spell.spellCircle}
              </Typography>
              <Stack
                direction='row'
                spacing={2}
                sx={{
                  alignItems: 'center',
                }}
              >
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

            {showActiveEffectHint && (
              <Alert
                icon={<AutoAwesomeIcon sx={{ color: ACTIVE_EFFECT_COLOR }} />}
                variant='outlined'
                sx={{
                  borderColor: ACTIVE_EFFECT_COLOR,
                  '& .MuiAlert-message': { color: 'text.primary' },
                }}
              >
                <Typography
                  variant='body2'
                  sx={{
                    fontWeight: 'bold',
                  }}
                >
                  Efeito ativo disponível
                </Typography>
                <Typography
                  variant='caption'
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  {activeEffectDef?.description ??
                    'Após confirmar o lançamento, você poderá aplicar o efeito desta magia na ficha.'}{' '}
                  Ao confirmar o lançamento, será perguntado se deseja aplicá-lo
                  (e ofertá-lo aos aliados da mesa).
                </Typography>
              </Alert>
            )}

            <Divider />

            <Box>
              <Typography
                variant='subtitle1'
                sx={{
                  fontWeight: 'bold',
                  mb: 1,
                }}
              >
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
                    sx={{
                      fontWeight: 'bold',
                      mb: 1,
                    }}
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
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography
                  variant='subtitle1'
                  sx={{
                    fontWeight: 'bold',
                  }}
                >
                  Dano a rolar
                </Typography>
                <Stack direction='row' spacing={1}>
                  {displayedRolls.length > 1 && (
                    <Button size='small' onClick={handleToggleAllRolls}>
                      {selectedRollIds.size === displayedRolls.length
                        ? 'Desmarcar todas'
                        : 'Selecionar todas'}
                    </Button>
                  )}
                  {displayedRolls.length > 0 && (
                    <Button
                      size='small'
                      startIcon={<AutoFixHighIcon />}
                      onClick={() => setOverrideRollsDialogOpen(true)}
                    >
                      Ajustar
                    </Button>
                  )}
                </Stack>
              </Stack>

              {overriddenRolls && (
                <Stack
                  direction='row'
                  spacing={1}
                  sx={{ alignItems: 'center', mb: 1, flexWrap: 'wrap' }}
                >
                  <Chip
                    icon={<AutoFixHighIcon />}
                    label='Edição manual'
                    size='small'
                    color='warning'
                    variant='outlined'
                  />
                  <Button
                    size='small'
                    startIcon={<RestartAltIcon />}
                    onClick={handleResetOverride}
                  >
                    Voltar ao automático
                  </Button>
                </Stack>
              )}

              {overriddenRolls && hasDamageAugment && (
                <Typography
                  variant='caption'
                  sx={{ display: 'block', color: 'text.secondary', mb: 1 }}
                >
                  Aprimoramentos não aplicados à rolagem (edição manual ativa).
                </Typography>
              )}

              {displayedRolls.length > 0 ? (
                <Stack spacing={0.5}>
                  {displayedRolls.map((roll) => (
                    <Box
                      key={roll.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1,
                        bgcolor: selectedRollIds.has(roll.id as string)
                          ? 'action.selected'
                          : 'action.hover',
                        borderRadius: 1,
                        cursor: 'pointer',
                      }}
                      onClick={() => roll.id && handleToggleRoll(roll.id)}
                    >
                      <Checkbox
                        checked={selectedRollIds.has(roll.id as string)}
                        size='small'
                        sx={{ p: 0, mr: 1 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Stack
                          direction='row'
                          spacing={1}
                          sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                        >
                          <Typography variant='body2'>
                            <strong>{roll.label}:</strong>{' '}
                            <strong
                              style={{
                                color: roll.isAugmented
                                  ? theme.palette.primary.main
                                  : undefined,
                              }}
                            >
                              {roll.dice}
                            </strong>
                          </Typography>
                          {roll.isAugmented && (
                            <Chip
                              label={`${roll.baseDice} ${
                                roll.addedSummary ?? ''
                              }`.trim()}
                              size='small'
                              color='primary'
                              variant='outlined'
                            />
                          )}
                        </Stack>
                        {roll.description && (
                          <Typography
                            variant='caption'
                            sx={{
                              color: 'text.secondary',
                            }}
                          >
                            {roll.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography
                  variant='body2'
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  Nenhuma rolagem configurada
                </Typography>
              )}

              {displayedRolls.length > 0 && selectedRollIds.size === 0 && (
                <Alert severity='warning' sx={{ mt: 1 }}>
                  Selecione pelo menos uma rolagem para executar
                </Alert>
              )}

              {onUpdateRolls && (
                <Button
                  size='small'
                  startIcon={<SettingsIcon />}
                  onClick={() => setBaseRollsDialogOpen(true)}
                  sx={{ mt: 1 }}
                >
                  Configurar rolagens base
                </Button>
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
                label={`Gastar PM (PM Atual: ${effectivePM}/${maxPM}${
                  tempPM ? ` [+${tempPM} temp]` : ''
                })`}
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

      {/* Edição manual efêmera (apenas deste lançamento) */}
      <RollsEditDialog
        open={overrideRollsDialogOpen}
        onClose={() => setOverrideRollsDialogOpen(false)}
        rolls={displayedRolls.map(toPlainRoll)}
        onSave={handleSaveOverride}
        title={`Ajustar rolagem: ${spell.nome}`}
      />

      {/* Edição persistente da rolagem base da magia */}
      {onUpdateRolls && (
        <RollsEditDialog
          open={baseRollsDialogOpen}
          onClose={() => setBaseRollsDialogOpen(false)}
          rolls={localRolls}
          onSave={handleSaveBaseRolls}
          title={`Rolagens base: ${spell.nome}`}
        />
      )}
    </>
  );
};

export default SpellCastDialog;
