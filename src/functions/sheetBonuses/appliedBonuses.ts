import _ from 'lodash';
import CharacterSheet, { SheetBonus } from '@/interfaces/CharacterSheet';
import { calculateBonusValue } from '../recalculateSheet';
import {
  describeBonusSource,
  formatBreakdownValue,
} from '../skills/skillBonusBreakdown';
import { describeBonusTarget } from './bonusTargetLabel';

/** Uma linha da seção "Aplicado na ficha" do card de poder. */
export type AppliedBonus = {
  /** Chave estável para lista React (é o próprio rótulo, já agregado). */
  key: string;
  /** Ex.: 'Ladinagem', 'RD contra Fogo', 'Proficiência: Armas Marciais'. */
  label: string;
  /** Ex.: '+2'. Ausente em alvos categóricos. */
  value?: string;
};

/** Poder de que dá pra extrair bônus — `CustomPower` não tem `sheetBonuses`. */
type PowerLike = { name: string; sheetBonuses?: SheetBonus[] };

/**
 * Bônus que um poder REALMENTE aplicou na ficha, prontos para exibir.
 *
 * Lê `sheet.sheetBonuses` (o estado vivo), não o array embutido no poder: o que
 * está ali já passou pelo filtro de `isBonusActive` no Step 8 do
 * `recalculateSheet`, então é exatamente o conjunto em vigor.
 *
 * Existe porque a coluna "Outros" da tabela de perícias soma bônus e
 * penalidades num número só: Golpista Divino dá +2 em Ladinagem, mas Ladinagem
 * é uma das três perícias com penalidade de armadura, então um ladino de couro
 * batido lê "+1" e conclui que o poder não funcionou (feedback de usuário,
 * jul/2026). Aqui o valor exibido é o DO PODER, independente do que mais caiu
 * no mesmo pote.
 */
export function getPowerAppliedBonuses(
  sheet: CharacterSheet,
  power: PowerLike
): AppliedBonus[] {
  const live = sheet.sheetBonuses ?? [];

  // Casamento primário: cobre todo o conteúdo do core, cujos bônus carimbam o
  // nome do poder na origem.
  let matched = live.filter(
    (bonus) => bonus.source.type === 'power' && bonus.source.name === power.name
  );

  // Casamento secundário: poderes de divindade/raça HOMEBREW declaram
  // `source: { type: 'divinity' | 'race' }` (ver `compileDeity.ts`), sem o nome
  // do poder — não há como atribuir pela origem. Casa o que o poder declara
  // contra o que está vivo, consumindo cada bônus UMA vez para dois poderes da
  // mesma divindade com bônus idênticos não contarem em dobro.
  if (matched.length === 0 && power.sheetBonuses?.length) {
    const remaining = [...live];
    const consumed: SheetBonus[] = [];

    power.sheetBonuses.forEach((declared) => {
      const index = remaining.findIndex(
        (candidate) =>
          candidate.source.type === declared.source.type &&
          // Comparar pelo rótulo, e não por `_.isEqual(source)`: `applyPower`
          // carimba `className` na origem quando há `sourceClassName`.
          describeBonusSource(candidate.source) ===
            describeBonusSource(declared.source) &&
          _.isEqual(candidate.target, declared.target) &&
          _.isEqual(candidate.modifier, declared.modifier)
      );
      if (index === -1) return; // declarado mas não aplicado (condição falsa)
      consumed.push(...remaining.splice(index, 1));
    });

    matched = consumed;
  }

  // Agrega por rótulo somando os valores (poder repetível gera duas entradas no
  // mesmo alvo), preservando a ordem de primeira aparição.
  const order: string[] = [];
  const numericTotals = new Map<string, number>();
  const categorical = new Set<string>();

  matched.forEach((bonus) => {
    const { label, numeric } = describeBonusTarget(bonus.target);

    if (!numeric) {
      if (!order.includes(label)) order.push(label);
      categorical.add(label);
      return;
    }

    const value = calculateBonusValue(sheet, bonus.modifier, bonus.source);
    if (value === 0) return; // mesma regra do `getSkillOthersBreakdown`

    if (!order.includes(label)) order.push(label);
    numericTotals.set(label, (numericTotals.get(label) ?? 0) + value);
  });

  return order
    .map((label) => {
      if (categorical.has(label)) return { key: label, label };
      const total = numericTotals.get(label) ?? 0;
      return { key: label, label, value: formatBreakdownValue(total) };
    })
    .filter((entry) => entry.value !== '+0');
}
