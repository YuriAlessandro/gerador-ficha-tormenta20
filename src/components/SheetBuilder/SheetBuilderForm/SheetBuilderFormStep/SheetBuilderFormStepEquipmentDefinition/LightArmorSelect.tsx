import React from 'react';
import { ArmorName, LightArmors, Translator } from 't20-sheet-builder';
import SheetBuilderFormSelect from '../../SheetBuilderFormSelect';

type Props = {
  setSelected: (selected?: ArmorName) => void;
  selectedArmor?: ArmorName;
};

const LightArmorSelect = ({ setSelected, selectedArmor }: Props) => {
  const defensiveArmors = LightArmors.getAll()
    .sort()
    .map((Armor) => ({
      label: Translator.getTranslation(Armor.equipmentName),
      value: Armor.equipmentName,
    }));
  return (
    <div>
      <h3>Escolha uma armadura leve</h3>
      <SheetBuilderFormSelect
        options={defensiveArmors}
        value={defensiveArmors.find((option) => option.value === selectedArmor)}
        onChange={(option) => setSelected(option?.value)}
        className='mb-3'
        id='martial-weapon-select'
        placeholder='Armadura de couro, couro batido...'
      />
    </div>
  );
};

export default LightArmorSelect;
