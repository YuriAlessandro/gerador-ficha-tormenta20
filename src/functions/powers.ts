import { Atributo } from '../data/systems/tormenta20/atributos';
import generalPowers from '../data/poderes';
import PROFICIENCIAS from '../data/systems/tormenta20/proficiencias';
import CharacterSheet from '../interfaces/CharacterSheet';
import { ClassPower } from '../interfaces/Class';
import {
  GeneralPower,
  Requirement,
  RequirementType,
} from '../interfaces/Poderes';
import Skill, {
  ALL_SPECIFIC_OFICIOS,
  isGenericOficio,
  isOficioSkill,
} from '../interfaces/Skills';
import {
  INVENTOR_SPECIALIZATIONS,
  InventorSpecialization,
  isClassOrVariantOf,
} from './general';
import { findClassDescription } from './multiclass';
import { countTormentaPowers } from './randomUtils';

export type LevelTier = 'Iniciante' | 'Veterano' | 'Campeão' | 'Herói';

/**
 * Retorna o patamar de nível do personagem
 */
export function getLevelTier(level: number): LevelTier {
  if (level <= 4) return 'Iniciante';
  if (level <= 10) return 'Veterano';
  if (level <= 16) return 'Campeão';
  return 'Herói';
}

/**
 * Conta quantos poderes de uma categoria específica foram escolhidos no patamar atual
 * Para Bênçãos Dracônicas: category = "Bênção Dracônica"
 */
export function getPowerCountInCurrentTier(
  sheet: CharacterSheet,
  category: string
): number {
  // Conta poderes gerais que contêm a categoria no nome
  // Para Bênçãos Dracônicas, todos começam com esse nome
  const count = sheet.generalPowers.filter((power) =>
    power.name.includes(category)
  ).length;

  return count;
}

/**
 * Reúne todos os poderes que o personagem possui (gerais, de origem e de classe).
 * Retorna apenas o que os checadores de requisito consomem (o nome).
 */
function getAllCharacterPowers(sheet: CharacterSheet): { name: string }[] {
  return [
    ...sheet.generalPowers,
    ...(sheet.origin?.powers || []),
    ...(sheet.classPowers || []),
  ];
}

/**
 * Nomes dos poderes que o personagem possui. Usado por regras que dependem de
 * "o personagem tem o poder X?" fora do sistema de requisitos — ex.: o teto de
 * círculo da tradição oposta da Linhagem Abençoada, destravado por Herança
 * Aprimorada/Superior.
 */
export function getCharacterPowerNames(sheet: CharacterSheet): string[] {
  return getAllCharacterPowers(sheet).map((power) => power.name);
}

/**
 * Aplica a flag `not` ao resultado bruto de um requisito. Ponto único da
 * negação: antes disso cada `case` do avaliador tratava (ou, em 13 dos 15
 * tipos, esquecia de tratar) o `not` por conta própria.
 */
export function applyRequirementNot(rule: Requirement, met: boolean): boolean {
  // `TEXT` (e tipos desconhecidos) não são avaliáveis — quem julga é o usuário,
  // então valem sempre. Negá-los tem que continuar permissivo, não virar um
  // bloqueio impossível de satisfazer.
  const isEvaluable =
    rule.type !== RequirementType.TEXT &&
    Object.values(RequirementType).includes(rule.type);
  if (!isEvaluable) return met;

  return rule.not ? !met : met;
}

/** Avalia um único requisito, ignorando a flag `not` (aplicada por quem chama). */
function evaluateRule(sheet: CharacterSheet, rule: Requirement): boolean {
  switch (rule.type) {
    case RequirementType.PODER: {
      const allPowers = getAllCharacterPowers(sheet);

      const foundInPowers = allPowers.some(
        (currPower) => currPower.name === rule.name
      );
      if (foundInPowers) return true;

      // Habilidades raciais que contam como possuir um poder
      // (ex.: Centauro "Ginete Natural" → poder "Ginete")
      const grantedByRace = (sheet.raca.abilities ?? []).some((a) =>
        a.grantsPowerRequirements?.includes(rule.name ?? '')
      );
      if (grantedByRace) return true;

      // Verifica opções escolhidas via chooseFromOptions (ex: Égide/Montaria Sagrada)
      return (sheet.sheetActionHistory ?? []).some((entry) =>
        entry.changes.some(
          (change) =>
            change.type === 'OptionChosen' && change.chosenName === rule.name
        )
      );
    }
    case RequirementType.ATRIBUTO: {
      const attr = rule.name as Atributo;
      return !!rule.name && sheet.atributos[attr].value >= (rule?.value || 0);
    }
    case RequirementType.PERICIA: {
      if (isGenericOficio(rule.name)) {
        // isOficioSkill (e não a lista fechada) para que um Ofício
        // customizado também satisfaça o pré-requisito genérico
        return sheet.skills.some(isOficioSkill);
      }

      const pericia = rule.name as Skill;
      if (rule.name && sheet.skills.includes(pericia)) return true;

      // Artesão Criativo: Ofício (Artesão) substitui qualquer outro Ofício
      // específico para fins de pré-requisito.
      if (ALL_SPECIFIC_OFICIOS.includes(pericia)) {
        const hasArtesaoCriativo = getAllCharacterPowers(sheet).some(
          (p) => p.name === 'Artesão Criativo'
        );
        if (
          hasArtesaoCriativo &&
          sheet.skills.includes(Skill.OFICIO_ARTESANATO)
        ) {
          return true;
        }
      }

      return false;
    }
    case RequirementType.HABILIDADE:
      return sheet.classe.abilities.some(
        (ability) => ability.name === rule.name
      );
    case RequirementType.PODER_TORMENTA: {
      const qtdPowers = rule.value as number;
      // `countTormentaPowers` também enxerga poderes de outros tipos marcados
      // com `countAsTormentaPower` (poder personalizado, origem homebrew).
      // OTHER powers, so can't count itself
      return countTormentaPowers(sheet) >= qtdPowers + 1;
    }
    case RequirementType.PROFICIENCIA: {
      const proficiencia = rule.name as string;

      // Caso especial: 'all' significa qualquer proficiência de arma (exceto Simples, que todas as classes têm)
      if (proficiencia === 'all') {
        const weaponProficiencies = [
          PROFICIENCIAS.MARCIAIS,
          PROFICIENCIAS.FOGO,
          PROFICIENCIAS.EXOTICAS,
        ];
        return weaponProficiencies.some((wp) =>
          sheet.classe.proficiencias.includes(wp)
        );
      }

      return sheet.classe.proficiencias.includes(proficiencia);
    }
    case RequirementType.NIVEL: {
      const nivel = rule.value as number;
      return sheet.nivel >= nivel;
    }
    case RequirementType.CLASSE: {
      // O nome da classe fica em rule.name nos dados (não em rule.value)
      const className = rule.name as string;
      return !!className && isClassOrVariantOf(sheet.classe, className);
    }
    case RequirementType.TIPO_ARCANISTA: {
      const classSubName = rule.name;
      return sheet.classe.subname === classSubName;
    }
    case RequirementType.MAGIA: {
      const spellName = rule.name;
      return (
        sheet.spells.filter((spell) => spell.nome === spellName).length >= 1
      );
    }
    case RequirementType.DEVOTO: {
      const godName = rule.name;
      // 'any' significa que o personagem deve ser devoto de qualquer divindade
      if (godName === 'any') return !!sheet.devoto?.divindade;
      return sheet.devoto?.divindade.name === godName;
    }
    case RequirementType.RACA: {
      const raceName = rule.name;
      return sheet.raca.name === raceName;
    }
    case RequirementType.CHASSIS: {
      return sheet.raca.chassis === rule.name;
    }
    case RequirementType.TIER_LIMIT: {
      const category = rule.name as string; // "Bênção Dracônica"
      const count = getPowerCountInCurrentTier(sheet, category);
      return count < 1; // Máximo 1 bênção por patamar
    }
    case RequirementType.TEXT:
      // TEXT requirements are always considered met - the user reads
      // the text description and judges if they meet the requirement
      return true;
    default:
      return true;
  }
}

export function isPowerAvailable(
  sheet: CharacterSheet,
  power: GeneralPower | ClassPower
): boolean {
  // Habilidades raciais podem ignorar todos os pré-requisitos de certos poderes
  // (ex.: Centauro "Cascos" → poderes de Carga/Investida)
  const raceBypass = (sheet.raca.abilities ?? []).some((a) =>
    a.bypassPrereqForPowersNamed?.some((term) => power.name.includes(term))
  );
  if (raceBypass) return true;

  if (power.requirements && power.requirements.length > 0) {
    return power.requirements.some((req) =>
      req.every((rule) => applyRequirementNot(rule, evaluateRule(sheet, rule)))
    );
  }

  return true;
}

export function getPowersAllowedByRequirements(
  sheet: CharacterSheet
): GeneralPower[] {
  const existingGeneralPowers = sheet.generalPowers;

  return Object.values(generalPowers)
    .flat()
    .filter((power) => {
      const isRepeatedPower = existingGeneralPowers.find(
        (existingPower) => existingPower.name === power.name
      );

      if (isRepeatedPower) {
        return power.allowSeveralPicks;
      }

      return isPowerAvailable(sheet, power);
    });
}

/**
 * Catálogo de poderes da classe da ficha, com fallback no registro.
 *
 * `stripSheetForStorage` zera `classe.powers` e `rehydrateSheet` só o restaura
 * quando a classe/variante é resolvida — variantes, homebrew e suplementos
 * desativados deixam o array vazio em fichas carregadas.
 */
function resolveClassPowerCatalog(sheet: CharacterSheet): ClassPower[] {
  const stored = sheet.classe?.powers ?? [];
  if (stored.length > 0) return stored;

  const fullClass = findClassDescription(
    sheet.classe?.name,
    sheet.classe?.subname
  );
  return fullClass?.powers ?? [];
}

export function getAllowedClassPowers(
  sheet: CharacterSheet,
  options?: { classLevel?: number }
): ClassPower[] {
  // If classLevel is provided, create a temporary sheet with that level
  // so that NIVEL requirements check against class level instead of character level
  const sheetForCheck =
    options?.classLevel !== undefined
      ? { ...sheet, nivel: options.classLevel }
      : sheet;

  return resolveClassPowerCatalog(sheet).filter((power) => {
    const existingClassPowers = sheet.classPowers || [];
    const isRepeatedPower = existingClassPowers.find(
      (existingPower) => existingPower.name === power.name
    );

    if (isRepeatedPower) {
      return power.canRepeat;
    }

    return isPowerAvailable(sheetForCheck, power);
  });
}

/**
 * Retorna os poderes de classe elegíveis para a ação `getClassPower`
 * (ex.: origem "Futura Lenda": "escolha um dos poderes de sua classe,
 * normalmente disponíveis a partir do 2º nível").
 *
 * A cláusula "a partir do 2º nível" é descritiva — poderes de classe começam no
 * 2º nível e a origem antecipa um deles. Logo os requisitos são avaliados como
 * se o personagem estivesse no 2º nível: entram os poderes sem requisito e os
 * de NÍVEL 2, ficam de fora os de nível maior e os com pré-requisito de
 * atributo/perícia/proficiência/poder não atendido.
 *
 * O nível efetivo é FIXO em `minLevel`, não o nível do personagem: é benefício
 * de origem, adquirido no 1º nível, e precisa render a mesma lista em qualquer
 * recálculo — inclusive de uma ficha já em nível alto.
 *
 * Mesma lógica usada pelo gerador em applyPower (getClassPower), extraída para
 * ser reaproveitada pela UI de seleção manual (assistente de criação).
 */
export function getFuturaLendaClassPowers(
  sheet: CharacterSheet,
  minLevel = 2
): ClassPower[] {
  const sheetForCheck: CharacterSheet = { ...sheet, nivel: minLevel };

  return resolveClassPowerCatalog(sheet).filter((power) => {
    // Check if power already exists and if it can be repeated
    const isRepeatedPower = (sheet.classPowers ?? []).some(
      (existingPower) => existingPower.name === power.name
    );

    if (isRepeatedPower && !power.canRepeat) {
      return false;
    }

    return isPowerAvailable(sheetForCheck, power);
  });
}

interface WeightedPower {
  power: ClassPower;
  weight: number;
}

function getInventorSpecializationFromSkills(
  skills: Skill[]
): InventorSpecialization | null {
  const specializationEntries = Object.entries(
    INVENTOR_SPECIALIZATIONS
  ) as Array<
    [InventorSpecialization, { skill: Skill; relatedPowers: string[] }]
  >;

  const foundSpecialization = specializationEntries.find(([, data]) =>
    skills.includes(data.skill)
  );

  return foundSpecialization ? foundSpecialization[0] : null;
}

export function getWeightedInventorClassPowers(
  sheet: CharacterSheet
): ClassPower[] {
  const allowedPowers = getAllowedClassPowers(sheet);

  if (
    !isClassOrVariantOf(sheet.classe, 'Inventor') ||
    allowedPowers.length === 0
  ) {
    return allowedPowers;
  }

  const specialization = getInventorSpecializationFromSkills(sheet.skills);

  if (!specialization) {
    return allowedPowers;
  }

  const { relatedPowers } = INVENTOR_SPECIALIZATIONS[specialization];

  // Create weighted powers array
  const weightedPowers: WeightedPower[] = allowedPowers.map((power) => ({
    power,
    weight: relatedPowers.includes(power.name) ? 3 : 1, // 3x weight for synergistic powers
  }));

  // For weighted selection, we'll modify the array to have multiple entries
  // of high-weight powers to simulate probability
  const expandedPowers: ClassPower[] = [];
  weightedPowers.forEach((wp) => {
    // Add the power multiple times based on its weight
    for (let i = 0; i < wp.weight; i += 1) {
      expandedPowers.push(wp.power);
    }
  });

  return expandedPowers;
}
