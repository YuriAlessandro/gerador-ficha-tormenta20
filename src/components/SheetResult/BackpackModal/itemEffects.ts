import Equipment from '../../../interfaces/Equipment';
import { SpellModifier } from '../../../interfaces/SpellModifiers';
import { describeItemBonuses } from '../../../functions/equipmentDisplay';
import { ITEM_DETAILS_MAP } from './itemDetailsMap';

export interface ItemPresentation {
  /** Descrição narrativa / aparência (lore), quando distinta do efeito. */
  lore?: string;
  /** Regras, efeitos mecânicos, ações ou bônus em prosa. */
  effectText?: string;
  /** Resumos curtos de propriedades/efeitos estruturados (chips/tags). */
  effectBadges: string[];
  /** Texto completo combinado para busca. */
  searchableText: string;
}

export function normalizeItemKey(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// ─── Separação entre Lore (aparência/contexto) e Efeito (regra mecânica) ───────

const MECH_SENTENCE_START =
  /^(?:[+\-–]\s*\d|ação\b|sem el[ea]|permite\b|fornece\b|concede\b|causa\b|você\b|ao\s|quando\s|se\s|contra\s|cada\s|em\s+testes|na\s+cd|para\s+usar|ao\s+ser|aplicad[oa]|bebid[oa]|lançad[oa]|arremesso\b|prender:|vestid[oa]s?\b|empunhar\b|dobra\b|aumenta\b|diminui\b|reduz\b|recupera\b|ignora\b|suas\s+magias|o\s+limite|a\s+cd|resistência\b|não\s+conta|não\s+é|enorme\b|grande\b|mesmas\b|com\s+um[a]?\s+teste|se\s+estiver|usando\b|recarregar\b|o\s+veneno|a\s+vítima|perde\b|pv\s+perdidos)/i;

const MECH_SENTENCE_ANY =
  /(?:[+\-–]\d|\b\d+d\d+|\bCD\s+\d+|\bPM\b|\bPV\b|\bRD\b|\bTO\b|\bT\$|\bDefesa\b|\bdano\b|\bteste[s]?\b|\bação\s+(?:padrão|movimento|completa|livre)\b|\brecebe\b|\bfornece\b|\bconcede\b|\baumenta\b|\bdiminui\b|\breduz\b|\brecuper(?:a|ação)\b|\bcausa\b|\bpermite\b|\bmargem\s+de\s+ameaça\b|\bsurpreendente\b|\broda(?:da|das)\b|\bcena\b|\bespaço[s]?\b|\bdeslocamento\b|\bpenalidade\b|\babalado|\bapavorado|\besmorecido|\bfrustrado|\blent[oa]|\benredad|\bdesprevenid|\bem\s+chamas|\bsangrando|\barmadura\s+pesada|\bproficiên|\binstrumento\s+musical|\besotérico|\bparceiro|\bmontaria|\baté\s+o\s+fim\s+do\s+dia\b|\bnoite\s+de\s+sono\b|\bpasso\s+de\s+dano\b|\bescolher\s+10\b|\bbônus\s+temporário\b|\bbenefício\s+temporário\b)/i;

/**
 * Divide uma descrição em prosa em `lore` (frases puramente descritivas ou de
 * ambientação) e `effectText` (regras e efeitos mecânicos).
 */
export function splitLoreAndEffect(rawText?: string): {
  lore?: string;
  effectText?: string;
} {
  const clean = rawText?.trim();
  if (!clean) return {};

  // Quebra em fronteiras de frase evitando quebrar decimais/abreviações.
  const sentences = clean.split(
    /(?<=[.!?;])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ*+\-–])/
  );

  const firstMechIdx = sentences.findIndex(
    (s) => MECH_SENTENCE_START.test(s) || MECH_SENTENCE_ANY.test(s)
  );

  if (firstMechIdx === -1) {
    return { lore: clean };
  }
  if (firstMechIdx === 0) {
    return { effectText: clean };
  }
  return {
    lore: sentences.slice(0, firstMechIdx).join(' '),
    effectText: sentences.slice(firstMechIdx).join(' '),
  };
}

// ─── Formatação de efeitos estruturados do dado TS ─────────────────────────────

const WEAPON_TAG_LABELS: Record<string, string> = {
  leve: 'Leve',
  alongada: 'Alongada',
  hibrida: 'Híbrida',
  desbalanceada: 'Desbalanceada',
  adaptavel: 'Adaptável',
  versatil: 'Versátil',
  ocultavel: 'Ocultável',
  desarmado: 'Ataque desarmado',
  dupla: 'Arma dupla',
  surpreendente: 'Surpreendente',
  agil: 'Ágil',
};

const EFFECT_KIND_LABELS: Record<string, string> = {
  attack: 'ataque',
  defense: 'Defesa',
  resistance: 'resistências',
};

function describeSpellFilter(mod: SpellModifier): string {
  const f = mod.filter;
  if (!f) return '';
  const parts: string[] = [];
  if (f.tradition === 'arcane') parts.push('Arcana');
  if (f.tradition === 'divine') parts.push('Divina');
  if (f.schools?.length) parts.push(f.schools.join('/'));
  if (f.damageTypes && Array.isArray(f.damageTypes))
    parts.push(f.damageTypes.join('/'));
  if (f.ranges?.length) parts.push(f.ranges.join('/'));
  if (f.chosen) parts.push('escolhida');
  return parts.length > 0 ? ` (${parts.join(', ')})` : '';
}

function describeSpellModifier(mod: SpellModifier): string | null {
  const scope = describeSpellFilter(mod);
  const { effect } = mod;
  switch (effect.type) {
    case 'SpellDC':
      return `+${effect.value} CD magia${scope}`;
    case 'PmLimit':
      return effect.value
        ? `+${effect.value} limite PM${scope}`
        : `Limite PM${scope}`;
    case 'PmReduction':
      return `–${effect.value} PM${scope}`;
    case 'AprimoramentoPm':
      return `+${effect.value} PM p/ aprimorar${scope}`;
    case 'ExtraRoll':
      return `+${effect.dice} ${effect.damageType || effect.label}${scope}`;
    case 'RollBonus':
      if (effect.extraDice) {
        return `+${effect.extraDice} dado ${
          effect.rolls === 'healing' ? 'cura' : 'dano'
        }${scope}`;
      }
      if (effect.perDie) {
        return `+${effect.perDie}/dado ${
          effect.rolls === 'healing' ? 'cura' : 'dano'
        }${scope}`;
      }
      return null;
    case 'EffectBonusIncrease':
      return `+${effect.value} bônus em ${
        EFFECT_KIND_LABELS[effect.kind] ?? effect.kind
      }${scope}`;
    case 'EffectThreatMargin':
      return `+${effect.value} margem de ameaça em magia de ${
        EFFECT_KIND_LABELS[effect.kind] ?? effect.kind
      }`;
    default:
      return null;
  }
}

/**
 * Extrai chips curtos de propriedades e efeitos mecânicos declarados
 * diretamente na estrutura de `Equipment` (bônus, tags, modificadores).
 */
export function extractItemEffectBadges(item: Equipment): string[] {
  const badges: string[] = [];
  const seen = new Set<string>();
  const push = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    badges.push(trimmed);
  };

  if (item.twoHanded) push('2 Mãos');
  if (item.oneHandedWhenMounted) push('1 Mão montado');
  if (item.arremesso) push('Arremesso');
  if (item.canBeWorn) push('Pode ser vestida');
  if (item.musicalInstrument) push('Instrumento musical');
  if (item.canBeUsedAsWeapon) push('Usável como arma');

  (item.weaponTags ?? []).forEach((tag) => {
    const label = WEAPON_TAG_LABELS[tag.toLowerCase()];
    if (label) push(label);
  });

  describeItemBonuses(item).forEach(push);

  (item.spellModifiers ?? []).forEach((mod) => {
    const label = describeSpellModifier(mod);
    if (label) push(label);
  });

  if (item.specialActions && item.specialActions.length > 1) {
    push(`Modos: ${item.specialActions.map((a) => a.label).join(' / ')}`);
  }

  return badges;
}

/**
 * Resolve toda a apresentação textual/mecânica de um item para exibição
 * legível no catálogo: lore, efeito separado e badges mecânicos.
 */
export function resolveItemPresentation(item: Equipment): ItemPresentation {
  const key = normalizeItemKey(item.nome);
  const rawText = item.descricao?.trim() || ITEM_DETAILS_MAP[key] || undefined;

  const { lore, effectText: splitEffect } = splitLoreAndEffect(rawText);

  // Fallback para itens que só têm `rolls` ou `weaponStats` sem `descricao`
  let effectText = splitEffect;
  if (!effectText && item.rolls && item.rolls.length > 0) {
    effectText = item.rolls
      .map((r) => {
        const desc = r.description ? `: ${r.description}` : '';
        return `${r.label} (${r.dice})${desc}`;
      })
      .join(' ');
  }

  const effectBadges = extractItemEffectBadges(item);
  const searchableText = [rawText, effectText, ...effectBadges]
    .filter(Boolean)
    .join(' ');

  return {
    lore,
    effectText,
    effectBadges,
    searchableText,
  };
}
