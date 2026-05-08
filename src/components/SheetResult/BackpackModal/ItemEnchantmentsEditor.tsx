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
import { TORMENTA20_SYSTEM } from '../../../data/systems/tormenta20';
import { ItemE } from '../../../interfaces/Rewards';
import {
  SUPPLEMENT_METADATA,
  SupplementId,
} from '../../../types/supplement.types';
import {
  calculateEnchantmentCost,
  validateEnchantmentForItemType,
} from '../../../utils/magicalItemsValidation';
import {
  enchantmentEffects,
  TEXT_ONLY_ENCHANTMENTS,
} from '../../../functions/itemEnhancements/enchantmentEffects';
import { allArcaneSpellsUpToCircle } from '../../../data/systems/tormenta20/magias/arcane';
import { allDivineSpellsUpToCircle } from '../../../data/systems/tormenta20/magias/divine';

export type EnchantmentItemType = 'weapon' | 'armor' | 'shield';

export interface ItemEnchantmentsEditorProps {
  itemType: EnchantmentItemType;
  selectedEnchantments: ItemE[];
  onChange: (enchantments: ItemE[]) => void;
  userSupplements: SupplementId[];
  disabled?: boolean;
  showCost?: boolean;
  maxCost?: number;
  onError?: (message: string) => void;
  /** Spell name selected for the Conjuradora enchantment, when present. */
  selectedSpell?: string;
  onSelectedSpellChange?: (spell: string) => void;
}

/**
 * All known spells (arcane up to 5th circle ∪ divine up to 5th circle), deduped
 * by name so the Conjuradora picker shows each spell once.
 */
function buildAllSpellsList(): { name: string }[] {
  const arcane = allArcaneSpellsUpToCircle(5);
  const divine = allDivineSpellsUpToCircle(5);
  const seen = new Set<string>();
  const result: { name: string }[] = [];
  [...arcane, ...divine].forEach((s) => {
    if (!seen.has(s.nome)) {
      seen.add(s.nome);
      result.push({ name: s.nome });
    }
  });
  return result.sort((a, b) => a.name.localeCompare(b.name));
}

const DEFAULT_MAX_COST = 5;

function getEnchantmentsForType(
  itemType: EnchantmentItemType,
  userSupplements: SupplementId[]
): ItemE[] {
  const base = itemType === 'weapon' ? weaponsEnchantments : armorEnchantments;

  const supplementEnchantments: ItemE[] = [];
  userSupplements.forEach((supplementId) => {
    const supplement = TORMENTA20_SYSTEM.supplements[supplementId];
    if (supplement?.enchantments) {
      const toAdd =
        itemType === 'weapon'
          ? supplement.enchantments.weapons || []
          : supplement.enchantments.armors || [];
      supplementEnchantments.push(...toAdd);
    }
  });

  return [...base, ...supplementEnchantments].filter((e) =>
    validateEnchantmentForItemType(e, itemType)
  );
}

const ItemEnchantmentsEditor: React.FC<ItemEnchantmentsEditorProps> = ({
  itemType,
  selectedEnchantments,
  onChange,
  userSupplements,
  disabled = false,
  showCost = true,
  maxCost = DEFAULT_MAX_COST,
  onError,
  selectedSpell,
  onSelectedSpellChange,
}) => {
  const allEnchantments = useMemo(
    () => getEnchantmentsForType(itemType, userSupplements),
    [itemType, userSupplements]
  );
  const allSpells = useMemo(buildAllSpellsList, []);
  const hasConjuradora = selectedEnchantments.some(
    (e) => e.enchantment === 'Conjuradora'
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
              const supplementMeta = option.supplementId
                ? SUPPLEMENT_METADATA[option.supplementId as SupplementId]
                : null;
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
                      {supplementMeta && (
                        <Chip
                          size='small'
                          label={supplementMeta.abbreviation}
                          color='primary'
                          sx={{ height: 16, fontSize: '0.65rem' }}
                        />
                      )}
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
            const supplementMeta = option.supplementId
              ? SUPPLEMENT_METADATA[option.supplementId as SupplementId]
              : null;
            return (
              <Box
                component='li'
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
              >
                <Box>
                  <Typography variant='body2' component='div'>
                    {option.enchantment}
                    {option.double && (
                      <Chip size='small' label='2 pts' sx={{ ml: 1 }} />
                    )}
                    {supplementMeta && (
                      <Chip
                        size='small'
                        label={supplementMeta.abbreviation}
                        color='primary'
                        variant='outlined'
                        sx={{ ml: 1 }}
                      />
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

      {hasConjuradora && (
        <Grid size={12}>
          <Autocomplete
            options={allSpells}
            getOptionLabel={(option) => option.name}
            value={
              selectedSpell
                ? allSpells.find((s) => s.name === selectedSpell) || {
                    name: selectedSpell,
                  }
                : null
            }
            onChange={(_, value) => onSelectedSpellChange?.(value?.name ?? '')}
            isOptionEqualToValue={(opt, value) => opt.name === value.name}
            renderInput={(params) => (
              <TextField
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...params}
                label='Magia (Conjuradora)'
                placeholder='Selecione a magia armazenada'
                helperText='A magia escolhida fica disponível na lista de magias do personagem.'
              />
            )}
            disabled={disabled}
          />
        </Grid>
      )}

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
