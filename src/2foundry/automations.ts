import {
  getActiveEffectForSpell,
  getActivePowerForSheetEntry,
} from '@/premium/data/activePowers';
import type {
  ActiveEffectUsageOption,
  ActivePowerDefinition,
} from '@/premium/interfaces/ActiveEffect';
import { calculateBonusValue } from '../functions/recalculateSheet';
import CharacterSheet, {
  SheetBonus,
  SheetChangeSource,
  StatModifierTarget,
} from '../interfaces/CharacterSheet';
import { buildChange, buildPassiveEffect } from './effects';
import { ATTRIBUTE_KEYS, toDamageTypeKey } from './enums';
import { textToHtml } from './normalize';
import { FOUNDRY_SKILLS } from './skills';
import { FoundryEffect, FoundryEffectChange } from './types';

/**
 * Automações próprias: os bônus estruturados da ficha convertidos em efeitos do
 * Foundry. Nada vem do compêndio do sistema — as fontes são os mesmos dados que
 * a ficha usa para calcular seus totais:
 *
 * - **Passivos** (`sheet.sheetBonuses`): bônus permanentes de poderes, raça,
 *   itens… Viram efeitos sempre ligados.
 * - **Ativáveis** (catálogo de efeitos ativos, o do botão "Usar" da ficha):
 *   poderes e magias com bônus temporário. Viram efeitos DESLIGADOS no ATOR,
 *   que o jogador liga e desliga na aba de Efeitos.
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
  /** Soma dos bônus de Defesa que o Foundry aplica sozinho via efeito. */
  defense: number;
  /** Bônus de perícia sem fonte exportável, por chave de perícia do Foundry. */
  skillOthers: Record<string, number>;
}

/** Poderes e magias da ficha que têm efeito ativável, pelo nome na ficha. */
export interface SheetToggles {
  powers: Map<string, ActivePowerDefinition>;
  spells: Map<string, ActivePowerDefinition>;
}

type WeaponScope = Extract<
  StatModifierTarget,
  { type: 'WeaponAttack' | 'WeaponDamage' }
>;

/**
 * Bônus de arma → sufixo do modificador do Foundry (`geral`, `cac`, `ad`).
 * `undefined` quando o bônus é restrito a armas específicas (nome, tag,
 * categoria…): o Foundry não tem modificador equivalente, e aplicá-lo a todas
 * as armas seria errado.
 */
function getWeaponScope(target: WeaponScope): string | undefined {
  const isRestricted =
    !!target.weaponName ||
    !!target.weaponTags?.length ||
    !!target.weaponCategories?.length ||
    target.proficiencyRequired ||
    target.lightOrAgileOnly ||
    target.twoHandedOnly ||
    target.swordOnly ||
    target.thrownOnly ||
    target.firingOnly;
  if (isRestricted) return undefined;
  if (target.meleeOnly) return 'cac';
  if (target.rangedOnly) return 'ad';
  return 'geral';
}

/**
 * Chave de mudança do Foundry para o alvo de um bônus.
 *
 * Passivos só cobrem perícias e Defesa: PV, PM, atributos, deslocamento e RD já
 * saem como totais prontos no ator, e bônus de ataque e dano permanentes já
 * estão nos números das armas. Um efeito ativável nasce desligado — nada dele
 * está nos totais —, então pode usar todas as chaves.
 */
function getChangeKey(
  target: StatModifierTarget,
  isToggle: boolean
): string | undefined {
  if (target.type === 'Defense') return 'system.attributes.defesa.bonus';
  if (target.type === 'Skill') {
    const skill = FOUNDRY_SKILLS[target.name];
    return skill ? `system.pericias.${skill}.bonus` : undefined;
  }
  if (!isToggle) return undefined;

  switch (target.type) {
    case 'Attribute':
      return `system.atributos.${ATTRIBUTE_KEYS[target.attribute]}.bonus`;
    case 'DamageReduction': {
      const type = toDamageTypeKey(target.damageType);
      return type ? `system.tracos.resistencias.${type}.bonus` : undefined;
    }
    case 'Displacement':
      // `*` replica o bônus em todos os modos de deslocamento (o sistema
      // expande a chave em `_prepareProxyChange`). É o que o conteúdo oficial
      // usa para "+Xm de deslocamento" — Atlético, Fuga Formidável, Primor
      // Atlético.
      return 'system.attributes.movement.*.bonus';
    case 'AllAttackBonus':
      return 'system.modificadores.ataque.geral';
    case 'WeaponAttack': {
      const scope = getWeaponScope(target);
      return scope ? `system.modificadores.ataque.${scope}` : undefined;
    }
    case 'WeaponDamage': {
      const scope = getWeaponScope(target);
      return scope ? `system.modificadores.dano.${scope}` : undefined;
    }
    default:
      return undefined;
  }
}

function toChanges(
  sheet: CharacterSheet,
  bonuses: Omit<SheetBonus, 'source'>[],
  isToggle: boolean,
  source?: SheetChangeSource
): FoundryEffectChange[] {
  return bonuses.flatMap((bonus) => {
    const key = getChangeKey(bonus.target, isToggle);
    if (!key) return [];
    // O valor é resolvido agora, com o nível e os atributos atuais da ficha.
    const value = calculateBonusValue(sheet, bonus.modifier, source);
    return value ? [buildChange(key, value, 'add')] : [];
  });
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

/** Efeitos ativáveis que valem para os poderes e magias desta ficha. */
export function findToggles(
  sheet: CharacterSheet,
  powerNames: string[]
): SheetToggles {
  const powers = new Map<string, ActivePowerDefinition>();
  powerNames.forEach((name) => {
    // Primeiro pela classe da ficha (poderes de classe exigem a classe certa);
    // depois só pelo nome, que cobre multiclasse e poderes gerais.
    const definition =
      getActivePowerForSheetEntry(sheet.classe, name) ??
      getActivePowerForSheetEntry(undefined, name);
    if (definition) powers.set(name, definition);
  });

  const spells = new Map<string, ActivePowerDefinition>();
  (sheet.spells ?? []).forEach((spell) => {
    const definition = getActiveEffectForSpell(spell.nome);
    if (definition) spells.set(spell.nome, definition);
  });

  return { powers, spells };
}

/**
 * Opções de uso com valor definido. A opção "customizada" (`scale`) pede um
 * número ao jogador na hora do uso — não há valor para pôr num efeito fixo.
 */
function getFixedOptions(
  sheet: CharacterSheet,
  definition: ActivePowerDefinition
): ActiveEffectUsageOption[] {
  return definition.getUsageOptions(sheet).filter((option) => !option.scale);
}

/** A opção está ligada na ficha neste momento? */
function isActiveNow(
  sheet: CharacterSheet,
  definition: ActivePowerDefinition,
  optionId: string
): boolean {
  return (sheet.activeEffects ?? []).some(
    (effect) =>
      effect.powerKey === definition.key && effect.optionId === optionId
  );
}

const SKILL_CHANGE_PREFIX = 'system.pericias.';

/**
 * Bônus que vale para TODAS as perícias (Inspiração, Comandar…) vira uma só
 * mudança com o curinga `system.pericias.*.bonus`, em vez de uma por perícia.
 * O sistema expande o `*` para todas as chaves de `system.pericias`
 * (`_prepareProxyChange`), o que de quebra alcança os ofícios personalizados.
 */
function collapseSkillChanges(
  changes: FoundryEffectChange[]
): FoundryEffectChange[] {
  const skills = changes.filter((change) =>
    change.key.startsWith(SKILL_CHANGE_PREFIX)
  );
  const distinct = new Set(skills.map(({ value, type }) => `${value}:${type}`));
  if (distinct.size !== 1) return changes;

  const covered = new Set(skills.map((change) => change.key));
  const coversEverySkill = Object.values(FOUNDRY_SKILLS).every((key) =>
    covered.has(`${SKILL_CHANGE_PREFIX}${key}.bonus`)
  );
  if (!coversEverySkill) return changes;

  const [first] = skills;
  return [
    { ...first, key: `${SKILL_CHANGE_PREFIX}*.bonus` },
    ...changes.filter((change) => !change.key.startsWith(SKILL_CHANGE_PREFIX)),
  ];
}

/**
 * A opção concede algo que não virou mudança de efeito (passo de dano, bônus
 * restrito a uma arma…)? Perícia sem chave própria não conta quando o curinga
 * entrou: ele cobre justamente os ofícios, que é o que não tem chave.
 */
function hasUnexportableBonus(
  option: ActiveEffectUsageOption,
  changes: FoundryEffectChange[]
): boolean {
  const collapsedSkills = changes.some(
    (change) => change.key === `${SKILL_CHANGE_PREFIX}*.bonus`
  );
  return option.bonuses.some((bonus) => {
    if (getChangeKey(bonus.target, true)) return false;
    return !(collapsedSkills && bonus.target.type === 'Skill');
  });
}

/**
 * Texto do efeito, que é o que o jogador lê antes de ligar: de onde o bônus
 * vem, o que custa em PM e o que o Foundry não aplica sozinho.
 */
function describeOption(
  definition: ActivePowerDefinition,
  option: ActiveEffectUsageOption,
  changes: FoundryEffectChange[],
  hasAlternatives: boolean
): string {
  const lines = [definition.sourceLabel];
  if (option.pmCost > 0) lines.push(`Custo: ${option.pmCost} PM.`);
  // Melhor o jogador saber que o número do nome não saiu inteiro do que
  // descobrir na mesa.
  if (hasUnexportableBonus(option, changes)) {
    lines.push(
      'Parte dos bônus desta opção não tem equivalente automático e ficou de ' +
        'fora — confira o texto do poder.'
    );
  }
  // PV/PM temporários não viram mudança de efeito: o Foundry reaplicaria o
  // valor a cada preparação de dados e o jogador nunca conseguiria gastá-los.
  if (option.grantsTempPV) {
    lines.push(
      `Concede ${option.grantsTempPV} PV temporários (aplicar à mão).`
    );
  }
  if (option.grantsTempPM) {
    lines.push(
      `Concede ${option.grantsTempPM} PM temporários (aplicar à mão).`
    );
  }
  if (hasAlternatives) {
    lines.push('As opções deste poder são alternativas: ligue só uma.');
  }
  return lines.join('\n');
}

/**
 * Um efeito de ligar/desligar por opção de uso do poder ou magia (ex.: os
 * níveis de Fúria). Sai ligado quando a opção está ativa na ficha.
 *
 * O efeito fica no **ator**, não no item do poder: a ficha de personagem do
 * sistema monta a aba de Efeitos só com `actor.effects`
 * (`prepareActiveEffectCategories`), e a 1.6 deixou de criar a cópia
 * transferida do efeito do item — no item, ele só apareceria abrindo o próprio
 * poder. No ator, desligado, ele cai em "Efeitos Inativos" com a caixa de
 * ligar; ligado, em "Efeitos Passivos".
 */
export function buildToggleEffects(
  sheet: CharacterSheet,
  definition: ActivePowerDefinition | undefined
): FoundryEffect[] {
  if (!definition) return [];

  const built = getFixedOptions(sheet, definition)
    .map((option) => ({
      option,
      changes: collapseSkillChanges(toChanges(sheet, option.bonuses, true)),
    }))
    .filter(({ changes }) => changes.length > 0);

  // Duas opções que geram as MESMAS mudanças virariam dois efeitos idênticos de
  // nomes diferentes — é o caso dos passos de dano de Armamento da Natureza,
  // em que só o bônus de ataque é exportável. Fica a primeira, e ela sai ligada
  // se qualquer uma das equivalentes estiver ativa na ficha.
  const groups = new Map<string, typeof built>();
  built.forEach((entry) => {
    const signature = JSON.stringify(
      entry.changes.map(({ key, value, type }) => [key, value, type])
    );
    groups.set(signature, [...(groups.get(signature) ?? []), entry]);
  });

  const options = [...groups.values()];
  return options.map((group) => {
    const [{ option, changes }] = group;
    const effect = buildPassiveEffect(
      `${definition.name}: ${option.label}`,
      changes,
      false
    );
    effect.disabled = !group.some((entry) =>
      isActiveNow(sheet, definition, entry.option.id)
    );
    effect.description = textToHtml(
      describeOption(definition, option, changes, options.length > 1)
    );
    return effect;
  });
}

/** Os ativáveis de todos os poderes e magias da ficha, como efeitos do ator. */
export function buildActorToggleEffects(
  sheet: CharacterSheet,
  toggles: SheetToggles
): FoundryEffect[] {
  return [...toggles.powers.values(), ...toggles.spells.values()].flatMap(
    (definition) => buildToggleEffects(sheet, definition)
  );
}

/** Chaves (`powerKey::optionId`) das opções exportadas como efeito ligado. */
function getExportedActiveKeys(
  sheet: CharacterSheet,
  toggles: SheetToggles
): Set<string> {
  const keys = new Set<string>();
  [...toggles.powers.values(), ...toggles.spells.values()].forEach(
    (definition) => {
      getFixedOptions(sheet, definition).forEach((option) => {
        if (
          isActiveNow(sheet, definition, option.id) &&
          toChanges(sheet, option.bonuses, true).length > 0
        ) {
          keys.add(definition.key);
        }
      });
    }
  );
  return keys;
}

export function buildAutomations(
  sheet: CharacterSheet,
  toggles: SheetToggles
): SheetAutomations {
  const groups = new Map<string, BonusGroup>();
  const skillOthers: Record<string, number> = {};
  const exportedActive = getExportedActiveKeys(sheet, toggles);
  let defense = 0;

  // `sheet.sheetBonuses` já chega filtrado por condição e é exatamente o que o
  // recálculo somou: espelhar a lista inteira mantém os totais iguais.
  (sheet.sheetBonuses ?? []).forEach((bonus) => {
    const { source, target } = bonus;
    if (target.type !== 'Defense' && target.type !== 'Skill') return;

    const [change] = toChanges(sheet, [bonus], false, source);
    if (!change) return;
    const value = Number(change.value);

    // Efeito ativo ligado na ficha e exportado como efeito ligado: o Foundry
    // aplica o bônus sozinho.
    if (source.type === 'activeEffect' && exportedActive.has(source.powerKey)) {
      if (target.type === 'Defense') defense += value;
      return;
    }

    const label = getSourceLabel(source);
    if (!label) {
      // A Defesa fecha sozinha pelo `outros` do ator; a perícia precisa levar
      // o valor no `outros` dela.
      if (target.type === 'Skill') {
        const skill = FOUNDRY_SKILLS[target.name];
        if (skill) skillOthers[skill] = (skillOthers[skill] ?? 0) + value;
      }
      return;
    }

    const groupKey = `${source.type}::${label}`;
    const group = groups.get(groupKey) ?? {
      label,
      powerName: source.type === 'power' ? source.name : undefined,
      changes: [],
    };
    group.changes.push(change);
    groups.set(groupKey, group);

    if (target.type === 'Defense') defense += value;
  });

  return { groups: Array.from(groups.values()), defense, skillOthers };
}
