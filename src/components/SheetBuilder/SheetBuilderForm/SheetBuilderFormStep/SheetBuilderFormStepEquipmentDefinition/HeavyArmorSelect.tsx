import React from 'react';
import { EquipmentName, HeavyArmors, Translator } from 't20-sheet-builder';
import SheetBuilderFormSelect from '../../SheetBuilderFormSelect';

type Props = {
  setSelected: (selected?: EquipmentName) => void;
};

const HeavyArmorSelect = ({ setSelected }: Props) => {
  const defensiveArmors = HeavyArmors.getAll()
    .filter((Armor) => Armor.equipmentName === EquipmentName.fullPlate) // Full plate por enquanto, tem que mudar para brunea depois
    .map((Armor) => ({
      label: Translator.getTranslation(Armor.equipmentName),
      value: Armor.equipmentName,
    }));
  return (
    <div>
      <h3>Escolha uma armadura pesada</h3>
      <SheetBuilderFormSelect
        options={defensiveArmors}
        onChange={(option) => setSelected(option?.value)}
        className='mb-3'
        id='martial-weapon-select'
        placeholder='Brunea'
      />
    </div>
  );
};

export default HeavyArmorSelect;
