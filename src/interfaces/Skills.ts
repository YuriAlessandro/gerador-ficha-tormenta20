import { Atributo } from '../data/systems/tormenta20/atributos';

/**
 * Catálogo de perícias do livro. O VALOR do membro é o rótulo exibido E a chave
 * persistida na ficha.
 *
 * ATENÇÃO: este enum NÃO é o conjunto fechado de nomes possíveis. Ofícios
 * customizados são criados em runtime por `buildCustomOficio`
 * (src/functions/oficio.ts) e coexistem com estes membros. Em qualquer caminho
 * que veja nomes vindos de uma ficha, use os helpers deste arquivo
 * (`isOficioSkill`, `getSkillAttr`, `isTrainedOnlySkill`) em vez de lookup
 * direto no enum, em `SkillsAttrs` ou em `TrainedOnlySkills` — senão o Ofício
 * customizado é descartado silenciosamente.
 */
enum Skill {
  ACROBACIA = 'Acrobacia',
  ADESTRAMENTO = 'Adestramento',
  ATLETISMO = 'Atletismo',
  ATUACAO = 'Atuação',
  CAVALGAR = 'Cavalgar',
  CONHECIMENTO = 'Conhecimento',
  CURA = 'Cura',
  DIPLOMACIA = 'Diplomacia',
  ENGANACAO = 'Enganação',
  FORTITUDE = 'Fortitude',
  FURTIVIDADE = 'Furtividade',
  GUERRA = 'Guerra',
  INICIATIVA = 'Iniciativa',
  INTIMIDACAO = 'Intimidação',
  INTUICAO = 'Intuição',
  INVESTIGACAO = 'Investigação',
  JOGATINA = 'Jogatina',
  LADINAGEM = 'Ladinagem',
  LUTA = 'Luta',
  MISTICISMO = 'Misticismo',
  NOBREZA = 'Nobreza',
  OFICIO = 'Ofício (Qualquer)',
  OFICIO_ARMEIRO = 'Ofício (Armeiro)',
  // Nome do membro mantido por compatibilidade; valor segue o livro ("Ofício (Artesão)")
  OFICIO_ARTESANATO = 'Ofício (Artesão)',
  OFICIO_ALQUIMIA = 'Ofício (Alquímia)',
  OFICIO_CULINARIA = 'Ofício (Culinária)',
  OFICIO_ALFAIATE = 'Ofício (Alfaiate)',
  OFICIO_ALVENARIA = 'Ofício (Alvenaria)',
  OFICIO_CARPINTEIRO = 'Ofício (Carpinteiro)',
  OFICIO_JOALHEIRO = 'Ofício (Joalheiro)',
  OFICIO_FAZENDEIRO = 'Ofício (Fazendeiro)',
  OFICIO_PESCADOR = 'Ofício (Pescador)',
  OFICIO_ESTALAJADEIRO = 'Ofício (Estalajadeiro)',
  OFICIO_ESCRIBA = 'Ofício (Escriba)',
  OFICIO_ESCULTOR = 'Ofício (Escultor)',
  OFICIO_EGENHOQUEIRO = 'Ofício (Engenhoqueiro)',
  OFICIO_PINTOR = 'Ofício (Pintor)',
  OFICIO_MINERADOR = 'Ofício (Minerador)',
  PERCEPCAO = 'Percepção',
  PILOTAGEM = 'Pilotagem',
  PONTARIA = 'Pontaria',
  REFLEXOS = 'Reflexos',
  RELIGIAO = 'Religião',
  SOBREVIVENCIA = 'Sobrevivência',
  VONTADE = 'Vontade',
}

export const SkillsAttrs: Record<string, Atributo> = {
  Acrobacia: Atributo.DESTREZA,
  Adestramento: Atributo.CARISMA,
  Atletismo: Atributo.FORCA,
  Atuação: Atributo.CARISMA,
  Cavalgar: Atributo.DESTREZA,
  Conhecimento: Atributo.INTELIGENCIA,
  Cura: Atributo.SABEDORIA,
  Diplomacia: Atributo.CARISMA,
  Enganação: Atributo.CARISMA,
  Fortitude: Atributo.CONSTITUICAO,
  Furtividade: Atributo.DESTREZA,
  Guerra: Atributo.INTELIGENCIA,
  Iniciativa: Atributo.DESTREZA,
  Intimidação: Atributo.CARISMA,
  Intuição: Atributo.SABEDORIA,
  Investigação: Atributo.INTELIGENCIA,
  Jogatina: Atributo.CARISMA,
  Ladinagem: Atributo.DESTREZA,
  Luta: Atributo.FORCA,
  Misticismo: Atributo.INTELIGENCIA,
  Nobreza: Atributo.INTELIGENCIA,
  'Ofício (Qualquer)': Atributo.INTELIGENCIA,
  'Ofício (Armeiro)': Atributo.INTELIGENCIA,
  'Ofício (Artesão)': Atributo.INTELIGENCIA,
  'Ofício (Alquímia)': Atributo.INTELIGENCIA,
  'Ofício (Culinária)': Atributo.INTELIGENCIA,
  'Ofício (Alfaiate)': Atributo.INTELIGENCIA,
  'Ofício (Alvenaria)': Atributo.INTELIGENCIA,
  'Ofício (Carpinteiro)': Atributo.INTELIGENCIA,
  'Ofício (Joalheiro)': Atributo.INTELIGENCIA,
  'Ofício (Fazendeiro)': Atributo.INTELIGENCIA,
  'Ofício (Pescador)': Atributo.INTELIGENCIA,
  'Ofício (Estalajadeiro)': Atributo.INTELIGENCIA,
  'Ofício (Escriba)': Atributo.INTELIGENCIA,
  'Ofício (Escultor)': Atributo.INTELIGENCIA,
  'Ofício (Engenhoqueiro)': Atributo.INTELIGENCIA,
  'Ofício (Pintor)': Atributo.INTELIGENCIA,
  'Ofício (Minerador)': Atributo.INTELIGENCIA,
  Percepção: Atributo.SABEDORIA,
  Pilotagem: Atributo.DESTREZA,
  Pontaria: Atributo.DESTREZA,
  Reflexos: Atributo.DESTREZA,
  Religião: Atributo.SABEDORIA,
  Sobrevivência: Atributo.SABEDORIA,
  Vontade: Atributo.SABEDORIA,
};

export const SkillsWithArmorPenalty: Skill[] = [
  Skill.ACROBACIA,
  Skill.FURTIVIDADE,
  Skill.LADINAGEM,
];

// Skills that can only be used if the character is trained in them
export const TrainedOnlySkills: Skill[] = [
  Skill.ADESTRAMENTO,
  Skill.CONHECIMENTO,
  Skill.GUERRA,
  Skill.JOGATINA,
  Skill.LADINAGEM,
  Skill.MISTICISMO,
  Skill.NOBREZA,
  Skill.OFICIO,
  Skill.OFICIO_ARMEIRO,
  Skill.OFICIO_ARTESANATO,
  Skill.OFICIO_ALQUIMIA,
  Skill.OFICIO_CULINARIA,
  Skill.OFICIO_ALFAIATE,
  Skill.OFICIO_ALVENARIA,
  Skill.OFICIO_CARPINTEIRO,
  Skill.OFICIO_JOALHEIRO,
  Skill.OFICIO_FAZENDEIRO,
  Skill.OFICIO_PESCADOR,
  Skill.OFICIO_ESTALAJADEIRO,
  Skill.OFICIO_ESCRIBA,
  Skill.OFICIO_ESCULTOR,
  Skill.OFICIO_EGENHOQUEIRO,
  Skill.OFICIO_PINTOR,
  Skill.OFICIO_MINERADOR,
  Skill.PILOTAGEM,
  Skill.RELIGIAO,
];

export const ALL_SPECIFIC_OFICIOS: Skill[] = [
  Skill.OFICIO_ALQUIMIA,
  Skill.OFICIO_ARMEIRO,
  Skill.OFICIO_ARTESANATO,
  Skill.OFICIO_CULINARIA,
  Skill.OFICIO_ALFAIATE,
  Skill.OFICIO_ALVENARIA,
  Skill.OFICIO_CARPINTEIRO,
  Skill.OFICIO_JOALHEIRO,
  Skill.OFICIO_FAZENDEIRO,
  Skill.OFICIO_PESCADOR,
  Skill.OFICIO_ESTALAJADEIRO,
  Skill.OFICIO_ESCRIBA,
  Skill.OFICIO_ESCULTOR,
  Skill.OFICIO_EGENHOQUEIRO,
  Skill.OFICIO_PINTOR,
  Skill.OFICIO_MINERADOR,
];

export const OFICIO_PREFIX = 'Ofício';

export function isGenericOficio(name?: string): boolean {
  return name === 'Ofício' || name === Skill.OFICIO;
}

/** Qualquer Ofício: do livro, genérico ou customizado. */
export function isOficioSkill(name?: string): boolean {
  return !!name && name.startsWith(OFICIO_PREFIX);
}

/** Ofício criado pelo usuário, fora do catálogo do livro. */
export function isCustomOficio(name?: string): boolean {
  return (
    isOficioSkill(name) &&
    !isGenericOficio(name) &&
    !ALL_SPECIFIC_OFICIOS.includes(name as Skill)
  );
}

/** 'Ofício (Ferreiro)' -> 'Ferreiro'. Devolve o nome inteiro se não casar. */
export function getOficioLabel(name: string): string {
  const match = name.match(/^Ofício\s*\((.*)\)$/);
  return match ? match[1].trim() : name;
}

/**
 * Atributo-chave de uma perícia, tolerante a Ofícios customizados (que não
 * existem em `SkillsAttrs`). Use no lugar de `SkillsAttrs[name]` em todo
 * caminho que processa nomes vindos de uma ficha.
 */
export function getSkillAttr(name: string): Atributo | undefined {
  return (
    SkillsAttrs[name] ??
    (isOficioSkill(name) ? Atributo.INTELIGENCIA : undefined)
  );
}

/** Ofício é sempre "somente treinado", inclusive os customizados. */
export function isTrainedOnlySkill(name: string): boolean {
  return isOficioSkill(name) || TrainedOnlySkills.includes(name as Skill);
}

/**
 * Nomes de perícia a considerar ao montar a tabela de uma ficha: o catálogo do
 * livro MAIS os nomes treinados que não existem no enum (Ofícios customizados).
 *
 * Iterar só `Object.values(Skill)` descarta os customizados silenciosamente —
 * use isto em todo ponto que reconstrói `completeSkills`.
 */
export function getSheetSkillNames(trainedSkills: string[]): Skill[] {
  return Array.from(
    new Set<string>([...Object.values(Skill), ...trainedSkills])
  ) as Skill[];
}

export type CompleteSkill = {
  name: Skill;
  halfLevel?: number;
  modAttr?: Atributo;
  training?: number;
  others?: number;
  manualOthers?: number;
  manuallyUntrained?: boolean;
  countAsTormentaPower?: boolean;
};

export type SkillsTotals = {
  [value in Skill]: number;
};

export default Skill;
