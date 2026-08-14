import { Atributo } from '../data/systems/tormenta20/atributos';
import CharacterSheet, { SubStep } from '../interfaces/CharacterSheet';
import { countTormentaPowers } from './randomUtils';

const ATTRIBUTE_NAMES = new Set<string>(Object.values(Atributo));

/**
 * Fichas anteriores ao ledger não têm `tormentaAttributePenalties`, e sem ele
 * é impossível saber se a penalidade já foi descontada — o que faria o
 * primeiro recálculo aplicá-la em cima do que já estava aplicado.
 *
 * As duas origens possíveis se distinguem pelo passo-a-passo: o motor de ficha
 * aleatória sempre registrou um `SubStep` "-N por X poderes da Tormenta" com o
 * atributo exato e o valor exato; o assistente nunca aplicou nada (a regra não
 * existia naquele caminho). Reconstruir o ledger a partir desses `SubStep`s
 * cobre os dois casos com precisão: ficha do assistente devolve ledger vazio.
 */
function seedLegacyLedger(
  sheet: CharacterSheet
): Partial<Record<Atributo, number>> {
  const ledger: Partial<Record<Atributo, number>> = {};

  (sheet.steps ?? []).forEach((step) => {
    [...(step.value ?? []), ...(step.subSteps ?? [])].forEach((subStep) => {
      if (typeof subStep?.value !== 'string') return;
      const match = /^-(\d+) por \d+ poderes da Tormenta$/.exec(subStep.value);
      if (!match) return;
      const attr = subStep.name;
      if (!attr || !ATTRIBUTE_NAMES.has(attr)) return;
      const amount = Number(match[1]);
      ledger[attr as Atributo] = (ledger[attr as Atributo] ?? 0) + amount;
    });
  });

  return ledger;
}

/**
 * "Ao escolher um poder da Tormenta você perde 1 ponto de Carisma. Para cada
 * dois outros poderes da Tormenta, perde mais 1 ponto de Carisma."
 *
 * Ponto único de aplicação da regra, compartilhado pelos DOIS motores de
 * derivação de ficha (`applyStatModifiers`, da ficha aleatória, e
 * `recalculateSheet`, do assistente e de toda edição). Antes a regra existia
 * só no motor aleatório, então personagem criado pelo assistente nunca perdia
 * Carisma.
 *
 * `recalculateSheet` não rebaseia `atributos` — trabalha de forma incremental.
 * Por isso a função é escrita como ledger: reverte o que já tinha aplicado,
 * recalcula do zero e regrava. Assim ela é idempotente (rodar N vezes tem o
 * mesmo efeito de rodar uma) e se auto-corrige quando o jogador adiciona ou
 * remove um poder da Tormenta.
 *
 * Muta `sheet` no lugar e devolve os `SubStep`s do passo-a-passo da criação.
 */
export function applyTormentaAttributePenalty(
  sheet: CharacterSheet
): SubStep[] {
  const subSteps: SubStep[] = [];

  // 1. Reverte o ledger anterior, devolvendo os atributos ao valor base.
  const previous = sheet.tormentaAttributePenalties ?? seedLegacyLedger(sheet);
  (Object.entries(previous) as [Atributo, number][]).forEach(
    ([attr, delta]) => {
      if (sheet.atributos[attr]) {
        sheet.atributos[attr] = {
          ...sheet.atributos[attr],
          value: sheet.atributos[attr].value + delta,
        };
      }
    }
  );

  const ledger: Partial<Record<Atributo, number>> = {};
  // Gravado SEMPRE, mesmo vazio: enquanto o campo for `undefined` o passo
  // acima cai no `seedLegacyLedger`, e o `SubStep` legado continua no
  // passo-a-passo para sempre — quem tirasse todos os poderes da Tormenta
  // ganharia o atributo de volta a cada recálculo.
  sheet.tormentaAttributePenalties = ledger;

  // 2. Recalcula a penalidade do zero.
  const tormentaPowersQtd = countTormentaPowers(sheet, {
    forCharismaPenalty: true,
  });
  const totalPenalty = Math.floor((tormentaPowersQtd + 1) / 2);
  if (totalPenalty <= 0) return subSteps;

  const chargeAttribute = (attr: Atributo, amount: number) => {
    sheet.atributos[attr] = {
      ...sheet.atributos[attr],
      value: sheet.atributos[attr].value - amount,
    };
    ledger[attr] = (ledger[attr] ?? 0) + amount;
  };

  // Caso especial pra feiticeiros da linhagem rubra, eles nunca querem perder
  // carisma: a perda cai no maior atributo que não seja Carisma, um ponto por
  // vez (o alvo pode mudar conforme os valores se igualam).
  const hasLinhagemRubra = sheet.classe.abilities?.some(
    (ability) => ability.name === 'Linhagem Rubra'
  );

  if (hasLinhagemRubra) {
    for (let remaining = totalPenalty; remaining > 0; remaining -= 1) {
      const highestAttribute = Object.values(sheet.atributos).reduce(
        (prev, curr) => {
          if (curr.name === Atributo.CARISMA) return prev;
          if (prev.value > curr.value) return prev;
          return curr;
        }
      );

      chargeAttribute(highestAttribute.name, 1);
      subSteps.push({
        name: highestAttribute.name,
        value: `-1 por ${tormentaPowersQtd} poderes da Tormenta`,
      });
    }
  } else {
    chargeAttribute(Atributo.CARISMA, totalPenalty);
    subSteps.push({
      name: Atributo.CARISMA,
      value: `-${totalPenalty} por ${tormentaPowersQtd} poderes da Tormenta`,
    });
  }

  return subSteps;
}

export default applyTormentaAttributePenalty;
