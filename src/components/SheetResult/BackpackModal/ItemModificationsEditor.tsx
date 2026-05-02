import React, { useMemo } from 'react';
import {
  Autocomplete,
  Box,
  Chip,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@mui/material';

import {
  armorsModifications,
  weaponsModifications,
} from '../../../data/rewards/items';
import { getSpecialMaterialData } from '../../../data/systems/tormenta20/specialMaterials';
import { TORMENTA20_SYSTEM } from '../../../data/systems/tormenta20';
import { ItemMod } from '../../../interfaces/Rewards';
import {
  SUPPLEMENT_METADATA,
  SupplementId,
} from '../../../types/supplement.types';
import {
  addModificationWithPrerequisites,
  calculateModificationCost,
} from '../../../utils/superiorItemsValidation';

export type ModificationItemType = 'weapon' | 'armor' | 'shield';

export interface ItemModificationsEditorProps {
  itemType: ModificationItemType;
  selectedModifications: ItemMod[];
  onChange: (modifications: ItemMod[]) => void;
  selectedMaterial: string;
  onSelectedMaterialChange: (material: string) => void;
  userSupplements: SupplementId[];
  disabled?: boolean;
  showCost?: boolean;
  showMaterialEffectPreview?: boolean;
  maxCost?: number;
  onError?: (message: string) => void;
}

const MATERIAL_OPTIONS: { value: string; label: string }[] = [
  { value: 'aço rubi', label: 'Aço Rubi' },
  { value: 'adamante', label: 'Adamante' },
  { value: 'gelo eterno', label: 'Gelo Eterno' },
  { value: 'madeira Tollon', label: 'Madeira Tollon' },
  { value: 'matéria vermelha', label: 'Matéria Vermelha' },
  { value: 'mitral', label: 'Mitral' },
];

const DEFAULT_MAX_COST = 5;

function getModificationsForType(
  itemType: ModificationItemType,
  userSupplements: SupplementId[]
): ItemMod[] {
  const baseMods =
    itemType === 'weapon' ? weaponsModifications : armorsModifications;

  const supplementMods: ItemMod[] = [];
  userSupplements.forEach((supplementId) => {
    const supplement = TORMENTA20_SYSTEM.supplements[supplementId];
    if (supplement?.improvements) {
      const modsToAdd =
        itemType === 'weapon'
          ? supplement.improvements.weapons || []
          : supplement.improvements.armors || [];
      supplementMods.push(...modsToAdd);
    }
  });

  return [...baseMods, ...supplementMods];
}

const ItemModificationsEditor: React.FC<ItemModificationsEditorProps> = ({
  itemType,
  selectedModifications,
  onChange,
  selectedMaterial,
  onSelectedMaterialChange,
  userSupplements,
  disabled = false,
  showCost = true,
  showMaterialEffectPreview = true,
  maxCost = DEFAULT_MAX_COST,
  onError,
}) => {
  const allMods = useMemo(
    () => getModificationsForType(itemType, userSupplements),
    [itemType, userSupplements]
  );

  const availableModifications = useMemo(
    () =>
      allMods
        .filter(
          (mod) =>
            !selectedModifications.some((selected) => selected.mod === mod.mod)
        )
        .sort((a, b) => a.mod.localeCompare(b.mod)),
    [allMods, selectedModifications]
  );

  const isOptionDisabled = (mod: ItemMod): boolean => {
    if (!mod.prerequisite) return false;
    return !selectedModifications.some(
      (selected) => selected.mod === mod.prerequisite
    );
  };

  const handleSelectionChange = (
    _event: React.SyntheticEvent,
    value: ItemMod[]
  ) => {
    const expanded = value.reduce<ItemMod[]>(
      (acc, selectedMod) =>
        addModificationWithPrerequisites(selectedMod, acc, allMods),
      []
    );

    const cost = calculateModificationCost(expanded);
    if (cost > maxCost) {
      if (onError) {
        onError(
          `Muito caras! O custo total das modificações não pode exceder ${maxCost} pontos.`
        );
      }
      return;
    }

    if (onError) onError('');

    if (!expanded.some((mod) => mod.mod === 'Material especial')) {
      if (selectedMaterial) onSelectedMaterialChange('');
    }

    onChange(expanded);
  };

  const totalCost = calculateModificationCost(selectedModifications);
  const hasMaterialEspecial = selectedModifications.some(
    (mod) => mod.mod === 'Material especial'
  );
  const materialData = selectedMaterial
    ? getSpecialMaterialData(selectedMaterial)
    : null;
  let materialEffect = null;
  if (materialData) {
    materialEffect =
      itemType === 'weapon'
        ? materialData.weaponEffect
        : materialData.armorEffect;
  }

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Autocomplete
          multiple
          options={availableModifications}
          getOptionLabel={(option) => option.mod}
          getOptionDisabled={isOptionDisabled}
          value={selectedModifications}
          onChange={handleSelectionChange}
          renderInput={(params) => (
            <TextField
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...params}
              label='Modificações'
              placeholder='Selecione as modificações'
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
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
                        {option.mod}
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
                    </Box>
                  }
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...getTagProps({ index })}
                />
              );
            })
          }
          renderOption={(props, option) => {
            const optionDisabled = isOptionDisabled(option);
            const supplementMeta = option.supplementId
              ? SUPPLEMENT_METADATA[option.supplementId as SupplementId]
              : null;
            return (
              <Box
                component='li'
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                sx={{
                  opacity: optionDisabled ? 0.5 : 1,
                  pointerEvents: optionDisabled ? 'none' : 'auto',
                }}
              >
                <Box>
                  <Typography variant='body2'>
                    {option.mod}
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
                    {optionDisabled && (
                      <Chip
                        size='small'
                        label='Bloqueado'
                        color='error'
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>
                  {option.description && (
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ display: 'block', mb: 0.5 }}
                    >
                      {option.description}
                    </Typography>
                  )}
                  {option.prerequisite && (
                    <Typography
                      variant='caption'
                      color={optionDisabled ? 'error.main' : 'warning.main'}
                      sx={{ display: 'block' }}
                    >
                      Requer: {option.prerequisite}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          }}
          disabled={disabled}
        />
      </Grid>

      {hasMaterialEspecial && (
        <Grid size={12}>
          <Autocomplete
            options={MATERIAL_OPTIONS}
            getOptionLabel={(option) => option.label}
            value={
              MATERIAL_OPTIONS.find((opt) => opt.value === selectedMaterial) ||
              null
            }
            onChange={(_, value) =>
              onSelectedMaterialChange(value?.value || '')
            }
            renderInput={(params) => (
              <TextField
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...params}
                label='Tipo de Material'
                placeholder='Selecione o material especial'
                required
              />
            )}
            disabled={disabled}
          />
        </Grid>
      )}

      {showMaterialEffectPreview && materialData && materialEffect && (
        <Grid size={12}>
          <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant='h6' gutterBottom>
              Efeito do Material: {materialData.name}
            </Typography>
            <Typography variant='body2'>
              <strong>Efeito:</strong> {materialEffect.effect}
            </Typography>
          </Paper>
        </Grid>
      )}

      {showCost && selectedModifications.length > 0 && (
        <Grid size={12}>
          <Typography variant='body2' color='text.secondary'>
            Custo total: {totalCost} / {maxCost} pontos
          </Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default ItemModificationsEditor;
