import CharacterSheet from '../../interfaces/CharacterSheet';
import Divindade from '../../interfaces/Divindade';
import { GeneralPower, RequirementType } from '../../interfaces/Poderes';
import { SupplementId } from '../../types/supplement.types';
import { dataRegistry } from '../../data/registry';
import { isPowerAvailable } from '../powers';
import { isDualDevotionPower } from './grantedPowerPool';

/**
 * Poder Capturado — Usurpador, 4º nível (Heróis de Arton).
 *
 * "Você rouba o poder que os deuses concedem a seus devotos. Escolha um deus
 * maior por nível e um poder concedido desse deus (você deve cumprir seus
 * pré-requisitos e não pode escolher poderes exclusivos de qualquer classe,
 * inclusive clérigo). Você pode gastar uma hora e fazer um teste de Enganação
 * (CD é 20 +5 para cada uso adicional no mesmo dia). Se passar, você é
 * considerado um devoto desse deus para efeitos de habilidades e itens, e pode
 * usar o poder concedido escolhido (...). Se falhar, você perde 3 PM. Este
 * efeito dura até o fim do dia ou até você usá-lo novamente."
 */

/** Nível a partir do qual a habilidade existe. */
export const PODER_CAPTURADO_MIN_LEVEL = 4;

/** CD base do teste de ativação, antes dos usos adicionais no dia. */
export const PODER_CAPTURADO_BASE_DC = 20;

/** Acréscimo de CD por uso adicional no mesmo dia. */
export const PODER_CAPTURADO_DC_STEP = 5;

/** PM perdidos quando o teste de ativação falha. */
export const PODER_CAPTURADO_FAILURE_PM = 3;

/**
 * Deus MAIOR. Os deuses menores (Guia de Deuses Menores) são os únicos que
 * carregam `statusDivino` — é o marcador que separa os dois grupos.
 */
export function isMajorDeity(deity: Divindade): boolean {
  return deity.statusDivino === undefined;
}

/** Deuses maiores com os poderes concedidos dos suplementos ativos anexados. */
export function getMajorDeities(supplements: SupplementId[]): Divindade[] {
  // Via registry, nunca pelo array estático DIVINDADES: os poderes concedidos
  // de suplemento são anexados às divindades dinamicamente por este método.
  return dataRegistry
    .getDeitiesWithSupplementPowers(supplements)
    .filter(isMajorDeity);
}

/**
 * "não pode escolher poderes exclusivos de qualquer classe, inclusive clérigo".
 *
 * Não existe flag de exclusividade nos dados — ela é expressa como cláusula
 * `RequirementType.CLASSE` dentro de `requirements` (OR de ANDs). Hoje só
 * `Dom da Imortalidade` (Paladino) e `Dom da Ressurreição` (Clérigo/Frade).
 *
 * NÃO dá para resolver isso com `isPowerAvailable`: o Usurpador é variante de
 * Clérigo, e `isClassOrVariantOf(classe, 'Clérigo')` devolve `true` para ele —
 * Dom da Ressurreição passaria no teste de requisito. Este predicado é
 * independente da ficha justamente por isso.
 */
export function isClassExclusivePower(power: GeneralPower): boolean {
  return (power.requirements ?? []).some((group) =>
    group.some((rule) => rule.type === RequirementType.CLASSE && !rule.not)
  );
}

/**
 * Ficha sintética "como se fosse devoto" do deus escolhido.
 *
 * Sem ela, `RequirementType.DEVOTO` é sempre falso num Usurpador (que por regra
 * não tem devoção) e NENHUM poder concedido seria elegível. Mesmo truque usado
 * em `getAllowedClassPowers`/`getFuturaLendaClassPowers`.
 */
export function buildSyntheticDevoteSheet(
  sheet: CharacterSheet,
  deity: Divindade
): CharacterSheet {
  return { ...sheet, devoto: { divindade: deity, poderes: [] } };
}

export interface CapturablePower {
  power: GeneralPower;
  available: boolean;
  /** Por que está indisponível (só quando `available` é falso). */
  reason?: 'class-exclusive' | 'requirements' | 'dual-devotion-only';
}

/**
 * Poderes concedidos do deus, marcados como capturáveis ou não. Devolve a
 * lista inteira (e não só os elegíveis) para a UI poder explicar o motivo do
 * bloqueio em vez de simplesmente esconder a opção.
 */
export function getCapturablePowers(
  sheet: CharacterSheet,
  deity: Divindade
): CapturablePower[] {
  const syntheticSheet = buildSyntheticDevoteSheet(sheet, deity);

  return (deity.poderes ?? []).map((power) => {
    // "Clérigos usurpadores não têm acesso aos poderes concedidos únicos de
    // uma devoção dupla — pois só podem ser considerados devotos de um deus
    // de cada vez." A ficha sintética tem exatamente um deus, então o AND de
    // dois DEVOTO já reprovaria; marcamos o motivo explicitamente para a UI
    // poder explicar em vez de dizer "requisitos não cumpridos".
    if (isDualDevotionPower(power)) {
      return {
        power,
        available: false,
        reason: 'dual-devotion-only' as const,
      };
    }
    if (isClassExclusivePower(power)) {
      return { power, available: false, reason: 'class-exclusive' as const };
    }
    if (!isPowerAvailable(syntheticSheet, power)) {
      return { power, available: false, reason: 'requirements' as const };
    }
    return { power, available: true };
  });
}

/**
 * Quantos pares deus+poder o personagem tem: "um deus maior por nível", a
 * partir do 4º. No 20º nível são 20 — exatamente o número de deuses maiores.
 */
export function getPoderCapturadoSlots(sheet: CharacterSheet): number {
  const hasAbility = !!sheet?.classe?.abilities?.some(
    (ability) => ability.name === 'Poder Capturado'
  );
  if (!hasAbility) return 0;
  return Math.max(0, sheet.nivel ?? 0);
}

/** CD do teste de ativação: 20, +5 para cada uso adicional no mesmo dia. */
export function getPoderCapturadoDC(usesToday: number): number {
  return (
    PODER_CAPTURADO_BASE_DC + PODER_CAPTURADO_DC_STEP * Math.max(0, usesToday)
  );
}

/** Resolve o poder concedido de uma escolha gravada na ficha. */
export function resolveCapturedPower(
  choice: { divindade: string; poder: string },
  supplements: SupplementId[]
): { deity: Divindade; power: GeneralPower } | null {
  const deity = getMajorDeities(supplements).find(
    (d) => d.name === choice.divindade
  );
  if (!deity) return null;

  const power = (deity.poderes ?? []).find((p) => p.name === choice.poder);
  if (!power) return null;

  return { deity, power };
}
