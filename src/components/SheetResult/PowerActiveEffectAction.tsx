import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { ActivePowerUseDialog } from '@/premium/components/ActiveEffects';
import { ACTIVE_EFFECT_COLOR } from '@/premium/functions/activeEffectHighlights';
import type {
  ActivePowerDefinition,
  ActiveEffectUsageOption,
} from '@/premium/interfaces/ActiveEffect';

interface PowerActiveEffectActionProps {
  definition: ActivePowerDefinition;
  sheet: CharacterSheet;
  onActivate: (
    definition: ActivePowerDefinition,
    option: ActiveEffectUsageOption
  ) => void;
}

/**
 * Botão "Usar" exibido no cabeçalho do próprio poder ativo (mesmo padrão dos
 * poderes com rolagem). Abre o diálogo de tipos de uso.
 */
export default function PowerActiveEffectAction({
  definition,
  sheet,
  onActivate,
}: PowerActiveEffectActionProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title={`Usar ${definition.name}`}>
        <IconButton
          size='small'
          onClick={() => setOpen(true)}
          sx={{ color: ACTIVE_EFFECT_COLOR }}
        >
          <AutoAwesomeIcon fontSize='small' />
        </IconButton>
      </Tooltip>
      <ActivePowerUseDialog
        open={open}
        definition={definition}
        sheet={sheet}
        onClose={() => setOpen(false)}
        onConfirm={(option) => {
          onActivate(definition, option);
          setOpen(false);
        }}
      />
    </>
  );
}
