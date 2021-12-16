import { moneyRewards } from '../../data/rewards/money';
import { LEVELS, MoneyReward } from '../../interfaces/Rewards';
import { rollDice } from '../randomUtils';

export interface RewardGenerated {
  value: number;
  money?: MoneyReward;
  // item?: Items;
}

export function rewardGenerator(nd: LEVELS): RewardGenerated {
  const itemValue = rollDice(1, 100);

  const reward = moneyRewards[nd];
  const money = reward.find((r) => itemValue >= r.min && itemValue <= r.max);

  return {
    value: itemValue,
    money,
  };
}

export function applyMoneyReward(money: MoneyReward): string {
  if (money.reward) {
    const rewardType = money.reward.money;
    const diceRoll = rollDice(money.reward.qty, money.reward.dice);

    const value = money.reward.som
      ? diceRoll + money.reward.som
      : diceRoll * money.reward.mult;

    return `${value} ${rewardType}`;
  }

  return '--';
}
