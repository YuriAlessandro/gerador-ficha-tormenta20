import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { rollDie } from '@/utils/diceRoller';
import { useContentSupplements } from '@/hooks/useContentSupplements';
import {
  PODER_CAPTURADO_FAILURE_PM,
  getPoderCapturadoDC,
} from '@/functions/powers/poderCapturado';
import { getPoderCapturadoDefinition } from '@/functions/powers/poderCapturadoEffects';
import { getUsurparCheckModifier } from '@/functions/spells/usurpar';
import { ACTIVE_EFFECT_COLOR } from '@/premium/functions/activeEffectHighlights';
import type {
  ActiveEffectUsageOption,
  ActivePowerDefinition,
} from '@/premium/interfaces/ActiveEffect';
import { useDiceRoll } from '@/premium/hooks/useDiceRoll';

interface PoderCapturadoActionProps {
  sheet: CharacterSheet;
  /** Abre o drawer de escolha dos pares deus + poder concedido. */
  onConfigure: () => void;
  /** Aplica o efeito ativo (sucesso no teste). */
  onActivate?: (
    definition: ActivePowerDefinition,
    option: ActiveEffectUsageOption
  ) => void;
  /** Grava a perda de PM da falha. */
  onSheetUpdate?: (updatedSheet: CharacterSheet) => void;
  characterName?: string;
}

/**
 * Ações do Poder Capturado no cabeçalho da habilidade: configurar as escolhas e
 * ativar uma delas.
 *
 * A ativação tem diálogo próprio (e não o `ActivePowerUseDialog` genérico)
 * porque a regra exige um teste de Enganação com CD crescente:
 * "gastar uma hora e fazer um teste de Enganação (CD é 20 +5 para cada uso
 * adicional no mesmo dia) (...) Se falhar, você perde 3 PM."
 *
 * O contador de usos do dia é local e NÃO é persistido: guardá-lo exigiria um
 * campo novo na ficha e uma integração com o descanso, e o jogador sabe quantas
 * vezes já tentou hoje.
 */
const PoderCapturadoAction: React.FC<PoderCapturadoActionProps> = ({
  sheet,
  onConfigure,
  onActivate,
  onSheetUpdate,
  characterName,
}) => {
  const supplements = useContentSupplements();
  const { showDiceResult } = useDiceRoll();

  const [open, setOpen] = useState(false);
  const [usesToday, setUsesToday] = useState(0);

  const definition = useMemo(
    () => getPoderCapturadoDefinition(sheet, supplements),
    [sheet, supplements]
  );
  const options = useMemo(
    () => definition?.getUsageOptions(sheet) ?? [],
    [definition, sheet]
  );

  const modifier = getUsurparCheckModifier(sheet);
  const dc = getPoderCapturadoDC(usesToday);

  const handleUse = (option: ActiveEffectUsageOption) => {
    const d20 = rollDie(20);
    const total = d20 + modifier;
    const success = total >= dc;

    showDiceResult(
      'Poder Capturado',
      [
        {
          label: `Enganação — CD ${dc}`,
          diceNotation: `1d20${modifier >= 0 ? '+' : ''}${modifier}`,
          rolls: [d20],
          modifier,
          total,
        },
      ],
      characterName,
      {
        kind: 'power',
        name: 'Poder Capturado',
        description: success
          ? `Sucesso: ${option.label}. Você conta como devoto desse deus até o fim do dia ou até usar novamente.`
          : `Falha: você perde ${PODER_CAPTURADO_FAILURE_PM} PM.`,
      }
    );

    if (success) {
      if (definition && onActivate) onActivate(definition, option);
    } else if (onSheetUpdate) {
      onSheetUpdate({
        ...sheet,
        currentPM: Math.max(
          0,
          (sheet.currentPM ?? 0) - PODER_CAPTURADO_FAILURE_PM
        ),
      });
    }

    setUsesToday((prev) => prev + 1);
    setOpen(false);
  };

  return (
    <>
      <Stack direction='row' spacing={0.5}>
        <Tooltip title='Escolher deuses e poderes capturados'>
          <IconButton
            size='small'
            onClick={onConfigure}
            aria-label='Escolher deuses e poderes capturados'
          >
            <SettingsIcon fontSize='small' color='primary' />
          </IconButton>
        </Tooltip>
        {options.length > 0 && onActivate && (
          <Tooltip title='Usar Poder Capturado'>
            <IconButton
              size='small'
              onClick={() => setOpen(true)}
              aria-label='Usar Poder Capturado'
              sx={{ color: ACTIVE_EFFECT_COLOR }}
            >
              <AutoAwesomeIcon fontSize='small' />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth='sm'
      >
        <DialogTitle>Usar Poder Capturado</DialogTitle>
        <DialogContent dividers>
          <Typography variant='body2' sx={{ color: 'text.secondary', mb: 2 }}>
            Você gasta uma hora e faz um teste de Enganação. Se passar, conta
            como devoto do deus escolhido e usa o poder concedido até o fim do
            dia ou até usar o Poder Capturado novamente. Se falhar, perde{' '}
            {PODER_CAPTURADO_FAILURE_PM} PM.
          </Typography>

          <Stack
            direction='row'
            spacing={1}
            sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 1 }}
          >
            <Typography variant='body2'>Usos hoje:</Typography>
            <IconButton
              size='small'
              onClick={() => setUsesToday((prev) => Math.max(0, prev - 1))}
              disabled={usesToday === 0}
              aria-label='Diminuir usos de hoje'
            >
              <RemoveIcon fontSize='small' />
            </IconButton>
            <Typography variant='body2'>{usesToday}</Typography>
            <IconButton
              size='small'
              onClick={() => setUsesToday((prev) => prev + 1)}
              aria-label='Aumentar usos de hoje'
            >
              <AddIcon fontSize='small' />
            </IconButton>
            <Chip size='small' color='primary' label={`CD ${dc}`} />
            <Chip
              size='small'
              variant='outlined'
              label={`1d20 ${modifier >= 0 ? '+' : '−'} ${Math.abs(modifier)}`}
            />
          </Stack>

          <Alert severity='info' sx={{ mb: 2 }}>
            O contador de usos não é salvo na ficha — ajuste-o para refletir
            quantas vezes você já tentou hoje.
          </Alert>

          <Box>
            <List dense disablePadding>
              {options.map((option) => (
                <ListItemButton
                  key={option.id}
                  onClick={() => handleUse(option)}
                >
                  <ListItemText
                    primary={option.label}
                    secondary={
                      option.bonuses.length === 0
                        ? 'Narrativo — sem bônus automatizáveis'
                        : `${option.bonuses.length} bônus aplicado(s)`
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PoderCapturadoAction;
