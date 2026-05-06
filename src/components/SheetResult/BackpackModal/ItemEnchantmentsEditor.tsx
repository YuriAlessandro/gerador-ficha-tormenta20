import React, { useMemo } from 'react';
import {
  Autocomplete,
  Box,
  Chip,
  Grid,
  TextField,
  Typography,
} from '@mui/material';

import {
  armorEnchantments,
  weaponsEnchantments,
} from '../../../data/rewards/items';
import { ItemE } from '../../../interfaces/Rewards';
import {
  calculateEnchantmentCost,
  validateEnchantmentForItemType,
} from '../../../utils/magicalItemsValidation';
import {
  enchantmentEffects,
  TEXT_ONLY_ENCHANTMENTS,
} from '../../../functions/itemEnhancements/enchantmentEffects';

export type EnchantmentItemType = 'weapon' | 'armor' | 'shield';

export interface ItemEnchantmentsEditorProps {
  itemType: EnchantmentItemType;
  selectedEnchantments: ItemE[];
  onChange: (enchantments: ItemE[]) => void;
  disabled?: boolean;
  showCost?: boolean;
  maxCost?: number;
  onError?: (message: string) => void;
}

const DEFAULT_MAX_COST = 5;

function getEnchantmentsForType(itemType: EnchantmentItemType): ItemE[] {
  const base = itemType === 'weapon' ? weaponsEnchantments : armorEnchantments;
  return base.filter((e) => validateEnchantmentForItemType(e, itemType));
}

const ItemEnchantmentsEditor: React.FC<ItemEnchantmentsEditorProps> = ({
  itemType,
  selectedEnchantments,
  onChange,
  disabled = false,
  showCost = true,
  maxCost = DEFAULT_MAX_COST,
  onError,
}) => {
  const allEnchantments = useMemo(
    () => getEnchantmentsForType(itemType),
    [itemType]
  );

  const availableEnchantments = useMemo(
    () =>
      allEnchantments
        .filter(
          (ench) =>
            !selectedEnchantments.some(
              (sel) => sel.enchantment === ench.enchantment
            )
        )
        .sort((a, b) => a.enchantment.localeCompare(b.enchantment)),
    [allEnchantments, selectedEnchantments]
  );

  const handleSelectionChange = (
    _event: React.SyntheticEvent,
    value: ItemE[]
  ) => {
    const cost = calculateEnchantmentCost(value);
    if (cost > maxCost) {
      if (onError) {
        onError(
          `Muito caros! O custo total dos encantamentos não pode exceder ${maxCost} pontos.`
        );
      }
      return;
    }

    if (onError) onError('');
    onChange(value);
  };

  const totalCost = calculateEnchantmentCost(selectedEnchantments);

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Autocomplete
          multiple
          options={availableEnchantments}
          getOptionLabel={(option) => option.enchantment}
          value={selectedEnchantments}
          onChange={handleSelectionChange}
          renderInput={(params) => (
            <TextField
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...params}
              label='Encantamentos'
              placeholder='Selecione os encantamentos'
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const hasNumericEffect =
                enchantmentEffects[option.enchantment] !== undefined;
              return (
                <Chip
                  variant='outlined'
                  label={
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <span>
                        {option.enchantment}
                        {option.double ? ' (2 pts)' : ''}
                      </span>
                      {!hasNumericEffect && (
                        <Chip
                          size='small'
                          label='descritivo'
                          sx={{ height: 16, fontSize: '0.65rem' }}
                        />
                      )}
                    </Box>
                  }
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...getTagProps({ index })}
                />
              );
            })
          }
          renderOption={(props, option) => {
            const hasNumericEffect =
              enchantmentEffects[option.enchantment] !== undefined;
            const isTextOnly = TEXT_ONLY_ENCHANTMENTS.has(option.enchantment);
            return (
              <Box
                component='li'
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
              >
                <Box>
                  <Typography variant='body2'>
                    {option.enchantment}
                    {option.double && (
                      <Chip size='small' label='2 pts' sx={{ ml: 1 }} />
                    )}
                    {!hasNumericEffect && isTextOnly && (
                      <Chip
                        size='small'
                        label='descritivo'
                        variant='outlined'
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>
                  {option.effect && (
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ display: 'block', mb: 0.5 }}
                    >
                      {option.effect}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          }}
          disabled={disabled}
        />
      </Grid>

      {showCost && selectedEnchantments.length > 0 && (
        <Grid size={12}>
          <Typography variant='body2' color='text.secondary'>
            Custo total: {totalCost} / {maxCost} pontos
          </Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default ItemEnchantmentsEditor;
