import {
  armorEnchantments,
  armors,
  armorsModifications,
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
  weaponsModifications,
} from '../../data/rewards/items';
import {
  majorRych,
  mediumRych,
  minorRych,
  moneyRewards,
} from '../../data/rewards/money';
import {
  ItemMod,
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

export function rewardGenerator(nd: LEVELS, isHalf: boolean): RewardGenerated {
  const moneyValue = rollDice(1, 100);
  const itemValue = rollDice(1, 100);

  const moneyReward = moneyRewards[nd];
  const itemsReward = itemsRewards[nd];
  const halfRoll = rollDice(1, 2);

  const money = moneyReward.find(
    (r) => moneyValue >= r.min && moneyValue <= r.max
  );

  const item = itemsReward.find(
    (r) => itemValue >= r.min && itemValue <= r.max
  );

  return {
    itemRoll: itemValue,
    moneyRoll: moneyValue,
    money: isHalf && halfRoll === 2 ? undefined : money,
    item: isHalf && halfRoll === 1 ? undefined : item,
  };
}

export function applyMoneyReward(
  money: MoneyReward,
  isDouble?: boolean
): string {
  if (money.reward) {
    const rewardType = money.reward.money;
    const diceRoll = rollDice(money.reward.qty, money.reward.dice);

    let value = money.reward.som
      ? diceRoll + money.reward.som
      : diceRoll * money.reward.mult;

    if (isDouble) value *= 2;

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
        let wealthValue =
          rollDice(wealth.value.qtd, wealth.value.dice) * wealth.value.mult;

        if (isDouble) wealthValue *= 2;

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

    return `(${diceRoll}) ${rolledItem.item}`;
  }

  return '';
};

const getSpecialMaterial = () => {
  const materialRoll = rollDice(1, 6);

  switch (materialRoll) {
    case 1:
      return 'aço rubi';
    case 2:
      return 'adamante';
    case 3:
      return 'gelo eterno';
    case 4:
      return 'madeira Tollon';
    case 5:
      return 'matéria vermelha';
    case 6:
      return 'mitral';
    default:
      break;
  }

  return '';
};

const getWeaponModification = (mods: number) => {
  let realQtd = mods;
  let str = '(';
  let remainingMods = mods;
  const takenMods: ItemMod[] = [];

  for (let index = 0; index < realQtd; index += 1) {
    const modRoll = rollDice(1, 100);
    const modification = weaponsModifications.find(
      (wm) => modRoll >= wm.min && modRoll <= wm.max
    );

    if (modification) {
      if (takenMods.includes(modification)) {
        realQtd += 1;
      } else if (modification?.double && mods === 1) {
        realQtd += 1;
      } else if (modification?.double && remainingMods < 2) {
        realQtd += 1;
      } else {
        if (modification?.double) realQtd -= 1;

        remainingMods -= 1;
        takenMods.push(modification);
        if (modification?.mod === 'Material especial')
          str = str.concat(`Material ${getSpecialMaterial()}; `);
        else
          str = str.concat(
            `${modification?.mod}${index === realQtd - 1 ? `` : '; '}`
          );
      }
    }
  }

  return `${str})`;
};

const getArmorModification = (mods: number) => {
  let realQtd = mods;
  let str = '(';
  let remainingMods = mods;
  const takenMods: ItemMod[] = [];

  for (let index = 0; index < realQtd; index += 1) {
    const modRoll = rollDice(1, 100);

    const modification = armorsModifications.find(
      (wm) => modRoll >= wm.min && modRoll <= wm.max
    );

    if (modification) {
      if (takenMods.includes(modification)) {
        realQtd += 1;
      } else if (modification?.double && mods === 1) {
        realQtd += 1;
      } else if (modification?.double && remainingMods < 2) {
        realQtd += 1;
      } else {
        if (modification?.double) realQtd -= 1;

        remainingMods -= 1;
        takenMods.push(modification);
        if (modification?.mod === 'Material especial')
          str = str.concat(`Material ${getSpecialMaterial()}; `);
        else
          str = str.concat(
            `${modification?.mod}${index === realQtd - 1 ? `` : '; '}`
          );
      }
    }
  }

  return `${str})`;
};

const getWeaponOrArmor = (diceRoll: number, mods: number) => {
  const typeRoll = rollDice(1, 6);

  if (typeRoll >= 1 && typeRoll <= 4) {
    // É uma arma
    const rolledItem = weapons.find(
      (i) => typeRoll >= i.min && typeRoll <= i.max
    );

    if (rolledItem) {
      if (mods > 0) {
        const modsStr = getWeaponModification(mods);
        return `(${typeRoll},${diceRoll}) ${rolledItem.item.nome} ${modsStr}`;
      }

      return `(${typeRoll},${diceRoll}) ${rolledItem.item.nome}`;
    }
  } else if (typeRoll >= 5 && typeRoll <= 6) {
    // É uma armadura ou escudo
    const rolledItem = armors.find(
      (i) => typeRoll >= i.min && typeRoll <= i.max
    );

    if (rolledItem) {
      if (mods > 0) {
        const modsStr = getArmorModification(mods);
        return `(${typeRoll},${diceRoll}) ${rolledItem.item.nome} ${modsStr}`;
      }

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

export function applyItemReward(item: ItemReward, isDouble?: boolean): string {
  const diceRoll = rollDice(1, 100);
  let rtn = '';
  const l = isDouble ? 2 : 1;

  for (let index = 0; index < l; index += 1) {
    if (item.reward?.type === ITEM_TYPE.DIVERSO) {
      // Item diverso, rola 1d100 para determinar qual item é encontrado.
      rtn += getMiscellaneousItem(diceRoll);
    }
    if (
      item.reward?.type === ITEM_TYPE.ARMA_ARMADURA ||
      item.reward?.type === ITEM_TYPE.SUPERIOR
    ) {
      /* Armas e armaduras. Rola 1d6. Um resultado 1 a 4 é uma arma. Um resultado 5 ou 6, uma armadura ou escudo.
      Então, rola 1d100 para determinar o item encontrado. */
      rtn += getWeaponOrArmor(diceRoll, item.reward.mods || 0);
    }
    if (item.reward?.type === ITEM_TYPE.POCAO) {
      /* É uma poção. Determinar primeira quantas poções foram encontradas
      depois rolar 1d100 para determinar quais foram encontradas. */
      if (item.reward.som)
        rtn += getPotionItem(
          item.reward.qty,
          item.reward.dice,
          item.reward.som
        );
      rtn += getPotionItem(item.reward.qty, item.reward.dice, 0);
    }
    if (item.reward?.type === ITEM_TYPE.MAGICO_MENOR) {
      /* Para itens mágicos, role 1d6. Em um resultado 1 ou 2, é encontrado uma arma.
      Em um resultado 3, uma armadura. Um resultado 4, 5 ou 6 é encontrado um acessório. */
      rtn += getMagicalItem(1);
    }
    if (item.reward?.type === ITEM_TYPE.MAGICO_MEDIO) {
      rtn += getMagicalItem(3);
    }
    if (item.reward?.type === ITEM_TYPE.MAGICO_MAIOR) {
      rtn += getMagicalItem(4);
    }

    rtn += '\n';
  }

  return rtn;
}
