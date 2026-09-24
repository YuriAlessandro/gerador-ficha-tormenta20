import { v4 as uuid } from 'uuid';
import CharacterSheet, { SheetBonus } from '../interfaces/CharacterSheet';
import { DiceRoll } from '../interfaces/DiceRoll';
import {
  SIZE_DAMAGE_STEP,
  getRaceSizeKey,
} from '../data/systems/tormenta20/races/raceSizes/raceSizes';
import { isBonusActive } from './bonusConditions';
import { getClassLevel, getClassLevelsMap } from './multiclass';
import { sheetHasPowerNamed } from './powers/hasPowerNamed';
import { countTormentaPowers } from './randomUtils';
import {
  damageAverage,
  stepUpDamage,
  addFlatDamageBonus,
} from './weaponDamageStep';
import { evaluateSimpleModifier } from './weaponBonusScope';

/**
 * Dano desarmado — ponto ÚNICO de verdade.
 *
 * O dano desarmado aparece em dois lugares: como `rolls` em três poderes — a
 * habilidade `Briga` (Lutador/Atleta) e os poderes `Estilo Desarmado` e
 * `Corpo Aberrante` — e agora também como uma arma de verdade na mochila
 * ("Ataque Desarmado", concedida automaticamente por `Briga`/`Estilo
 * Desarmado`, e a Manopla, que usa a mesma tag). Este módulo mantém os dois
 * em dia.
 *
 * A derivação é ABSOLUTA (base → melhor dado → passos), nunca incremental. É
 * isso que a torna idempotente sem precisar de um snapshot tipo `baseDano`: os
 * `rolls` são um campo do USUÁRIO, preservados e reinjetados a cada recálculo
 * por `restoreUserAbilityFields`, então somar um passo "por cima" do valor
 * corrente faria o dado subir sozinho a cada save.
 *
 * `updateDesarmadoTaggedWeaponsDano` escreve só o DADO-BASE (melhor de: 1d3
 * padrão, Estilo Desarmado, escada da Briga) nas armas `weaponTags:
 * ['desarmado']` — o passo de tamanho e futuros bônus por tag chegam pelo
 * bake genérico de armas (`recalculateSheet` Step 17), que já se aplica a
 * qualquer arma da mochila. Incluir o tamanho aqui TAMBÉM duplicaria o passo,
 * já que o Step 11.7 empurra um `WeaponDamageStep` sem filtro de tag para
 * toda arma da mochila.
 */

/** JDA, cap. 3: "1d3 pontos de dano para criaturas Pequenas e Médias". */
export const UNARMED_BASE_DAMAGE = '1d3';

/** Dano desarmado do poder geral `Estilo Desarmado`. */
const ESTILO_DESARMADO_DAMAGE = '1d6';

/**
 * Prefixo dos rótulos de rolagem que este módulo mantém vivos ("Dano
 * Desarmado" nos poderes, "Dano Desarmado (base)" na Briga).
 *
 * Casar por rótulo, em vez de reescrever `rolls` inteiro, preserva rolagens que
 * o jogador adicionou ao mesmo poder — e dá a ele uma saída explícita:
 * renomear a rolagem desliga a automação.
 */
const UNARMED_ROLL_LABEL_PREFIX = 'Dano Desarmado';

/** Rótulo usado quando a rolagem precisa ser CRIADA (ficha salva sem ela). */
const UNARMED_ROLL_LABEL = 'Dano Desarmado';

/** Poderes cujo card carrega a rolagem viva de dano desarmado. */
const UNARMED_ROLL_POWER_NAMES = new Set([
  'Corpo Aberrante',
  'Estilo Desarmado',
]);

/** Habilidades de classe que carregam a rolagem viva de dano desarmado. */
const UNARMED_ROLL_ABILITY_NAMES = new Set(['Briga']);

/**
 * Tabela oficial de dano desarmado da Briga (Lutador/Atleta), por nível de
 * classe: 1º-4º 1d6, 5º-8º 1d8, 9º-12º 1d10, 13º-16º 1d12, 17º-19º 2d8,
 * 20º 2d10 (Dono da Rua / Corpo Ideal).
 */
export function getBrigaDice(classLevel: number): string {
  if (classLevel >= 20) return '2d10';
  if (classLevel >= 17) return '2d8';
  if (classLevel >= 13) return '1d12';
  if (classLevel >= 9) return '1d10';
  if (classLevel >= 5) return '1d8';
  return '1d6';
}

export interface UnarmedDamageBreakdown {
  /** Dado antes de qualquer passo. */
  base: string;
  /** De onde o dado base veio, para o texto de interface. */
  baseSource: 'Ataque desarmado' | 'Estilo Desarmado' | 'Briga';
  /** Passo derivado da categoria de tamanho. */
  sizeStep: number;
  /** Soma dos bônus `UnarmedDamageStep`. */
  bonusSteps: number;
  /** `sizeStep + bonusSteps`. */
  totalSteps: number;
  /** Soma dos bônus `UnarmedDamage` (fixo, não mexe no dado). */
  flatBonus: number;
  /** Dado final, já com `flatBonus` somado (ex.: "1d6+2"). */
  dice: string;
}

/**
 * Dado base do ataque desarmado, ANTES dos passos.
 *
 * As três fontes não somam — a maior vence. `Estilo Desarmado` e `Briga` dizem
 * ambos "seus ataques desarmados causam X"; um Lutador 5º com Estilo Desarmado
 * bate 1d8, não 1d10.
 *
 * A comparação é pela MÉDIA, não pelo índice na escada: os degraus `2dX` vivem
 * num ramo diferente da Tabela 3-2, onde `2d8` (média 9) tem índice menor que
 * `1d12` (média 6,5) mas vale mais.
 */
export function getUnarmedBaseDamage(sheet: CharacterSheet): {
  dice: string;
  source: UnarmedDamageBreakdown['baseSource'];
} {
  let best: { dice: string; source: UnarmedDamageBreakdown['baseSource'] } = {
    dice: UNARMED_BASE_DAMAGE,
    source: 'Ataque desarmado',
  };

  const consider = (
    dice: string,
    source: UnarmedDamageBreakdown['baseSource']
  ) => {
    if (damageAverage(dice) > damageAverage(best.dice)) best = { dice, source };
  };

  if (sheetHasPowerNamed(sheet, 'Estilo Desarmado')) {
    consider(ESTILO_DESARMADO_DAMAGE, 'Estilo Desarmado');
  }

  // A Briga vem da habilidade JÁ na ficha (`classe.abilities` é filtrado por
  // nível), nunca de um teste pelo nome da classe: `getClassLevel` devolve o
  // nível TOTAL em ficha mono-classe, então `getClassLevel(sheet, 'Lutador')`
  // num Guerreiro daria o nível dele. `sourceClassName` é o que faz multiclasse
  // e a variante Atleta caírem certo.
  const briga = (sheet.classe?.abilities ?? []).find(
    (ability) => ability.name === 'Briga'
  );
  if (briga) {
    const className = briga.sourceClassName ?? sheet.classe.name;
    consider(getBrigaDice(getClassLevel(sheet, className)), 'Briga');
  }

  return best;
}

/**
 * Bônus de um alvo de dano desarmado (`UnarmedDamageStep` ou `UnarmedDamage`)
 * válidos para esta ficha.
 *
 * Lê `sheet.sheetBonuses` (o caminho normal, pós-recálculo) e TAMBÉM as cópias
 * embutidas nos poderes da ficha. A segunda metade existe porque abrir uma
 * ficha não dispara recálculo: sem ela, o card do poder mostraria o dado errado
 * até a primeira edição. Dedup por fonte, com `sheetBonuses` ganhando.
 *
 * NUNCA considera bônus de fonte `size`: o passo de tamanho entra uma vez só,
 * lido direto de `sheet.size` em `getUnarmedDamageSteps`.
 */
function collectUnarmedBonuses(
  sheet: CharacterSheet,
  targetType: 'UnarmedDamageStep' | 'UnarmedDamage'
): SheetBonus[] {
  const collected: SheetBonus[] = [];
  const seen = new Set<string>();

  const push = (bonus: SheetBonus) => {
    if (bonus?.target?.type !== targetType) return;
    if (bonus.source?.type === 'size') return;
    const key = `${bonus.source?.type ?? '?'}:${
      (bonus.source as { name?: string })?.name ?? '?'
    }`;
    if (seen.has(key)) return;
    if (!isBonusActive(sheet, bonus)) return;
    seen.add(key);
    collected.push(bonus);
  };

  (sheet.sheetBonuses ?? []).forEach(push);

  const embedded: { sheetBonuses?: SheetBonus[] }[] = [
    ...(sheet.generalPowers ?? []),
    ...(sheet.classPowers ?? []),
    ...(sheet.customPowers ?? []),
    ...(sheet.customGrantedPowers ?? []),
    ...(sheet.origin?.powers ?? []),
    ...(sheet.devoto?.poderes ?? []),
    ...(sheet.classe?.abilities ?? []),
  ];
  embedded.forEach((entry) => (entry?.sheetBonuses ?? []).forEach(push));

  return collected;
}

/** Soma os bônus de um alvo de dano desarmado, resolvendo cada modificador. */
function sumUnarmedBonuses(
  sheet: CharacterSheet,
  targetType: 'UnarmedDamageStep' | 'UnarmedDamage'
): number {
  // `normalizeSheet` chama isto em ficha corrompida da nuvem, que pode não ter
  // `classe` — `getClassLevelsMap` lê `sheet.classe.name` sem guarda.
  const classLevels = sheet.classe
    ? getClassLevelsMap(sheet)
    : new Map<string, number>();
  const tPowQtd = countTormentaPowers(sheet);

  return collectUnarmedBonuses(sheet, targetType).reduce(
    (total, bonus) =>
      total +
      evaluateSimpleModifier(
        bonus.modifier,
        sheet.atributos,
        sheet.nivel ?? 1,
        {
          classLevels,
          source: bonus.source,
          tPowQtd,
        }
      ),
    0
  );
}

/** Passo de tamanho + soma dos bônus `UnarmedDamageStep`. */
export function getUnarmedDamageSteps(sheet: CharacterSheet): {
  sizeStep: number;
  bonusSteps: number;
} {
  const sizeStep = SIZE_DAMAGE_STEP[getRaceSizeKey(sheet.size)] ?? 0;
  const bonusSteps = sumUnarmedBonuses(sheet, 'UnarmedDamageStep');

  return { sizeStep, bonusSteps };
}

/** Soma dos bônus `UnarmedDamage` (fixo — Ossos Afiados, Tocado pelo Indomável). */
export function getUnarmedDamageFlatBonus(sheet: CharacterSheet): number {
  return sumUnarmedBonuses(sheet, 'UnarmedDamage');
}

/** Detalhamento completo, para exibição e para os testes. */
export function computeUnarmedDamage(
  sheet: CharacterSheet
): UnarmedDamageBreakdown {
  const { dice: base, source: baseSource } = getUnarmedBaseDamage(sheet);
  const { sizeStep, bonusSteps } = getUnarmedDamageSteps(sheet);
  const totalSteps = sizeStep + bonusSteps;
  const flatBonus = getUnarmedDamageFlatBonus(sheet);

  // `allowAltLadder`: a Briga do Lutador 17º+ é 2d8/2d10, degraus que só
  // existem no ramo alternativo da Tabela 3-2. Sem isso, Corpo Aberrante
  // não faria nada exatamente para quem mais bate desarmado.
  const stepped = stepUpDamage(base, totalSteps, { allowAltLadder: true });

  return {
    base,
    baseSource,
    sizeStep,
    bonusSteps,
    totalSteps,
    flatBonus,
    dice: flatBonus !== 0 ? addFlatDamageBonus(stepped, flatBonus) : stepped,
  };
}

/** Só o dado final. */
export function getUnarmedDamageDice(sheet: CharacterSheet): string {
  return computeUnarmedDamage(sheet).dice;
}

const isUnarmedRoll = (roll: DiceRoll): boolean =>
  typeof roll?.label === 'string' &&
  roll.label.startsWith(UNARMED_ROLL_LABEL_PREFIX);

/**
 * Reescreve as rolagens já existentes. Devolve `null` quando nada mudou, para
 * que quem chama consiga evitar substituir o objeto à toa.
 */
function rewriteRolls(rolls: DiceRoll[], dice: string): DiceRoll[] | null {
  let changed = false;
  const next = rolls.map((roll) => {
    if (!isUnarmedRoll(roll) || roll.dice === dice) return roll;
    changed = true;
    return { ...roll, dice };
  });
  return changed ? next : null;
}

/**
 * Escreve o dado corrente em todas as rolagens de dano desarmado da ficha.
 * Muta `sheet` no lugar (substituindo objetos, nunca mutando-os — as
 * habilidades de classe são compartilhadas por referência com o catálogo e com
 * `classe.originalAbilities`). Devolve o dado quando algo mudou, senão `null`.
 */
export function updateUnarmedRolls(sheet: CharacterSheet): string | null {
  const { dice } = computeUnarmedDamage(sheet);
  let changed = false;

  if (sheet.classe?.abilities) {
    sheet.classe.abilities = sheet.classe.abilities.map((ability) => {
      if (!UNARMED_ROLL_ABILITY_NAMES.has(ability.name)) return ability;
      if (!ability.rolls?.length) return ability;
      const rolls = rewriteRolls(ability.rolls, dice);
      if (!rolls) return ability;
      changed = true;
      return { ...ability, rolls };
    });
  }

  const buckets: { list?: { name: string; rolls?: DiceRoll[] }[] }[] = [
    { list: sheet.generalPowers },
    { list: sheet.classPowers },
    { list: sheet.customPowers },
    { list: sheet.customGrantedPowers },
    { list: sheet.origin?.powers },
    { list: sheet.devoto?.poderes },
  ];

  buckets.forEach(({ list }) => {
    if (!list) return;
    list.forEach((power, index) => {
      if (!power || !UNARMED_ROLL_POWER_NAMES.has(power.name)) return;

      if (!power.rolls?.length) {
        // Ficha salva antes de a rolagem existir no catálogo. Cria uma — é o
        // que faz o botão aparecer sem exigir uma edição do jogador.
        // eslint-disable-next-line no-param-reassign
        list[index] = {
          ...power,
          rolls: [{ id: uuid(), label: UNARMED_ROLL_LABEL, dice }],
        };
        changed = true;
        return;
      }

      const rolls = rewriteRolls(power.rolls, dice);
      if (!rolls) return;
      // eslint-disable-next-line no-param-reassign
      list[index] = { ...power, rolls };
      changed = true;
    });
  });

  return changed ? dice : null;
}

/**
 * Reescreve dano/crítico das armas marcadas `weaponTags: ['desarmado']`
 * (Ataque Desarmado, Manopla) com o dado-base vivo (`getUnarmedBaseDamage`).
 *
 * Muta `sheet.bag.equipments.Arma` no lugar, no mesmo estilo do bake de armas
 * em `recalculateSheet.ts` (substitui o array, nunca muta os itens). Precisa
 * rodar ANTES do bake genérico de armas (`reapplyEnhancementsAndWeaponBonuses`
 * / Step 17), pra esse passo aplicar o degrau de tamanho por cima do dado-base
 * fresco em vez de sobre um valor desatualizado.
 *
 * Respeita `hasManualEdits` e modificações/encantamentos — mesma regra que
 * `resetWeaponToBase` usa pra não sobrescrever edição do jogador.
 */
export function updateDesarmadoTaggedWeaponsDano(sheet: CharacterSheet): void {
  const { dice } = getUnarmedBaseDamage(sheet);

  sheet.bag.equipments.Arma = sheet.bag.equipments.Arma.map((weapon) => {
    if (!weapon.weaponTags?.includes('desarmado')) return weapon;
    if (weapon.hasManualEdits) return weapon;
    if (weapon.modifications?.length || weapon.enchantments?.length) {
      return weapon;
    }

    // "-" é só o placeholder de catálogo (Manopla) pra "usa o dano
    // desarmado" — um crítico real definido pelo jogador nunca é tocado.
    const critico = weapon.critico === '-' ? 'x2' : weapon.critico;
    if (weapon.dano === dice && weapon.critico === critico) return weapon;

    return {
      ...weapon,
      dano: dice,
      baseDano: dice,
      critico,
      baseCritico: critico,
    };
  });
}

export default computeUnarmedDamage;
