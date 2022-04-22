import { Alert, Box, Collapse, Paper, Slide, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import React, { useState } from 'react';
import Select from 'react-select';
import { TransitionGroup } from 'react-transition-group';
import EQUIPAMENTOS from '../../data/equipamentos';
import { getRandomItemFromArray } from '../../functions/randomUtils';
import {
  getArmorModification,
  getWeaponModification,
} from '../../functions/rewards/rewardsGenerator';
import getSelectTheme from '../../functions/style';
import Equipment from '../../interfaces/Equipment';

type SelectedOption = { value: string; label: string };

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

// const allEquips = [...allWeapons, ...allArmors, ...EQUIPAMENTOS.escudos];

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

const armorsTypes: SelectedOption[] = [
  {
    value: 'qualquer',
    label: 'Todas as Armaduras',
  },
  {
    value: 'leves',
    label: 'Armaduras Leves',
  },
  {
    value: 'pesadas',
    label: 'Armaduras Pesadas',
  },
];

const shieldTypes: SelectedOption[] = [
  {
    value: 'qualquer',
    label: 'Escudos',
  },
];

const weightedRandom = (min: number, max: number): number =>
  Math.round(max / (Math.random() * max + min));

const SuperiorItems: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [selectedItemType, setSelectedItemTYpe] = useState<string>('');
  const [itemSubType, setItemsSubType] = useState<SelectedOption[]>([]);
  const [items, setItems] = useState<SelectedOption[]>([]);
  const [selectedItem, setSelectedItem] = useState<SelectedOption>();
  const [generatedItems, setGeneratedItems] = useState<Equipment[]>([]);
  const [generatedMods, setGeneratedMods] = useState<string[]>([]);
  const [searchList, setSearchList] = useState<Equipment[]>([]);

  const formThemeColors = isDarkMode
    ? getSelectTheme('dark')
    : getSelectTheme('default');

  const onChangeItemType = (type: SelectedOption | null) => {
    setAlertMessage('');
    if (type) {
      switch (type.value) {
        case '1':
          setSelectedItemTYpe('Arma');
          setItemsSubType(weaponsTypes);
          break;
        case '2':
          setSelectedItemTYpe('Armadura');
          setItemsSubType(armorsTypes);
          break;
        case '3':
          setSelectedItemTYpe('Escudo');
          setItemsSubType(shieldTypes);
          break;
        default:
          break;
      }
    }
  };

  const onChangeSubType = (subType: SelectedOption | null) => {
    setAlertMessage('');
    if (subType) {
      if (selectedItemType === 'Arma') {
        switch (subType.value) {
          case 'qualquer':
            setSearchList(allWeapons);
            setItems([
              ...[{ label: 'Qualquer arma', value: 'qualquer' }],
              ...allWeapons
                .sort((i1, i2) => (i1.nome < i2.nome ? -1 : 1))
                .map((i: Equipment) => ({ label: i.nome, value: i.nome })),
            ]);
            break;
          case 'simples':
            setSearchList(EQUIPAMENTOS.armasSimples);
            setItems([
              ...[{ label: 'Qualquer arma', value: 'qualquer' }],
              ...EQUIPAMENTOS.armasSimples
                .sort((i1, i2) => (i1.nome < i2.nome ? -1 : 1))
                .map((i: Equipment) => ({ label: i.nome, value: i.nome })),
            ]);
            break;
          case 'marciais':
            setSearchList(EQUIPAMENTOS.armasMarciais);
            setItems([
              ...[{ label: 'Qualquer arma', value: 'qualquer' }],
              ...EQUIPAMENTOS.armasMarciais
                .sort((i1, i2) => (i1.nome < i2.nome ? -1 : 1))
                .map((i: Equipment) => ({ label: i.nome, value: i.nome })),
            ]);
            break;
          case 'exoticas':
            setSearchList(EQUIPAMENTOS.armasExoticas);
            setItems([
              ...[{ label: 'Qualquer arma', value: 'qualquer' }],
              ...EQUIPAMENTOS.armasExoticas
                .sort((i1, i2) => (i1.nome < i2.nome ? -1 : 1))
                .map((i: Equipment) => ({ label: i.nome, value: i.nome })),
            ]);
            break;
          case 'fogo':
            setSearchList(EQUIPAMENTOS.armasDeFogo);
            setItems([
              ...[{ label: 'Qualquer arma', value: 'qualquer' }],
              ...EQUIPAMENTOS.armasDeFogo
                .sort((i1, i2) => (i1.nome < i2.nome ? -1 : 1))
                .map((i: Equipment) => ({ label: i.nome, value: i.nome })),
            ]);
            break;
          default:
            break;
        }
      } else if (selectedItemType === 'Armadura') {
        switch (subType.value) {
          case 'qualquer':
            setSearchList(allArmors);
            setItems([
              ...[{ label: 'Qualquer armadura', value: 'qualquer' }],
              ...allArmors
                .sort((i1, i2) => (i1.nome < i2.nome ? -1 : 1))
                .map((i: Equipment) => ({ label: i.nome, value: i.nome })),
            ]);
            break;
          case 'leves':
            setSearchList(EQUIPAMENTOS.armadurasLeves);
            setItems([
              ...[{ label: 'Qualquer armadura', value: 'qualquer' }],
              ...EQUIPAMENTOS.armadurasLeves
                .sort((i1, i2) => (i1.nome < i2.nome ? -1 : 1))
                .map((i: Equipment) => ({ label: i.nome, value: i.nome })),
            ]);
            break;
          case 'pesadas':
            setSearchList(EQUIPAMENTOS.armaduraPesada);
            setItems([
              ...[{ label: 'Qualquer armadura', value: 'qualquer' }],
              ...EQUIPAMENTOS.armaduraPesada
                .sort((i1, i2) => (i1.nome < i2.nome ? -1 : 1))
                .map((i: Equipment) => ({ label: i.nome, value: i.nome })),
            ]);
            break;
          default:
            break;
        }
      } else if (selectedItemType === 'Escudo') {
        setSearchList(EQUIPAMENTOS.escudos);
        setItems([
          ...[{ label: 'Qualquer escudo', value: 'qualquer' }],
          ...EQUIPAMENTOS.escudos
            .sort((i1, i2) => (i1.nome < i2.nome ? -1 : 1))
            .map((i: Equipment) => ({ label: i.nome, value: i.nome })),
        ]);
      }
    }
  };

  const onChangeItem = (item: SelectedOption | null) => {
    setAlertMessage('');
    if (item) setSelectedItem(item);
  };

  const onClickGenerate = () => {
    const modifications = weightedRandom(1, 5);

    if (selectedItem) {
      if (selectedItem.value === 'qualquer') {
        const item = getRandomItemFromArray(searchList);
        setGeneratedItems((oldItems) => [item, ...oldItems]);
      } else {
        const item = searchList.find((i) => i.nome === selectedItem.value);
        if (item) setGeneratedItems((oldItems) => [item, ...oldItems]);
      }

      if (selectedItemType === 'Arma') {
        // Apply modifications to weapon
        const mods = getWeaponModification(modifications);
        setGeneratedMods((oldMods) => [mods, ...oldMods]);
      } else {
        const mods = getArmorModification(modifications);
        setGeneratedMods((oldMods) => [mods, ...oldMods]);
      }
    } else {
      setAlertMessage('Você precisa selecionar todas as opções abaixo.');
    }
  };

  const displayItems = generatedItems.map((item, idx) => ({
    item,
    mods: generatedMods[idx],
  }));

  return (
    <div id='main-screen' style={{ margin: '30px 30px 30px 25px' }}>
      <Collapse in={alertMessage.length > 0}>
        <Alert
          sx={{ mb: 2 }}
          severity='error'
          onClose={() => setAlertMessage('')}
        >
          {alertMessage}
        </Alert>
      </Collapse>
      <div style={{ display: 'flex' }}>
        <Select
          className='filterSelect'
          options={[
            // { value: 0, label: 'Qualquer' },
            { value: '1', label: 'Armas' },
            { value: '2', label: 'Armaduras' },
            { value: '3', label: 'Escudos' },
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

        <Button onClick={onClickGenerate} type='button' variant='contained'>
          Gerar novo item
        </Button>
      </div>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {displayItems && (
          <TransitionGroup>
            {displayItems.map((item) => (
              <Slide
                direction='right'
                key={`${item.item.nome}${item.mods}`}
                timeout={600}
              >
                <Paper
                  elevation={2}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    p: 1,
                    backgroundColor: isDarkMode ? '#922325' : '#FFFFFF',
                    color: isDarkMode ? '#FFFFFF' : '#000',
                    mt: 1,
                  }}
                >
                  <Typography fontWeight='bold' fontSize={20}>
                    {item.item.nome}
                  </Typography>
                  <div>{item.mods.replace('(', '').replace(')', '')}</div>
                </Paper>
              </Slide>
            ))}
          </TransitionGroup>
        )}
      </Box>
    </div>
  );
};

export default SuperiorItems;
