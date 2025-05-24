import { cloneDeep, differenceBy, isArray, merge, mergeWith } from 'lodash';
import Equipment, { BagEquipments } from './Equipment';

const defaultEquipments: BagEquipments = {
  'Item Geral': [
    {
      nome: 'Mochila',
      group: 'Item Geral',
      spaces: 0,
    },
    {
      nome: 'Saco de dormir',
      group: 'Item Geral',
      spaces: 1,
    },
    {
      nome: 'Traje de viajante',
      group: 'Item Geral',
      spaces: 0,
    },
  ],
  Alimentação: [],
  Alquimía: [],
  Animal: [],
  Arma: [],
  Armadura: [],
  Escudo: [],
  Hospedagem: [],
  Serviço: [],
  Vestuário: [],
  Veículo: [],
};

function calcBagSpaces(bagEquipments: BagEquipments): number {
  const equipments = Object.values(bagEquipments).flat();

  let spaces = 0;

  equipments.forEach((equipment: Equipment) => {
    const equipamentSpaces = equipment.spaces || 0;
    spaces += equipamentSpaces;
  });

  return spaces;
}

function calcArmorPenalty(equipments: BagEquipments): number {
  const armorPenalty = equipments.Armadura.reduce(
    (acc, armor) => acc + armor.armorPenalty,
    0
  );

  const shieldPenalty = equipments.Escudo.reduce(
    (acc, armor) => acc + armor.armorPenalty,
    0
  );

  return armorPenalty + shieldPenalty;
}

export default class Bag {
  public equipments: BagEquipments;

  public spaces: number;

  public armorPenalty: number;

  constructor(equipments = {}) {
    this.equipments = merge(equipments, cloneDeep(defaultEquipments));

    this.spaces = calcBagSpaces(this.equipments);
    this.armorPenalty = calcArmorPenalty(this.equipments);
  }

  public setEquipments(equipments: BagEquipments): void {
    this.equipments = equipments;
    this.spaces = calcBagSpaces(this.equipments);
    this.armorPenalty = calcArmorPenalty(this.equipments);
  }

  public getEquipments(): BagEquipments {
    return this.equipments;
  }

  public getSpaces(): number {
    return this.spaces;
  }

  public getArmorPenalty(): number {
    return this.armorPenalty;
  }

  public addEquipment(equipments: Partial<BagEquipments>): void {
    const newEquipments = mergeWith(
      this.equipments,
      equipments,
      (oldEquips: Equipment[], newEquips: Equipment[]) => {
        if (isArray(oldEquips))
          return newEquips.concat(differenceBy(oldEquips, newEquips, 'nome'));

        return undefined;
      }
    );

    this.setEquipments(newEquipments);
  }
}
