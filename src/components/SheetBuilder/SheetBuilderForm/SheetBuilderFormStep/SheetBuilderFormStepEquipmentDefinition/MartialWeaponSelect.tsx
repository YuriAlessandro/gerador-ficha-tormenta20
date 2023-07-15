import React from 'react';
import {
  MartialWeaponName,
  MartialWeapons,
  Translator,
} from 't20-sheet-builder';
import SheetBuilderFormSelect from '../../SheetBuilderFormSelect';

type Props = {
  setSelected: (selected?: MartialWeaponName) => void;
};

const martialWeapons = MartialWeapons.getAll().map((Weapon) => ({
  label: Translator.getEquipmentTranslation(Weapon.equipmentName),
  value: Weapon.equipmentName,
}));

const MartialWeaponSelect = ({ setSelected }: Props) => (
  <div>
    <h3>Escolha uma arma marcial</h3>
    <SheetBuilderFormSelect
      options={martialWeapons}
      onChange={(option) => setSelected(option?.value)}
      className='mb-3'
      id='martial-weapon-select'
      placeholder='Adaga, clava, espada...'
    />
  </div>
);

export default MartialWeaponSelect;
