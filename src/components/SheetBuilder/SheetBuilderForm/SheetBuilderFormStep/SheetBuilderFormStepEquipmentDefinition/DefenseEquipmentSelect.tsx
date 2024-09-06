import { Box, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ArmorName, HeavyArmors } from 't20-sheet-builder';
import HeavyArmorSelect from './HeavyArmorSelect';
import LightArmorSelect from './LightArmorSelect';

type Props = {
  setSelected: (selected?: ArmorName) => void;
  hasLightArmorProficiency: boolean;
  hasHeavyArmorProficiency: boolean;
  selectedArmor?: ArmorName;
};

const DefensiveWeaponSelect = ({
  selectedArmor,
  setSelected,
  hasLightArmorProficiency,
  hasHeavyArmorProficiency,
}: Props) => {
  const [selectedArmorType, setSelectedArmorType] = useState<'light' | 'heavy'>(
    'light'
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target as HTMLInputElement;
    if (value === 'light' || value === 'heavy') setSelectedArmorType(value);
  };

  useEffect(() => {
    if (selectedArmor) {
      // Test if this armor is heavy
      if (
        HeavyArmors.getAll().find(
          (armor) => armor.equipmentName === selectedArmor
        )
      ) {
        setSelectedArmorType('heavy');
      }
    }
  }, [selectedArmor]);

  return (
    <div>
      <h3>Escolha uma armadura</h3>
      {hasLightArmorProficiency && !hasHeavyArmorProficiency && (
        <Box>
          <p>Você possui proficiência apenas para armaduras leves.</p>
          <LightArmorSelect
            selectedArmor={selectedArmor}
            setSelected={setSelected}
          />
        </Box>
      )}
      {!hasLightArmorProficiency && hasHeavyArmorProficiency && (
        <Box>
          <p>Você possui proficiência apenas para armaduras pesadas.</p>
          <HeavyArmorSelect
            selectedArmor={selectedArmor}
            setSelected={setSelected}
          />
        </Box>
      )}
      {hasLightArmorProficiency && hasHeavyArmorProficiency && (
        <Box>
          <p>Você deve escolher com qual tipo de armadura deseja começar.</p>
          <RadioGroup
            row
            name='armor-type'
            value={selectedArmorType}
            onChange={handleChange}
          >
            <FormControlLabel
              value='light'
              control={<Radio />}
              label='Armaduras Leves'
            />
            <FormControlLabel
              value='heavy'
              control={<Radio />}
              label='Armaduras Pesadas'
            />
          </RadioGroup>

          {selectedArmorType === 'light' && (
            <LightArmorSelect
              selectedArmor={selectedArmor}
              setSelected={setSelected}
            />
          )}
          {selectedArmorType === 'heavy' && (
            <HeavyArmorSelect
              selectedArmor={selectedArmor}
              setSelected={setSelected}
            />
          )}
        </Box>
      )}
      {!hasLightArmorProficiency && !hasHeavyArmorProficiency && (
        <p>Você não possui proficiência de armadura leve nem pesada.</p>
      )}
    </div>
  );
};

export default DefensiveWeaponSelect;
