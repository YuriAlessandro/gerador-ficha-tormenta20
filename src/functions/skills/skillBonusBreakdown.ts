import CharacterSheet, { SheetChangeSource } from '@/interfaces/CharacterSheet';
import Skill, { CompleteSkill } from '@/interfaces/Skills';
import { CONDITION_TEMPLATES, ConditionId } from '@/premium/data/conditions';
import { calculateBonusValue } from '../recalculateSheet';

/** Uma parcela do "Outros" de uma perícia, já com rótulo pronto pra exibir. */
export type SkillOthersEntry = { label: string; value: number };

const ARMOR_PENALTY_LABEL = 'Penalidade de armadura';

/** Rótulo legível de qualquer origem de bônus da ficha. */
export function describeBonusSource(source: SheetChangeSource): string {
  switch (source.type) {
    case 'power':
      return source.name;
    case 'levelUp':
      return `Nível ${source.level}`;
    case 'origin':
      return source.originName;
    case 'race':
      return source.raceName;
    case 'class':
      return source.className;
    case 'divinity':
      return source.divinityName;
    case 'equipment':
      return source.equipmentName;
    case 'complication':
      return source.complicationName;
    case 'activeEffect':
      return source.name;
    case 'condition':
      // `conditionId` é `string` na ficha; o catálogo é indexado por ConditionId.
      return (
        CONDITION_TEMPLATES[source.conditionId as ConditionId]?.name ??
        'Condição'
      );
    case 'manualEdit':
      return 'Edição manual';
    default:
      return 'Outros';
  }
}

/** Mesmo modificador de tamanho que a SkillTable soma ao exibir "Outros". */
function getSkillSizeModifier(sheet: CharacterSheet, skill: Skill): number {
  if (skill !== Skill.FURTIVIDADE) return 0;
  return sheet.size?.modifiers?.stealth ?? 0;
}

/**
 * Decompõe o "Outros" de uma perícia nas parcelas que o formaram, para a ficha
 * poder mostrar de onde vem cada ponto.
 *
 * A coluna "Outros" soma tudo num único número, o que esconde bônus reais
 * quando há uma penalidade no mesmo pote: Golpista Divino dá +2 em Ladinagem,
 * mas Ladinagem é uma das três perícias com penalidade de armadura
 * (`SkillsWithArmorPenalty`), então um ladino de couro batido vê "+1" e conclui
 * que o poder não funcionou (feedback de usuário, jul/2026).
 *
 * As parcelas saem de `sheet.sheetBonuses`, que persiste na ficha e já vem
 * filtrado por `isBonusActive` no Step 8 do `recalculateSheet` — o que sobrou
 * ali é exatamente o conjunto ativo. Mesmo padrão do tooltip de efeitos de
 * arma em `Weapon.tsx`. Nada novo é gravado na ficha.
 *
 * A soma das parcelas devolvidas é sempre igual a `others + modificador de
 * tamanho`, isto é, ao número que a SkillTable exibe.
 */
export function getSkillOthersBreakdown(
  sheet: CharacterSheet,
  skill: CompleteSkill
): SkillOthersEntry[] {
  const entries: SkillOthersEntry[] = [];
  let accounted = 0;

  (sheet.sheetBonuses ?? []).forEach((bonus) => {
    const isSkillTarget =
      bonus.target.type === 'Skill' && bonus.target.name === skill.name;
    // Teste de ataque é teste de Luta/Pontaria — mesmo roteamento do Step 8 do
    // recalculateSheet. Sem isto, Armas da Ambição some do breakdown.
    const isAttackTarget =
      bonus.target.type === 'AllAttackBonus' &&
      (skill.name === Skill.LUTA || skill.name === Skill.PONTARIA);

    if (!isSkillTarget && !isAttackTarget) return;

    const value = calculateBonusValue(sheet, bonus.modifier, bonus.source);
    if (value === 0) return;

    entries.push({ label: describeBonusSource(bonus.source), value });
    accounted += value;
  });

  const manualOthers = skill.manualOthers ?? 0;
  if (manualOthers !== 0) {
    entries.push({ label: 'Ajuste manual', value: manualOthers });
    accounted += manualOthers;
  }

  // O que resta de `others` depois dos bônus e do ajuste manual é a parcela que
  // o `recalculateCompleteSkills` semeia antes de tudo: a penalidade de
  // armadura (própria ou a de item sem proficiência, que se estende às perícias
  // de Força/Destreza). Derivar por resto — em vez de recalcular a penalidade
  // aqui — garante que o breakdown feche com o total exibido mesmo se surgir
  // uma parcela nova nesse pote.
  const residual = (skill.others ?? 0) - accounted;
  if (residual !== 0) {
    entries.push({
      label: residual < 0 ? ARMOR_PENALTY_LABEL : 'Outros',
      value: residual,
    });
  }

  // Fora de `others`: a SkillTable soma o tamanho separadamente em Furtividade.
  const sizeModifier = getSkillSizeModifier(sheet, skill.name);
  if (sizeModifier !== 0) {
    entries.push({
      label: `Tamanho (${sheet.size?.name ?? ''})`.replace(' ()', ''),
      value: sizeModifier,
    });
  }

  // Uma linha por origem: duas entradas da mesma fonte na mesma perícia (poder
  // repetível, por exemplo) viram uma só, somadas. Também garante rótulo único,
  // que a UI usa como chave de lista.
  const merged = new Map<string, number>();
  entries.forEach(({ label, value }) => {
    merged.set(label, (merged.get(label) ?? 0) + value);
  });

  return Array.from(merged, ([label, value]) => ({ label, value })).filter(
    (entry) => entry.value !== 0
  );
}

/** `2` → `'+2'`, `-1` → `'-1'`. */
export function formatBreakdownValue(value: number): string {
  return `${value >= 0 ? '+' : ''}${value}`;
}
