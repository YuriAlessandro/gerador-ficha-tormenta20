import React, { useMemo, useState } from 'react';
import { Badge, IconButton, Tooltip } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CharacterSheet from '@/interfaces/CharacterSheet';
import {
  getSheetSpellChoices,
  getSpellChoiceOptions,
  setSpellModifierChoices,
} from '@/functions/spells/modifiers';
import SpellChoiceDialog from './SpellsTab/SpellChoiceDialog';
import { spellChoiceNoun } from './SpellsTab/SpellChoiceEditor';

interface Props {
  /**
   * Chave da escolha (`ResolvedSpellChoice.key`): o nome do poder, ou
   * "<melhoria>@<id do item>" para melhoria de esotérico (Harmonizado).
   */
  choiceKey: string;
  instances: number;
  sheet: CharacterSheet;
  onSheetUpdate: (updatedSheet: CharacterSheet) => void;
}

/**
 * Botão "escolher magias" de um poder com `spellChoice` (Foco em Magia,
 * Aspecto da Primavera…). Com vaga sobrando, o botão leva um ponto de aviso.
 */
const PowerSpellChoiceAction: React.FC<Props> = ({
  choiceKey,
  instances,
  sheet,
  onSheetUpdate,
}) => {
  const [open, setOpen] = useState(false);

  const choice = useMemo(
    () => getSheetSpellChoices(sheet).find((c) => c.key === choiceKey),
    [sheet, choiceKey]
  );
  const options = useMemo(
    () => (choice ? getSpellChoiceOptions(sheet, choice) : []),
    [sheet, choice]
  );

  if (!choice) return null;

  const pending = choice.chosen.length < choice.max;
  const noun = spellChoiceNoun(choice.of, choice.max);
  const tooltip = pending
    ? `Escolher ${noun} (${choice.chosen.length}/${choice.max})`
    : `${noun.charAt(0).toUpperCase()}${noun.slice(1)}: ${choice.chosen.join(
        ', '
      )}`;

  return (
    <>
      <Tooltip title={tooltip}>
        <IconButton
          size='small'
          onClick={() => setOpen(true)}
          aria-label={`Escolher ${noun} de ${choice.source}`}
        >
          <Badge color='warning' variant='dot' invisible={!pending}>
            <AutoFixHighIcon fontSize='small' color='primary' />
          </Badge>
        </IconButton>
      </Tooltip>
      {open && (
        <SpellChoiceDialog
          open={open}
          onClose={() => setOpen(false)}
          choice={choice}
          options={options}
          picks={instances}
          onSave={(values) =>
            onSheetUpdate({
              ...sheet,
              spellModifierChoices: setSpellModifierChoices(
                sheet,
                choice.key,
                values
              ),
            })
          }
        />
      )}
    </>
  );
};

export default PowerSpellChoiceAction;
