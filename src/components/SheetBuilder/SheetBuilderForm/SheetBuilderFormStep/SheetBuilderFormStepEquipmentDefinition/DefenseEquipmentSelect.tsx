import React, { useState } from 'react';
import { EquipmentName } from 't20-sheet-builder';
import { Box, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import LightArmorSelect from './LightArmorSelect';
import HeavyArmorSelect from './HeavyArmorSelect';

type Props = {
  setSelected: (selected?: EquipmentName) => void;
  hasLightArmorProficiency: boolean;
  hasHeavyArmorProficiency: boolean;
};

const DefensiveWeaponSelect = ({
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

  return (
    <div>
      <h3>Escolha uma armadura</h3>
      {hasLightArmorProficiency && !hasHeavyArmorProficiency && (
        <Box>
          <p>Você possui proficiência apenas para armaduras leves.</p>
          <LightArmorSelect setSelected={setSelected} />
        </Box>
      )}
      {!hasLightArmorProficiency && hasHeavyArmorProficiency && (
        <Box>
          <p>Você possui proficiência apenas para armaduras pesadas.</p>
          <HeavyArmorSelect setSelected={setSelected} />
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
            <LightArmorSelect setSelected={setSelected} />
          )}
          {selectedArmorType === 'heavy' && (
            <HeavyArmorSelect setSelected={setSelected} />
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
