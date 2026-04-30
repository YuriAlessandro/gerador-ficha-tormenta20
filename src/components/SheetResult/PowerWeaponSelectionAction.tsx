import React, { useMemo, useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import CharacterSheet from '@/interfaces/CharacterSheet';
import {
  ManualPowerSelections,
  SelectionOptions,
} from '@/interfaces/PowerSelections';
import { GeneralPower, OriginPower } from '@/interfaces/Poderes';
import { ClassPower, ClassAbility } from '@/interfaces/Class';
import { RaceAbility } from '@/interfaces/Race';
import { getPowerSelectionRequirements } from '@/functions/powers/manualPowerSelection';
import { recalculateSheet } from '@/functions/recalculateSheet';
import PowerSelectionDialog from './EditDrawers/PowerSelectionDialog';

type PowerLike =
  | GeneralPower
  | ClassPower
  | RaceAbility
  | ClassAbility
  | OriginPower;

interface Props {
  power: PowerLike;
  instances: number;
  sheet: CharacterSheet;
  onSheetUpdate: (updatedSheet: CharacterSheet) => void;
}

const PowerWeaponSelectionAction: React.FC<Props> = ({
  power,
  instances,
  sheet,
  onSheetUpdate,
}) => {
  const [open, setOpen] = useState(false);

  const weaponRequirements = useMemo(() => {
    const requirements = getPowerSelectionRequirements(power);
    if (!requirements) return null;
    const filtered = requirements.requirements.filter(
      (r) => r.type === 'selectWeaponSpecialization'
    );
    if (filtered.length === 0) return null;
    return { ...requirements, requirements: filtered };
  }, [power]);

  const initialSelections = useMemo<SelectionOptions>(() => {
    const weapons = (sheet.sheetActionHistory || [])
      .filter((entry) => entry.powerName === power.name)
      .flatMap((entry) =>
        entry.changes
          .filter((c) => c.type === 'WeaponSpecializationSelected')
          .map((c) =>
            c.type === 'WeaponSpecializationSelected' ? c.weaponName : ''
          )
      );
    return { weapons };
  }, [sheet.sheetActionHistory, power.name]);

  if (!weaponRequirements) return null;

  const handleConfirm = (selections: SelectionOptions) => {
    // Rebuild full manual selections from history so other powers keep their
    // recorded choices intact during recalculation.
    const fullManualSelections: ManualPowerSelections = {};
    sheet.sheetActionHistory?.forEach((entry) => {
      const { powerName } = entry;
      if (!powerName) return;
      entry.changes.forEach((change) => {
        if (change.type === 'FamiliarSelected') {
          if (!fullManualSelections[powerName])
            fullManualSelections[powerName] = {};
          fullManualSelections[powerName].familiars = [change.familiarKey];
        } else if (change.type === 'AnimalTotemSelected') {
          if (!fullManualSelections[powerName])
            fullManualSelections[powerName] = {};
          fullManualSelections[powerName].animalTotems = [change.totemKey];
        } else if (
          change.type === 'WeaponSpecializationSelected' &&
          powerName !== power.name
        ) {
          if (!fullManualSelections[powerName])
            fullManualSelections[powerName] = {};
          const existing = fullManualSelections[powerName].weapons || [];
          fullManualSelections[powerName].weapons = [
            ...existing,
            change.weaponName,
          ];
        }
      });
    });

    fullManualSelections[power.name] = {
      ...(fullManualSelections[power.name] || {}),
      weapons: selections.weapons || [],
    };

    // Drop existing weapon specialization history entries for this power so the
    // recalculation re-creates them based on the new selections.
    const cleanedSheet: CharacterSheet = {
      ...sheet,
      sheetActionHistory: (sheet.sheetActionHistory || []).filter(
        (entry) =>
          !(
            entry.powerName === power.name &&
            entry.changes.some((c) => c.type === 'WeaponSpecializationSelected')
          )
      ),
    };

    const updated = recalculateSheet(cleanedSheet, sheet, fullManualSelections);
    onSheetUpdate(updated);
    setOpen(false);
  };

  return (
    <>
      <Tooltip title='Selecionar arma'>
        <IconButton size='small' onClick={() => setOpen(true)}>
          <GpsFixedIcon fontSize='small' color='primary' />
        </IconButton>
      </Tooltip>
      {open && (
        <PowerSelectionDialog
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={handleConfirm}
          requirements={weaponRequirements}
          sheet={sheet}
          instances={instances}
          initialSelections={initialSelections}
        />
      )}
    </>
  );
};

export default PowerWeaponSelectionAction;
