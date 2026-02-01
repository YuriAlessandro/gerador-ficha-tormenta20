import Race, {
  RaceAbility,
  RaceAttributeAbility,
} from '../../../../../interfaces/Race';
import Skill from '../../../../../interfaces/Skills';
import {
  getRandomItemFromArray,
  pickFromArray,
} from '../../../../../functions/randomUtils';
import { Atributo } from '../../atributos';
import {
  buildTabuAbility,
  DUENDE_FIXED_ABILITIES,
  DUENDE_NATURE_NAMES,
  DUENDE_NATURES,
  DUENDE_PRESENTE_NAMES,
  DUENDE_PRESENTES,
  DUENDE_SIZE_NAMES,
  DUENDE_SIZES,
  DUENDE_TABU_SKILLS,
} from './duende-config';

/**
 * Mescla atributos cumulativos, somando modificadores do mesmo atributo
 */
function mergeAttributes(
  attributes: RaceAttributeAbility[]
): RaceAttributeAbility[] {
  const attrMap = new Map<string, number>();

  attributes.forEach((attr) => {
    if (attr.attr !== 'any') {
      const current = attrMap.get(attr.attr) || 0;
      attrMap.set(attr.attr, current + attr.mod);
    }
  });

  // Incluir atributos 'any' sem mesclar
  const anyAttrs = attributes.filter((attr) => attr.attr === 'any');

  // Converter Map de volta para array
  const mergedAttrs: RaceAttributeAbility[] = Array.from(attrMap.entries()).map(
    ([attr, mod]) => ({
      attr: attr as Atributo,
      mod,
    })
  );

  return [...mergedAttrs, ...anyAttrs];
}

/**
 * Aplica customização ao Duende
 * Esta função é usada tanto na geração inicial quanto no editor manual
 */
export function applyDuendeCustomization(
  baseRace: Race,
  natureId: string,
  sizeId: string,
  bonusAttributes: Atributo[],
  presenteIds: string[],
  tabuSkill: Skill
): Race {
  const nature = DUENDE_NATURES[natureId];
  const size = DUENDE_SIZES[sizeId];

  if (!nature || !size) {
    // Invalid customization - return base race unchanged
    return baseRace;
  }

  // Calcular atributos
  // 1. Atributos dos Dons (+1 em dois atributos)
  const donsAttrs: RaceAttributeAbility[] = bonusAttributes.map((attr) => ({
    attr,
    mod: 1,
  }));

  // 2. Atributo extra da natureza Animal
  const natureAttrs: RaceAttributeAbility[] = nature.extraAttribute
    ? [{ attr: 'any' as const, mod: 1 }]
    : [];

  // 3. Atributos do tamanho
  const sizeAttrs = size.attributeModifiers || [];

  // Acumular todos os atributos
  const accumulatedAttrs = mergeAttributes([
    ...donsAttrs,
    ...natureAttrs,
    ...sizeAttrs,
  ]);

  // Construir lista de habilidades
  const abilities: RaceAbility[] = [
    ...DUENDE_FIXED_ABILITIES, // Tipo de Criatura, Aversão a Ferro, Aversão a Sinos
    ...nature.abilities, // Habilidades da natureza escolhida
    buildTabuAbility(tabuSkill), // Tabu com a perícia escolhida
  ];

  // Adicionar os presentes escolhidos
  presenteIds.forEach((presenteId) => {
    const presente = DUENDE_PRESENTES[presenteId];
    if (presente) {
      abilities.push(presente.ability);
    }
  });

  return {
    ...baseRace,
    nature: natureId,
    presentPowers: presenteIds,
    tabuSkill,
    attributes: {
      attrs: accumulatedAttrs,
    },
    abilities,
    size: size.sizeCategory,
  };
}

/**
 * Gera atributos aleatórios para os Dons do Duende
 * Se a natureza for Animal, permite repetir um atributo dos dons
 */
function generateRandomBonusAttributes(isAnimal: boolean): Atributo[] {
  const allAttrs = Object.values(Atributo);

  if (isAnimal) {
    // Animal: pode repetir um atributo (para +2 em um só)
    // 50% de chance de repetir
    if (Math.random() > 0.5) {
      const attr = getRandomItemFromArray(allAttrs);
      return [attr, attr];
    }
  }

  // Escolher dois atributos diferentes
  const firstAttr = getRandomItemFromArray(allAttrs);
  const remainingAttrs = allAttrs.filter((a) => a !== firstAttr);
  const secondAttr = getRandomItemFromArray(remainingAttrs);

  return [firstAttr, secondAttr];
}

/**
 * Raça Duende (Heróis de Arton)
 * Baseado no PR #406 de Bruno Boscolo (@BrunoBoscolo)
 * Adaptado para o sistema de suplementos
 *
 * O Duende é uma raça complexa com múltiplas escolhas:
 * - Natureza (Animal, Vegetal, Mineral)
 * - Tamanho (Minúsculo, Pequeno, Médio, Grande)
 * - Dons (+1 em dois atributos)
 * - Presentes (3 poderes de uma lista de 14)
 * - Tabu (-5 em uma perícia)
 */
const DUENDE: Race = {
  name: 'Duende',

  // Atributos base: serão substituídos pela customização
  // Os +1 dos Dons são aplicados via customização
  attributes: {
    attrs: [
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
    ],
  },

  faithProbability: {
    ALLIHANNA: 1,
    HYNINN: 1,
    NIMB: 1,
    WYNNA: 1,
  },

  // Habilidades base: serão substituídas pela customização
  abilities: [...DUENDE_FIXED_ABILITIES],

  /**
   * setup() gera escolhas aleatórias e aplica customização
   * Modal permitirá alteração após geração
   */
  setup: (race) => {
    // Gerar escolhas aleatórias
    const randomNatureId = getRandomItemFromArray(DUENDE_NATURE_NAMES);
    const randomSizeId = getRandomItemFromArray(DUENDE_SIZE_NAMES);
    const randomPresentes = pickFromArray(DUENDE_PRESENTE_NAMES, 3);
    const randomTabuSkill = getRandomItemFromArray(DUENDE_TABU_SKILLS);

    // Gerar atributos dos Dons
    const isAnimal = randomNatureId === 'animal';
    const randomBonusAttrs = generateRandomBonusAttributes(isAnimal);

    // Aplicar customização completa
    return applyDuendeCustomization(
      race,
      randomNatureId,
      randomSizeId,
      randomBonusAttrs,
      randomPresentes,
      randomTabuSkill
    );
  },

  /**
   * Retorna deslocamento baseado no tamanho
   */
  getDisplacement(race) {
    if (race.sizeCategory) {
      const size = DUENDE_SIZES[race.sizeCategory];
      if (size) {
        return size.displacement;
      }
    }
    return 9; // Default (Médio)
  },
};

export default DUENDE;
