import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { ActivePowerUseDialog } from '@/premium/components/ActiveEffects';
import { ACTIVE_EFFECT_COLOR } from '@/premium/functions/activeEffectHighlights';
import type {
  ActivePowerDefinition,
  ActiveEffectUsageOption,
} from '@/premium/interfaces/ActiveEffect';
import type { CustomEffect } from '@/premium/interfaces/CustomEffect';
import { buildVirtualDefinitionFromCustomEffect } from '@/premium/data/activePowers/customEffectAdapter';

interface PowerCustomEffectsActionProps {
  powerName: string;
  customEffects: CustomEffect[];
  sheet: CharacterSheet;
  onActivate: (
    definition: ActivePowerDefinition,
    option: ActiveEffectUsageOption
  ) => void;
}

/**
 * Botão "Usar" para efeitos customizados criados pelo usuário num poder.
 * - 1 efeito: abre o diálogo de tiers direto.
 * - >1 efeitos: abre um menu para o usuário escolher qual efeito ativar; o
 *   diálogo de tiers abre em seguida.
 */
export default function PowerCustomEffectsAction({
  powerName,
  customEffects,
  sheet,
  onActivate,
}: PowerCustomEffectsActionProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [activeDefinition, setActiveDefinition] =
    useState<ActivePowerDefinition | null>(null);

  if (customEffects.length === 0) return null;

  const closeAll = () => {
    setActiveDefinition(null);
    setMenuAnchor(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (customEffects.length === 1) {
      setActiveDefinition(
        buildVirtualDefinitionFromCustomEffect(
          powerName,
          customEffects[0],
          sheet.nivel
        )
      );
      return;
    }
    setMenuAnchor(e.currentTarget);
  };

  const handlePickFromMenu = (effect: CustomEffect) => {
    setMenuAnchor(null);
    setActiveDefinition(
      buildVirtualDefinitionFromCustomEffect(powerName, effect, sheet.nivel)
    );
  };

  const tooltipLabel =
    customEffects.length === 1
      ? `Usar ${customEffects[0].name}`
      : 'Usar efeito customizado';

  return (
    <>
      <Tooltip title={tooltipLabel}>
        <IconButton
          size='small'
          onClick={handleClick}
          sx={{ color: ACTIVE_EFFECT_COLOR }}
        >
          <AutoAwesomeIcon fontSize='small' />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        {customEffects.map((effect) => (
          <MenuItem key={effect.id} onClick={() => handlePickFromMenu(effect)}>
            {effect.name}
          </MenuItem>
        ))}
      </Menu>
      <ActivePowerUseDialog
        open={activeDefinition !== null}
        definition={activeDefinition}
        sheet={sheet}
        onClose={closeAll}
        onConfirm={(option) => {
          if (activeDefinition) {
            onActivate(activeDefinition, option);
          }
          closeAll();
        }}
      />
    </>
  );
}
