import React from 'react';
import { RaceName } from 't20-sheet-builder';
import { Option } from '@/components/SheetBuilder/common/Option';
import SheetBuilderFormSelect from '../../SheetBuilderFormSelect';

type Props = {
  changeRace: (race?: RaceName) => void;
};

const raceOptions: Record<RaceName, Option<RaceName>> = {
  human: {
    label: 'Humano',
    value: RaceName.human,
  },
  dwarf: {
    label: 'Anão',
    value: RaceName.dwarf,
  },
  dahllan: {
    label: 'Dahllan',
    value: RaceName.dahllan,
  },
  elf: {
    label: 'Elfo',
    value: RaceName.elf,
  },
  goblin: {
    label: 'Goblin',
    value: RaceName.goblin,
  },
  lefeu: {
    label: 'Lefeu',
    value: RaceName.lefeu,
  },
  minotaur: {
    label: 'Minotauro',
    value: RaceName.minotaur,
  },
  qareen: {
    label: 'Qaaren',
    value: RaceName.qareen,
  },
};

const RacesSelect = ({ changeRace: setRace }: Props) => (
  <SheetBuilderFormSelect
    options={Object.values(raceOptions)}
    className='mb-6'
    onChange={(option) => setRace(option?.value)}
    placeholder='Escolha uma raça'
    id='race-select'
  />
);

export default RacesSelect;
