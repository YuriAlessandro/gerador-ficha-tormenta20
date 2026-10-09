import { calculateBonusValue } from '../functions/recalculateSheet';
import CharacterSheet, {
  SheetBonus,
  SheetChangeSource,
} from '../interfaces/CharacterSheet';
import { buildChange } from './effects';
import { FOUNDRY_SKILLS } from './skills';
import { FoundryEffectChange } from './types';

/**
 * Automações próprias: os bônus estruturados da ficha (`sheet.sheetBonuses`)
 * convertidos em efeitos passivos do Foundry. Nada vem do compêndio do sistema
 * — a fonte é o mesmo dado que a ficha usa para calcular seus totais.
 *
 * `sheet.sheetBonuses` já chega filtrado por condição (`isBonusActive`) e é
 * exatamente o que o recálculo somou, então espelhar a lista inteira mantém os
 * totais do Foundry iguais aos da ficha.
 *
 * Cobertura: perícias e Defesa. PV, PM, deslocamento, carga, atributos e RD
 * saem como totais prontos no ator; bônus de ataque e dano já estão nos números
 * das armas.
 */
export interface BonusGroup {
  /** Nome mostrado no efeito: o poder, o item, a raça… que concede o bônus. */
  label: string;
  /** Preenchido quando a fonte é um poder — o efeito vai no item do poder. */
  powerName?: string;
  changes: FoundryEffectChange[];
}

export interface SheetAutomations {
  groups: BonusGroup[];
  /** Soma dos bônus de Defesa que viraram efeito (o Foundry os soma sozinho). */
  defense: number;
  /** Bônus de perícia sem fonte exportável, por chave de perícia do Foundry. */
  skillOthers: Record<string, number>;
}

/**
 * Rótulo da fonte. `undefined` = estado passageiro da ficha (condição, efeito
 * ativo ligado): não vira efeito permanente no Foundry.
 */
function getSourceLabel(source: SheetChangeSource): string | undefined {
  switch (source.type) {
    case 'power':
      return source.name;
    case 'equipment':
      return source.equipmentName;
    case 'race':
      return source.raceName;
    case 'class':
      return source.className;
    case 'origin':
      return source.originName;
    case 'divinity':
      return source.divinityName;
    case 'complication':
      return source.complicationName;
    case 'age':
      return source.ageLabel;
    case 'size':
      return `Tamanho ${source.sizeName}`;
    case 'levelUp':
      return `Nível ${source.level}`;
    case 'manualEdit':
      return 'Ajuste manual';
    default:
      return undefined;
  }
}

/** Chave de mudança do Foundry para o alvo do bônus, quando há uma. */
function getChangeKey(bonus: SheetBonus): string | undefined {
  if (bonus.target.type === 'Defense') return 'system.attributes.defesa.bonus';
  if (bonus.target.type === 'Skill') {
    const skill = FOUNDRY_SKILLS[bonus.target.name];
    return skill ? `system.pericias.${skill}.bonus` : undefined;
  }
  return undefined;
}

export function buildAutomations(sheet: CharacterSheet): SheetAutomations {
  const groups = new Map<string, BonusGroup>();
  const skillOthers: Record<string, number> = {};
  let defense = 0;

  (sheet.sheetBonuses ?? []).forEach((bonus) => {
    const key = getChangeKey(bonus);
    if (!key) return;

    // O valor é resolvido agora, com o nível e os atributos atuais da ficha.
    const value = calculateBonusValue(sheet, bonus.modifier, bonus.source);
    if (!value) return;

    const label = getSourceLabel(bonus.source);
    if (!label) {
      // A Defesa fecha sozinha pelo `outros` do ator; a perícia precisa levar
      // o valor no `outros` dela.
      if (bonus.target.type === 'Skill') {
        const skill = FOUNDRY_SKILLS[bonus.target.name];
        if (skill) skillOthers[skill] = (skillOthers[skill] ?? 0) + value;
      }
      return;
    }

    const groupKey = `${bonus.source.type}::${label}`;
    const group = groups.get(groupKey) ?? {
      label,
      powerName: bonus.source.type === 'power' ? bonus.source.name : undefined,
      changes: [],
    };
    group.changes.push(buildChange(key, value, 'add'));
    groups.set(groupKey, group);

    if (bonus.target.type === 'Defense') defense += value;
  });

  return { groups: Array.from(groups.values()), defense, skillOthers };
}
