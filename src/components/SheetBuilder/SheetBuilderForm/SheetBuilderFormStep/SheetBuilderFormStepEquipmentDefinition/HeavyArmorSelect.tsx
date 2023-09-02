import React from 'react';
import {
  ArmorName,
  EquipmentName,
  HeavyArmorName,
  Translator,
} from 't20-sheet-builder';
import SheetBuilderFormSelect from '../../SheetBuilderFormSelect';

type Props = {
  setSelected: (selected?: ArmorName) => void;
  selectedArmor?: ArmorName;
};

const HeavyArmorSelect = ({ setSelected, selectedArmor }: Props) => {
  const defensiveArmors = [
    {
      label: Translator.getTranslation(EquipmentName.brunea),
      value: EquipmentName.brunea as HeavyArmorName,
    },
  ];
  return (
    <div>
      <h3>Escolha uma armadura pesada</h3>
      <SheetBuilderFormSelect
        options={defensiveArmors}
        value={defensiveArmors.find((option) => option.value === selectedArmor)}
        onChange={(option) => setSelected(option?.value)}
        className='mb-3'
        id='martial-weapon-select'
        placeholder='Brunea'
      />
    </div>
  );
};

export default HeavyArmorSelect;
