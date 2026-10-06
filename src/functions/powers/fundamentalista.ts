/**
 * Fundamentalista (Deuses de Arton, p. 11–12): +1 poder concedido, um dogma
 * mais rígido do deus e uso apenas da arma preferida.
 *
 * O app INFORMA a regra, não a aplica: nada aqui bloqueia armas ou zera PM.
 *
 * Módulo quase-folha de propósito: `general.ts` o importa, então ele não pode
 * depender de nada que importe `general.ts` de volta. Por isso a chave do deus
 * é resolvida aqui, e não com `pantheonKeyForDeity` (que puxa `multiclass`).
 */
import CharacterSheet from '../../interfaces/CharacterSheet';
import { ClassDescription } from '../../interfaces/Class';
import { DogmaFundamentalista } from '../../interfaces/Character';
import Equipment from '../../interfaces/Equipment';
import SelectOptions from '../../interfaces/SelectedOptions';
import {
  allDivindadeNames,
  divindadeDisplayNames,
  DivindadeNames,
  PREFERRED_WEAPON_ANY,
  PREFERRED_WEAPON_NONE,
} from '../../interfaces/Divindade';
import { DivindadeEnum } from '../../data/systems/tormenta20/divindades';
import {
  FUNDAMENTALISTAS,
  FundamentalistaDeus,
} from '../../data/systems/tormenta20/deuses-de-arton/fundamentalistas';
import { SupplementId } from '../../types/supplement.types';
import { normalizeDeityName } from '../deityName';
import { getClassFamilyName } from '../classFamily';

export type ClassIdentity = Pick<
  ClassDescription,
  'name' | 'isVariant' | 'baseClassName'
>;

const DOGMA_ORDER: DogmaFundamentalista[] = ['sacerdote', 'druida', 'paladino'];

export const DOGMA_LABELS: Record<DogmaFundamentalista, string> = {
  sacerdote: 'Sacerdote',
  druida: 'Druida',
  paladino: 'Paladino',
};

export const FUNDAMENTALIST_VIOLATION_TEXT =
  'Violar o dogma: perde PM e habilidades de classe divina até o dia seguinte. Reincidir na mesma aventura exige penitência.';

/** Família da classe divina → dogma que ela segue. */
const DOGMA_BY_CLASS_FAMILY: Partial<Record<string, DogmaFundamentalista>> = {
  Clérigo: 'sacerdote',
  Frade: 'sacerdote',
  Druida: 'druida',
  Paladino: 'paladino',
};

/**
 * Nome normalizado → chave do enum. `normalizeDeityName` tira hífens e
 * espaços, então a chave (`TANNATOH`) e o nome (`Tanna-Toh`) casam no mesmo
 * registro — o formulário usa a chave, a ficha usa o nome.
 */
const KEY_BY_NORMALIZED_NAME = new Map<string, DivindadeNames>(
  allDivindadeNames.map((key): [string, DivindadeNames] => [
    normalizeDeityName(divindadeDisplayNames[key]),
    key,
  ])
);

export function getFundamentalistDeityKey(
  deityName?: string
): DivindadeNames | undefined {
  if (!deityName) return undefined;
  return KEY_BY_NORMALIZED_NAME.get(normalizeDeityName(deityName));
}

function getEntry(deityName?: string): FundamentalistaDeus | undefined {
  const key = getFundamentalistDeityKey(deityName);
  return key ? FUNDAMENTALISTAS[key] : undefined;
}

/** Só os 20 deuses maiores têm dogma; deus menor e homebrew não. */
export function isFundamentalistEligibleDeity(deityName?: string): boolean {
  return !!getEntry(deityName);
}

export function isDivineClass(classe: ClassIdentity): boolean {
  return !!DOGMA_BY_CLASS_FAMILY[getClassFamilyName(classe)];
}

export function getAvailableDogmas(deityName: string): DogmaFundamentalista[] {
  const entry = getEntry(deityName);
  if (!entry) return [];
  return DOGMA_ORDER.filter((dogma) => !!entry[dogma]);
}

/**
 * Classe divina segue o próprio dogma; outra classe segue `escolha` (p. 12).
 * Se o deus não tiver o dogma pedido (ex.: druida de Khalmyr via Devoções
 * Abertas), cai para o de sacerdote, que todo deus maior tem.
 */
export function resolveDogmaForClass(
  classe: ClassIdentity,
  deityName: string,
  escolha?: DogmaFundamentalista
): DogmaFundamentalista {
  const wanted = DOGMA_BY_CLASS_FAMILY[getClassFamilyName(classe)] ?? escolha;
  return wanted && getAvailableDogmas(deityName).includes(wanted)
    ? wanted
    : 'sacerdote';
}

/**
 * Classe divina cujo deus não tem o dogma dela (ex.: druida de Khalmyr via
 * Devoções Abertas). O livro não trata o caso; usar o de sacerdote é decisão
 * do app, e o aviso diz isso ao usuário.
 */
export function getDogmaFallbackNotice(
  classe: ClassIdentity,
  deityName: string
): string | undefined {
  const own = DOGMA_BY_CLASS_FAMILY[getClassFamilyName(classe)];
  const key = getFundamentalistDeityKey(deityName);
  if (!own || !key || getAvailableDogmas(deityName).includes(own)) {
    return undefined;
  }
  return `${divindadeDisplayNames[key]} não tem dogma de ${DOGMA_LABELS[
    own
  ].toLowerCase()}; usando o de sacerdote (adaptação do Fichas de Nimb, não é regra do livro).`;
}

export function getDogma(
  deityName: string,
  dogma: DogmaFundamentalista
): { texto: string; paginas: number[] } | undefined {
  const entry = getEntry(deityName);
  const own = entry?.[dogma];
  if (!entry || !own) return undefined;
  if (!own.herdaSacerdote) {
    return { texto: own.texto ?? '', paginas: [own.pagina] };
  }
  const base = entry.sacerdote.texto ?? '';
  return {
    texto: own.texto ? `${base} ${own.texto}` : base,
    paginas: [entry.sacerdote.pagina, own.pagina],
  };
}

export function formatDogmaPages(paginas: number[]): string {
  return `p. ${paginas.join(' e ')}`;
}

export function getFundamentalistNotices(
  deityName: string,
  dogma: DogmaFundamentalista,
  raceName?: string
): string[] {
  const key = getFundamentalistDeityKey(deityName);
  if (!key) return [];
  const entry = FUNDAMENTALISTAS[key];
  const notices: string[] = [];
  if (entry.avisoNpc?.includes(dogma)) {
    // Avaliação EDITORIAL do app: o livro só diz que "alguns dogmas" servem
    // melhor a NPCs, sem listar quais. O texto precisa deixar isso claro.
    notices.push(
      'O livro avisa que alguns dogmas servem melhor a NPCs, sem dizer quais. Na avaliação do Fichas de Nimb (não é regra do livro), este é um deles.'
    );
  }
  if (
    dogma === 'paladino' &&
    entry.paladinoSomenteRaca &&
    raceName &&
    raceName !== entry.paladinoSomenteRaca
  ) {
    notices.push(
      `Apenas ${entry.paladinoSomenteRaca.toLowerCase()}s podem ser paladinos fundamentalistas de ${
        divindadeDisplayNames[key]
      }.`
    );
  }
  return notices;
}

/**
 * Dogma da ficha. A combinação com devoção dupla é inválida (o normalizer a
 * descarta); aqui ela simplesmente não conta.
 */
export function getSheetFundamentalista(
  sheet: CharacterSheet
): DogmaFundamentalista | undefined {
  const devoto = sheet?.devoto;
  if (!devoto?.fundamentalista || devoto.divindadeSecundaria) return undefined;
  return devoto.fundamentalista.dogma;
}

/**
 * Quantos poderes concedidos o devoto escolhe. Classe sem valor escolhe 1
 * (mesmo padrão do assistente e do gerador); `'all'` continua `'all'`.
 */
export function getGrantedPowerCount(
  qtdPoderesConcedidos: string | number | undefined,
  fundamentalista: boolean
): number | 'all' {
  if (qtdPoderesConcedidos === 'all') return 'all';
  const base =
    typeof qtdPoderesConcedidos === 'number' ? qtdPoderesConcedidos : 1;
  return fundamentalista ? base + 1 : base;
}

/** Resolvida pelo NOME: o `devoto.divindade` gravado não tem o campo. */
export function getPreferredWeapon(deityName?: string): string | undefined {
  const key = getFundamentalistDeityKey(deityName);
  return key ? DivindadeEnum[key].preferredWeapon : undefined;
}

export function getPreferredWeaponRule(deityName: string): string | undefined {
  const preferred = getPreferredWeapon(deityName);
  if (!preferred) return undefined;
  if (preferred === PREFERRED_WEAPON_ANY) {
    return 'Qualquer arma serve: Nimb não tem uma só arma preferida.';
  }
  if (preferred === PREFERRED_WEAPON_NONE) {
    return `${deityName} não tem arma preferida: usar qualquer arma viola o dogma.`;
  }
  return `Usa apenas a arma preferida (${preferred}); outra arma viola o dogma.`;
}

const normalizeWeaponName = (name: string): string =>
  name.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

/**
 * Compara o `nome` de CATÁLOGO: melhorias, material e encantos vivem em
 * `modifications`/`enchantments`, e o nome dado pelo jogador em
 * `customDisplayName` — nenhum deles altera `nome`. Comparação exata: armas
 * de nome parecido (Adaga oposta, Maça-estrela) são outras armas.
 */
export function isPreferredWeapon(
  weapon: Pick<Equipment, 'nome'>,
  deityName?: string
): boolean {
  const preferred = getPreferredWeapon(deityName);
  // Sem dado não há o que avisar.
  if (!preferred || preferred === PREFERRED_WEAPON_ANY) return true;
  if (preferred === PREFERRED_WEAPON_NONE) return false;
  return normalizeWeaponName(weapon.nome) === normalizeWeaponName(preferred);
}

/** Armas naturais, ataque desarmado e munição não contam como "usar arma". */
const isWieldedWeapon = (item: Equipment): boolean =>
  item.group === 'Arma' &&
  !item.isAmmo &&
  !item.weaponTags?.includes('natural') &&
  item.nome !== 'Ataque Desarmado';

export function getPreferredWeaponWarning(
  sheet: CharacterSheet,
  item: Equipment
): string | undefined {
  if (!getSheetFundamentalista(sheet) || !isWieldedWeapon(item)) {
    return undefined;
  }
  const deityName = sheet.devoto?.divindade.name;
  if (!deityName || isPreferredWeapon(item, deityName)) return undefined;
  const rule = getPreferredWeaponRule(deityName);
  return `Fundamentalista: ${rule} Variações ficam a critério do mestre.`;
}

/**
 * A escolha do formulário vale? Confere tudo de novo porque o estado do
 * formulário pode estar velho (interruptor ligado e depois deus trocado, ou
 * suplemento desativado).
 */
export function resolveFundamentalistChoice(
  options: Pick<
    SelectOptions,
    'fundamentalista' | 'dogmaFundamentalista' | 'dualDevotion' | 'supplements'
  >,
  classe: ClassIdentity,
  deityName?: string
): { dogma: DogmaFundamentalista } | undefined {
  if (!options.fundamentalista || options.dualDevotion) return undefined;
  if (!options.supplements?.includes(SupplementId.TORMENTA20_DEUSES_ARTON)) {
    return undefined;
  }
  if (!deityName || !isFundamentalistEligibleDeity(deityName)) return undefined;
  return {
    dogma: resolveDogmaForClass(
      classe,
      deityName,
      options.dogmaFundamentalista
    ),
  };
}

/** Texto do dogma para o PDF; `''` quando a ficha não é fundamentalista. */
export function getFundamentalistaSummary(sheet: CharacterSheet): string {
  const dogma = getSheetFundamentalista(sheet);
  const deityName = sheet.devoto?.divindade.name;
  if (!dogma || !deityName) return '';
  const info = getDogma(deityName, dogma);
  if (!info) return '';
  return [
    `${deityName}, dogma de ${DOGMA_LABELS[dogma].toLowerCase()}: ${
      info.texto
    }`,
    getPreferredWeaponRule(deityName),
    FUNDAMENTALIST_VIOLATION_TEXT,
    `Deuses de Arton, ${formatDogmaPages(info.paginas)}.`,
  ]
    .filter(Boolean)
    .join('\n');
}
