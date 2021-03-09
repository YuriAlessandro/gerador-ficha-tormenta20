export type equipGroup =
  | 'Arma'
  | 'Armadura'
  | 'Escudo'
  | 'Item Geral'
  | 'Alquimía'
  | 'Vestuário'
  | 'Hospedagem'
  | 'Alimentação'
  | 'Animal'
  | 'Veículo'
  | 'Serviço';
export default interface Equipment {
  nome: string;
  dano?: string;
  critico?: string;
  peso?: number;
  tipo?: string;
  alcance?: string;
  group: equipGroup;
}

export type defenseEquipGroup = 'Armadura' | 'Escudo';

export interface DefenseEquipment extends Equipment {
  defenseBonus: number;
  armorPenalty: number;
  group: defenseEquipGroup;
}

interface Modification {
  name: string;
  description: string;
}

export interface SuperiorEquipment extends Equipment {
  modifications: Modification[];
}

export type Bag = Record<equipGroup, Equipment[]>;
