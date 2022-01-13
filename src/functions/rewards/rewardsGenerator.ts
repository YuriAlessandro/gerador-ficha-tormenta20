import {
  armorEnchantments,
  armors,
  enchantedArmors,
  enchantedWeapons,
  itemsRewards,
  majorAccessories,
  mediumAccessories,
  minorAccessories,
  miscellaneousItems,
  potions,
  weapons,
  weaponsEnchantments,
} from '../../data/rewards/items';
import {
  majorRych,
  mediumRych,
  minorRych,
  moneyRewards,
} from '../../data/rewards/money';
import {
  ItemReward,
  ITEM_TYPE,
  LEVELS,
  MoneyReward,
  MONEY_TYPE,
  Rych,
} from '../../interfaces/Rewards';
import { getRandomItemFromArray, rollDice } from '../randomUtils';

export interface RewardGenerated {
  moneyRoll: number;
  itemRoll: number;
  money?: MoneyReward;
  item?: ItemReward;
  moneyApplied?: string;
  itemApplied?: string;
}

export function rewardGenerator(nd: LEVELS): RewardGenerated {
  const moneyValue = rollDice(1, 100);
  const itemValue = rollDice(1, 100);

  const moneyReward = moneyRewards[nd];
  const itemsReward = itemsRewards[nd];

  const money = moneyReward.find(
    (r) => moneyValue >= r.min && moneyValue <= r.max
  );
  const item = itemsReward.find(
    (r) => itemValue >= r.min && itemValue <= r.max
  );

  return {
    itemRoll: itemValue,
    moneyRoll: moneyValue,
    money,
    item,
  };
}

export function applyMoneyReward(money: MoneyReward): string {
  if (money.reward) {
    const rewardType = money.reward.money;
    const diceRoll = rollDice(money.reward.qty, money.reward.dice);

    const value = money.reward.som
      ? diceRoll + money.reward.som
      : diceRoll * money.reward.mult;

    let wealth: Rych | undefined;
    const wealthRoll = rollDice(1, 100);

    if (rewardType === MONEY_TYPE.RIQUEZA_MENOR) {
      wealth = minorRych.find(
        (mr) => wealthRoll >= mr.min && wealthRoll <= mr.max
      );
    } else if (rewardType === MONEY_TYPE.RIQUEZA_MEDIA) {
      wealth = mediumRych.find(
        (mr) => wealthRoll >= mr.min && wealthRoll <= mr.max
      );
    } else if (rewardType === MONEY_TYPE.RIQUEZA_MAIOR) {
      wealth = majorRych.find(
        (mr) => wealthRoll >= mr.min && wealthRoll <= mr.max
      );
    }

    if (wealth) {
      let str = '';

      for (let i = 0; i < value; i += 1) {
        const wealthValue =
          rollDice(wealth.value.qtd, wealth.value.dice) * wealth.value.mult;

        const wealthItem = getRandomItemFromArray(wealth.items);
        str = str.concat(
          `${wealthItem} no valor de T$${wealthValue}${
            i === value - 1 ? '.' : '; '
          }`
        );
      }

      return `(${diceRoll}) ${str}`;
    }

    return `(${diceRoll}) ${value} ${rewardType}`;
  }

  return '--';
}

const getMiscellaneousItem = (diceRoll: number) => {
  const rolledItem = miscellaneousItems.find(
    (i) => diceRoll >= i.min && diceRoll <= i.max
  );

  if (rolledItem) {
    if (rolledItem.effect) {
      const itemRoll = rollDice(rolledItem.effect.qtd, rolledItem.effect.dice);
      return `${itemRoll} ${rolledItem.item}`;
    }

    return rolledItem.item;
  }

  return '';
};

const getWeaponOrArmor = (diceRoll: number) => {
  const typeRoll = rollDice(1, 6);

  if (typeRoll >= 1 && typeRoll <= 4) {
    // É uma arma
    const rolledItem = weapons.find(
      (i) => typeRoll >= i.min && typeRoll <= i.max
    );

    if (rolledItem) {
      return `(${typeRoll},${diceRoll}) ${rolledItem.item.nome}`;
    }
  } else if (typeRoll >= 5 && typeRoll <= 6) {
    // É uma armadura ou escudo
    const rolledItem = armors.find(
      (i) => typeRoll >= i.min && typeRoll <= i.max
    );

    if (rolledItem) {
      return `(${typeRoll},${diceRoll}) ${rolledItem.item.nome}`;
    }
  }

  return '';
};

const getPotionItem = (qty: number, dice: number, som: number) => {
  const qtd = rollDice(qty, dice) + som;
  let rst = '';

  for (let i = 0; i < qtd; i += 1) {
    const potionRoll = rollDice(1, 100);
    const rolledPotion = potions.find(
      (p) => potionRoll >= p.min && potionRoll <= p.max
    );

    if (rolledPotion)
      rst = rst.concat(`${rolledPotion.item}${i === qtd - 1 ? '.' : '; '}`);
  }

  if (som > 0) return `(${qtd - som}) ${rst}`;
  return `(${qtd}) ${rst}`;
};

const getMagicalItem = (qtd: number) => {
  const itemTypeRoll = rollDice(1, 6);

  if (itemTypeRoll >= 1 && itemTypeRoll <= 2) {
    // É uma arma
    const weaponRoll = rollDice(1, 100);
    const weapon = weapons.find(
      (w) => weaponRoll >= w.min && weaponRoll <= w.max
    );

    let str = `${weapon?.item.nome} mágico (`;
    let realQtd = qtd;

    for (let i = 0; i < realQtd; i += 1) {
      const enchantmentType = rollDice(1, 100);
      if (enchantmentType < 91) {
        const enchantment = weaponsEnchantments.find(
          (e) => enchantmentType >= e.min && enchantmentType <= e.max
        );

        if (enchantment) {
          /* Se o encantamento conta como dois e a arma só deveria ter
          um efeito mágico, vamos rolar mais uma vez */
          if (enchantment.double && qtd === 1) {
            realQtd += 1;
          } else {
            // Se o encantando conta como dois, tira um encantamento.
            if (enchantment.double) realQtd -= 1;
            str = str.concat(
              `${enchantment.enchantment}${i === qtd - 1 ? '' : '; '}`
            );
          }
        }
      } else {
        const sRoll = rollDice(1, 100);
        const w = enchantedWeapons.find(
          (nw) => sRoll >= nw.min && sRoll <= nw.max
        );

        if (w) return `(${itemTypeRoll},${sRoll}) ${w.item})`;
      }
    }

    return `(${itemTypeRoll},${weaponRoll}) ${str})`;
  }

  if (itemTypeRoll === 3) {
    const armorRoll = rollDice(1, 100);
    const armor = armors.find((a) => armorRoll >= a.min && armorRoll <= a.max);

    let str = `${armor?.item.nome} mágico (`;
    let realQtd = qtd;

    for (let i = 0; i < realQtd; i += 1) {
      const enchantmentType = rollDice(1, 100);
      if (enchantmentType < 91) {
        const enchantment = armorEnchantments.find(
          (e) => enchantmentType >= e.min && enchantmentType <= e.max
        );

        if (enchantment) {
          /* Se o encantamento conta como dois e a arma só deveria ter
          um efeito mágico, vamos rolar mais uma vez */
          if (enchantment.double && qtd === 1) {
            realQtd += 1;
          } else if (armor?.item.group !== 'Escudo' && enchantment.onlyShield) {
            realQtd += 1;
          } else {
            if (enchantment.double) realQtd -= 1;
            str = str.concat(
              `${enchantment.enchantment}${i === qtd - 1 ? '' : '; '}`
            );
          }
        }
      } else {
        const aRoll = rollDice(1, 100);
        const w = enchantedArmors.find(
          (na) => aRoll >= na.min && aRoll <= na.max
        );

        if (w) return `(${itemTypeRoll},${aRoll}) ${w.item})`;
      }
    }

    return `(${itemTypeRoll},${armorRoll}) ${str})`;
  }
  if (itemTypeRoll >= 4 && itemTypeRoll <= 6) {
    const acessoryRoll = rollDice(1, 100);
    if (qtd === 1) {
      const item = minorAccessories.find(
        (ma) => acessoryRoll >= ma.min && acessoryRoll <= ma.max
      );
      return `(${itemTypeRoll},${acessoryRoll}) ${item?.item}`;
    }
    if (qtd === 3) {
      const item = mediumAccessories.find(
        (ma) => acessoryRoll >= ma.min && acessoryRoll <= ma.max
      );
      return `(${itemTypeRoll},${acessoryRoll}) ${item?.item}`;
    }
    if (qtd === 4) {
      const item = majorAccessories.find(
        (ma) => acessoryRoll >= ma.min && acessoryRoll <= ma.max
      );
      return `(${itemTypeRoll},${acessoryRoll}) ${item?.item}`;
    }
  }

  return '';
};

export function applyItemReward(item: ItemReward): string {
  const diceRoll = rollDice(1, 100);

  if (item.reward?.type === ITEM_TYPE.DIVERSO) {
    // Item diverso, rola 1d100 para determinar qual item é encontrado.
    return getMiscellaneousItem(diceRoll);
  }
  if (
    item.reward?.type === ITEM_TYPE.ARMA_ARMADURA ||
    item.reward?.type === ITEM_TYPE.SUPERIOR
  ) {
    /* Armas e armaduras. Rola 1d6. Um resultado 1 a 4 é uma arma. Um resultado 5 ou 6, uma armadura ou escudo.
    Então, rola 1d100 para determinar o item encontrado. */
    return getWeaponOrArmor(diceRoll);
  }
  if (item.reward?.type === ITEM_TYPE.POCAO) {
    /* É uma poção. Determinar primeira quantas poções foram encontradas
    depois rolar 1d100 para determinar quais foram encontradas. */
    if (item.reward.som)
      return getPotionItem(item.reward.qty, item.reward.dice, item.reward.som);
    return getPotionItem(item.reward.qty, item.reward.dice, 0);
  }
  if (item.reward?.type === ITEM_TYPE.MAGICO_MENOR) {
    /* Para itens mágicos, role 1d6. Em um resultado 1 ou 2, é encontrado uma arma.
    Em um resultado 3, uma armadura. Um resultado 4, 5 ou 6 é encontrado um acessório. */
    return getMagicalItem(1);
  }
  if (item.reward?.type === ITEM_TYPE.MAGICO_MEDIO) {
    return getMagicalItem(3);
  }
  if (item.reward?.type === ITEM_TYPE.MAGICO_MAIOR) {
    return getMagicalItem(4);
  }

  return '';
}
