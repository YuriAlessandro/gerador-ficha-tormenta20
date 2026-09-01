import { ClassPower } from '@/interfaces/Class';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { GeneralPower, OriginPower } from '@/interfaces/Poderes';
import {
  ManualPowerSelections,
  PowerSelectionRequirement,
  PowerSelectionRequirements,
  SelectionOptions,
} from '@/interfaces/PowerSelections';
import { RaceAbility } from '@/interfaces/Race';
import Skill from '@/interfaces/Skills';
import { Spell, spellsCircles } from '@/interfaces/Spells';
import { dataRegistry } from '@/data/registry';
import { ANIMAL_TOTEM_NAMES } from '@/data/systems/tormenta20/animalTotems';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { Armas } from '@/data/systems/tormenta20/equipamentos';
import { FAMILIAR_NAMES } from '@/data/systems/tormenta20/familiars';
import {
  allArcaneSpellsCircle1,
  allArcaneSpellsCircle2,
  allArcaneSpellsCircle3,
  allArcaneSpellsCircle4,
  allArcaneSpellsCircle5,
} from '@/data/systems/tormenta20/magias/arcane';
import {
  allDivineSpellsCircle1,
  allDivineSpellsCircle2,
  allDivineSpellsCircle3,
  allDivineSpellsCircle4,
  allDivineSpellsCircle5,
} from '@/data/systems/tormenta20/magias/divine';
import { SupplementId } from '@/types/supplement.types';
import { isPhysicalIncreaseBlockedByAge } from '@/premium/functions/ages';
import {
  getAttributeIncreasesInSamePlateau,
  getCurrentPlateau,
} from './general';
import { getFuturaLendaClassPowers, isPowerAvailable } from '../powers';
import { isClassOrVariantOf } from '../general';

/** Força, Destreza e Constituição — os atributos "físicos" de T20. */
const PHYSICAL_ATTRIBUTES: Atributo[] = [
  Atributo.FORCA,
  Atributo.DESTREZA,
  Atributo.CONSTITUICAO,
];

/**
 * Helper to determine if a spell list represents "all arcane spells of circle X"
 * by comparing with core spell arrays.
 */
function isAllArcaneSpellsOfCircle(spells: Spell[]): {
  isMatch: boolean;
  circle: number;
} {
  const coreArcaneArrays = [
    { array: allArcaneSpellsCircle1, circle: 1 },
    { array: allArcaneSpellsCircle2, circle: 2 },
    { array: allArcaneSpellsCircle3, circle: 3 },
    { array: allArcaneSpellsCircle4, circle: 4 },
    { array: allArcaneSpellsCircle5, circle: 5 },
  ];

  // Use find instead of for...of to satisfy ESLint
  const match = coreArcaneArrays.find(({ array }) => {
    // Check if spells contain at least 80% of the core arcane spells for this circle
    // This accounts for possible custom attribute variations (like De Outro Mundo power)
    const coreNames = new Set(array.map((s) => s.nome));
    const matchCount = spells.filter((s) => coreNames.has(s.nome)).length;
    return matchCount >= array.length * 0.8 && spells.length >= array.length;
  });

  if (match) {
    return { isMatch: true, circle: match.circle };
  }

  return { isMatch: false, circle: 0 };
}

/**
 * Helper to determine if a spell list represents "all divine spells of circle X"
 * by comparing with core spell arrays.
 */
function isAllDivineSpellsOfCircle(spells: Spell[]): {
  isMatch: boolean;
  circle: number;
} {
  const coreDivineArrays = [
    { array: allDivineSpellsCircle1, circle: 1 },
    { array: allDivineSpellsCircle2, circle: 2 },
    { array: allDivineSpellsCircle3, circle: 3 },
    { array: allDivineSpellsCircle4, circle: 4 },
    { array: allDivineSpellsCircle5, circle: 5 },
  ];

  const match = coreDivineArrays.find(({ array }) => {
    const coreNames = new Set(array.map((s) => s.nome));
    const matchCount = spells.filter((s) => coreNames.has(s.nome)).length;
    return matchCount >= array.length * 0.8 && spells.length >= array.length;
  });

  if (match) {
    return { isMatch: true, circle: match.circle };
  }

  return { isMatch: false, circle: 0 };
}

/**
 * Helper to determine if a spell list represents "all spells (arcane+divine) of circle X"
 */
function isAllSpellsOfCircle(spells: Spell[]): {
  isMatch: boolean;
  circle: number;
} {
  // Check if it's a combined list of arcane+divine spells
  const circleToSpells: Record<string, number> = {};

  spells.forEach((spell) => {
    const circleKey = spell.spellCircle;
    circleToSpells[circleKey] = (circleToSpells[circleKey] || 0) + 1;
  });

  // Find the dominant circle
  const circles = Object.entries(circleToSpells);
  if (circles.length === 1) {
    const [circleKey, count] = circles[0];
    // Map spellCircle enum to number
    const circleMap: Record<string, number> = {
      [spellsCircles.c1]: 1,
      [spellsCircles.c2]: 2,
      [spellsCircles.c3]: 3,
      [spellsCircles.c4]: 4,
      [spellsCircles.c5]: 5,
    };
    const circleNumber = circleMap[circleKey] || 0;

    // If we have more than 40 spells from a single circle, it's likely all spells
    if (count > 40 && circleNumber > 0) {
      return { isMatch: true, circle: circleNumber };
    }
  }

  return { isMatch: false, circle: 0 };
}

/**
 * Quantidade real de perícias de um requisito `learnSkill` escalado por
 * patamar (ex.: Biblioteca Divina). `requirement.pick` é só o piso, declarado
 * para o patamar Iniciante — usado por qualquer consumidor que tenha a ficha
 * (editor de poderes, level-up) ou só o nível-alvo (assistente de criação).
 */
export function resolveLearnSkillPick(
  requirement: PowerSelectionRequirement,
  plateau: number
): number {
  if (
    requirement.type === 'learnSkill' &&
    requirement.metadata?.perTierAboveIniciante
  ) {
    return (
      requirement.pick +
      requirement.metadata.perTierAboveIniciante * (plateau - 1)
    );
  }
  return requirement.pick;
}

/**
 * Quantidade de perícias AINDA por escolher de um requisito `learnSkill`
 * escalado por patamar (ex.: Biblioteca Divina): o total cumulativo do
 * patamar atual, menos as que o histórico da ficha já concedeu.
 *
 * Sem isso, subir um único patamar (ex.: 1 → 2) reoferecia o total
 * cumulativo inteiro (2 perícias) em vez de só o incremento (1) — o jogador
 * só deveria ver mais de uma opção se ainda não tivesse escolhido nenhuma
 * (poder concedido depois da criação, sem histórico prévio).
 */
export function resolveLearnSkillRemainingPick(
  requirement: PowerSelectionRequirement,
  plateau: number,
  sheet?: CharacterSheet,
  powerName?: string
): number {
  const totalPick = resolveLearnSkillPick(requirement, plateau);
  if (!sheet || !powerName) return totalPick;

  const alreadyGranted = (sheet.sheetActionHistory || [])
    .filter((entry) => entry.powerName === powerName)
    .flatMap((entry) => entry.changes)
    .filter((change) => change.type === 'SkillsAdded')
    .flatMap((change) => (change.type === 'SkillsAdded' ? change.skills : []));

  return Math.max(totalPick - alreadyGranted.length, 0);
}

/**
 * Check if a power requires manual selection from the user
 */
export function getPowerSelectionRequirements(
  power: GeneralPower | ClassPower | RaceAbility | OriginPower
): PowerSelectionRequirements | null {
  const requirements: PowerSelectionRequirement[] = [];

  // Check sheetActions for manual selections
  if (power.sheetActions && power.sheetActions.length > 0) {
    power.sheetActions.forEach((sheetAction) => {
      const { action } = sheetAction;

      if (action.type === 'learnSkill' && action.pick > 0) {
        requirements.push({
          type: 'learnSkill',
          availableOptions: action.availableSkills,
          pick: action.pick,
          label: `Selecione ${action.pick} perícia${
            action.pick > 1 ? 's' : ''
          }`,
          metadata: action.perTierAboveIniciante
            ? { perTierAboveIniciante: action.perTierAboveIniciante }
            : undefined,
        });
      }

      if (action.type === 'addProficiency' && action.pick > 0) {
        requirements.push({
          type: 'addProficiency',
          availableOptions: action.availableProficiencies,
          pick: action.pick,
          label: `Selecione ${action.pick} proficiência${
            action.pick > 1 ? 's' : ''
          }`,
        });
      }

      if (action.type === 'getGeneralPower' && action.pick > 0) {
        requirements.push({
          type: 'getGeneralPower',
          availableOptions: action.availablePowers,
          pick: action.pick,
          label: `Selecione ${action.pick} poder${
            action.pick > 1 ? 'es' : ''
          } geral${action.pick > 1 ? 'is' : ''}`,
          metadata: { ignorePrerequisites: action.ignorePrerequisites },
        });
      }

      if (action.type === 'learnSpell' && action.pick > 0) {
        requirements.push({
          type: 'learnSpell',
          availableOptions: action.availableSpells,
          pick: action.pick,
          label: `Selecione ${action.pick} magia${action.pick > 1 ? 's' : ''}`,
        });
      }

      if (action.type === 'learnAnySpellFromHighestCircle' && action.pick > 0) {
        requirements.push({
          type: 'learnAnySpellFromHighestCircle',
          availableOptions: [], // Will be populated dynamically in getFilteredAvailableOptions
          pick: action.pick,
          label: `Selecione ${action.pick} magia${
            action.pick > 1 ? 's' : ''
          } (qualquer círculo disponível)`,
          metadata: {
            allowedType: action.allowedType,
            schools: action.schools,
          },
        });
      }

      if (action.type === 'increaseAttribute') {
        requirements.push({
          type: 'increaseAttribute',
          availableOptions: [], // Will be populated dynamically in getFilteredAvailableOptions
          pick: 1, // Always pick 1 attribute
          label: 'Selecione 1 atributo para aumentar',
        });
      }

      if (action.type === 'selectWeaponSpecialization') {
        requirements.push({
          type: 'selectWeaponSpecialization',
          availableOptions: action.availableWeapons || [], // Will be populated dynamically if empty
          pick: 1, // Always pick 1 weapon (per instance)
          label: 'Selecione 1 arma para especialização',
          onlyFromSheet: action.onlyFromSheet,
          optional: action.optional,
          bonuses: action.bonuses,
        });
      }

      if (action.type === 'selectFamiliar') {
        requirements.push({
          type: 'selectFamiliar',
          availableOptions: action.availableFamiliars || [], // Will be populated dynamically if empty
          pick: 1, // Always pick 1 familiar
          label: 'Selecione 1 familiar',
        });
      }

      if (action.type === 'selectAnimalTotem') {
        requirements.push({
          type: 'selectAnimalTotem',
          availableOptions: action.availableTotems || [], // Will be populated dynamically if empty
          pick: 1, // Always pick 1 totem
          label: 'Selecione 1 animal totêmico',
        });
      }

      if (action.type === 'buildGolpePessoal') {
        requirements.push({
          type: 'buildGolpePessoal',
          availableOptions: [], // No predefined options, will use builder interface
          pick: 1, // Always build 1 golpe
          label: 'Construa seu Golpe Pessoal',
        });
      }

      if (action.type === 'chooseFromOptions' && !action.linkedTo) {
        const pick = action.pick ?? 1;
        requirements.push({
          type: 'chooseFromOptions',
          availableOptions: action.options,
          pick,
          label: pick > 1 ? `Selecione ${pick} opções` : `Selecione uma opção`,
          metadata: {
            optionKey: action.optionKey,
          },
        });
      }

      // Handle Versátil special action for humans
      if (
        action.type === 'special' &&
        action.specialAction === 'humanoVersatil'
      ) {
        requirements.push({
          type: 'humanoVersatil',
          availableOptions: [], // Will be populated dynamically with all skills
          pick: 2, // Always 2 choices (2 skills OR 1 skill + 1 power)
          label: 'Selecione 2 perícias (ou 1 perícia + 1 poder geral)',
        });
      }

      // Handle Deformidade special action for Lefou
      if (
        action.type === 'special' &&
        action.specialAction === 'lefouDeformidade'
      ) {
        requirements.push({
          type: 'lefouDeformidade',
          availableOptions: [], // Will be populated dynamically with all skills
          pick: 2, // 2 skills OR 1 skill + 1 tormenta power
          label:
            'Selecione 2 perícias (+2 cada) ou 1 perícia (+2) + 1 poder da Tormenta',
        });
      }

      // Handle Memória Póstuma special action for Osteon/Soterrado
      if (
        action.type === 'special' &&
        action.specialAction === 'osteonMemoriaPostuma'
      ) {
        requirements.push({
          type: 'osteonMemoriaPostuma',
          availableOptions: [], // Populated dynamically by the component
          pick: 1, // 1 skill OR 1 power OR 1 race ability
          label: 'Selecione o benefício da Memória Póstuma',
        });
      }

      // Handle Natureza Orgânica special action for Yidishan
      if (
        action.type === 'special' &&
        action.specialAction === 'yidishanNaturezaOrganica'
      ) {
        requirements.push({
          type: 'yidishanNaturezaOrganica',
          availableOptions: [], // Populated dynamically by the component
          pick: 1, // 1 skill OR 1 power OR 1 race ability (when oldRace !== Humano)
          label: 'Selecione o benefício da Natureza Orgânica',
        });
      }

      // Handle Mashin Chassi special action
      if (
        action.type === 'special' &&
        action.specialAction === 'mashinChassi'
      ) {
        requirements.push({
          type: 'mashinChassi',
          availableOptions: [],
          pick: 2,
          label: 'Selecione 2 perícias (ou 1 perícia + 1 maravilha mecânica)',
        });
      }

      // Handle Alma Livre special action
      if (
        action.type === 'special' &&
        action.specialAction === 'almaLivreSelectClass'
      ) {
        requirements.push({
          type: 'almaLivreSelectClass',
          availableOptions: [], // Populated dynamically by the component
          pick: 1, // 1 class + 1 power
          label: 'Selecione uma classe e um poder dessa classe',
        });
      }

      if (
        action.type === 'special' &&
        action.specialAction === 'diferentaoSelectClassPower'
      ) {
        requirements.push({
          type: 'almaLivreSelectClass',
          availableOptions: [],
          pick: 1,
          label: 'Selecione uma classe e um poder dessa classe',
          metadata: { immediateClassPower: true },
        });
      }

      // Marcar perícias já treinadas (ex.: "Especialista" do Ladino). O `pick`
      // real é dinâmico (modificador do atributo, piso `min`) e só pode ser
      // calculado por quem tem a ficha — aqui vai o piso, e o atributo segue no
      // metadata para o assistente e o `validateSelections` resolverem.
      if (action.type === 'markTrainedSkills') {
        requirements.push({
          type: 'markTrainedSkills',
          availableOptions: [], // Populado em getFilteredAvailableOptions
          pick: action.min,
          label: 'Selecione as perícias treinadas',
          metadata: {
            pickByAttribute: action.pickByAttribute,
            minPick: action.min,
          },
        });
      }

      // Aprender uma habilidade de outra classe (ex.: origem "Duplo Feérico").
      // `availableOptions` guarda a whitelist crua do dado; o cruzamento com os
      // suplementos ativos e a exclusão da própria classe ficam em
      // `getFilteredAvailableOptions`.
      if (action.type === 'learnClassAbility') {
        requirements.push({
          type: 'learnClassAbility',
          availableOptions: action.availableClasses,
          pick: 1,
          label: `Selecione uma classe e uma habilidade de ${action.level}º nível dela`,
          metadata: {
            abilityLevel: action.level,
          },
        });
      }

      // Escolher um poder de classe (ex.: origem "Futura Lenda")
      if (action.type === 'getClassPower') {
        requirements.push({
          type: 'getClassPower',
          availableOptions: [], // Populated dynamically in getFilteredAvailableOptions
          pick: 1,
          label: 'Selecione um poder de classe',
          metadata: {
            minLevel: action.minLevel ?? 2,
          },
        });
      }
    });
  }

  // Check sheetBonuses for PickSkill targets
  if (power.sheetBonuses && power.sheetBonuses.length > 0) {
    power.sheetBonuses.forEach((bonus) => {
      if (bonus.target.type === 'PickSkill' && bonus.target.pick > 0) {
        requirements.push({
          type: 'learnSkill',
          availableOptions: bonus.target.skills,
          pick: bonus.target.pick,
          label: `Selecione ${bonus.target.pick} perícia${
            bonus.target.pick > 1 ? 's' : ''
          }`,
        });
      }
    });
  }

  if (requirements.length === 0) {
    return null;
  }

  return {
    powerName: power.name,
    requirements,
  };
}

/**
 * Requisitos de escolha que só existem DEPOIS de o jogador escolher uma opção de
 * `chooseFromOptions` — as `sheetActions` da opção escolhida (ex.: Herança de
 * Werra → "Duas Armas Exóticas" pede 2 proficiências).
 *
 * Ficam fora de `getPowerSelectionRequirements` porque são condicionais: quem
 * chama precisa ter as seleções atuais em mãos. Como as ações são cascateadas
 * com o nome do poder dono (ver `applyPower`), as seleções resultantes são
 * gravadas sob a MESMA chave do poder — sem colisão, porque o pai usa
 * `chosenOption` e as filhas usam os campos do próprio tipo de ação.
 */
export function getChosenOptionNestedRequirements(
  power: GeneralPower | ClassPower | RaceAbility | OriginPower,
  selectionForPower?: SelectionOptions
): PowerSelectionRequirement[] {
  const chosenNames = selectionForPower?.chosenOption;
  if (!chosenNames || chosenNames.length === 0) return [];
  if (!power.sheetActions || power.sheetActions.length === 0) return [];

  const nested: PowerSelectionRequirement[] = [];

  power.sheetActions.forEach((sheetAction) => {
    if (sheetAction.action.type !== 'chooseFromOptions') return;

    sheetAction.action.options.forEach((option) => {
      if (!chosenNames.includes(option.name)) return;
      if (!option.sheetActions || option.sheetActions.length === 0) return;

      const optionRequirements = getPowerSelectionRequirements({
        ...power,
        sheetActions: option.sheetActions,
      });
      if (optionRequirements) {
        nested.push(...optionRequirements.requirements);
      }
    });
  });

  return nested;
}

/**
 * Um requisito de escolha já resolvido: além do requisito em si, diz sob QUAL
 * chave de `ManualPowerSelections` as respostas dele moram.
 *
 * Existe porque um poder pode conceder outro poder que, por sua vez, pede uma
 * escolha própria (ex.: Talentos do Bando dos Kobolds → Ex-Familiar → familiar).
 * As respostas desse segundo nível são gravadas sob o nome do poder CONCEDIDO,
 * não do poder pai.
 */
export interface ResolvedRequirement {
  /** Chave em `ManualPowerSelections` onde as respostas deste requisito moram. */
  selectionKey: string;
  /** Nome do poder dono do requisito (o concedido, quando aninhado). */
  ownerName: string;
  /** Quando true, o requisito veio de um poder concedido por outro poder. */
  isNested: boolean;
  requirement: PowerSelectionRequirement;
}

/**
 * Escolhas exigidas pelos poderes que o jogador escolheu em um requisito
 * `getGeneralPower`/`getClassPower`.
 *
 * As respostas moram sob o nome do poder CONCEDIDO, não do poder pai — é assim
 * que o passo do assistente grava e que os validadores leem. Exportada para que
 * a tela que desenha os seletores e o validador que libera o botão Próximo
 * derivem a lista do MESMO lugar.
 */
export function getGrantedPowerRequirements(
  selectionForPower: SelectionOptions | undefined
): ResolvedRequirement[] {
  const grantedPowers = (selectionForPower?.powers ?? []) as Array<
    GeneralPower | ClassPower
  >;

  return grantedPowers.flatMap((granted) => {
    if (!granted?.name || !granted.sheetActions) return [];
    return (getPowerSelectionRequirements(granted)?.requirements ?? []).map(
      (requirement) => ({
        selectionKey: granted.name,
        ownerName: granted.name,
        isNested: true,
        requirement,
      })
    );
  });
}

/**
 * Lista achatada de TODAS as escolhas que um poder exige, incluindo as dos
 * poderes que ele concede.
 *
 * É a fonte única de verdade para quem desenha os seletores (o passo "Efeitos de
 * Poderes") e para quem libera o botão Próximo (`canProceed` / `isStepComplete`).
 * Enquanto as duas coisas coletavam requisitos por caminhos diferentes, dava
 * para existir requisito que bloqueia o assistente sem ter onde escolher.
 */
export function resolvePowerRequirements(
  power: GeneralPower | ClassPower | RaceAbility | OriginPower,
  allSelections: ManualPowerSelections
): ResolvedRequirement[] {
  const selectionKey = power.name;
  const ownSelections = allSelections[selectionKey];

  const own = [
    ...(getPowerSelectionRequirements(power)?.requirements ?? []),
    // Requisitos que só existem depois de uma escolha de `chooseFromOptions`.
    // Ficam na MESMA chave do poder pai (ver `applyPower`).
    ...getChosenOptionNestedRequirements(power, ownSelections),
  ].map((requirement) => ({
    selectionKey,
    ownerName: power.name,
    isNested: false,
    requirement,
  }));

  // Segundo nível: cada poder concedido pode ter escolhas próprias. Só um nível
  // de profundidade — é o que os validadores sempre fizeram, e evita ciclo.
  const grantsPower = own.some(
    ({ requirement }) =>
      requirement.type === 'getGeneralPower' ||
      requirement.type === 'getClassPower'
  );
  const nested = grantsPower ? getGrantedPowerRequirements(ownSelections) : [];

  return [...own, ...nested];
}

/**
 * Filter available options based on what the character already has
 * @param requirement - The power selection requirement
 * @param sheet - The character sheet
 * @param supplements - Optional array of active supplement IDs (defaults to CORE only)
 */
export function getFilteredAvailableOptions(
  requirement: PowerSelectionRequirement,
  sheet: CharacterSheet,
  supplements: SupplementId[] = [SupplementId.TORMENTA20_CORE]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any[] {
  const { type, availableOptions } = requirement;

  switch (type) {
    case 'learnSkill': {
      const skills = availableOptions as Skill[];
      return skills
        .filter((skill) => {
          // Check if skill is already in the skills array
          if (sheet.skills.includes(skill)) {
            return false;
          }

          // Check if skill is already trained in completeSkills
          if (sheet.completeSkills) {
            const existingSkill = sheet.completeSkills.find(
              (cs) => cs.name === skill
            );
            if (
              existingSkill &&
              existingSkill.training &&
              existingSkill.training > 0
            ) {
              return false;
            }
          }

          return true;
        })
        .sort((a, b) => a.localeCompare(b));
    }

    case 'addProficiency': {
      const proficiencies = availableOptions as string[];
      return proficiencies
        .filter((prof) => !sheet.classe.proficiencias.includes(prof))
        .sort((a, b) => a.localeCompare(b));
    }

    case 'getGeneralPower': {
      const powers = availableOptions as GeneralPower[];
      // Concessões marcadas com `ignorePrerequisites` valem apesar dos
      // pré-requisitos dos poderes ofertados (Linhagem Abençoada dá um poder
      // concedido "sem precisar ser devoto"). Sem isso, o requisito DEVOTO
      // reprova a lista inteira e o assistente fica sem opção nenhuma.
      const ignorePrerequisites =
        requirement.metadata?.ignorePrerequisites === true;
      return powers
        .filter((power) => {
          // Filter out powers the character already has
          if (
            sheet.generalPowers?.some(
              (existing) => existing.name === power.name
            )
          ) {
            return false;
          }
          // Filter out powers whose requirements are not met
          if (!ignorePrerequisites && !isPowerAvailable(sheet, power)) {
            return false;
          }
          return true;
        })
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    case 'learnSpell': {
      const spells = availableOptions as Spell[];

      // Check "all spells (arcane+divine)" FIRST to avoid false positives
      // from arcane/divine checks when the list contains both traditions
      const allSpellsCheck = isAllSpellsOfCircle(spells);
      if (allSpellsCheck.isMatch) {
        const arcaneSpells = dataRegistry.getArcaneSpellsByCircleAndSupplements(
          allSpellsCheck.circle,
          supplements
        );
        const divineSpells = dataRegistry.getDivineSpellsByCircleAndSupplements(
          allSpellsCheck.circle,
          supplements
        );
        const allSpellsWithSupplements = [...arcaneSpells, ...divineSpells];

        // Remove duplicates
        const uniqueSpells = allSpellsWithSupplements.filter(
          (spell, index, array) =>
            array.findIndex((s) => s.nome === spell.nome) === index
        );

        // Preserve custom attributes from original spells if present
        const originalCustomAttr = spells.find(
          (s) => s.customKeyAttr
        )?.customKeyAttr;
        const enrichedSpells = originalCustomAttr
          ? uniqueSpells.map((s) => ({
              ...s,
              customKeyAttr: originalCustomAttr,
            }))
          : uniqueSpells;

        return enrichedSpells
          .filter(
            (spell) =>
              !sheet.spells?.some((existing) => existing.nome === spell.nome)
          )
          .sort((a, b) => a.nome.localeCompare(b.nome));
      }

      // Check if this is "all arcane spells of circle X" - if so, expand with supplements
      const arcaneCheck = isAllArcaneSpellsOfCircle(spells);
      if (arcaneCheck.isMatch) {
        const arcaneSpellsWithSupplements =
          dataRegistry.getArcaneSpellsByCircleAndSupplements(
            arcaneCheck.circle,
            supplements
          );

        // Preserve custom attributes from original spells if present
        const originalCustomAttr2 = spells.find(
          (s) => s.customKeyAttr
        )?.customKeyAttr;
        const enrichedArcaneSpells = originalCustomAttr2
          ? arcaneSpellsWithSupplements.map((s) => ({
              ...s,
              customKeyAttr: originalCustomAttr2,
            }))
          : arcaneSpellsWithSupplements;

        return enrichedArcaneSpells
          .filter(
            (spell) =>
              !sheet.spells?.some((existing) => existing.nome === spell.nome)
          )
          .sort((a, b) => a.nome.localeCompare(b.nome));
      }

      // Check if this is "all divine spells of circle X" - if so, expand with supplements
      const divineCheck = isAllDivineSpellsOfCircle(spells);
      if (divineCheck.isMatch) {
        const allSpellsWithSupplements2 =
          dataRegistry.getDivineSpellsByCircleAndSupplements(
            divineCheck.circle,
            supplements
          );

        return allSpellsWithSupplements2
          .filter(
            (spell) =>
              !sheet.spells?.some((existing) => existing.nome === spell.nome)
          )
          .sort((a, b) => a.nome.localeCompare(b.nome));
      }

      // For specific spell lists (not all spells of a circle), use as-is
      return spells
        .filter(
          (spell) =>
            !sheet.spells?.some((existing) => existing.nome === spell.nome)
        )
        .sort((a, b) => a.nome.localeCompare(b.nome));
    }

    case 'learnAnySpellFromHighestCircle': {
      // Dynamically determine available spells from ANY circle up to the highest available
      const highestCircle =
        sheet.classe.spellPath?.spellCircleAvailableAtLevel?.(sheet.nivel) || 1;

      const allAvailableSpells: Spell[] = [];
      const allowedType = requirement.metadata?.allowedType || 'Both';

      // Get spells from all circles from 1 up to the highest available
      // Using registry to include supplement spells
      for (let circle = 1; circle <= highestCircle; circle += 1) {
        if (allowedType === 'Arcane') {
          // Use registry for supplement support
          allAvailableSpells.push(
            ...dataRegistry.getArcaneSpellsByCircleAndSupplements(
              circle,
              supplements
            )
          );
        } else if (allowedType === 'Divine') {
          // Use registry for supplement support
          allAvailableSpells.push(
            ...dataRegistry.getDivineSpellsByCircleAndSupplements(
              circle,
              supplements
            )
          );
        } else {
          // Both - combine arcane and divine for this circle using registry
          allAvailableSpells.push(
            ...dataRegistry.getArcaneSpellsByCircleAndSupplements(
              circle,
              supplements
            )
          );
          allAvailableSpells.push(
            ...dataRegistry.getDivineSpellsByCircleAndSupplements(
              circle,
              supplements
            )
          );
        }
      }

      // Remove duplicates from allAvailableSpells (same spell might exist in both arcane and divine)
      const uniqueSpells = allAvailableSpells.filter(
        (spell, index, array) =>
          array.findIndex((s) => s.nome === spell.nome) === index
      );

      // Filter by schools if specified
      const allowedSchools = requirement.metadata?.schools || [];
      let availableSpells = uniqueSpells;
      if (allowedSchools.length > 0) {
        availableSpells = uniqueSpells.filter((spell) =>
          allowedSchools.includes(spell.school)
        );
      }

      // Filter out spells already known and sort by name
      return availableSpells
        .filter(
          (spell) =>
            !sheet.spells?.some((existing) => existing.nome === spell.nome)
        )
        .sort((a, b) => a.nome.localeCompare(b.nome));
    }

    case 'increaseAttribute': {
      // Get attributes that haven't been increased in the current plateau
      const usedAttributes = getAttributeIncreasesInSamePlateau(sheet);
      // Idades Variadas (Heróis de Arton, p. 290): Velhos e Anciões "não podem
      // escolher o poder Aumento de Atributo para nenhum atributo físico".
      // Filtrar aqui cobre de uma vez o assistente de criação, o de evolução e
      // o drawer de poderes — todos passam por esta função.
      const blockedByAge = isPhysicalIncreaseBlockedByAge(sheet.age?.bracket)
        ? PHYSICAL_ATTRIBUTES
        : [];
      const availableAttributes = Object.values(Atributo).filter(
        (attr) => !usedAttributes.includes(attr) && !blockedByAge.includes(attr)
      );

      // Return attribute names sorted alphabetically
      return availableAttributes.sort((a, b) => a.localeCompare(b));
    }

    case 'selectWeaponSpecialization': {
      // When the action is configured to list only weapons in the sheet
      if (requirement.onlyFromSheet) {
        const sheetWeaponNames = Array.from(
          new Set(
            (sheet.bag?.equipments?.Arma || []).map((weapon) => weapon.nome)
          )
        );
        return sheetWeaponNames.sort((a, b) => a.localeCompare(b));
      }

      // If specific weapons were provided, use those
      if (availableOptions && availableOptions.length > 0) {
        return (availableOptions as string[]).sort((a, b) =>
          a.localeCompare(b)
        );
      }

      // Otherwise, return all available weapons
      const allWeaponNames = Object.values(Armas).map((weapon) => weapon.nome);
      return allWeaponNames.sort((a, b) => a.localeCompare(b));
    }

    case 'selectFamiliar': {
      // If specific familiars were provided, use those
      if (availableOptions && availableOptions.length > 0) {
        return (availableOptions as string[]).sort((a, b) =>
          a.localeCompare(b)
        );
      }

      // Otherwise, return all available familiars
      return FAMILIAR_NAMES.sort((a, b) => a.localeCompare(b));
    }

    case 'selectAnimalTotem': {
      // If specific totems were provided, use those
      if (availableOptions && availableOptions.length > 0) {
        return (availableOptions as string[]).sort((a, b) =>
          a.localeCompare(b)
        );
      }

      // Otherwise, return all available totems
      return ANIMAL_TOTEM_NAMES.sort((a, b) => a.localeCompare(b));
    }

    case 'chooseFromOptions': {
      // Options are pre-defined in the action, return as-is
      return availableOptions;
    }

    case 'humanoVersatil': {
      // Return all skills that the character doesn't already have
      const allSkills = Object.values(Skill);
      return allSkills
        .filter((skill) => {
          // Check if skill is already in the skills array
          if (sheet.skills.includes(skill)) {
            return false;
          }

          // Check if skill is already trained in completeSkills
          if (sheet.completeSkills) {
            const existingSkill = sheet.completeSkills.find(
              (cs) => cs.name === skill
            );
            if (
              existingSkill &&
              existingSkill.training &&
              existingSkill.training > 0
            ) {
              return false;
            }
          }

          return true;
        })
        .sort((a, b) => a.localeCompare(b));
    }

    case 'lefouDeformidade': {
      // Return all skills sorted alphabetically
      const allLefouSkills = Object.values(Skill);
      return allLefouSkills.sort((a, b) => a.localeCompare(b));
    }

    case 'osteonMemoriaPostuma': {
      // Options are handled dynamically by MemoriaPostumaSelectionField
      // Return all skills as a fallback for filtering purposes
      const allMPSkills = Object.values(Skill);
      return allMPSkills
        .filter((skill) => {
          if (sheet.skills.includes(skill)) {
            return false;
          }
          if (sheet.completeSkills) {
            const existingSkill = sheet.completeSkills.find(
              (cs) => cs.name === skill
            );
            if (
              existingSkill &&
              existingSkill.training &&
              existingSkill.training > 0
            ) {
              return false;
            }
          }
          return true;
        })
        .sort((a, b) => a.localeCompare(b));
    }

    case 'yidishanNaturezaOrganica': {
      // Options are handled dynamically by YidishanNaturezaOrganicaSelectionField
      // Return all skills as a fallback for filtering purposes
      const allYidishanSkills = Object.values(Skill);
      return allYidishanSkills
        .filter((skill) => {
          if (sheet.skills.includes(skill)) {
            return false;
          }
          if (sheet.completeSkills) {
            const existingSkill = sheet.completeSkills.find(
              (cs) => cs.name === skill
            );
            if (
              existingSkill &&
              existingSkill.training &&
              existingSkill.training > 0
            ) {
              return false;
            }
          }
          return true;
        })
        .sort((a, b) => a.localeCompare(b));
    }

    case 'mashinChassi': {
      // Return all skills that the character doesn't already have
      const allMashinSkills = Object.values(Skill);
      return allMashinSkills
        .filter((skill) => {
          if (sheet.skills.includes(skill)) {
            return false;
          }
          if (sheet.completeSkills) {
            const existingSkill = sheet.completeSkills.find(
              (cs) => cs.name === skill
            );
            if (
              existingSkill &&
              existingSkill.training &&
              existingSkill.training > 0
            ) {
              return false;
            }
          }
          return true;
        })
        .sort((a, b) => a.localeCompare(b));
    }

    case 'almaLivreSelectClass': {
      // Options are handled dynamically by AlmaLivreSelectionField
      // Return all classes except the character's own class as a fallback
      const allClasses = dataRegistry.getClassesBySupplements(supplements);
      return allClasses
        .filter((c) => c.name !== sheet.classe.name)
        .map((c) => c.name)
        .sort((a, b) => a.localeCompare(b, 'pt-BR'));
    }

    case 'markTrainedSkills': {
      // Só perícias em que o personagem JÁ é treinado
      return [...(sheet.skills ?? [])].sort((a, b) =>
        a.localeCompare(b, 'pt-BR')
      );
    }

    case 'learnClassAbility': {
      // Devolve NOMES DE CLASSE (não pares classe+habilidade): `renderRequirement`
      // aborta o passo quando a lista vem vazia, e a lista de habilidades depende
      // da classe que o jogador ainda vai escolher.
      const whitelist = availableOptions as string[];
      const level = requirement.metadata?.abilityLevel ?? 1;

      return (
        dataRegistry
          .getClassesBySupplements(supplements)
          .filter((cls) => whitelist.includes(cls.name))
          // "uma classe que não seja a sua" — variante conta como a base
          .filter((cls) => !isClassOrVariantOf(sheet.classe, cls.name))
          // classe sem habilidade no nível pedido não tem o que oferecer
          .filter((cls) => cls.abilities.some((a) => a.nivel === level))
          .map((cls) => cls.name)
          .sort((a, b) => a.localeCompare(b, 'pt-BR'))
      );
    }

    case 'getClassPower': {
      // Poderes de classe elegíveis (ex.: origem "Futura Lenda"), filtrados por
      // nível mínimo e disponibilidade. Mesma lógica usada pelo gerador.
      return getFuturaLendaClassPowers(
        sheet,
        requirement.metadata?.minLevel ?? 2
      ).sort((a, b) => a.name.localeCompare(b.name));
    }

    default:
      return availableOptions;
  }
}

/**
 * Conta quantas escolhas o usuário já fez para uma requisição.
 *
 * Fonte única de verdade para os assistentes decidirem se o passo de seleções
 * está completo (`canProceed`/`isStepComplete`). Antes cada assistente mantinha
 * seu próprio `switch`, e os que não conheciam `chooseFromOptions` travavam o
 * botão "Próximo" para sempre (ex.: poder Tradição Perdida).
 *
 * Retorna `null` quando o tipo não é contável aqui — o chamador deve tratar
 * como "não bloquear", para que um tipo novo nunca prenda o assistente.
 */
export function countRequirementSelections(
  requirement: PowerSelectionRequirement,
  selections?: SelectionOptions
): number | null {
  switch (requirement.type) {
    case 'learnSkill':
      return selections?.skills?.length ?? 0;
    case 'addProficiency':
      return selections?.proficiencies?.length ?? 0;
    case 'getGeneralPower':
    case 'getClassPower':
      return selections?.powers?.length ?? 0;
    case 'learnSpell':
    case 'learnAnySpellFromHighestCircle':
      return selections?.spells?.length ?? 0;
    case 'increaseAttribute':
      return selections?.attributes?.length ?? 0;
    case 'selectWeaponSpecialization':
      return selections?.weapons?.length ?? 0;
    case 'selectFamiliar':
      return selections?.familiars?.length ?? 0;
    case 'selectAnimalTotem':
      return selections?.animalTotems?.length ?? 0;
    case 'chooseFromOptions':
      return selections?.chosenOption?.length ?? 0;
    case 'buildGolpePessoal':
      return selections?.golpePessoalBuild ? 1 : 0;
    case 'almaLivreSelectClass': {
      const selectedClass = requirement.metadata?.immediateClassPower
        ? selections?.diferentaoClass
        : selections?.almaLivreClass;
      const selectedPower = requirement.metadata?.immediateClassPower
        ? selections?.diferentaoPower
        : selections?.almaLivrePower;
      return selectedClass && selectedPower ? 1 : 0;
    }

    // Escolha em dois passos: ao selecionar a classe o campo já grava
    // `{ className, abilityName: '' }` para que a classe sobreviva à navegação
    // entre passos do assistente. Só conta como escolha feita quando a
    // habilidade também foi escolhida.
    case 'learnClassAbility':
      return selections?.classAbilities?.[0]?.abilityName ? 1 : 0;

    // O `pick` real é dinâmico; quem chama ajusta pelo atributo (o assistente
    // faz isso em `canProceed`). Aqui só a contagem crua.
    case 'markTrainedSkills':
      return selections?.skills?.length ?? 0;

    // Versátil (Humano), Deformidade (Lefou) e Chassi (Mashin): 2 perícias OU
    // 1 perícia + 1 poder.
    case 'humanoVersatil':
    case 'lefouDeformidade':
    case 'mashinChassi': {
      const skillCount = selections?.skills?.length ?? 0;
      const powerCount = selections?.powers?.length ?? 0;
      if (skillCount >= 2) return 2;
      if (skillCount >= 1 && powerCount >= 1) return 2;
      return skillCount;
    }

    // Memória Póstuma (Osteon/Soterrado) e Natureza Orgânica (Yidishan):
    // 1 perícia OU 1 poder OU 1 habilidade de raça.
    case 'osteonMemoriaPostuma':
    case 'yidishanNaturezaOrganica': {
      const skillCount = selections?.skills?.length ?? 0;
      const powerCount = selections?.powers?.length ?? 0;
      const abilityCount = selections?.raceAbilities?.length ?? 0;
      return skillCount + powerCount + abilityCount > 0 ? 1 : 0;
    }

    default:
      // Tipo não coberto: não bloquear o avanço do assistente
      return null;
  }
}

/**
 * Validate that the user's selections meet the requirements
 */
export function validateSelections(
  requirements: PowerSelectionRequirements,
  selections: SelectionOptions,
  sheet: CharacterSheet,
  supplements: SupplementId[] = [SupplementId.TORMENTA20_CORE]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  requirements.requirements.forEach((requirement) => {
    const { type, pick } = requirement;

    let selectedCount = 0;
    // Quantidade esperada. Quase sempre é o `pick` declarado; tipos de pick
    // dinâmico (markTrainedSkills) recalculam a partir da ficha.
    let expectedPick = pick;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let selectedItems: any[] = [];

    switch (type) {
      case 'learnSkill':
        // Biblioteca Divina e similares: escala com o patamar do nível atual
        // da ficha, com piso `pick` (declarado para o patamar Iniciante).
        expectedPick = resolveLearnSkillPick(
          requirement,
          getCurrentPlateau(sheet)
        );
        selectedItems = selections.skills || [];
        selectedCount = selectedItems.length;
        break;

      case 'addProficiency':
        selectedItems = selections.proficiencies || [];
        selectedCount = selectedItems.length;
        break;

      case 'getGeneralPower':
      case 'getClassPower':
        selectedItems = selections.powers || [];
        selectedCount = selectedItems.length;
        break;

      case 'learnSpell':
      case 'learnAnySpellFromHighestCircle':
        selectedItems = selections.spells || [];
        selectedCount = selectedItems.length;
        break;

      case 'increaseAttribute':
        selectedItems = selections.attributes || [];
        selectedCount = selectedItems.length;
        break;

      case 'selectWeaponSpecialization':
        selectedItems = selections.weapons || [];
        selectedCount = selectedItems.length;
        break;

      case 'selectFamiliar':
        selectedItems = selections.familiars || [];
        selectedCount = selectedItems.length;
        break;

      case 'selectAnimalTotem':
        selectedItems = selections.animalTotems || [];
        selectedCount = selectedItems.length;
        break;

      case 'chooseFromOptions':
        selectedItems = selections.chosenOption || [];
        selectedCount = selectedItems.length;
        break;

      case 'mashinChassi': {
        // 2 skills OR 1 skill + 1 mechanical marvel
        const mashinSkills = selections.skills || [];
        const mashinPowers = selections.powers || [];
        if (mashinSkills.length >= 2) {
          selectedCount = 2;
        } else if (mashinSkills.length >= 1 && mashinPowers.length >= 1) {
          selectedCount = 2;
        } else {
          selectedCount = mashinSkills.length;
        }
        selectedItems = [...mashinSkills, ...mashinPowers];
        break;
      }

      case 'osteonMemoriaPostuma': {
        // 1 skill OR 1 power OR 1 race ability
        const mpSkills = selections.skills || [];
        const mpPowers = selections.powers || [];
        const mpAbilities = selections.raceAbilities || [];
        selectedCount =
          mpSkills.length + mpPowers.length + mpAbilities.length > 0 ? 1 : 0;
        selectedItems = [...mpSkills, ...mpPowers, ...mpAbilities];
        break;
      }

      case 'yidishanNaturezaOrganica': {
        // 1 skill OR 1 power OR 1 race ability
        const ynoSkills = selections.skills || [];
        const ynoPowers = selections.powers || [];
        const ynoAbilities = selections.raceAbilities || [];
        selectedCount =
          ynoSkills.length + ynoPowers.length + ynoAbilities.length > 0 ? 1 : 0;
        selectedItems = [...ynoSkills, ...ynoPowers, ...ynoAbilities];
        break;
      }

      case 'almaLivreSelectClass': {
        // 1 class + 1 power
        const selectedClass = requirement.metadata?.immediateClassPower
          ? selections.diferentaoClass
          : selections.almaLivreClass;
        const selectedPower = requirement.metadata?.immediateClassPower
          ? selections.diferentaoPower
          : selections.almaLivrePower;
        const hasClass = selectedClass ? 1 : 0;
        const hasPower = selectedPower ? 1 : 0;
        selectedCount = hasClass && hasPower ? 1 : 0;
        selectedItems = [selectedClass, selectedPower].filter(Boolean);
        break;
      }

      case 'markTrainedSkills': {
        // Quantidade = modificador do atributo, com piso `minPick`. Aqui há
        // ficha, então dá para exigir o número certo (ao contrário do
        // `getPowerSelectionRequirements`, que só conhece o poder).
        const attribute = requirement.metadata?.pickByAttribute;
        const attributeMod = attribute
          ? sheet.atributos[attribute]?.value ?? 0
          : 0;
        const trainedCount = (sheet.skills ?? []).length;
        expectedPick = Math.min(
          Math.max(requirement.metadata?.minPick ?? pick, attributeMod),
          trainedCount
        );
        selectedItems = selections.skills || [];
        selectedCount = selectedItems.length;
        break;
      }

      case 'learnClassAbility': {
        // 1 classe + 1 habilidade daquela classe. `selectedItems` guarda só os
        // nomes de classe para casar com a lista de opções (também nomes de
        // classe) na checagem genérica de disponibilidade logo abaixo.
        const classAbilities = selections.classAbilities || [];
        selectedCount = classAbilities.filter(
          (selection) => selection.abilityName
        ).length;
        selectedItems = classAbilities.map((selection) => selection.className);
        break;
      }

      default:
        // Handle unknown types
        break;
    }

    const isOptional = requirement.optional === true;
    if (!isOptional && selectedCount !== expectedPick) {
      errors.push(
        `${requirement.label}: esperado ${expectedPick}, selecionado ${selectedCount}`
      );
    }

    // Tipos cuja lista de opções é montada pelo próprio componente (o
    // `getFilteredAvailableOptions` devolve vazio de propósito). Conferir
    // disponibilidade aqui reprovaria toda escolha válida.
    if (type === 'almaLivreSelectClass') return;

    // Check if selections are available
    const availableOptions = getFilteredAvailableOptions(
      requirement,
      sheet,
      supplements
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getName = (item: any): string => {
      if (typeof item === 'string') return item;
      if ('name' in item) return item.name;
      if ('nome' in item) return item.nome;
      return String(item);
    };

    selectedItems.forEach((item) => {
      const itemName = getName(item);
      // Empty strings represent "no choice" placeholders for optional requirements
      if (isOptional && itemName === '') {
        return;
      }
      if (
        !availableOptions.some((available) => getName(available) === itemName)
      ) {
        errors.push(
          `Seleção inválida: ${itemName} não está disponível para ${requirement.label}`
        );
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Apply a power with manual selections instead of random picks
 */
export function applyPowerWithManualSelections(
  sheet: CharacterSheet,
  _power: GeneralPower | ClassPower,
  _selections: SelectionOptions
): CharacterSheet {
  // This will be implemented when we update the applyPower function
  // For now, we'll return the sheet unchanged
  return sheet;
}
