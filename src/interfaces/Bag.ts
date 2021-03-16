import { cloneDeep, differenceBy, isArray, merge, mergeWith } from 'lodash';
import Equipment, { BagEquipments } from './Equipment';

const defaultEquipments: BagEquipments = {
  'Item Geral': [
    {
      nome: 'Mochila',
      group: 'Item Geral',
      peso: 1,
    },
    {
      nome: 'Saco de dormir',
      group: 'Item Geral',
      peso: 2.5,
    },
    {
      nome: 'Traje de viajante',
      group: 'Item Geral',
      peso: 2,
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

function calcBagWeight(equipments: BagEquipments): number {
  const equipmentGroups = Object.values(equipments).flat();

  let weight = 0;

  equipmentGroups.forEach((equipment) => {
    const equipmentWeight = equipment || 0;
    weight += equipmentWeight;
  });

  return weight;
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
  private equipments: BagEquipments;

  private weight: number;

  private armorPenalty: number;

  constructor(equipments = {}) {
    this.equipments = merge(equipments, cloneDeep(defaultEquipments));

    this.weight = calcBagWeight(this.equipments);
    this.armorPenalty = calcArmorPenalty(this.equipments);
  }

  public setEquipments(equipments: BagEquipments): void {
    this.equipments = equipments;
    this.weight = calcBagWeight(this.equipments);
    this.armorPenalty = calcArmorPenalty(this.equipments);
  }

  public getEquipments(): BagEquipments {
    return this.equipments;
  }

  public getWeight(): number {
    return this.weight;
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
