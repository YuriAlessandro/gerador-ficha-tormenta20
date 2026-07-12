import { RollGroup } from '../premium/services/socket.service';
import { parseDamage, rollDice } from './diceRoller';

/**
 * Pipeline puro de resolução de rolagens de ataque (jogadores, ameaças e
 * aliados). O crítico é decidido a partir dos valores REAIS dos dados —
 * sejam eles do RNG local ou dos dados 3D — garantindo que o d20 exibido,
 * a flag de crítico e a multiplicação do dano sempre concordem.
 *
 * Regras T20: crítico quando o d20 natural >= margem de ameaça; multiplica
 * apenas os DADOS de dano base (modificadores numéricos e dados extras nunca
 * são multiplicados).
 */

export interface AttackCritConfig {
  threshold: number; // margem de ameaça (d20 natural >= threshold => crítico)
  multiplier: number; // x2, x3, x4
}

// 'trigger' = Mecanismo (rótulo depende de acerto/erro); 'extra' = dano
// extra/elemental e bonusDamageDice. Nenhum dos dois multiplica em crítico.
export type AttackExtraKind = 'trigger' | 'extra';

export interface AttackExtraSpec {
  kind: AttackExtraKind;
  label: string;
  dice: string;
  damageType?: string;
}

export interface AttackRollRequest {
  rollLabel: string;
  characterName?: string;
  attackLabel?: string; // default 'Ataque'
  attackBonus: number;
  crit: AttackCritConfig;
  damage: {
    // String COMPLETA não multiplicada, com modificador numérico embutido
    // (ex.: '1d8+1d6+5'). A multiplicação de crítico é responsabilidade
    // deste módulo.
    dice: string;
    damageType?: string;
  };
  extras?: AttackExtraSpec[];
}

export interface DiceSpec {
  count: number;
  sides: number;
}

export interface AttackRollPlan {
  request: AttackRollRequest;
  baseDamage: { groups: DiceSpec[]; modifier: number };
  extras: Array<{
    spec: AttackExtraSpec;
    groups: DiceSpec[];
    modifier: number;
  }>;
}

// Valores reais dos dados, na ordem canônica do plano. Em crítico, os dados
// adicionais de cada grupo-base vêm APÓS os da fase 1 (append), grupo a grupo.
export interface AttackDiceValues {
  d20: number;
  baseDamage: number[];
  extras: number[][]; // um array por entrada de plan.extras, na mesma ordem
}

// Formato estrutural dos resultados do DiceBox (evita depender de hooks).
export interface Dice3DResultLike {
  sides: number | string;
  value: number;
  groupId?: number;
  rolls?: Array<{ value: number }>;
}

export type DiceRollerFn = (sides: number, count: number) => number[];

export function buildAttackRollPlan(
  request: AttackRollRequest
): AttackRollPlan | null {
  const parsedDamage = parseDamage(request.damage.dice);
  if (!parsedDamage) return null;

  // Extras com string inválida são descartados (paridade com os early
  // returns dos componentes antes da centralização).
  const extras = (request.extras ?? []).reduce<AttackRollPlan['extras']>(
    (acc, spec) => {
      const parsed = parseDamage(spec.dice);
      if (parsed) {
        acc.push({
          spec,
          groups: parsed.diceGroups,
          modifier: parsed.modifier,
        });
      }
      return acc;
    },
    []
  );

  return {
    request,
    baseDamage: {
      groups: parsedDamage.diceGroups,
      modifier: parsedDamage.modifier,
    },
    extras,
  };
}

/**
 * Dados da fase 1, em ordem canônica: 1d20, grupos do dano base, grupos dos
 * extras (na ordem do request). Essa ordem é o contrato usado para
 * redistribuir os valores 3D agrupados por faces.
 */
export function getPhase1Dice(plan: AttackRollPlan): DiceSpec[] {
  return [
    { count: 1, sides: 20 },
    ...plan.baseDamage.groups,
    ...plan.extras.flatMap((extra) => extra.groups),
  ];
}

export function isCriticalHit(d20: number, crit: AttackCritConfig): boolean {
  return d20 >= crit.threshold;
}

export function isFumbleRoll(d20: number): boolean {
  return d20 === 1;
}

/**
 * Dados adicionais rolados quando o ataque crita: cada grupo do dano base
 * ganha `count × (multiplicador − 1)` dados extras.
 */
export function getCritExtraDice(plan: AttackRollPlan): DiceSpec[] {
  const extraPerGroup = plan.request.crit.multiplier - 1;
  if (extraPerGroup <= 0) return [];
  return plan.baseDamage.groups.map((group) => ({
    count: group.count * extraPerGroup,
    sides: group.sides,
  }));
}

/**
 * Agrupa specs por faces (somando contagens) e monta a notação para o
 * DiceBox, do maior dado para o menor (ex.: '1d20+3d6').
 */
export function diceSpecsToNotation(specs: DiceSpec[]): string {
  const bySides: Record<number, number> = {};
  specs.forEach((spec) => {
    bySides[spec.sides] = (bySides[spec.sides] ?? 0) + spec.count;
  });
  return Object.entries(bySides)
    .map(([sides, count]) => ({ sides: parseInt(sides, 10), count }))
    .sort((a, b) => b.sides - a.sides)
    .map(({ sides, count }) => `${count}d${sides}`)
    .join('+');
}

/**
 * Extrai os valores individuais dos resultados do DiceBox, agrupados por
 * faces (mesma extração usada historicamente no DiceRollContext:
 * result.rolls[].value com fallback para result.value).
 */
export function extractValuesBySides(
  results: Dice3DResultLike[]
): Record<number, number[]> {
  const bySides: Record<number, number[]> = {};
  results.forEach((result) => {
    const sides = Number(result.sides);
    if (!bySides[sides]) bySides[sides] = [];
    if (result.rolls && Array.isArray(result.rolls)) {
      result.rolls.forEach((roll) => bySides[sides].push(roll.value));
    } else {
      bySides[sides].push(result.value);
    }
  });
  return bySides;
}

const copyQueues = (
  valuesBySides: Record<number, number[]>
): Record<number, number[]> => {
  const queues: Record<number, number[]> = {};
  Object.entries(valuesBySides).forEach(([sides, values]) => {
    queues[Number(sides)] = [...values];
  });
  return queues;
};

const takeFromQueues = (
  queues: Record<number, number[]>,
  spec: DiceSpec
): number[] | null => {
  const queue = queues[spec.sides];
  if (!queue || queue.length < spec.count) return null;
  return queue.splice(0, spec.count);
};

/**
 * Consome `specs` (em ordem) das filas por faces. Retorna null se faltar dado.
 * Não muta o objeto recebido.
 */
export function takeDiceValues(
  specs: DiceSpec[],
  valuesBySides: Record<number, number[]>
): number[] | null {
  const queues = copyQueues(valuesBySides);
  const taken: number[] = [];
  for (let i = 0; i < specs.length; i += 1) {
    const values = takeFromQueues(queues, specs[i]);
    if (!values) return null;
    taken.push(...values);
  }
  return taken;
}

function distributeValues(
  plan: AttackRollPlan,
  valuesBySides: Record<number, number[]>,
  critDice: DiceSpec[]
): AttackDiceValues | null {
  const queues = copyQueues(valuesBySides);

  const d20Values = takeFromQueues(queues, { count: 1, sides: 20 });
  if (!d20Values) return null;

  const baseDamage: number[] = [];
  for (let i = 0; i < plan.baseDamage.groups.length; i += 1) {
    const values = takeFromQueues(queues, plan.baseDamage.groups[i]);
    if (!values) return null;
    baseDamage.push(...values);
  }

  const extras: number[][] = [];
  for (let i = 0; i < plan.extras.length; i += 1) {
    const extraValues: number[] = [];
    for (let j = 0; j < plan.extras[i].groups.length; j += 1) {
      const values = takeFromQueues(queues, plan.extras[i].groups[j]);
      if (!values) return null;
      extraValues.push(...values);
    }
    extras.push(extraValues);
  }

  // Dados adicionais de crítico vêm APÓS os da fase 1 nas filas (ordem de
  // inserção da cena) e são appendados ao dano base.
  for (let i = 0; i < critDice.length; i += 1) {
    const values = takeFromQueues(queues, critDice[i]);
    if (!values) return null;
    baseDamage.push(...values);
  }

  return { d20: d20Values[0], baseDamage, extras };
}

/**
 * Distribui os valores 3D (agrupados por faces) na ordem canônica da fase 1.
 * Retorna null se faltar dado em alguma fila — gatilho para o fallback local.
 * Não muta o objeto recebido.
 */
export function distributePhase1Values(
  plan: AttackRollPlan,
  valuesBySides: Record<number, number[]>
): AttackDiceValues | null {
  return distributeValues(plan, valuesBySides, []);
}

/**
 * Distribui a cena 3D COMPLETA após a segunda fase de um crítico: fase 1 na
 * ordem canônica + dados adicionais de crítico appendados ao dano base. O
 * `getRollResults()` do DiceBox devolve todos os grupos em cena em ordem de
 * inserção, então os dados da fase 1 ocupam o início de cada fila por faces
 * e os adicionados o final. Retorna null se as contagens não fecharem.
 */
export function distributeFullAttackValues(
  plan: AttackRollPlan,
  valuesBySides: Record<number, number[]>
): AttackDiceValues | null {
  return distributeValues(plan, valuesBySides, getCritExtraDice(plan));
}

const sum = (values: number[]): number =>
  values.reduce((acc, value) => acc + value, 0);

const specsToDiceString = (specs: DiceSpec[]): string =>
  specs.map((spec) => `${spec.count}d${spec.sides}`).join('+');

/**
 * Monta os RollGroup[] finais a partir dos valores reais dos dados.
 * `values.baseDamage` deve conter os dados da fase 1 (na ordem dos grupos) e,
 * em crítico, os dados adicionais appendados em seguida.
 */
export function resolveAttackRoll(
  plan: AttackRollPlan,
  values: AttackDiceValues
): RollGroup[] {
  const { request } = plan;
  const { crit } = request;

  const isCritical = isCriticalHit(values.d20, crit);
  const isFumble = isFumbleRoll(values.d20);

  const atkModifierStr =
    request.attackBonus >= 0
      ? `+${request.attackBonus}`
      : `${request.attackBonus}`;

  const groups: RollGroup[] = [
    {
      label: request.attackLabel ?? 'Ataque',
      diceNotation: `1d20${atkModifierStr}`,
      rolls: [values.d20],
      modifier: request.attackBonus,
      total: Math.max(1, values.d20 + request.attackBonus),
      isCritical,
      isFumble,
      criticalThreshold: crit.threshold,
    },
  ];

  const phase1Count = plan.baseDamage.groups.reduce(
    (acc, group) => acc + group.count,
    0
  );
  const normalDamage = Math.max(
    1,
    sum(values.baseDamage.slice(0, phase1Count)) + plan.baseDamage.modifier
  );

  if (isCritical) {
    const multipliedSpecs = plan.baseDamage.groups.map((group) => ({
      count: group.count * crit.multiplier,
      sides: group.sides,
    }));
    groups.push({
      label: `Dano x${crit.multiplier} (normal: ${normalDamage})`,
      diceNotation: specsToDiceString(multipliedSpecs),
      rolls: values.baseDamage,
      modifier: plan.baseDamage.modifier,
      total: Math.max(1, sum(values.baseDamage) + plan.baseDamage.modifier),
      damageType: request.damage.damageType,
    });
  } else {
    groups.push({
      label: 'Dano',
      diceNotation: specsToDiceString(plan.baseDamage.groups),
      rolls: values.baseDamage,
      modifier: plan.baseDamage.modifier,
      total: normalDamage,
      damageType: request.damage.damageType,
    });
  }

  plan.extras.forEach((extra, index) => {
    const extraValues = values.extras[index] ?? [];
    // O Mecanismo soma ao dano apenas se o ataque acertar; sem alvo/Defesa na
    // plataforma, o proxy é a falha crítica (paridade com o comportamento
    // anterior, em que o total de ataque clampado era sempre > 0).
    const label =
      extra.spec.kind === 'trigger'
        ? `${extra.spec.label} (${
            isFumble ? 'errou — não soma' : 'acertou — somar ao dano'
          })`
        : extra.spec.label;
    groups.push({
      label,
      diceNotation: specsToDiceString(extra.groups),
      rolls: extraValues,
      modifier: extra.modifier,
      total: Math.max(1, sum(extraValues) + extra.modifier),
      damageType: extra.spec.damageType,
    });
  });

  return groups;
}

/**
 * Caminho sem dados 3D (e fallback quando a animação falha): rola tudo com o
 * RNG local, incluindo os dados adicionais quando o d20 crita.
 */
export function rollAttackLocally(
  plan: AttackRollPlan,
  roll: DiceRollerFn = rollDice
): RollGroup[] {
  const d20 = roll(20, 1)[0];

  const baseDamage = plan.baseDamage.groups.flatMap((group) =>
    roll(group.sides, group.count)
  );
  if (isCriticalHit(d20, plan.request.crit)) {
    getCritExtraDice(plan).forEach((spec) => {
      baseDamage.push(...roll(spec.sides, spec.count));
    });
  }

  const extras = plan.extras.map((extra) =>
    extra.groups.flatMap((group) => roll(group.sides, group.count))
  );

  return resolveAttackRoll(plan, { d20, baseDamage, extras });
}
