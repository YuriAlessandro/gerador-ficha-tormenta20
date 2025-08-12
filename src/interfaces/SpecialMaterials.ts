export interface SpecialMaterialEffect {
  material: string;
  type: 'Arma' | 'Armadura e Escudo' | 'Escudo e Esotérico' | 'Esotérico';
  effect: string;
}

export interface SpecialMaterial {
  name: string;
  weaponEffect?: SpecialMaterialEffect;
  armorEffect?: SpecialMaterialEffect;
}
