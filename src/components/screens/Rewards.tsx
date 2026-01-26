import { Button, Container, Stack, styled } from '@mui/material';
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
import { SEO, getPageSEO } from '../SEO';
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
  // const [useSupItens, setUseSupItens] = useState<boolean>(false);

  const onClickGenerate = () => {
    const newItems: RewardGenerated[] = [];
    const isDouble = rewardMult === 'Dobro';
    const isHalf = rewardMult === 'Metade';

    let itemsToRoll = numberOfItems;

    if (isDouble) itemsToRoll *= 2;

    for (let index = 0; index < itemsToRoll; index += 1) {
      const newItem = rewardGenerator(nd);
      if (newItem.money)
        newItem.moneyApplied = applyMoneyReward(newItem.money, isHalf);
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
                  <StyledTableCell>
                    {item?.money?.reward?.applyRollBonus ? '+% ' : ''}
                    {item.moneyApplied}
                  </StyledTableCell>
                  <StyledTableCell />
                  <StyledTableCell style={{ whiteSpace: 'pre-wrap' }}>
                    {item?.item?.reward?.applyRollBonus ? '+% ' : ''}
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

  const rewardsSEO = getPageSEO('rewards');

  return (
    <>
      <SEO
        title={rewardsSEO.title}
        description={rewardsSEO.description}
        url='/recompensas'
      />
      <Container maxWidth='lg' sx={{ py: 3 }}>
        <Stack
          spacing={2}
          direction='row'
          flexWrap='wrap'
          alignItems='center'
          justifyContent='center'
          sx={{ marginBottom: '20px' }}
          rowGap={2}
        >
          <TextField
            id='filled-number'
            label='Quantidade'
            type='number'
            variant='outlined'
            onChange={onChangeQtd}
            sx={{ maxWidth: '100px' }}
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

          {/* <Divider orientation='vertical' flexItem />

        <FormControlLabel
          value='top'
          control={
            <Checkbox
              checked={useSupItens}
              onChange={() => setUseSupItens(!useSupItens)}
            />
          }
          label='Utilizar itens de suplementos'
          labelPlacement='end'
        />

        <Divider orientation='vertical' flexItem /> */}

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

          <Button onClick={onClickGenerate} type='button' variant='contained'>
            Gerar Recompensa
          </Button>
        </Stack>

        <p>
          <ul>
            <li>
              <strong>Metade</strong>: A criatura tem poucos tesouros; quaisquer
              resultados rolados para dinheiro é dividido pela metade.
            </li>
            <li>
              <strong>Dobro</strong>: Será rolado normalmente, duas vezes para
              para dinheiro e duas vezes para itens.
            </li>
          </ul>
        </p>

        {items && ResultDiv}

        <h3>Como gerar o tesouro corretamente?</h3>

        <p>
          Para determinar o tesouro de uma única criatura, use a ND equivalente
          ao nível de desafio da criatura derrotada.
        </p>

        <p>
          Se o grupo tiver derrotado mais de uma criatura, use a ND equivalente
          ao nível de desafio do combate.
        </p>

        <p>
          Para criaturas com ND menor do que 1, o nível de desafio do combate
          será igual ao ND da criatura multiplicado pelo número delas. Assim,
          quatro inimigos de ND 1/4 formam um combate de ND 1.
        </p>

        <p>
          Para criaturas com ND igual ou maior do que 1, o nível de desafio do
          combate será igual ao ND da criatura +2 para cada vez que o número
          delas dobrar. Assim, dois inimigos de ND 5 formam um combate de ND 7,
          quatro inimigos de ND 8 formam um combate de ND 12 e assim por diante.
        </p>
        {/* <p>
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
            Para itens diversos, o valor determina qual foi selecionado.
          </li>
          <li>
            Para armas e armaduras e (inclusive com modificações), o primeiro
            valor é 1d6 para determinar se o é uma arma (1 a 4) ou armadura
            (5 ou 6). O segundo valor determina qual foi selecionado.
          </li>
          <li>Para poções, é o valor correspondente à poção selecionada.</li>
          <li>
            Para itens mágicos, o primeiro valor é 1d6 para determina se
            encontra uma arma (1 ou 2), uma armadura (3) ou um acessório (4,5 ou
            6). O segundo valor determina o efeito mágico (ou o acessório mágico
            específico).
          </li>
        </ul>
      </p> */}
      </Container>
    </>
  );
};

export default Rewards;
