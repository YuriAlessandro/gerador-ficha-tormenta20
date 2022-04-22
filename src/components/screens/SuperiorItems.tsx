import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import React, { useState } from 'react';
import Select from 'react-select';
import EQUIPAMENTOS from '../../data/equipamentos';
import { getRandomItemFromArray } from '../../functions/randomUtils';
import getSelectTheme from '../../functions/style';
import Equipment from '../../interfaces/Equipment';

type SelectedOption = { value: string; label: string };

const useStyles = makeStyles(() => ({
  button: {
    background: 'rgb(209, 50, 53);',
    color: '#FAFAFA',
    marginBottom: '10px',
  },
}));

const allWeapons = [
  ...EQUIPAMENTOS.armasSimples,
  ...EQUIPAMENTOS.armasMarciais,
  ...EQUIPAMENTOS.armasExoticas,
  ...EQUIPAMENTOS.armasDeFogo,
];

const allArmors = [
  ...EQUIPAMENTOS.armadurasLeves,
  ...EQUIPAMENTOS.armaduraPesada,
];

const allEquips = [...allWeapons, ...allArmors, ...EQUIPAMENTOS.escudos];

const weaponsTypes: SelectedOption[] = [
  {
    value: 'qualquer',
    label: 'Todas as Armas',
  },
  {
    value: 'simples',
    label: 'Armas Simples',
  },
  {
    value: 'marciais',
    label: 'Armas Marciais',
  },
  {
    value: 'exoticas',
    label: 'Armas Exóticas',
  },
  {
    value: 'fogo',
    label: 'Armas de Fogo',
  },
];

const SuperiorItems: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [itemSubType, setItemsSubType] = useState<SelectedOption[]>([]);
  const [items, setItems] = useState<SelectedOption[]>([]);
  const [selectedItem, setSelectedItem] = useState<SelectedOption>();
  const [generatedItem, setGeneratedItem] = useState<Equipment | undefined>(
    undefined
  );

  const classes = useStyles();
  const formThemeColors = isDarkMode
    ? getSelectTheme('dark')
    : getSelectTheme('default');

  const onChangeItemType = (type: SelectedOption | null) => {
    if (type) {
      switch (type.value) {
        case '1':
          setItemsSubType(weaponsTypes);
          break;

        default:
          break;
      }
    }
  };

  const onChangeSubType = (subType: SelectedOption | null) => {
    if (subType) {
      switch (subType.value) {
        case 'qualquer':
          setItems([
            ...[{ label: 'Qualquer arma', value: 'qualquer' }],
            ...allWeapons
              .sort((i1, i2) => (i1.nome < i2.nome ? -1 : 1))
              .map((i: Equipment) => ({ label: i.nome, value: i.nome })),
          ]);
          break;

        default:
          break;
      }
    }
  };

  const onChangeItem = (item: SelectedOption | null) => {
    if (item) setSelectedItem(item);
  };

  const onClickGenerate = () => {
    if (selectedItem) {
      if (selectedItem.value === 'qualquer') {
        const item = getRandomItemFromArray(allEquips);
        setGeneratedItem(item);
        return;
      }

      const item = allEquips.find((i) => i.nome === selectedItem.value);
      setGeneratedItem(item);
    }
  };

  return (
    <div id='main-screen' style={{ margin: '30px 30px 30px 25px' }}>
      <div style={{ display: 'flex' }}>
        <Select
          className='filterSelect'
          options={[
            // { value: 0, label: 'Qualquer' },
            { value: '1', label: 'Armas' },
            // { value: 2, label: 'Armaduras' },
            // { value: 3, label: 'Escudos' },
          ]}
          placeholder='Escolha o tipo do item'
          onChange={onChangeItemType}
          theme={(theme) => ({
            ...theme,
            colors: {
              ...formThemeColors,
            },
          })}
        />

        <Select
          className='filterSelect'
          options={itemSubType}
          placeholder='Escolha a classificação'
          onChange={onChangeSubType}
          isDisabled={itemSubType.length === 0}
          theme={(theme) => ({
            ...theme,
            colors: {
              ...formThemeColors,
            },
          })}
        />

        <Select
          className='filterSelect'
          options={items}
          placeholder='Escolha o item'
          isDisabled={items.length === 0}
          onChange={onChangeItem}
          theme={(theme) => ({
            ...theme,
            colors: {
              ...formThemeColors,
            },
          })}
          isSearchable
        />

        <Button
          onClick={onClickGenerate}
          type='button'
          className={classes.button}
        >
          Gerar Recompensa
        </Button>
      </div>
      <div>{generatedItem && <h1>{generatedItem.nome}</h1>}</div>
    </div>
  );
};

export default SuperiorItems;
