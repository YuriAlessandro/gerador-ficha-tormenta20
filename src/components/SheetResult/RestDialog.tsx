import React, { useState, useEffect, useMemo } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import CharacterSheet from '../../interfaces/CharacterSheet';
import {
  calculateRestRecovery,
  detectRestOptions,
  isCompanionImmuneToRestConditions,
  MANUAL_REST_OPTIONS,
  REST_CONDITIONS,
  RestCondition,
  RestOption,
} from '../../functions/restRecovery';

/**
 * O que o modal devolve são as ESCOLHAS, não o resultado.
 *
 * A recuperação exibida aqui é só prévia: limpar efeitos ativos muda os máximos
 * de PV/PM, então quem aplica o descanso recalcula a ficha primeiro e refaz a
 * conta com estes mesmos parâmetros. Mandar o número pronto criaria um segundo
 * valor de verdade, calculado contra máximos que já não valem.
 */
export interface RestConfirmConfig {
  clearActiveEffects: boolean;
  clearConditions: boolean;
  clearTemp: boolean;
  /** Índices em `sheet.companions` que devem descansar junto. */
  restingCompanionIndexes: number[];
  condition: RestCondition;
  outdoors: boolean;
  selectedOptions: RestOption[];
}

interface RestDialogProps {
  open: boolean;
  onClose: () => void;
  sheet: CharacterSheet;
  onConfirm: (config: RestConfirmConfig) => void;
}

const RestDialog: React.FC<RestDialogProps> = ({
  open,
  onClose,
  sheet,
  onConfirm,
}) => {
  const theme = useTheme();
  const isMobile = useMemo(() => window.innerWidth < 720, []);

  const [condition, setCondition] = useState<RestCondition>('normal');
  const [outdoors, setOutdoors] = useState(false);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [clearActiveEffects, setClearActiveEffects] = useState(false);
  const [clearConditions, setClearConditions] = useState(false);
  const [clearTemp, setClearTemp] = useState(false);
  const [restingCompanions, setRestingCompanions] = useState<number[]>([]);

  const detectedOptions = useMemo(
    () => (open ? detectRestOptions(sheet) : []),
    [open, sheet]
  );

  const activeEffectsCount = sheet.activeEffects?.length ?? 0;
  const conditionsCount = sheet.activeConditions?.length ?? 0;
  const tempTotal = (sheet.tempPV ?? 0) + (sheet.tempPM ?? 0);
  const companions = useMemo(() => sheet.companions ?? [], [sheet.companions]);

  /**
   * "Ao relento" não é um modificador por si só — pela regra, dormir ao relento
   * sem acampamento É a condição ruim, que o seletor acima já cobre. O checkbox
   * só existe para destravar habilidades que citam o relento explicitamente
   * (Vida Rústica, Descanso Natural). Sem nenhuma delas na ficha ele não muda
   * número nenhum, então não é exibido — controle morto confunde mais do que
   * informa.
   */
  const outdoorsDependent = useMemo(
    () => detectedOptions.filter((option) => option.requiresOutdoors),
    [detectedOptions]
  );

  // Re-semeia o rascunho a cada abertura: a ficha pode ter mudado entre um
  // descanso e outro (subiu de nível, ganhou poder, tomou dano).
  useEffect(() => {
    if (!open) return;
    setCondition('normal');
    setOutdoors(false);
    setCheckedIds(
      detectRestOptions(sheet)
        .filter((option) => option.defaultChecked)
        .map((option) => option.id)
    );
    setClearActiveEffects((sheet.activeEffects?.length ?? 0) > 0);
    setClearConditions((sheet.activeConditions?.length ?? 0) > 0);
    setClearTemp(false);
    setRestingCompanions((sheet.companions ?? []).map((_, index) => index));
  }, [open, sheet]);

  const selectedOptions = useMemo(
    () =>
      [...detectedOptions, ...MANUAL_REST_OPTIONS].filter((option) =>
        checkedIds.includes(option.id)
      ),
    [detectedOptions, checkedIds]
  );

  const maxPV = sheet.pv ?? 0;
  const maxPM = sheet.pm ?? 0;
  const currentPV = sheet.currentPV ?? maxPV;
  const currentPM = sheet.currentPM ?? maxPM;

  const preview = useMemo(
    () =>
      calculateRestRecovery({
        level: sheet.nivel,
        condition,
        outdoors,
        options: selectedOptions,
        currentPV,
        maxPV,
        currentPM,
        maxPM,
      }),
    [
      sheet.nivel,
      condition,
      outdoors,
      selectedOptions,
      currentPV,
      maxPV,
      currentPM,
      maxPM,
    ]
  );

  const toggleOption = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id]
    );
  };

  const toggleCompanion = (index: number) => {
    setRestingCompanions((prev) =>
      prev.includes(index)
        ? prev.filter((entry) => entry !== index)
        : [...prev, index]
    );
  };

  const hasExtras =
    (clearActiveEffects && activeEffectsCount > 0) ||
    (clearConditions && conditionsCount > 0) ||
    (clearTemp && tempTotal > 0) ||
    restingCompanions.length > 0;

  const nothingToDo = preview.pv === 0 && preview.pm === 0 && !hasExtras;

  const handleConfirm = () => {
    onConfirm({
      clearActiveEffects,
      clearConditions,
      clearTemp,
      restingCompanionIndexes: restingCompanions,
      condition,
      outdoors,
      selectedOptions,
    });
    onClose();
  };

  const renderOption = (option: RestOption) => {
    const blocked = Boolean(option.requiresOutdoors) && !outdoors;
    return (
      <Box key={option.id} sx={{ opacity: blocked ? 0.5 : 1 }}>
        <FormControlLabel
          control={
            <Checkbox
              size='small'
              checked={checkedIds.includes(option.id)}
              onChange={() => toggleOption(option.id)}
            />
          }
          label={
            <Stack
              direction='row'
              spacing={1}
              sx={{ alignItems: 'center', flexWrap: 'wrap' }}
            >
              <Typography variant='body2'>{option.label}</Typography>
              {option.sourceLabel && (
                <Chip
                  label={option.sourceLabel}
                  size='small'
                  variant='outlined'
                  sx={{ height: 18, fontSize: '0.65rem' }}
                />
              )}
              {blocked && (
                <Chip
                  label='só ao relento'
                  size='small'
                  color='warning'
                  variant='outlined'
                  sx={{ height: 18, fontSize: '0.65rem' }}
                />
              )}
            </Stack>
          }
          sx={{ alignItems: 'flex-start', mr: 0 }}
        />
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ display: 'block', ml: 4, mt: -0.5, mb: 1 }}
        >
          {option.description}
        </Typography>
      </Box>
    );
  };

  return (
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
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
            <BedtimeIcon fontSize='small' />
            <span>Descansar</span>
          </Stack>
          <IconButton size='small' onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant='caption' color='text.secondary'>
          Uma noite de descanso (pelo menos oito horas de sono) recupera PV e PM
          de acordo com seu nível e suas condições de descanso.
        </Typography>

        <Typography variant='subtitle2' sx={{ mt: 2, mb: 1 }}>
          Condição de descanso
        </Typography>
        <ToggleButtonGroup
          exclusive
          fullWidth
          value={condition}
          orientation={isMobile ? 'vertical' : 'horizontal'}
          onChange={(_event, value: RestCondition | null) => {
            if (value) setCondition(value);
          }}
          size='small'
        >
          {REST_CONDITIONS.map((entry) => (
            <ToggleButton key={entry.id} value={entry.id}>
              <Stack sx={{ alignItems: 'center', lineHeight: 1.2 }}>
                <Typography variant='body2' sx={{ fontWeight: 600 }}>
                  {entry.label}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {entry.hint}
                </Typography>
              </Stack>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ display: 'block', mt: 1 }}
        >
          {REST_CONDITIONS.find((entry) => entry.id === condition)?.description}
        </Typography>

        {outdoorsDependent.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  size='small'
                  checked={outdoors}
                  onChange={(event) => setOutdoors(event.target.checked)}
                />
              }
              label={
                <Typography variant='body2'>Dormindo ao relento</Typography>
              }
            />
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ display: 'block', ml: 4, mt: -0.5 }}
            >
              Destrava {outdoorsDependent.map((o) => o.label).join(' e ')} —{' '}
              {outdoorsDependent.length > 1
                ? 'habilidades suas que só valem'
                : 'habilidade sua que só vale'}{' '}
              quando você dorme sem abrigo.
            </Typography>
          </Box>
        )}

        {detectedOptions.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant='subtitle2' sx={{ mb: 1 }}>
              Detectado na sua ficha
            </Typography>
            {detectedOptions.map(renderOption)}
          </>
        )}

        <Accordion
          disableGutters
          elevation={0}
          sx={{ mt: 2, '&::before': { display: 'none' } }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
            <Typography variant='subtitle2'>Outros efeitos</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, pt: 0 }}>
            {MANUAL_REST_OPTIONS.map(renderOption)}
          </AccordionDetails>
        </Accordion>

        {(activeEffectsCount > 0 ||
          conditionsCount > 0 ||
          tempTotal > 0 ||
          companions.length > 0) && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant='subtitle2' sx={{ mb: 1 }}>
              Ao descansar, também
            </Typography>

            {activeEffectsCount > 0 && (
              <FormControlLabel
                control={
                  <Checkbox
                    size='small'
                    checked={clearActiveEffects}
                    onChange={(event) =>
                      setClearActiveEffects(event.target.checked)
                    }
                  />
                }
                label={
                  <Typography variant='body2'>
                    Limpar efeitos ativos ({activeEffectsCount})
                  </Typography>
                }
                sx={{ display: 'flex' }}
              />
            )}

            {conditionsCount > 0 && (
              <FormControlLabel
                control={
                  <Checkbox
                    size='small'
                    checked={clearConditions}
                    onChange={(event) =>
                      setClearConditions(event.target.checked)
                    }
                  />
                }
                label={
                  <Typography variant='body2'>
                    Limpar condições ativas ({conditionsCount})
                  </Typography>
                }
                sx={{ display: 'flex' }}
              />
            )}

            {tempTotal > 0 && (
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      size='small'
                      checked={clearTemp}
                      onChange={(event) => setClearTemp(event.target.checked)}
                    />
                  }
                  label={
                    <Typography variant='body2'>
                      Zerar PV/PM temporários ({sheet.tempPV ?? 0} PV,{' '}
                      {sheet.tempPM ?? 0} PM)
                    </Typography>
                  }
                  sx={{ display: 'flex' }}
                />
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ display: 'block', ml: 4, mt: -0.5 }}
                >
                  Pela regra, pontos temporários desaparecem no fim do dia.
                </Typography>
              </Box>
            )}

            {companions.map((companion, index) => (
              <FormControlLabel
                // eslint-disable-next-line react/no-array-index-key
                key={`companion-${index}`}
                control={
                  <Checkbox
                    size='small'
                    checked={restingCompanions.includes(index)}
                    onChange={() => toggleCompanion(index)}
                  />
                }
                label={
                  <Stack
                    direction='row'
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                  >
                    <Typography variant='body2'>
                      Descansar {companion.name || 'melhor amigo'}
                    </Typography>
                    {isCompanionImmuneToRestConditions(
                      companion.companionType
                    ) && (
                      <Chip
                        label='ignora condições'
                        size='small'
                        variant='outlined'
                        sx={{ height: 18, fontSize: '0.65rem' }}
                      />
                    )}
                  </Stack>
                }
                sx={{ display: 'flex' }}
              />
            ))}
          </>
        )}

        <Paper
          variant='outlined'
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: theme.palette.action.hover,
          }}
        >
          <Stack
            direction='row'
            spacing={3}
            sx={{ justifyContent: 'center', mb: 1 }}
          >
            <Stack sx={{ alignItems: 'center' }}>
              <Typography
                variant='h5'
                sx={{ fontWeight: 700, color: theme.palette.error.main }}
              >
                +{preview.pv}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                PV
              </Typography>
            </Stack>
            <Stack sx={{ alignItems: 'center' }}>
              <Typography
                variant='h5'
                sx={{ fontWeight: 700, color: theme.palette.info.main }}
              >
                +{preview.pm}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                PM
              </Typography>
            </Stack>
          </Stack>

          {(preview.pv < preview.rawPV || preview.pm < preview.rawPM) && (
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ display: 'block', textAlign: 'center' }}
            >
              Máximo já atingido — a recuperação cheia seria de {preview.rawPV}{' '}
              PV e {preview.rawPM} PM.
            </Typography>
          )}

          <Box sx={{ mt: 1 }}>
            {preview.steps.map((step) => (
              <Typography
                key={step}
                variant='caption'
                color='text.secondary'
                sx={{ display: 'block' }}
              >
                {step}
              </Typography>
            ))}
          </Box>
        </Paper>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant='contained'
          onClick={handleConfirm}
          disabled={nothingToDo}
          startIcon={<BedtimeIcon />}
        >
          Descansar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RestDialog;
