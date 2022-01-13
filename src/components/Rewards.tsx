import { Button, makeStyles, withStyles } from '@material-ui/core';
import React, { useState } from 'react';
import Select from 'react-select';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';

import { ITEM_TYPE, LEVELS } from '../interfaces/Rewards';
import {
  rewardGenerator,
  applyMoneyReward,
  applyItemReward,
  RewardGenerated,
} from '../functions/rewards/rewardsGenerator';

const StyledTableCell = withStyles(() => ({
  head: {
    backgroundColor: 'rgb(209, 50, 53)',
    color: '#FFF',
  },
}))(TableCell);

const useStyles = makeStyles(() => ({
  button: {
    background: 'rgb(209, 50, 53);',
    color: '#FAFAFA',
  },
}));

const nds = Object.keys(LEVELS).map((nd) => ({
  value: nd,
  label: `ND ${nd.replace('F', '').replace('S', '1/')}`,
}));

type SelectedOption = { value: string; label: string };

const Rewards: React.FC = () => {
  const classes = useStyles();

  const [items, setItems] = useState<RewardGenerated[]>();
  const [numberOfItems, setNumberOfItems] = useState<number>(1);
  const [nd, setNd] = useState<LEVELS>(LEVELS.S4);

  const onClickGenerate = () => {
    const newItems: RewardGenerated[] = [];
    for (let index = 0; index < numberOfItems; index += 1) {
      const newItem = rewardGenerator(nd);
      if (newItem.money) newItem.moneyApplied = applyMoneyReward(newItem.money);
      if (newItem.item) newItem.itemApplied = applyItemReward(newItem.item);
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
              <TableCell width={10}>
                {nd.replace('S', '1/').replace('F', '')}
              </TableCell>
              <TableCell>D% = {item?.moneyRoll}</TableCell>
              <TableCell>{moneyStr}</TableCell>
              <TableCell>D% = {item?.itemRoll}</TableCell>
              <TableCell>{itemStr}</TableCell>
            </TableRow>
            {(item.itemApplied || item.moneyApplied) && (
              <TableRow>
                <TableCell />
                <TableCell />
                <TableCell>{item.moneyApplied}</TableCell>
                <TableCell />
                <TableCell>{item.itemApplied}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  });

  return (
    <div id='main-screen' style={{ margin: '30px 30px 30px 25px' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}
      >
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
          // style={{ background: 'blue' }}
          // theme={(theme) => ({
          //   ...theme,
          //   colors: {
          //     ...formThemeColors,
          //   },
          // })}
        />

        <Button
          onClick={onClickGenerate}
          type='button'
          className={classes.button}
        >
          Gerar Recompensa
        </Button>
      </div>
      {items && ResultDiv}
    </div>
  );
};

export default Rewards;
