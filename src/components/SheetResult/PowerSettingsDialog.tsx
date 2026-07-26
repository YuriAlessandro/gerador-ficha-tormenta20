import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { DiceRoll } from '@/interfaces/DiceRoll';
import type CharacterSheet from '@/interfaces/CharacterSheet';
import type { CustomEffect } from '@/premium/interfaces/CustomEffect';
import { getActivePowerForSheetEntry } from '@/premium/data/activePowers';
import {
  CustomEffectsList,
  PrecannedEffectView,
} from '@/premium/components/CustomEffectsEditor';
import RollsEditorPanel from '../RollsEditorPanel';

interface PowerSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  powerName: string;
  className?: string;
  rolls: DiceRoll[];
  customEffects: CustomEffect[];
  sheet: CharacterSheet;
  onRollsChange: (rolls: DiceRoll[]) => void;
  onCustomEffectsChange: (effects: CustomEffect[]) => void;
  /** Override de nome já salvo na ficha (ausente = usa o nome do livro). */
  customName?: string;
  /** Override de texto já salvo na ficha (ausente = usa o texto do livro). */
  customDescription?: string;
  /** Texto canônico do poder, usado para pré-preencher e para restaurar. */
  defaultText?: string;
  /** Ausente = a aba "Exibição" não aparece (ficha só-leitura). */
  onDisplayChange?: (customName?: string, customDescription?: string) => void;
}

type DialogTab = 0 | 1 | 2;

/**
 * Dialog de configurações do poder expandido. Substitui o uso direto de
 * `RollsEditDialog` no `PowerDisplay`, oferecendo três abas:
 *
 * - "Rolagens": configura rolagens de dados do poder (label + notação).
 * - "Efeitos": configura efeitos customizados (tiers + bônus) que aparecem
 *   no gerenciador de Efeitos Ativos. Quando o poder tem efeito pré-canned
 *   no registry `ACTIVE_POWERS`, exibe apenas o efeito read-only.
 * - "Exibição": nome e texto customizados pelo jogador. Só afetam a exibição —
 *   `power.name` continua sendo a identidade do poder em todo o resto do app.
 *
 * As três abas persistem on-change — não há botão de Salvar.
 */
const PowerSettingsDialog: React.FC<PowerSettingsDialogProps> = ({
  open,
  onClose,
  title,
  powerName,
  className,
  rolls,
  customEffects,
  sheet,
  onRollsChange,
  onCustomEffectsChange,
  customName,
  customDescription,
  defaultText,
  onDisplayChange,
}) => {
  const [tab, setTab] = useState<DialogTab>(0);
  const [nameDraft, setNameDraft] = useState(customName ?? '');
  const [textDraft, setTextDraft] = useState(
    customDescription ?? defaultText ?? ''
  );

  // Recarrega os rascunhos ao ABRIR (ou ao trocar de poder). Não depende dos
  // overrides salvos de propósito: reagir a cada gravação faria o campo brigar
  // com o que está sendo digitado.
  useEffect(() => {
    if (!open) return;
    setNameDraft(customName ?? '');
    setTextDraft(customDescription ?? defaultText ?? '');
  }, [open, powerName]);

  const precannedDef = useMemo(
    () => getActivePowerForSheetEntry(className, powerName),
    [className, powerName]
  );

  let effectsBadgeSuffix = '';
  if (precannedDef) {
    effectsBadgeSuffix = ' (auto)';
  } else if (customEffects.length > 0) {
    effectsBadgeSuffix = ` (${customEffects.length})`;
  }

  // Campo vazio (ou igual ao texto do livro) é AUSÊNCIA de override, nunca
  // string vazia: limpar o campo é a mesma coisa que "Restaurar padrão".
  // A gravação acontece no blur — persistir a cada tecla salvaria a ficha
  // inteira dezenas de vezes e faria o campo brigar com o texto digitado.
  const commitDisplay = (nextName: string, nextText: string) => {
    if (!onDisplayChange) return;
    const trimmedName = nextName.trim();
    const trimmedText = nextText.trim();
    const isDefaultText =
      !trimmedText || trimmedText === (defaultText ?? '').trim();
    onDisplayChange(
      trimmedName || undefined,
      isDefaultText ? undefined : nextText
    );
  };

  const handleResetName = () => {
    setNameDraft('');
    commitDisplay('', textDraft);
  };

  const handleResetText = () => {
    const original = defaultText ?? '';
    setTextDraft(original);
    commitDisplay(nameDraft, original);
  };

  // Fechar com Esc não dispara o blur do campo, então o commit vem junto.
  const handleClose = () => {
    commitDisplay(nameDraft, textDraft);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <Tabs
        value={tab}
        onChange={(_e, v: DialogTab) => setTab(v)}
        variant='fullWidth'
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label={`Rolagens${rolls.length ? ` (${rolls.length})` : ''}`} />
        <Tab label={`Efeitos${effectsBadgeSuffix}`} />
        {onDisplayChange && <Tab label='Exibição' />}
      </Tabs>
      <DialogContent dividers>
        {tab === 0 && (
          <RollsEditorPanel rolls={rolls} onChange={onRollsChange} />
        )}
        {tab === 1 && (
          <Box>
            {precannedDef ? (
              <PrecannedEffectView definition={precannedDef} sheet={sheet} />
            ) : (
              <CustomEffectsList
                effects={customEffects}
                onChange={onCustomEffectsChange}
              />
            )}
          </Box>
        )}
        {tab === 2 && onDisplayChange && (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Box>
              <TextField
                label='Nome personalizado'
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={() => commitDisplay(nameDraft, textDraft)}
                placeholder={powerName}
                helperText={`Padrão: ${powerName}`}
                fullWidth
                size='small'
              />
              <Button
                size='small'
                onClick={handleResetName}
                disabled={!nameDraft.trim()}
                sx={{ mt: 0.5 }}
              >
                Restaurar padrão
              </Button>
            </Box>

            <Box>
              <TextField
                label='Texto personalizado'
                value={textDraft}
                onChange={(e) => setTextDraft(e.target.value)}
                onBlur={() => commitDisplay(nameDraft, textDraft)}
                multiline
                minRows={4}
                maxRows={12}
                fullWidth
                size='small'
              />
              <Button
                size='small'
                onClick={handleResetText}
                disabled={textDraft.trim() === (defaultText ?? '').trim()}
                sx={{ mt: 0.5 }}
              >
                Restaurar padrão
              </Button>
            </Box>

            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              Use para anotar em que nível pegou o poder, um acordo com o mestre
              ou uma variação da regra. O nome original continua valendo para
              pré-requisitos, rolagens e busca — um texto personalizado, porém,
              deixa de receber correções do livro.
            </Typography>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant='contained'>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PowerSettingsDialog;
