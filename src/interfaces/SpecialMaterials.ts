import type {
  EnhancementEffect,
  ScaledEnhancementEffect,
} from '../functions/itemEnhancements/core';

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
  /** Nome de exibição do suplemento de origem (carimbado pelo registry) */
  supplementName?: string;
  /**
   * Efeito numérico do material como ARMA, embutido no dado. Presente em
   * conteúdo não-core; materiais do livro básico resolvem pelo registro
   * estático `materialEffects`.
   */
  weaponEffectStats?: EnhancementEffect;
  /**
   * Efeito numérico do material como ARMADURA/ESCUDO. Aceita a forma com dois
   * ramos (`light`/`heavy`) porque vários materiais escalam com o porte da
   * armadura — o equivalente serializável da função usada pelo core.
   */
  armorEffectStats?: ScaledEnhancementEffect;
}
