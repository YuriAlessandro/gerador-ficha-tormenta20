import { Button, styled } from '@mui/material';
import React, { useState } from 'react';
import Select from 'react-select';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import getSelectTheme from '../../functions/style';

import { ITEM_TYPE, LEVELS } from '../../interfaces/Rewards';
import {
  rewardGenerator,
  applyMoneyReward,
  applyItemReward,
  RewardGenerated,
} from '../../functions/rewards/rewardsGenerator';

const nds = Object.keys(LEVELS).map((nd) => ({
  value: nd,
  label: `ND ${nd.replace('F', '').replace('S', '1/')}`,
}));

type SelectedOption = { value: string; label: string };

const Rewards: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const StyledTableCell = styled(TableCell)(() => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: 'rgb(209, 50, 53)',
      color: '#FFF',
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
      backgroundColor: isDarkMode ? '#212121' : '#FFF',
      color: isDarkMode ? '#FFF' : '#000',
    },
  }));

  const [items, setItems] = useState<RewardGenerated[]>();
  const [numberOfItems, setNumberOfItems] = useState<number>(1);
  const [nd, setNd] = useState<LEVELS>(LEVELS.S4);
  const [rewardMult, setSrewardMult] = useState<'Padrão' | 'Metade' | 'Dobro'>(
    'Padrão'
  );

  const onClickGenerate = () => {
    const newItems: RewardGenerated[] = [];
    const isDouble = rewardMult === 'Dobro';
    const isHalf = rewardMult === 'Metade';

    for (let index = 0; index < numberOfItems; index += 1) {
      const newItem = rewardGenerator(nd, isHalf);
      if (newItem.money)
        newItem.moneyApplied = applyMoneyReward(newItem.money, isDouble);
      if (newItem.item)
        newItem.itemApplied = applyItemReward(newItem.item, isDouble);
      newItems.push(newItem);
    }
    setItems(newItems);
  };

  const onChangeNd = (newNd: SelectedOption | null) => {
    if (newNd) setNd(newNd.value as LEVELS);
  };

  const onChangeQtd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const qtd = e.target.value as unknown as number;

    if (qtd && qtd <= 0) setNumberOfItems(1);
    else setNumberOfItems(qtd);
  };

  const ResultDiv = items?.map((item) => {
    const moneyStr = item?.money?.reward
      ? `
  ${item.money?.reward?.qty}${
          item.money?.reward?.dice > 1 ? `d${item.money?.reward?.dice}` : ''
        }${
          item.money?.reward?.mult > 1 ? `x${item.money?.reward?.mult} ` : ' '
        }${item.money?.reward?.som ? `+${item.money?.reward?.som} ` : ' '}${
          item.money?.reward?.money
        }
  `
      : '--';

    const itemStr = item?.item?.reward
      ? `${
          item.item.reward.type === ITEM_TYPE.POCAO
            ? `${item.item?.reward?.qty}d${item.item?.reward?.dice}${
                item.item?.reward?.som ? `+${item.item?.reward?.som} ` : ' '
              }`
            : ''
        }${item.item.reward.type}${
          item.item.reward.type === ITEM_TYPE.SUPERIOR
            ? ` (${item.item.reward.mods} modificações) `
            : ''
        }`
      : '--';

    return (
      <>
        <TableContainer component={Paper} style={{ marginBottom: '10px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell width='10%'>ND</StyledTableCell>
                <StyledTableCell width='45%' colSpan={2}>
                  Dinheiro
                </StyledTableCell>
                <StyledTableCell width='45%' colSpan={2}>
                  Itens
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <StyledTableCell width={10}>
                  {nd.replace('S', '1/').replace('F', '')}
                </StyledTableCell>
                <StyledTableCell>D% = {item?.moneyRoll}</StyledTableCell>
                <StyledTableCell>{moneyStr}</StyledTableCell>
                <StyledTableCell>D% = {item?.itemRoll}</StyledTableCell>
                <StyledTableCell>{itemStr}</StyledTableCell>
              </TableRow>
              {(item.itemApplied || item.moneyApplied) && (
                <TableRow>
                  <StyledTableCell />
                  <StyledTableCell />
                  <StyledTableCell>{item.moneyApplied}</StyledTableCell>
                  <StyledTableCell />
                  <StyledTableCell style={{ whiteSpace: 'pre-wrap' }}>
                    {item.itemApplied}
                  </StyledTableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  });

  const handleRewardMultChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = event.target.value;
    if (val === 'Padrão' || val === 'Metade' || val === 'Dobro')
      setSrewardMult(val);
  };

  const formThemeColors = isDarkMode
    ? getSelectTheme('dark')
    : getSelectTheme('default');

  return (
    <div id='main-screen' style={{ margin: '30px 30px 30px 25px' }}>
      <div className='rewardsFilter'>
        <TextField
          id='filled-number'
          label='Quantidade'
          type='number'
          variant='outlined'
          onChange={onChangeQtd}
          style={{ marginRight: '10px' }}
          size='small'
          value={numberOfItems}
        />

        <Select
          className='filterSelect'
          options={nds}
          placeholder='Nível de Dificuldade'
          onChange={onChangeNd}
          theme={(theme) => ({
            ...theme,
            colors: {
              ...formThemeColors,
            },
          })}
        />

        <div>
          <FormControlLabel
            value='top'
            control={
              <Radio
                checked={rewardMult === 'Padrão'}
                onChange={handleRewardMultChange}
                value='Padrão'
                name='radio-button-demo'
                color='default'
              />
            }
            label='Padrão'
            labelPlacement='end'
          />

          <FormControlLabel
            value='top'
            control={
              <Radio
                checked={rewardMult === 'Metade'}
                onChange={handleRewardMultChange}
                value='Metade'
                name='radio-button-demo'
                color='default'
              />
            }
            label='Metade'
            labelPlacement='end'
          />

          <FormControlLabel
            value='top'
            control={
              <Radio
                checked={rewardMult === 'Dobro'}
                onChange={handleRewardMultChange}
                value='Dobro'
                name='radio-button-demo'
                color='default'
              />
            }
            label='Dobro'
            labelPlacement='end'
          />
        </div>

        <Button onClick={onClickGenerate} type='button' variant='contained'>
          Gerar Recompensa
        </Button>
      </div>

      <p>
        <ul>
          <li>
            <strong>Metade</strong>: Será gerado dinheiro ou item, nunca os dois
            ao mesmo tempo. O valor será o original rolado.
          </li>
          <li>
            <strong>Dobro</strong>: Será rolado normalmente, o dinheiro será
            dobrado e um item adicional será gerado.
          </li>
        </ul>
      </p>

      <h3>Como gerar o tesouro corretamente?</h3>

      <p>
        Para determinar o tesouro de uma única criatura, use a ND equivalente ao
        nível de desafio da criatura derrotada.
      </p>

      <p>
        Se o grupo tiver derrotado mais de uma criatura, use a ND equivalente ao
        nível de desafio do combate.
      </p>

      <p>
        Para criaturas com ND menor do que 1, o nível de desafio do combate será
        igual ao ND da criatura multiplicado pelo número delas. Assim, quatro
        inimigos de ND 1/4 formam um combate de ND 1.
      </p>

      <p>
        Para criaturas com ND igual ou maior do que 1, o nível de desafio do
        combate será igual ao ND da criatura +2 para cada vez que o número delas
        dobrar. Assim, dois inimigos de ND 5 formam um combate de ND 7, quatro
        inimigos de ND 8 formam um combate de ND 12 e assim por diante.
      </p>
      {items && ResultDiv}
      <p>
        Os valores entre parênteses dizem respeito a ordem de rolagem dos dados.
        <ul>
          <li>
            Para dinheiro, o valor entre parênteses é o rolado originalmente
            para calcular o total.
          </li>
          <li>
            Para riquezas, o primeiro número é para determinar qual a riqueza, o
            segundo é para determinar o valor dela.
          </li>
          <li>
            Para itens diversos, o valor determina qual item foi selecionado.
          </li>
          <li>
            Para armas e armaduras e (inclusive com modificações), o primeiro
            valor é 1d6 para determinar se o item é uma arma (1 a 4) ou armadura
            (5 ou 6). O segundo valor determina qual item foi selecionado.
          </li>
          <li>Para poções, é o valor correspondente à poção selecionada.</li>
          <li>
            Para itens mágicos, o primeiro valor é 1d6 para determina se
            encontra uma arma (1 ou 2), uma armadura (3) ou um acessório (4,5 ou
            6). O segundo valor determina o efeito mágico (ou o acessório mágico
            específico).
          </li>
        </ul>
      </p>
    </div>
  );
};

export default Rewards;
