import {
  AutoFixHigh as MagiaIcon,
  Church as DivinoIcon,
  Diversity3 as RacaIcon,
  EditNote as CustomIcon,
  Gavel as CombateIcon,
  Handshake as ConcedidoIcon,
  HistoryEdu as OrigemIcon,
  MilitaryTech as ClassPowerIcon,
  School as ClassAbilityIcon,
  Star as DestinoIcon,
  SvgIconComponent,
  WarningAmber as ComplicacaoIcon,
  Whatshot as TormentaIcon,
} from '@mui/icons-material';

import { ClassAbility, ClassPower } from '../../interfaces/Class';
import {
  GeneralPower,
  GeneralPowerType,
  OriginPower,
} from '../../interfaces/Poderes';
import { RaceAbility } from '../../interfaces/Race';
import { CustomPower } from '../../interfaces/CustomPower';

/** Qualquer poder que possa aparecer na aba Poderes da ficha. */
export type SheetPower =
  | ClassPower
  | ClassAbility
  | RaceAbility
  | OriginPower
  | GeneralPower
  | CustomPower;

export type PowerOriginKind =
  | 'classPower'
  | 'classAbility'
  | 'raceAbility'
  | 'originPower'
  | 'deityPower'
  | 'generalCombate'
  | 'generalDestino'
  | 'generalMagia'
  | 'generalConcedidos'
  | 'generalTormenta'
  | 'generalRaca'
  | 'customGranted'
  | 'custom'
  | 'complication';

export interface PowerOriginDescriptor {
  kind: PowerOriginKind;
  icon: SvgIconComponent;
  /**
   * Token da paleta MUI preferido (ex: 'error.main') para a cor seguir o modo
   * claro/escuro. Hex só onde nenhum token mapeia bem — mesma regra do
   * `itemTypeStyles`.
   */
  color: string;
  /** Posição do grupo na lista. Poderes de classe primeiro, custom no fim. */
  order: number;
  /**
   * `source` é o nome da classe (multiclasse) ou da raça, quando o kind é
   * subdividido. Ignorado pelos demais.
   */
  label: (source?: string) => string;
  /** Gera um grupo por `source` em vez de um grupo único. */
  subdivided?: boolean;
}

export const POWER_ORIGINS: Record<PowerOriginKind, PowerOriginDescriptor> = {
  classPower: {
    kind: 'classPower',
    icon: ClassPowerIcon,
    color: 'primary.main',
    order: 0,
    label: (source) => (source ? `Poder de ${source}` : 'Poder de Classe'),
    subdivided: true,
  },
  classAbility: {
    kind: 'classAbility',
    icon: ClassAbilityIcon,
    color: 'primary.light',
    order: 1,
    label: (source) =>
      source ? `Habilidade de ${source}` : 'Habilidade de Classe',
    subdivided: true,
  },
  raceAbility: {
    kind: 'raceAbility',
    icon: RacaIcon,
    color: 'success.main',
    order: 2,
    label: (source) =>
      source ? `Habilidade de ${source}` : 'Habilidade de Raça',
    subdivided: true,
  },
  originPower: {
    kind: 'originPower',
    icon: OrigemIcon,
    color: '#795548',
    order: 3,
    label: () => 'Poder de Origem',
  },
  deityPower: {
    kind: 'deityPower',
    icon: DivinoIcon,
    color: 'info.main',
    order: 4,
    label: () => 'Poder Divino',
  },
  generalCombate: {
    kind: 'generalCombate',
    icon: CombateIcon,
    color: 'error.main',
    order: 5,
    label: () => 'Poder de Combate',
  },
  generalDestino: {
    kind: 'generalDestino',
    icon: DestinoIcon,
    color: 'warning.main',
    order: 6,
    label: () => 'Poder de Destino',
  },
  generalMagia: {
    kind: 'generalMagia',
    icon: MagiaIcon,
    color: '#673ab7',
    order: 7,
    label: () => 'Poder de Magia',
  },
  generalConcedidos: {
    kind: 'generalConcedidos',
    icon: ConcedidoIcon,
    color: 'info.light',
    order: 8,
    label: () => 'Poder Concedido',
  },
  generalTormenta: {
    kind: 'generalTormenta',
    icon: TormentaIcon,
    color: '#9c27b0',
    order: 9,
    label: () => 'Poder da Tormenta',
  },
  generalRaca: {
    kind: 'generalRaca',
    icon: RacaIcon,
    color: 'success.dark',
    order: 10,
    label: () => 'Poder de Raça',
  },
  customGranted: {
    kind: 'customGranted',
    icon: ConcedidoIcon,
    color: '#00acc1',
    order: 11,
    label: () => 'Poder Concedido Personalizado',
  },
  custom: {
    kind: 'custom',
    icon: CustomIcon,
    color: 'text.secondary',
    order: 12,
    label: () => 'Poder Personalizado',
  },
  complication: {
    kind: 'complication',
    icon: ComplicacaoIcon,
    color: 'warning.main',
    order: 13,
    label: () => 'Complicação',
  },
};

export const POWER_ORIGIN_ORDER: PowerOriginKind[] = (
  Object.keys(POWER_ORIGINS) as PowerOriginKind[]
).sort((a, b) => POWER_ORIGINS[a].order - POWER_ORIGINS[b].order);

/** O tipo do poder geral decide o grupo; `OriginPower.type` NÃO serve aqui. */
const GENERAL_TYPE_TO_KIND: Record<GeneralPowerType, PowerOriginKind> = {
  [GeneralPowerType.COMBATE]: 'generalCombate',
  [GeneralPowerType.DESTINO]: 'generalDestino',
  [GeneralPowerType.MAGIA]: 'generalMagia',
  [GeneralPowerType.CONCEDIDOS]: 'generalConcedidos',
  [GeneralPowerType.TORMENTA]: 'generalTormenta',
  [GeneralPowerType.RACA]: 'generalRaca',
};

export interface PowerOrigin {
  kind: PowerOriginKind;
  /** Nome da classe/raça que concedeu, quando o kind é subdividido. */
  source?: string;
}

export const originGroupKey = (origin: PowerOrigin): string =>
  `${origin.kind}::${origin.source ?? ''}`;

export const originLabel = (origin: PowerOrigin): string =>
  POWER_ORIGINS[origin.kind].label(origin.source);

export interface PowerSourceArrays {
  classPowers: ClassPower[];
  raceAbilities: RaceAbility[];
  classAbilities: ClassAbility[];
  originPowers: OriginPower[];
  deityPowers: GeneralPower[];
  generalPowers: GeneralPower[];
  customPowers?: CustomPower[];
  customGrantedPowers?: CustomPower[];
  className: string;
  raceName: string;
}

/**
 * Classifica cada poder pelo NOME, numa única passada.
 *
 * A ordem de varredura reproduz a precedência que a exibição usava antes
 * (classe > raça > habilidade de classe > origem > divindade > concedido
 * personalizado > personalizado > geral), com *first-writer-wins*: o mesmo nome
 * vindo de duas fontes fica com a primeira.
 *
 * Classificar por nome — e não por identidade de referência, como o código
 * antigo fazia com `Array.includes(pw)` — é o que torna isso confiável:
 * `processedClassPowers` clona objetos para injetar `dynamicText`, então a
 * comparação por referência já falhava para esses poderes.
 */
export function classifyPowers(
  sources: PowerSourceArrays
): Map<string, PowerOrigin> {
  const origins = new Map<string, PowerOrigin>();

  const claim = (name: string, origin: PowerOrigin) => {
    if (!origins.has(name)) origins.set(name, origin);
  };

  sources.classPowers.forEach((power) =>
    claim(power.name, {
      kind: 'classPower',
      source: power.className ?? sources.className,
    })
  );
  sources.raceAbilities.forEach((ability) =>
    claim(ability.name, { kind: 'raceAbility', source: sources.raceName })
  );
  sources.classAbilities.forEach((ability) =>
    claim(ability.name, {
      kind: 'classAbility',
      source: ability.sourceClassName || sources.className,
    })
  );
  sources.originPowers.forEach((power) =>
    claim(power.name, { kind: 'originPower' })
  );
  sources.deityPowers.forEach((power) =>
    claim(power.name, { kind: 'deityPower' })
  );
  (sources.customGrantedPowers || []).forEach((power) =>
    claim(power.name, { kind: 'customGranted' })
  );
  (sources.customPowers || []).forEach((power) =>
    claim(power.name, { kind: 'custom' })
  );
  sources.generalPowers.forEach((power) =>
    claim(power.name, {
      kind: GENERAL_TYPE_TO_KIND[power.type] ?? 'generalCombate',
    })
  );

  return origins;
}

export interface PowerGroup<T> {
  key: string;
  origin: PowerOrigin;
  descriptor: PowerOriginDescriptor;
  label: string;
  powers: T[];
}

/**
 * Particiona a lista JÁ ORDENADA em grupos por origem.
 *
 * Uma passada só, empurrando para buckets: a ordem manual definida pelo usuário
 * (`sheet.powersOrder`, aplicada por `applyPowersOrder`) fica preservada DENTRO
 * de cada grupo por construção. Os grupos saem na ordem canônica dos
 * descritores, e os subgrupos (multiclasse) em ordem alfabética.
 */
export function groupPowersByOrigin<T extends { name: string }>(
  ordered: T[],
  origins: Map<string, PowerOrigin>
): PowerGroup<T>[] {
  const buckets = new Map<string, PowerGroup<T>>();

  ordered.forEach((power) => {
    const origin = origins.get(power.name) ?? { kind: 'custom' as const };
    const key = originGroupKey(origin);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.powers.push(power);
      return;
    }
    buckets.set(key, {
      key,
      origin,
      descriptor: POWER_ORIGINS[origin.kind],
      label: originLabel(origin),
      powers: [power],
    });
  });

  return Array.from(buckets.values()).sort((a, b) => {
    const byOrder = a.descriptor.order - b.descriptor.order;
    if (byOrder !== 0) return byOrder;
    return (a.origin.source ?? '').localeCompare(b.origin.source ?? '');
  });
}
