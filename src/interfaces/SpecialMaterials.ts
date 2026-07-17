export interface SpecialMaterialEffect {
  material: string;
  type:
    | 'Arma'
    | 'Armadura'
    | 'Armadura e Escudo'
    | 'Escudo e Esotérico'
    | 'Esotérico';
  effect: string;
}

export interface SpecialMaterial {
  name: string;
  weaponEffect?: SpecialMaterialEffect;
  armorEffect?: SpecialMaterialEffect;
  /** Suplemento de origem (ausente = livro básico) */
  supplementId?: string;
}
