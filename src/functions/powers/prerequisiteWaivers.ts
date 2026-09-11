/**
 * Dispensa de pré-requisitos — ponto único de "este personagem pode pegar tal
 * poder ignorando tais requisitos". A exceção é declarada no poder que a
 * CONCEDE (`waivesPrerequisites`), não nos poderes-alvo.
 *
 * São DOIS eixos, e quase todo caso real precisa dos dois:
 *
 * 1. **Avaliação** — `isRequirementWaived` faz `isPowerAvailable` (motor) e
 *    `evaluatePowerRequirements` (editor) ignorarem certos tipos de requisito.
 * 2. **Catálogo** — `unlocksOtherClassPowers` / `unlocksOtherDeityPowers`
 *    trazem o poder para a lista de escolha. Sem isso não há o que avaliar:
 *    concedido sai da piscina da divindade da ficha e poder de classe sai do
 *    catálogo da classe da ficha, então nunca chegam ao avaliador.
 *
 * O `bypassPrereqForPowersNamed` das habilidades raciais é normalizado para um
 * waiver aqui, em vez de seguir como um segundo caminho de decisão — eram duas
 * cópias divergentes desse check (ver o topo de `requirementEvaluation`).
 *
 * Caso de referência: "Domínio do Medo" em
 * `data/systems/tormenta20/deuses-menores/powers`.
 */
import { ClassPower } from '../../interfaces/Class';
import CharacterSheet from '../../interfaces/CharacterSheet';
import {
  GeneralPower,
  PowerSelector,
  PrerequisiteWaiver,
  Requirement,
  RequirementType,
} from '../../interfaces/Poderes';
import { collectSheetPowers, PowerLike } from './hasPowerNamed';

/** Qualquer coisa que possa carregar um waiver e ser alvo de um. */
export type WaivablePower = Pick<GeneralPower | ClassPower, 'name'> & {
  tags?: string[];
  waivesPrerequisites?: PrerequisiteWaiver[];
  bypassPrereqForPowersNamed?: string[];
  /** Multiclasse já carimba a classe de origem no poder. */
  className?: string;
};

/** Poderes marcados no editor e ainda não salvos na ficha. */
export interface PendingPowers {
  generalPowers?: PowerLike[];
  classPowers?: PowerLike[];
}

/** Açúcar legado → waiver: substring no nome, todos os tipos, sem catálogo. */
function legacyBypassToWaiver(
  source: WaivablePower
): PrerequisiteWaiver | undefined {
  const terms = source.bypassPrereqForPowersNamed;
  if (!terms || terms.length === 0) return undefined;
  return {
    targets: { nameIncludes: terms },
    // `requirementTypes` ausente = todos, que é o que o campo sempre fez.
    reason: source.name,
  };
}

/**
 * Waivers declarados por um conjunto qualquer de poderes. Independe de ficha
 * para atender o assistente de criação, que escolhe antes de haver uma.
 */
export function collectWaiversFrom(
  sources: WaivablePower[]
): PrerequisiteWaiver[] {
  const waivers: PrerequisiteWaiver[] = [];
  sources.forEach((source) => {
    source.waivesPrerequisites?.forEach((waiver) => waivers.push(waiver));
    const legacy = legacyBypassToWaiver(source);
    if (legacy) waivers.push(legacy);
  });
  return waivers;
}

/**
 * Todos os waivers ativos do personagem. `classe.abilities` fica fora de
 * `collectSheetPowers` de propósito (traz todos os níveis), então entra aqui
 * com o gate explícito. `pending` cobre o que o editor marcou e não salvou.
 */
export function getActiveWaivers(
  sheet: CharacterSheet,
  pending?: PendingPowers
): PrerequisiteWaiver[] {
  const sources: WaivablePower[] = [
    ...(collectSheetPowers(sheet) as WaivablePower[]),
    ...((sheet.classe?.abilities ?? []).filter(
      (ability) => ability.nivel <= sheet.nivel
    ) as unknown as WaivablePower[]),
    ...((pending?.generalPowers ?? []) as WaivablePower[]),
    ...((pending?.classPowers ?? []) as WaivablePower[]),
  ];

  return collectWaiversFrom(sources);
}

/**
 * O seletor alcança este poder? `className` é o escopo do poder avaliado —
 * `undefined` para poder geral/concedido.
 */
export function selectorMatches(
  selector: PowerSelector,
  power: WaivablePower,
  className?: string
): boolean {
  if (selector.names?.includes(power.name)) return true;

  const scope = className ?? power.className;
  if (
    scope &&
    selector.classPowers?.some(
      (entry) => entry.className === scope && entry.name === power.name
    )
  ) {
    return true;
  }

  if (selector.tags?.some((tag) => power.tags?.includes(tag))) return true;

  // Modo legado, por substring. Ver `PowerSelector.nameIncludes`.
  if (selector.nameIncludes?.some((term) => power.name.includes(term))) {
    return true;
  }

  return false;
}

/** O primeiro waiver que alcança este poder. Inteiro: quem chama usa `reason` e `unlocks*`. */
export function findWaiverForPower(
  power: WaivablePower,
  waivers: PrerequisiteWaiver[],
  className?: string
): PrerequisiteWaiver | undefined {
  return waivers.find((waiver) =>
    selectorMatches(waiver.targets, power, className)
  );
}

/** `requirementTypes` ausente significa "todos os tipos". */
export function waiverCovers(
  waiver: PrerequisiteWaiver,
  type: RequirementType
): boolean {
  return !waiver.requirementTypes || waiver.requirementTypes.includes(type);
}

/**
 * Este requisito está dispensado? Requisito NEGADO nunca é: ele PROÍBE uma
 * combinação, e ignorá-lo inverteria a regra em vez de afrouxá-la.
 */
export function isRequirementWaived(
  requirement: Requirement,
  power: WaivablePower,
  waivers: PrerequisiteWaiver[],
  className?: string
): { waived: boolean; reason?: string } {
  if (requirement.not) return { waived: false };

  const waiver = findWaiverForPower(power, waivers, className);
  if (!waiver || !waiverCovers(waiver, requirement.type)) {
    return { waived: false };
  }

  return { waived: true, reason: waiver.reason };
}

/** Waivers que destravam poderes de classe de OUTRAS classes. */
export function getClassUnlockingWaivers(
  waivers: PrerequisiteWaiver[]
): PrerequisiteWaiver[] {
  return waivers.filter((waiver) => waiver.unlocksOtherClassPowers);
}

/** Idem, para concedidos de outros deuses. */
export function getDeityUnlockingWaivers(
  waivers: PrerequisiteWaiver[]
): PrerequisiteWaiver[] {
  return waivers.filter((waiver) => waiver.unlocksOtherDeityPowers);
}
