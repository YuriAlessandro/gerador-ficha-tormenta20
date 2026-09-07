import type {
  AgeAttributeModifier,
  BaseAgeStage,
  InitialAgeGroup,
  InitialAgeGroupId,
} from '../../../interfaces/Age';
import type { ClassNames } from '../../../interfaces/Class';
import { Atributo } from './atributos';

/**
 * Idade — dados do livro básico (Tormenta20, p. 108).
 *
 * Diferente das Idades Variadas de Heróis de Arton (`src/premium/data/
 * ageBrackets.ts`), estas regras valem para TODA ficha, independente de
 * suplemento ativo. Quando o jogador liga Idades Variadas, as faixas de HdA
 * substituem os modificadores daqui.
 */

function modifiers(entries: [Atributo, number][]): AgeAttributeModifier[] {
  return entries.map(([attribute, value]) => ({ attribute, value }));
}

const PHYSICAL: Atributo[] = [
  Atributo.FORCA,
  Atributo.DESTREZA,
  Atributo.CONSTITUICAO,
];
const MENTAL: Atributo[] = [
  Atributo.INTELIGENCIA,
  Atributo.SABEDORIA,
  Atributo.CARISMA,
];

/** Modificadores acumulados: −n em todo físico, +m em todo mental. */
function agingModifiers(
  physicalPenalty: number,
  mentalBonus: number
): AgeAttributeModifier[] {
  return modifiers([
    ...PHYSICAL.map<[Atributo, number]>((attr) => [attr, -physicalPenalty]),
    ...MENTAL.map<[Atributo, number]>((attr) => [attr, mentalBonus]),
  ]);
}

/**
 * Estágios de envelhecimento, em ordem crescente de idade.
 *
 * Os modificadores gravados são os TOTAIS acumulados, não os incrementos: o
 * livro define Maduro como −1/+1 e Velho como −2/+1 *adicionais*, resultando no
 * total −3/+2 que ele mesmo explicita ("um personagem velho recebe um total de
 * For −3, Des −3, Con −3, Int +2, Sab +2, Car +2").
 */
export const BASE_AGE_STAGES: BaseAgeStage[] = [
  {
    id: 'jovem',
    label: 'Jovem',
    minAge: 0,
    summary: 'Nenhum modificador',
    description:
      'A idade padrão dos aventureiros. Muitos heróis são jovens, mas nem ' +
      'todos precisam ser — não há idade certa para viver aventuras, ' +
      'perseguir sonhos e combater o mal.',
    attributeModifiers: [],
  },
  {
    id: 'maduro',
    label: 'Maduro',
    minAge: 45,
    summary: 'For −1, Des −1, Con −1, Int +1, Sab +1, Car +1',
    description:
      'O corpo começa a cobrar o preço dos anos, mas a experiência compensa: ' +
      'você perde 1 ponto em cada atributo físico e ganha 1 ponto em cada ' +
      'atributo mental.',
    attributeModifiers: agingModifiers(1, 1),
  },
  {
    id: 'velho',
    label: 'Velho',
    minAge: 70,
    // O resumo mostra o TOTAL, igual a `attributeModifiers`: é o que a ficha
    // aplica de fato. O livro descreve −2/+1 adicionais sobre o Maduro, e a
    // soma dos dois é exatamente isto.
    summary: 'For −3, Des −3, Con −3, Int +2, Sab +2, Car +2',
    description:
      'Os modificadores da idade são cumulativos. Um personagem velho recebe ' +
      'um total de For −3, Des −3, Con −3, Int +2, Sab +2, Car +2 em relação a ' +
      'um personagem jovem.',
    attributeModifiers: agingModifiers(3, 2),
  },
];

export const DEFAULT_BASE_AGE_STAGE = 'jovem';

/**
 * Longevidade máxima (p. 108): 70 + 2d20 anos, em referência humana. Escala
 * pela longevidade da raça como qualquer outro marco etário.
 */
export const MAX_LONGEVITY_BASE = 70;
export const MAX_LONGEVITY_DICE = { qtdDados: 2, numFaces: 20 };

/* -------------------------------------------------------------------------- */
/* Idade inicial                                                               */
/* -------------------------------------------------------------------------- */

export const INITIAL_AGE_GROUPS: Record<InitialAgeGroupId, InitialAgeGroup> = {
  instintivo: {
    id: 'instintivo',
    formula: '1d6+15',
    qtdDados: 1,
    numFaces: 6,
    bonus: 15,
  },
  treinado: {
    id: 'treinado',
    formula: '2d4+15',
    qtdDados: 2,
    numFaces: 4,
    bonus: 15,
  },
  estudado: {
    id: 'estudado',
    formula: '2d6+15',
    qtdDados: 2,
    numFaces: 6,
    bonus: 15,
  },
};

/**
 * Grupo de idade inicial por classe (p. 108).
 *
 * O livro lista apenas as catorze classes básicas. Classes de suplemento entram
 * aqui pelo grupo mais próximo em conceito; variantes não precisam de entrada,
 * porque `getInitialAgeGroup` cai na `baseClassName` delas.
 */
export const INITIAL_AGE_GROUP_BY_CLASS: Partial<
  Record<ClassNames, InitialAgeGroupId>
> = {
  // 1d6+15 (16 a 21 anos)
  Bárbaro: 'instintivo',
  Bucaneiro: 'instintivo',
  Ladino: 'instintivo',
  Lutador: 'instintivo',
  // 2d4+15 (17 a 23 anos)
  Bardo: 'treinado',
  Caçador: 'treinado',
  Cavaleiro: 'treinado',
  Guerreiro: 'treinado',
  Nobre: 'treinado',
  Paladino: 'treinado',
  // Heróis de Arton: aprende junto do animal, no mesmo ritmo do Caçador.
  Treinador: 'treinado',
  // 2d6+15 (17 a 27 anos)
  Arcanista: 'estudado',
  Clérigo: 'estudado',
  Druida: 'estudado',
  Inventor: 'estudado',
  // Deuses de Arton: formação religiosa longa, como a do Clérigo.
  Frade: 'estudado',
};

/** Grupo usado quando a classe não está mapeada (nem ela nem sua base). */
export const DEFAULT_INITIAL_AGE_GROUP: InitialAgeGroupId = 'treinado';

/* -------------------------------------------------------------------------- */
/* Longevidade racial                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Multiplicadores do box "Idades das Raças" (Heróis de Arton, p. 289).
 *
 * Vivem no repositório aberto, e não no submódulo premium, porque o
 * envelhecimento do livro básico também precisa deles: sem escalar os marcos, um
 * elfo de 70 anos seria "velho", o que contradiz a própria descrição da raça.
 *
 * Duas regras diferentes, e a distinção importa: as raças LONGEVAS multiplicam
 * apenas os marcos A PARTIR DE ADULTO ("embora essas raças sejam mais longevas,
 * amadurecem no mesmo ritmo de humanos"), enquanto as raças de vida curta
 * multiplicam TODOS os marcos.
 */
const SLOW_AGING_X2 = ['Anão', 'Meio-Elfo', 'Qareen'];
const SLOW_AGING_X5 = [
  'Dahllan',
  'Duende',
  'Eiradaan',
  'Elfo',
  'Golem',
  'Golem Desperto',
  'Osteon',
  'Sátiro',
  'Sílfide',
];
const FAST_AGING = ['Goblin', 'Trog'];

export interface RaceAgeScaling {
  multiplier: number;
  /** `true` = só da maturidade em diante; `false` = todos os marcos. */
  fromAdultOnly: boolean;
}

export const NO_AGE_SCALING: RaceAgeScaling = {
  multiplier: 1,
  fromAdultOnly: false,
};

export function getRaceAgeScaling(
  raceName: string | undefined
): RaceAgeScaling {
  if (!raceName) return NO_AGE_SCALING;
  // Osteon/Soterrado guardam a raça de origem no nome composto em alguns casos;
  // o match por prefixo cobre "Golem Desperto" sem exigir a lista completa.
  const matches = (list: string[]) =>
    list.some((name) => raceName === name || raceName.startsWith(`${name} `));

  if (matches(SLOW_AGING_X5)) return { multiplier: 5, fromAdultOnly: true };
  if (matches(SLOW_AGING_X2)) return { multiplier: 2, fromAdultOnly: true };
  if (matches(FAST_AGING)) return { multiplier: 0.7, fromAdultOnly: false };
  return NO_AGE_SCALING;
}
