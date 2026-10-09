import { Atributo } from '../data/systems/tormenta20/atributos';
import { normalizeName } from './normalize';

/**
 * Chaves que o sistema Tormenta20 do Foundry aceita (`module/config/T20.js`,
 * versão em `version.ts`). O sistema valida ou procura por CHAVE: um rótulo em
 * português ("Padrão", "Curto") aparece em branco na ficha.
 */
export const TIME_PERIODS = [
  'inst',
  'scene',
  'turn',
  'round',
  'sust',
  'minute',
  'hour',
  'day',
  'month',
  'year',
  'perm',
  'special',
] as const;

export const ACTIVATION_TYPES = [
  '',
  'passive',
  'action',
  'move',
  'full',
  'reaction',
  'free',
  'minute',
  'hour',
  'day',
  'special',
] as const;

export const DISTANCE_UNITS = [
  '',
  'none',
  'self',
  'touch',
  'short',
  'medium',
  'long',
  'spec',
  'any',
  'm',
  'km',
] as const;

export const SPELL_SCHOOLS = [
  'abj',
  'adv',
  'con',
  'enc',
  'evo',
  'ilu',
  'nec',
  'tra',
] as const;

export const SPELL_TYPES = ['arc', 'div', 'uni', 'eng', 'sim'] as const;

export const POWER_TYPES = [
  'ability',
  'classe',
  'concedido',
  'geral',
  'origem',
  'racial',
  'distincao',
  'complicacao',
] as const;

export const DAMAGE_TYPES = [
  'dano',
  'perda',
  'acido',
  'corte',
  'eletricidade',
  'essencia',
  'fogo',
  'frio',
  'impacto',
  'luz',
  'psiquico',
  'perfuracao',
  'trevas',
] as const;

export const HEALING_TYPES = [
  'curapv',
  'curatpv',
  'curapm',
  'curatpm',
] as const;

export const WEAPON_PROFICIENCIES = [
  'simples',
  'marcial',
  'exotica',
  'fogo',
  'natural',
  'improvisada',
] as const;

export const WEAPON_PURPOSES = [
  'corpo-a-corpo',
  'corpo-a-corpo-arremesso',
  'disparo',
  'arremesso',
] as const;

export const WEAPON_GRIPS = ['leve', 'uma', 'duas'] as const;

export const EQUIPMENT_TYPES = [
  'leve',
  'pesada',
  'escudo',
  'bonus',
  'natural',
  'acessorio',
  'traje',
  'ferramenta',
  'esoterico',
] as const;

export const SENSES = ['penumbra', 'escuro', 'cegas', 'faro'] as const;

export type FoundryAttribute = 'for' | 'des' | 'con' | 'int' | 'sab' | 'car';

export const ATTRIBUTE_KEYS: Record<Atributo, FoundryAttribute> = {
  [Atributo.FORCA]: 'for',
  [Atributo.DESTREZA]: 'des',
  [Atributo.CONSTITUICAO]: 'con',
  [Atributo.INTELIGENCIA]: 'int',
  [Atributo.SABEDORIA]: 'sab',
  [Atributo.CARISMA]: 'car',
};

export const SIZE_KEYS: Record<string, string> = {
  minusculo: 'min',
  pequeno: 'peq',
  medio: 'med',
  grande: 'gra',
  enorme: 'eno',
  colossal: 'col',
};

export function toSizeKey(name: string | undefined): string {
  return SIZE_KEYS[normalizeName(name ?? '')] ?? 'med';
}

const SCHOOL_KEYS: Record<string, string> = {
  abjur: 'abj',
  adiv: 'adv',
  conv: 'con',
  encan: 'enc',
  evoc: 'evo',
  ilusao: 'ilu',
  necro: 'nec',
  trans: 'tra',
};

export function toSchoolKey(school: string | undefined): string {
  return SCHOOL_KEYS[normalizeName(school ?? '')] ?? SPELL_SCHOOLS[0];
}

/** Tira o que vier entre parênteses: 'Curto (9m)' → 'curto'. */
function normalizeLabel(label: string | undefined): string {
  return normalizeName((label ?? '').replace(/\(.*?\)/g, ''));
}

const ACTIVATION_KEYS: Record<string, string> = {
  padrao: 'action',
  'acao padrao': 'action',
  movimento: 'move',
  'acao de movimento': 'move',
  completa: 'full',
  'acao completa': 'full',
  reacao: 'reaction',
  livre: 'free',
  'acao livre': 'free',
};

export type FoundryActivation = {
  execucao: string;
  /** Texto original, mostrado pelo sistema quando `execucao` é `special`. */
  special: string;
};

export function toActivation(execucao: string | undefined): FoundryActivation {
  const key = ACTIVATION_KEYS[normalizeLabel(execucao)];
  if (key) return { execucao: key, special: '' };
  return { execucao: 'special', special: execucao?.trim() ?? '' };
}

const RANGE_KEYS: Record<string, string> = {
  pessoal: 'self',
  toque: 'touch',
  curto: 'short',
  medio: 'medium',
  longo: 'long',
  ilimitado: 'any',
};

/** `undefined` quando o alcance é um texto que o sistema não tem chave para. */
export function toRangeKey(alcance: string | undefined): string | undefined {
  return RANGE_KEYS[normalizeLabel(alcance)];
}

export type FoundryDuration = {
  units: string;
  value: number;
  /** Texto original, mostrado pelo sistema quando `units` é `special`. */
  special: string;
};

const DURATION_KEYS: Record<string, string> = {
  instantanea: 'inst',
  cena: 'scene',
  sustentada: 'sust',
  permanente: 'perm',
};

const DURATION_UNIT_KEYS: Record<string, string> = {
  rodada: 'round',
  turno: 'turn',
  minuto: 'minute',
  hora: 'hour',
  dia: 'day',
  mes: 'month',
  ano: 'year',
};

export function toDuration(duracao: string | undefined): FoundryDuration {
  const label = normalizeLabel(duracao);
  const key = DURATION_KEYS[label];
  if (key) return { units: key, value: 0, special: '' };

  const counted = label.match(
    /^(\d+) (rodada|turno|minuto|hora|dia|mes|ano)s?$/
  );
  if (counted) {
    return {
      units: DURATION_UNIT_KEYS[counted[2]],
      value: Number(counted[1]),
      special: '',
    };
  }
  // `duracao.units` é obrigatório e não pode ficar em branco no sistema.
  if (!label) return { units: 'inst', value: 0, special: '' };
  return { units: 'special', value: 0, special: duracao?.trim() ?? '' };
}

const DAMAGE_TYPE_KEYS: Record<string, string> = {
  geral: 'dano',
  acido: 'acido',
  corte: 'corte',
  eletricidade: 'eletricidade',
  essencia: 'essencia',
  fogo: 'fogo',
  frio: 'frio',
  impacto: 'impacto',
  luz: 'luz',
  psiquico: 'psiquico',
  perfuracao: 'perfuracao',
  trevas: 'trevas',
};

/** `''` (sem tipo) quando o texto não é um tipo de dano do sistema. */
export function toDamageTypeKey(type: string | undefined): string {
  return DAMAGE_TYPE_KEYS[normalizeName(type ?? '')] ?? '';
}
