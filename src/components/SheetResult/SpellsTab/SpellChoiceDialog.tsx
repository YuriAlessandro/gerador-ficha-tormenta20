import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import type {
  ResolvedSpellChoice,
  SpellChoiceOption,
} from '@/functions/spells/modifiers';
import SpellChoiceEditor, { spellChoiceNoun } from './SpellChoiceEditor';

interface SpellChoiceDialogProps {
  open: boolean;
  onClose: () => void;
  choice: ResolvedSpellChoice;
  options: SpellChoiceOption[];
  /** Vezes que o poder foi escolhido (só informativo). */
  picks?: number;
  onSave: (values: string[]) => void;
}

/** Diálogo da escolha de magias de um poder ou item (Foco em Magia…). */
const SpellChoiceDialog: React.FC<SpellChoiceDialogProps> = ({
  open,
  onClose,
  choice,
  options,
  picks,
  onSave,
}) => {
  const [draft, setDraft] = useState<string[]>(choice.chosen);

  useEffect(() => {
    if (open) setDraft(choice.chosen);
  }, [open, choice.chosen]);

  const noun = spellChoiceNoun(choice.of, choice.max);
  const repeated =
    picks && picks > 1
      ? ` Você tem este poder ${picks} vezes: uma ${spellChoiceNoun(
          choice.of,
          1
        )} diferente para cada.`
      : '';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='xs'>
      <DialogTitle>{choice.source}</DialogTitle>
      <DialogContent dividers>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 1.5 }}>
          Escolha até {choice.max} {noun}.{repeated}
        </Typography>
        <SpellChoiceEditor
          of={choice.of}
          options={options}
          max={choice.max}
          value={draft}
          onChange={setDraft}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant='contained'
          onClick={() => {
            onSave(draft);
            onClose();
          }}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SpellChoiceDialog;
