import React from 'react';
import {
  AnimalsFriendEquipments,
  EquipmentName,
  Translator,
} from 't20-sheet-builder';
import { Option } from '@/components/SheetBuilder/common/Option';
import SheetBuilderFormSelect from '@/components/SheetBuilder/SheetBuilderForm/SheetBuilderFormSelect';

type Props = {
  selectAnimal: (animal?: AnimalsFriendEquipments) => void;
};

const options: Option<AnimalsFriendEquipments>[] = [
  {
    label: Translator.getEquipmentTranslation(EquipmentName.hound),
    value: EquipmentName.hound,
  },
  {
    label: Translator.getEquipmentTranslation(EquipmentName.horse),
    value: EquipmentName.horse,
  },
  {
    label: Translator.getEquipmentTranslation(EquipmentName.pony),
    value: EquipmentName.pony,
  },
  {
    label: Translator.getEquipmentTranslation(EquipmentName.trobo),
    value: EquipmentName.trobo,
  },
];

const AnimalEquipmentSelect = ({ selectAnimal }: Props) => (
  <SheetBuilderFormSelect
    options={options}
    id='animals-friend-equipment'
    placeholder='Escolha um animal'
    onChange={(option) => selectAnimal(option?.value)}
  />
);

export default AnimalEquipmentSelect;
