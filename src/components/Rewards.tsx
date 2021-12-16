import { Button, makeStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import {
  rewardGenerator,
  applyMoneyReward,
  RewardGenerated,
} from '../functions/rewards/rewardsGenerator';
import { LEVELS } from '../interfaces/Rewards';

const useStyles = makeStyles(() => ({
  button: {
    background: 'rgb(209, 50, 53);',
    color: '#FAFAFA',
    marginBottom: '10px',
  },
}));

const nds = Object.keys(LEVELS).map((nd) => ({
  value: nd,
  label: `ND ${nd.replace('F', '').replace('S', '1/')}`,
}));

type SelectedOption = { value: string; label: string };

const Rewards: React.FC = () => {
  const classes = useStyles();

  const [item, setItem] = useState<RewardGenerated>();
  const [nd, setNd] = useState<LEVELS>(LEVELS.S4);
  const [generatedMoney, setGeneratedMoney] = useState('');

  useEffect(() => {
    if (item && item.money) setGeneratedMoney(applyMoneyReward(item.money));
  }, [item]);

  const onClickGenerate = () => {
    const newItem = rewardGenerator(nd);
    setItem(newItem);
  };

  const onChangeNd = (newNd: SelectedOption | null) => {
    if (newNd) setNd(newNd.value as LEVELS);
  };

  const resultDiv = (
    <div>
      <strong>Tesouro ND {nd.replace('S', '1/').replace('F', '')}: </strong>
      {item?.money?.reward ? (
        <span>
          Valor rolado: {item.value} = {item.money?.reward?.qty}
          {item.money?.reward?.dice > 1 ? `d${item.money?.reward?.dice}` : ''}
          {item.money?.reward?.mult > 1 ? `x${item.money?.reward?.mult} ` : ' '}
          {item.money?.reward?.som ? `+${item.money?.reward?.som} ` : ' '}
          {item.money?.reward?.money}
        </span>
      ) : (
        <span>Valor rolado: {item?.value} = --</span>
      )}
    </div>
  );

  return (
    <div>
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
      {item && resultDiv}
      {generatedMoney && <div>{generatedMoney}</div>}
    </div>
  );
};

export default Rewards;
