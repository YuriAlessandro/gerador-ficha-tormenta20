import React from 'react';
import { SimpleWeaponName, SimpleWeapons, Translator } from 't20-sheet-builder';
import SheetBuilderFormSelect from '../../SheetBuilderFormSelect';

type Props = {
  setSelected: (selected?: SimpleWeaponName) => void;
};

const simpleWeapons = SimpleWeapons.getAll().map((Weapon) => ({
  label: Translator.getEquipmentTranslation(Weapon.equipmentName),
  value: Weapon.equipmentName,
}));

const SimpleWeaponSelect = ({ setSelected }: Props) => (
  <div>
    <h3>Escolha uma arma simples</h3>
    <SheetBuilderFormSelect
      options={simpleWeapons}
      onChange={(option) => setSelected(option?.value)}
      className='mb-3'
      id='simple-weapon-select'
      placeholder='Adaga, clava, espada...'
    />
  </div>
);

export default SimpleWeaponSelect;
