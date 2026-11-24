import React, { useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import ItemModificationsEditor, {
  ModificationItemType,
} from '@/components/SheetResult/BackpackModal/ItemModificationsEditor';
import { getSuperiorItemOptions } from '@/functions/superiorItemGrant';
import {
  SuperiorItemGroup,
  SuperiorItemSelection,
} from '@/interfaces/PowerSelections';
import { SupplementId } from '@/types/supplement.types';

interface SuperiorItemFieldProps {
  groups: SuperiorItemGroup[];
  /** Quantas melhorias o item tem. */
  pick: number;
  supplements: SupplementId[];
  value?: SuperiorItemSelection;
  onChange: (value: SuperiorItemSelection) => void;
}

const MOD_TYPE: Record<SuperiorItemGroup, ModificationItemType> = {
  Arma: 'weapon',
  Armadura: 'armor',
  Escudo: 'shield',
};

/** Escolha de um item superior: tipo, item e melhorias. */
const SuperiorItemField: React.FC<SuperiorItemFieldProps> = ({
  groups,
  pick,
  supplements,
  value,
  onChange,
}) => {
  const [error, setError] = useState('');
  const selection: SuperiorItemSelection = value ?? {
    group: groups[0],
    itemName: '',
    modifications: [],
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <ToggleButtonGroup
        exclusive
        size='small'
        value={selection.group}
        onChange={(_event, group: SuperiorItemGroup | null) => {
          if (!group) return;
          setError('');
          onChange({ group, itemName: '', modifications: [] });
        }}
      >
        {groups.map((group) => (
          <ToggleButton key={group} value={group}>
            {group}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <Autocomplete
        options={getSuperiorItemOptions(selection.group, supplements)
          .map((item) => item.nome)
          .sort((a, b) => a.localeCompare(b, 'pt-BR'))}
        value={selection.itemName || null}
        onChange={(_event, itemName) =>
          onChange({
            ...selection,
            itemName: itemName ?? '',
            baseItem: getSuperiorItemOptions(selection.group, supplements).find(
              (item) => item.nome === itemName
            ),
          })
        }
        renderInput={(params) => (
          <TextField
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...params}
            label='Item'
          />
        )}
      />
      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
        Melhorias: {selection.modifications.length} / {pick} (o pré-requisito de
        uma melhoria também conta)
      </Typography>
      {error && <Alert severity='warning'>{error}</Alert>}
      <ItemModificationsEditor
        itemType={MOD_TYPE[selection.group]}
        selectedModifications={selection.modifications}
        onChange={(modifications) => {
          if (modifications.length > pick) {
            setError(`O item tem só ${pick} melhorias.`);
            return;
          }
          setError('');
          onChange({ ...selection, modifications });
        }}
        selectedMaterial={selection.material ?? ''}
        onSelectedMaterialChange={(material) => {
          // Só a escolha: limpar vem junto da remoção da melhoria, e gravar as
          // duas pela mesma closure perderia a remoção.
          if (material) onChange({ ...selection, material });
        }}
        userSupplements={supplements}
        showCost={false}
        maxCost={Infinity}
      />
    </Box>
  );
};

export default SuperiorItemField;
