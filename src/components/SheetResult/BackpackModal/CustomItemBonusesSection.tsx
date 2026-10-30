import React, { useState } from 'react';
import {
  Box,
  FormHelperText,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { SheetBonus, StatModifierTarget } from '@/interfaces/CharacterSheet';
import { equipGroup } from '@/interfaces/Equipment';
import { MAX_CUSTOM_POWER_BONUSES } from '@/functions/powers/customPowerBonuses';
import SheetBonusBuilder from '@/premium/components/Homebrew/SheetBonusBuilder';

/**
 * Mesmos alvos escondidos do poder personalizado — a poda é a mesma
 * (`sanitizeCustomItemBonuses`), ver a lista de permitidos em
 * `functions/powers/customPowerBonuses.ts`.
 */
const HIDDEN_CUSTOM_ITEM_TARGETS: StatModifierTarget['type'][] = [
  'TrainSkill',
  'Proficiency',
];

interface CustomItemBonusesSectionProps {
  group: equipGroup;
  value: SheetBonus[];
  onChange: (bonuses: SheetBonus[]) => void;
}

/**
 * Efeitos que um item criado na mochila aplica na ficha (+1 numa perícia,
 * dano extra…). Vestuário só vale vestido (`unwornClothingIds`); o resto vale
 * enquanto estiver na mochila — ver `applyEquipmentBonuses`.
 */
const CustomItemBonusesSection: React.FC<CustomItemBonusesSectionProps> = ({
  group,
  value,
  onChange,
}) => {
  const [advanced, setAdvanced] = useState(false);
  const overLimit = value.length > MAX_CUSTOM_POWER_BONUSES;

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          mb: 1,
        }}
      >
        <Typography variant='subtitle2'>Efeitos na ficha (opcional)</Typography>
        <ToggleButtonGroup
          size='small'
          exclusive
          value={advanced ? 'advanced' : 'basic'}
          onChange={(_e, next) => {
            if (next !== null) setAdvanced(next === 'advanced');
          }}
        >
          <ToggleButton value='basic'>Básico</ToggleButton>
          <ToggleButton value='advanced'>Avançado</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      <Typography
        variant='caption'
        sx={{ display: 'block', color: 'text.secondary', mb: 1.5 }}
      >
        {group === 'Vestuário'
          ? 'Valem enquanto a peça estiver vestida.'
          : 'Valem enquanto o item estiver na mochila.'}{' '}
        Perícia, atributo, Defesa, dano, PV, PM… No máximo{' '}
        {MAX_CUSTOM_POWER_BONUSES}.
      </Typography>
      <SheetBonusBuilder
        value={value}
        onChange={onChange}
        advanced={advanced}
        scaleBy='level'
        hiddenTargets={HIDDEN_CUSTOM_ITEM_TARGETS}
        allowPlayerChoice={false}
      />
      {overLimit && (
        <FormHelperText error sx={{ mt: 1 }}>
          No máximo {MAX_CUSTOM_POWER_BONUSES} efeitos por item — remova os
          excedentes para salvar.
        </FormHelperText>
      )}
    </Box>
  );
};

export default CustomItemBonusesSection;
