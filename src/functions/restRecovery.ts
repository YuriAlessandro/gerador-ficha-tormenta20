import CharacterSheet from '../interfaces/CharacterSheet';
import { CompanionType } from '../interfaces/Companion';

/**
 * Regra "Recuperando PV e PM" — Tormenta20, p. 106 (Construção de Personagem →
 * Toques Finais).
 *
 * > Com uma noite de descanso (pelo menos oito horas de sono), você recupera PV
 * > e PM de acordo com seu nível e condições de descanso.
 * > Ruim: metade do nível. Normal: o nível. Confortável: o dobro. Luxuosa: o triplo.
 * > Você nunca pode recuperar mais pontos de vida ou mana do que perdeu.
 *
 * O arredondamento sai do próprio exemplo do livro: Helior, 7º nível, recupera
 * 3 PV em condição ruim — ou seja, `floor(7 / 2)`.
 *
 * Este módulo é PURO: sem React, sem acesso a `src/premium`. As complicações são
 * detectadas pelo `name` da cópia embutida em `sheet.complication`, então não há
 * import do catálogo premium.
 */

export type RestCondition = 'ruim' | 'normal' | 'confortavel' | 'luxuosa';

/** Alguns efeitos valem só para PV (Cuidados Prolongados) ou só para PM (Sopa de Peixe). */
export type RestScope = 'both' | 'pv' | 'pm';

export type RestEffect =
  /** Move a condição de descanso N categorias (Estoico +1, Hedonista −2). */
  | { type: 'shiftCategory'; steps: number; scope: RestScope }
  /** Golem/Osteon: "não é afetado por condições de descanso" — sempre normal. */
  | { type: 'ignoreConditions' }
  /** Goblin/Vida Rústica: "recuperação nunca é inferior ao seu nível". */
  | { type: 'floorLevel'; scope: RestScope }
  /** Cuidados Prolongados, pratos, Galrasia: "+X por nível". */
  | { type: 'perLevelBonus'; amount: number; scope: RestScope }
  /** Área de Tormenta: reduz à metade, sempre por último. */
  | { type: 'halve' };

export interface RestOption {
  id: string;
  label: string;
  description: string;
  effect: RestEffect;
  /** `auto` = detectada na ficha; `manual` = situacional, o jogador marca. */
  source: 'auto' | 'manual';
  /** Chip de procedência mostrado na UI ("Raça", "Origem", ...). */
  sourceLabel?: string;
  /** Só produz efeito quando o descanso é ao relento. */
  requiresOutdoors?: boolean;
  defaultChecked: boolean;
}

export interface RestRecoveryInput {
  level: number;
  condition: RestCondition;
  outdoors: boolean;
  options: RestOption[];
  currentPV: number;
  maxPV: number;
  currentPM: number;
  maxPM: number;
}

export interface RestRecoveryResult {
  /** PV efetivamente recuperados, já com o teto do máximo aplicado. */
  pv: number;
  /** PM efetivamente recuperados, já com o teto do máximo aplicado. */
  pm: number;
  /** Antes do teto — usado pela UI para avisar "máximo já atingido". */
  rawPV: number;
  rawPM: number;
  /** Categoria depois dos deslocamentos. `nenhuma` = caiu abaixo de ruim. */
  effectiveConditionPV: RestCondition | 'nenhuma';
  effectiveConditionPM: RestCondition | 'nenhuma';
  /** Memorial de cálculo, em português, para a prévia do modal. */
  steps: string[];
}

const CONDITION_ORDER: RestCondition[] = [
  'ruim',
  'normal',
  'confortavel',
  'luxuosa',
];

export const REST_CONDITIONS: {
  id: RestCondition;
  label: string;
  hint: string;
  description: string;
}[] = [
  {
    id: 'ruim',
    label: 'Ruim',
    hint: '½ nível',
    description:
      'Dormir ao relento, sem um saco de dormir e um acampamento, constitui condição ruim.',
  },
  {
    id: 'normal',
    label: 'Normal',
    hint: 'nível',
    description: 'Dormir em uma estalagem comum constitui condição normal.',
  },
  {
    id: 'confortavel',
    label: 'Confortável',
    hint: '2× nível',
    description:
      'Um quarto pequeno mas privativo, com cama de colchão de palha e um baú.',
  },
  {
    id: 'luxuosa',
    label: 'Luxuosa',
    hint: '3× nível',
    description:
      'Um quarto grande, colchão de algodão ou penas, água quente para banho e outros luxos.',
  },
];

/**
 * Efeitos situacionais que a ficha não tem como saber — dependem do que
 * aconteceu na mesa (um aliado passou em Cura, o grupo comeu bem, onde dormiram).
 */
export const MANUAL_REST_OPTIONS: RestOption[] = [
  {
    id: 'cuidados-prolongados',
    label: 'Cuidados prolongados',
    description:
      'Alguém treinado em Cura passou num teste CD 15 cuidando de você: +1 PV por nível.',
    effect: { type: 'perLevelBonus', amount: 1, scope: 'pv' },
    source: 'manual',
    defaultChecked: false,
  },
  {
    id: 'prato-do-aventureiro',
    label: 'Prato do aventureiro',
    description: 'Refeição reforçada antes de dormir: +1 PV por nível.',
    effect: { type: 'perLevelBonus', amount: 1, scope: 'pv' },
    source: 'manual',
    defaultChecked: false,
  },
  {
    id: 'sopa-de-peixe',
    label: 'Sopa de peixe',
    description: 'Garante um descanso relaxante: +1 PM por nível.',
    effect: { type: 'perLevelBonus', amount: 1, scope: 'pm' },
    source: 'manual',
    defaultChecked: false,
  },
  {
    id: 'historia-de-acampamento',
    label: 'História de acampamento',
    description:
      'Um bardo entreteve o grupo por uma hora antes de dormir: +1 PM por nível.',
    effect: { type: 'perLevelBonus', amount: 1, scope: 'pm' },
    source: 'manual',
    defaultChecked: false,
  },
  {
    id: 'galrasia',
    label: 'Descansando em Galrasia',
    description:
      'A vitalidade sobrenatural do continente perdido: +1 PV e +1 PM por nível.',
    effect: { type: 'perLevelBonus', amount: 1, scope: 'both' },
    source: 'manual',
    defaultChecked: false,
  },
  {
    id: 'area-de-tormenta',
    label: 'Descansando em área de Tormenta',
    description:
      'A recuperação é reduzida à metade, depois de todos os outros efeitos.',
    effect: { type: 'halve' },
    source: 'manual',
    defaultChecked: false,
  },
];

/** Habilidades raciais que anulam condições de descanso (golens, osteon, mashin). */
const IGNORE_CONDITION_RACE_ABILITIES = [
  'Criatura Artificial',
  'Preço da Não Vida',
];

/**
 * Complicações de Heróis de Arton que pioram o descanso. `conditional` marca as
 * que dependem do ambiente (o jogador decide se está nos ermos / na cidade).
 */
const COMPLICATION_REST_PENALTIES: {
  name: string;
  steps: number;
  conditional: boolean;
  description: string;
}[] = [
  {
    name: 'Criado na Cidade',
    steps: -1,
    conditional: true,
    description: 'Nos ermos, sua recuperação é uma categoria pior.',
  },
  {
    name: 'Matugo',
    steps: -1,
    conditional: true,
    description: 'Em ambientes urbanos, sua recuperação é uma categoria pior.',
  },
  {
    name: 'Paranoico',
    steps: -1,
    conditional: false,
    description: 'Sua condição de descanso é sempre uma categoria pior.',
  },
  {
    name: 'Hedonista',
    steps: -2,
    conditional: false,
    description:
      'Você só aceita o luxo: luxuosa recupera o nível, confortável metade, ' +
      'e normal ou ruim recuperam apenas 1 PV e 1 PM.',
  },
];

function hasNamed(list: { name: string }[] | undefined, name: string): boolean {
  return (list ?? []).some((entry) => entry.name === name);
}

/**
 * Lê raça, origem, classe, poderes e complicação da ficha e devolve os
 * modificadores de descanso que se aplicam ao personagem. Casa por nome, mesmo
 * padrão do resto do motor de fichas (ver `recalculateSheet`).
 */
export function detectRestOptions(sheet: CharacterSheet): RestOption[] {
  const options: RestOption[] = [];

  IGNORE_CONDITION_RACE_ABILITIES.forEach((abilityName) => {
    if (hasNamed(sheet.raca?.abilities, abilityName)) {
      options.push({
        id: `raca-${abilityName}`,
        label: abilityName,
        description:
          'Você não é afetado por condições boas ou ruins de descanso: ' +
          'recupera sempre como em condições normais.',
        effect: { type: 'ignoreConditions' },
        source: 'auto',
        sourceLabel: 'Raça',
        defaultChecked: true,
      });
    }
  });

  if (hasNamed(sheet.raca?.abilities, 'Rato das Ruas')) {
    options.push({
      id: 'rato-das-ruas',
      label: 'Rato das Ruas',
      description: 'Sua recuperação nunca é inferior ao seu nível.',
      effect: { type: 'floorLevel', scope: 'both' },
      source: 'auto',
      sourceLabel: 'Raça',
      defaultChecked: true,
    });
  }

  if (hasNamed(sheet.origin?.powers, 'Estoico')) {
    options.push({
      id: 'estoico',
      label: 'Estoico',
      description:
        'Sua condição de descanso é uma categoria acima do padrão pela situação.',
      effect: { type: 'shiftCategory', steps: 1, scope: 'both' },
      source: 'auto',
      sourceLabel: 'Origem',
      defaultChecked: true,
    });
  }

  if (hasNamed(sheet.origin?.powers, 'Vida Rústica')) {
    options.push({
      id: 'vida-rustica',
      label: 'Vida Rústica',
      description:
        'Mesmo dormindo ao relento, sua recuperação nunca é inferior ao seu nível.',
      effect: { type: 'floorLevel', scope: 'both' },
      source: 'auto',
      sourceLabel: 'Origem',
      requiresOutdoors: true,
      defaultChecked: false,
    });
  }

  ['Pajem', 'Jovem Pajem'].forEach((abilityName) => {
    if (hasNamed(sheet.classe?.abilities, abilityName)) {
      options.push({
        id: `classe-${abilityName}`,
        label: abilityName,
        description:
          'Sua condição de descanso é uma categoria acima do padrão pela situação.',
        effect: { type: 'shiftCategory', steps: 1, scope: 'both' },
        source: 'auto',
        sourceLabel: 'Classe',
        defaultChecked: true,
      });
    }
  });

  const hasDescansoNatural =
    hasNamed(sheet.generalPowers, 'Descanso Natural') ||
    hasNamed(sheet.devoto?.poderes, 'Descanso Natural');
  if (hasDescansoNatural) {
    options.push({
      id: 'descanso-natural',
      label: 'Descanso Natural',
      description:
        'Para você, dormir ao relento conta como condição de descanso confortável.',
      effect: { type: 'shiftCategory', steps: 2, scope: 'both' },
      source: 'auto',
      sourceLabel: 'Poder concedido',
      requiresOutdoors: true,
      defaultChecked: false,
    });
  }

  if (hasNamed(sheet.devoto?.poderes, 'Herança de Vitalia')) {
    options.push({
      id: 'heranca-de-vitalia',
      label: 'Herança de Vitalia',
      description:
        'Sua recuperação de pontos de vida aumenta em uma categoria.',
      effect: { type: 'shiftCategory', steps: 1, scope: 'pv' },
      source: 'auto',
      sourceLabel: 'Poder concedido',
      defaultChecked: true,
    });
  }

  const complicationName = sheet.complication?.name;
  if (complicationName) {
    const penalty = COMPLICATION_REST_PENALTIES.find(
      (entry) => entry.name === complicationName
    );
    if (penalty) {
      options.push({
        id: `complicacao-${penalty.name}`,
        label: penalty.name,
        description: penalty.description,
        effect: {
          type: 'shiftCategory',
          steps: penalty.steps,
          scope: 'both',
        },
        source: 'auto',
        sourceLabel: 'Complicação',
        defaultChecked: !penalty.conditional,
      });
    }
  }

  return options;
}

/** Aplica o multiplicador da categoria. Ruim arredonda para baixo (Helior, p. 106). */
function baseRecovery(condition: RestCondition, level: number): number {
  switch (condition) {
    case 'ruim':
      return Math.floor(level / 2);
    case 'confortavel':
      return level * 2;
    case 'luxuosa':
      return level * 3;
    case 'normal':
    default:
      return level;
  }
}

const CONDITION_LABEL: Record<RestCondition, string> = {
  ruim: 'ruim',
  normal: 'normal',
  confortavel: 'confortável',
  luxuosa: 'luxuosa',
};

function appliesTo(scope: RestScope, track: 'pv' | 'pm'): boolean {
  return scope === 'both' || scope === track;
}

interface TrackOutcome {
  value: number;
  condition: RestCondition | 'nenhuma';
  steps: string[];
}

function computeTrack(
  track: 'pv' | 'pm',
  level: number,
  condition: RestCondition,
  effects: RestEffect[]
): TrackOutcome {
  const steps: string[] = [];
  const label = track.toUpperCase();

  const ignoresConditions = effects.some((e) => e.type === 'ignoreConditions');

  let effective: RestCondition | 'nenhuma';
  if (ignoresConditions) {
    effective = 'normal';
    steps.push(`${label}: não é afetado por condições de descanso → normal`);
  } else {
    const shift = effects.reduce(
      (sum, e) =>
        e.type === 'shiftCategory' && appliesTo(e.scope, track)
          ? sum + e.steps
          : sum,
      0
    );
    const baseIndex = CONDITION_ORDER.indexOf(condition);
    const shifted = baseIndex + shift;
    if (shifted < 0) {
      effective = 'nenhuma';
    } else {
      effective =
        CONDITION_ORDER[Math.min(shifted, CONDITION_ORDER.length - 1)];
    }
    if (shift !== 0) {
      const arrow =
        effective === 'nenhuma'
          ? 'abaixo de ruim'
          : CONDITION_LABEL[effective as RestCondition];
      steps.push(
        `${label}: ${CONDITION_LABEL[condition]} ${
          shift > 0 ? `+${shift}` : shift
        } categoria(s) → ${arrow}`
      );
    }
  }

  let value: number;
  if (effective === 'nenhuma') {
    // Piso canônico de Heróis de Arton: abaixo de ruim, recupera 1 fixo.
    value = 1;
    steps.push(`${label}: piso de 1 ${label} independentemente do nível`);
  } else {
    value = baseRecovery(effective, level);
    steps.push(
      `${label}: condição ${CONDITION_LABEL[effective]} → ${value} ${label}`
    );

    const hasFloor = effects.some(
      (e) => e.type === 'floorLevel' && appliesTo(e.scope, track)
    );
    if (hasFloor && value < level) {
      value = level;
      steps.push(`${label}: piso do nível → ${value} ${label}`);
    }
  }

  const perLevel = effects.reduce(
    (sum, e) =>
      e.type === 'perLevelBonus' && appliesTo(e.scope, track)
        ? sum + e.amount
        : sum,
    0
  );
  if (perLevel !== 0) {
    value += perLevel * level;
    steps.push(`${label}: +${perLevel} por nível → ${value} ${label}`);
  }

  // Área de Tormenta divide "após aplicar outros efeitos que afetem sua recuperação".
  const halvings = effects.filter((e) => e.type === 'halve').length;
  for (let i = 0; i < halvings; i += 1) {
    value = Math.floor(value / 2);
  }
  if (halvings > 0) {
    steps.push(`${label}: reduzido à metade → ${value} ${label}`);
  }

  return { value: Math.max(0, value), condition: effective, steps };
}

/**
 * Calcula a recuperação de uma noite de descanso. As trilhas de PV e PM são
 * independentes porque vários efeitos valem só para uma delas.
 */
export function calculateRestRecovery(
  input: RestRecoveryInput
): RestRecoveryResult {
  const {
    level,
    condition,
    outdoors,
    options,
    currentPV,
    maxPV,
    currentPM,
    maxPM,
  } = input;

  const effects = options
    .filter((option) => !option.requiresOutdoors || outdoors)
    .map((option) => option.effect);

  const pvTrack = computeTrack('pv', level, condition, effects);
  const pmTrack = computeTrack('pm', level, condition, effects);

  return {
    rawPV: pvTrack.value,
    rawPM: pmTrack.value,
    pv: Math.max(0, Math.min(pvTrack.value, maxPV - currentPV)),
    pm: Math.max(0, Math.min(pmTrack.value, maxPM - currentPM)),
    effectiveConditionPV: pvTrack.condition,
    effectiveConditionPM: pmTrack.condition,
    steps: [...pvTrack.steps, ...pmTrack.steps],
  };
}

/**
 * O Melhor Amigo do Treinador (Heróis de Arton, p. 20) usa o nível do treinador,
 * não possui PM, e os tipos construto e morto-vivo "não são afetados por
 * condições de descanso".
 */
export function isCompanionImmuneToRestConditions(
  companionType: CompanionType
): boolean {
  return companionType === 'Construto' || companionType === 'Morto-Vivo';
}
