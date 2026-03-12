import { cloneDeep, differenceBy, isArray, merge, mergeWith } from 'lodash';
import Equipment, { BagEquipments } from './Equipment';

const emptyEquipments: BagEquipments = {
  'Item Geral': [],
  Alimentação: [],
  Alquimía: [],
  Animal: [],
  Arma: [],
  Armadura: [],
  Escudo: [],
  Esotérico: [],
  Hospedagem: [],
  Serviço: [],
  Vestuário: [],
  Veículo: [],
};

const defaultEquipments: BagEquipments = {
  ...emptyEquipments,
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
};

function calcBagSpaces(bagEquipments: BagEquipments): number {
  const equipments = Object.values(bagEquipments).flat();

  let spaces = 0;

  equipments.forEach((equipment: Equipment) => {
    // Ignora equipamentos undefined ou sem a propriedade spaces
    if (!equipment) return;
    const equipamentSpaces = equipment.spaces || 0;
    const qty = equipment.quantity || 1;
    spaces += equipamentSpaces * qty;
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

  constructor(equipments = {}, skipDefaults = false) {
    const base = skipDefaults ? emptyEquipments : defaultEquipments;
    this.equipments = merge(cloneDeep(base), equipments);

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
