import CharacterSheet from '../interfaces/CharacterSheet';
import Skill, { isOficioSkill } from '../interfaces/Skills';
import { getSkillTotal } from '../functions/skills/skillTotal';
import { ATTRIBUTE_KEYS, FoundryAttribute } from './enums';

/**
 * Campos PERSISTIDOS de uma perícia no sistema (`schemaSkill`). O valor final,
 * os bônus de efeitos e as condições são derivados pelo Foundry.
 */
export type FoundryCharSkill = {
  atributo: FoundryAttribute;
  treinado: boolean;
  /** Somente treinado. */
  st: boolean;
  /** Sofre penalidade de armadura. */
  pda: boolean;
  /** Sofre modificador de tamanho. */
  size: boolean;
  outros: number;
  custom: boolean;
  label: string;
};

type SkillDefinition = [
  atributo: FoundryAttribute,
  st?: boolean,
  pda?: boolean,
  size?: boolean
];

/** Espelha `T20.pericias` do sistema (`module/config/T20.js`). */
const SKILL_DEFINITIONS: Record<string, SkillDefinition> = {
  acro: ['des', false, true],
  ades: ['car', true],
  atle: ['for'],
  atua: ['car', true],
  cava: ['des'],
  conh: ['int', true],
  cura: ['sab'],
  dipl: ['car'],
  enga: ['car'],
  fort: ['con'],
  furt: ['des', false, true, true],
  guer: ['int', true],
  inic: ['des'],
  inti: ['car'],
  intu: ['sab'],
  inve: ['int'],
  joga: ['car', true],
  ladi: ['des', true, true],
  luta: ['for'],
  mist: ['int', true],
  nobr: ['int', true],
  perc: ['sab'],
  pilo: ['des', true],
  pont: ['des'],
  refl: ['des'],
  reli: ['sab', true],
  sobr: ['sab'],
  vont: ['sab'],
  // Ofícios que o sistema traz prontos; os demais entram como `ofi1`…`ofi9`.
  alfa: ['int', true],
  alqu: ['int', true],
  arme: ['int', true],
  arte: ['int', true],
  cozi: ['int', true],
  enge: ['int', true, true],
};

export const FOUNDRY_SKILLS: Partial<Record<Skill, string>> = {
  [Skill.ACROBACIA]: 'acro',
  [Skill.ADESTRAMENTO]: 'ades',
  [Skill.ATLETISMO]: 'atle',
  [Skill.ATUACAO]: 'atua',
  [Skill.CAVALGAR]: 'cava',
  [Skill.CONHECIMENTO]: 'conh',
  [Skill.CURA]: 'cura',
  [Skill.DIPLOMACIA]: 'dipl',
  [Skill.ENGANACAO]: 'enga',
  [Skill.FORTITUDE]: 'fort',
  [Skill.FURTIVIDADE]: 'furt',
  [Skill.GUERRA]: 'guer',
  [Skill.INICIATIVA]: 'inic',
  [Skill.INTIMIDACAO]: 'inti',
  [Skill.INTUICAO]: 'intu',
  [Skill.INVESTIGACAO]: 'inve',
  [Skill.JOGATINA]: 'joga',
  [Skill.LADINAGEM]: 'ladi',
  [Skill.LUTA]: 'luta',
  [Skill.MISTICISMO]: 'mist',
  [Skill.NOBREZA]: 'nobr',
  [Skill.PERCEPCAO]: 'perc',
  [Skill.PILOTAGEM]: 'pilo',
  [Skill.PONTARIA]: 'pont',
  [Skill.REFLEXOS]: 'refl',
  [Skill.RELIGIAO]: 'reli',
  [Skill.SOBREVIVENCIA]: 'sobr',
  [Skill.VONTADE]: 'vont',
  [Skill.OFICIO_ALFAIATE]: 'alfa',
  [Skill.OFICIO_ALQUIMIA]: 'alqu',
  [Skill.OFICIO_ARMEIRO]: 'arme',
  [Skill.OFICIO_ARTESANATO]: 'arte',
  [Skill.OFICIO_CULINARIA]: 'cozi',
  [Skill.OFICIO_EGENHOQUEIRO]: 'enge',
};

/** O sistema aceita no máximo nove ofícios personalizados (`ofi1`…`ofi9`). */
const MAX_CUSTOM_CRAFTS = 9;

function buildSkill(definition: SkillDefinition): FoundryCharSkill {
  const [atributo, st = false, pda = false, size = false] = definition;
  return {
    atributo,
    treinado: false,
    st,
    pda,
    size,
    outros: 0,
    custom: false,
    label: '',
  };
}

/** 'Ofício (Alvenaria)' → 'Ofício: Alvenaria', como o sistema rotula. */
function toCraftLabel(skill: string): string {
  const specialty = skill.match(/\((.*)\)/)?.[1]?.trim();
  return specialty ? `Ofício: ${specialty}` : skill;
}

/** Todas as perícias do sistema, destreinadas. */
export function buildDefaultSkills(): Record<string, FoundryCharSkill> {
  const skills: Record<string, FoundryCharSkill> = {};
  Object.entries(SKILL_DEFINITIONS).forEach(([key, definition]) => {
    skills[key] = buildSkill(definition);
  });
  return skills;
}

/** `T20.sizeModifiers` do sistema: o `@tamanho` das perícias com `size`. */
const SIZE_SKILL_MODIFIERS: Record<string, number> = {
  min: 5,
  peq: 2,
  med: 0,
  gra: -2,
  eno: -5,
  col: -10,
};

/** O que o Foundry soma sozinho numa perícia, além do `outros`. */
export interface SkillDerivation {
  /** Nível do personagem (soma dos itens de classe). */
  level: number;
  /** Chave de tamanho do ator (`tracos.tamanho`). */
  size: string;
  /** `@pda`: soma das penalidades dos itens vestidos (número ≤ 0). */
  armorPenalty: number;
  /** Valor do atributo no Foundry, já com os efeitos ligados. */
  attribute: (attribute: FoundryAttribute) => number;
  /** Bônus de efeitos ligados na perícia (chave própria ou curinga). */
  effectBonus: (skillKey: string) => number;
}

/** `attributes.treino` do sistema. */
export function getTrainingBonus(level: number): number {
  if (level > 14) return 6;
  if (level > 6) return 4;
  return 2;
}

/** `prepareSkill` do sistema, sem o `outros`. */
function getFoundrySkillValue(
  key: string,
  skill: FoundryCharSkill,
  derivation: SkillDerivation
): number {
  const { level } = derivation;
  return (
    Math.floor(level / 2) +
    derivation.attribute(skill.atributo) +
    (skill.treinado ? getTrainingBonus(level) : 0) +
    derivation.effectBonus(key) +
    (skill.pda ? derivation.armorPenalty : 0) +
    (skill.size ? SIZE_SKILL_MODIFIERS[derivation.size] ?? 0 : 0)
  );
}

/**
 * Perícias do ator. O `outros` de cada perícia fecha a conta com o total que a
 * ficha mostra, como a Defesa: absorve o que a ficha soma por caminhos que o
 * Foundry não enxerga (bônus sem efeito equivalente, penalidade de armadura
 * sem proficiência, ajuste manual) e desconta o que ele já soma sozinho.
 */
export function buildSkills(
  sheet: CharacterSheet,
  derivation: SkillDerivation
): Record<string, FoundryCharSkill> {
  const skills = buildDefaultSkills();
  // Nome da perícia na ficha → chave no Foundry, incluindo os ofícios custom.
  const keys = new Map<string, string>(
    Object.entries(FOUNDRY_SKILLS) as [string, string][]
  );

  let customCrafts = 0;
  (sheet.skills ?? []).forEach((skill) => {
    const key = FOUNDRY_SKILLS[skill];
    if (key) {
      skills[key].treinado = true;
      return;
    }
    // Ofício sem chave própria no sistema (os do livro que ele não traz e os
    // personalizados): perícia custom, no mesmo formato que a ficha do Foundry
    // cria pelo botão "novo ofício".
    if (isOficioSkill(skill) && customCrafts < MAX_CUSTOM_CRAFTS) {
      customCrafts += 1;
      const customKey = `ofi${customCrafts}`;
      skills[customKey] = {
        ...buildSkill(['int', true]),
        treinado: true,
        custom: true,
        label: toCraftLabel(skill),
      };
      keys.set(skill, customKey);
    }
  });

  (sheet.completeSkills ?? []).forEach((skill) => {
    const key = keys.get(skill.name);
    const target = key && skills[key];
    if (!target) return;
    // A perícia usa o atributo da ficha, que o jogador pode ter trocado.
    if (skill.modAttr) target.atributo = ATTRIBUTE_KEYS[skill.modAttr];
    target.outros =
      getSkillTotal(sheet, skill) -
      getFoundrySkillValue(key, target, derivation);
  });

  return skills;
}
