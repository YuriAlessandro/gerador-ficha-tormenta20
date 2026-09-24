import cloneDeep from 'lodash/cloneDeep';
import { ClassAbility, ClassDescription } from '@/interfaces/Class';
import Skill from '@/interfaces/Skills';
import { SupplementId } from '@/types/supplement.types';
import { getClassFamilyName } from '@/functions/classFamily';
import { normalizeDeityName } from '@/functions/deityName';

/**
 * Variações de classe por divindade (Deuses de Arton, Cap. 1).
 *
 * O livro descreve pacotes do tipo "Paladino de Marah": um devoto de certo deus
 * pode trocar uma habilidade de classe por outra e/ou remanejar perícias. Hoje
 * só o Paladino de Marah (p. 30) tem regra mecânica desse tipo no livro inteiro
 * — `grep "substituir a habilidade"` devolve uma única ocorrência —, mas a
 * tabela é genérica para que suplementos futuros e homebrew entrem só somando
 * uma linha.
 *
 * Todas as trocas são OPCIONAIS ("pode substituir"): sem escolha explícita do
 * jogador, a classe fica exatamente como no livro básico.
 */
export interface DeityClassVariant {
  /** Nome da divindade, como em `Divindade.name` (ex.: 'Marah'). */
  deity: string;
  /**
   * FAMÍLIA de classe: casa com a classe base e com suas variantes, então a
   * entrada 'Paladino' vale também para o Santo (Heróis de Arton).
   */
  className: string;
  /** Habilidade alternativa que o jogador pode pôr no lugar de outra. */
  alternativeAbility?: { replaces: string; ability: ClassAbility };
  /** Troca opcional de uma perícia inicial obrigatória por outra. */
  initialSkillSwap?: { from: Skill; to: Skill };
  /** Perícias somadas à lista de perícias de classe. Automático, sem escolha. */
  addedClassSkills?: Skill[];
}

/** Escolhas do jogador para a variante. Ausente = regra do livro básico. */
export interface DeityClassChoices {
  /** Nome da habilidade alternativa escolhida. */
  alternativeAbility?: string;
  /** `true` = aplicar a troca de perícia inicial. */
  swapInitialSkill?: boolean;
}

const MENSAGEM_DE_PAZ: ClassAbility = {
  name: 'Mensagem de Paz',
  nivel: 1,
  text: 'Você pode gastar uma ação padrão e 1 PM para diminuir o desejo de violência de uma criatura em alcance curto. Faça um teste de Diplomacia oposto ao teste de Vontade da criatura. Se você vencer, a criatura sofre uma penalidade cumulativa de –1 em testes de ataque e rolagens de dano e, se for um lacaio, fica também pasma por 1 rodada (uma criatura só pode ficar pasma por este efeito uma vez por cena). Para cada 10 pontos pelos quais você vencer o teste oposto, a penalidade aumenta em 1 e, se a criatura estava enfeitiçada, fascinada ou pasma, a penalidade aumenta em 1 para cada uma dessas condições. A cada rodada, a penalidade acumulada da criatura diminui em 1. A cada quatro níveis, você pode gastar +1 PM para receber +5 no teste de Diplomacia. A partir do 5º nível, quando usa esta habilidade, você pode gastar +2 PM. Se fizer isso, afeta todas as criaturas à sua escolha em alcance curto. Mental.',
};

export const DEITY_CLASS_VARIANTS: DeityClassVariant[] = [
  {
    // Deuses de Arton, p. 30 — "Paladino de Marah".
    deity: 'Marah',
    className: 'Paladino',
    alternativeAbility: {
      replaces: 'Golpe Divino',
      ability: MENSAGEM_DE_PAZ,
    },
    initialSkillSwap: { from: Skill.LUTA, to: Skill.DIPLOMACIA },
    addedClassSkills: [Skill.ATUACAO, Skill.LUTA],
  },
];

/**
 * Variante que casa com a classe e as divindades, SEM olhar suplemento.
 *
 * É o que o recálculo usa: a escolha já está persistida na ficha, e a presença
 * dela é a própria prova de que o suplemento estava ativo na criação. Gatear
 * aqui faria uma ficha sem `sheet.supplements` (as antigas não têm o carimbo)
 * reverter a troca em silêncio no primeiro recálculo.
 *
 * `deityNames` deve vir de `getPersistentDeityNames` — primária + secundária
 * (Devoção Dupla), sem o Poder Capturado, que é transitório.
 */
export function findDeityClassVariant(
  deityNames: string[],
  classe: ClassDescription | undefined
): DeityClassVariant | undefined {
  if (!classe) return undefined;

  const family = getClassFamilyName(classe);
  // Normaliza os dois lados: os formulários passam a CHAVE do enum ('MARAH',
  // 'TANNATOH') e o catálogo passa o nome formatado ('Marah', 'Tanna-Toh').
  const normalized = deityNames.map(normalizeDeityName);

  return DEITY_CLASS_VARIANTS.find(
    (variant) =>
      variant.className === family &&
      normalized.includes(normalizeDeityName(variant.deity))
  );
}

/**
 * Variante OFERECÍVEL: casa classe/divindade e exige o suplemento ativo.
 *
 * É o que decide se o assistente mostra o passo e se o editor mostra a seção.
 */
export function getDeityClassVariant(
  deityNames: string[],
  classe: ClassDescription | undefined,
  supplements: SupplementId[]
): DeityClassVariant | undefined {
  if (!supplements.includes(SupplementId.TORMENTA20_DEUSES_ARTON)) {
    return undefined;
  }
  return findDeityClassVariant(deityNames, classe);
}

/**
 * Substitui, na lista de habilidades, a habilidade do livro básico pela
 * alternativa escolhida. Ponto único da troca de habilidade: o assistente, a
 * geração e o recálculo (`applyClassAbilities`) passam por aqui.
 *
 * Devolve o MESMO array quando não há nada a trocar, para o chamador não pagar
 * clone à toa em todo recálculo.
 */
export function applyDeityClassAbilitySwap(
  abilities: ClassAbility[],
  variant: DeityClassVariant | undefined,
  chosenAbilityName?: string
): ClassAbility[] {
  const alternative = variant?.alternativeAbility;
  if (!alternative || chosenAbilityName !== alternative.ability.name) {
    return abilities;
  }

  const index = abilities.findIndex((a) => a.name === alternative.replaces);
  if (index === -1) return abilities;

  // Clone: a habilidade vai parar dentro de `sheet.classe.abilities`, e a tabela
  // acima é um singleton compartilhado por todas as fichas.
  const ability = cloneDeep(alternative.ability);

  return [
    ...abilities.slice(0, index),
    // Preserva o `sourceClassName` que `applyClassAbilities` carimba, senão a
    // habilidade trocada perde a atribuição de classe em fichas multiclasse.
    { ...ability, sourceClassName: abilities[index].sourceClassName },
    ...abilities.slice(index + 1),
  ];
}

/**
 * Aplica a variante inteira sobre a classe: habilidade, perícias iniciais e
 * perícias de classe.
 *
 * Usado pelo assistente e pela geração — é aqui que `periciasbasicas` e
 * `periciasrestantes` mudam. O recálculo usa só `applyDeityClassAbilitySwap`:
 * as perícias são consumidas na criação e depois vivem em `sheet.pericias`.
 */
export function applyDeityClassVariant(
  classe: ClassDescription,
  variant: DeityClassVariant | undefined,
  choices?: DeityClassChoices
): ClassDescription {
  if (!variant) return classe;

  const swappedAbilities = applyDeityClassAbilitySwap(
    classe.abilities,
    variant,
    choices?.alternativeAbility
  );

  // Perícias de classe extras: automático, sem escolha do jogador. Evita
  // duplicar o que já está na lista (Luta só entra se não for perícia de classe).
  const extraSkills = (variant.addedClassSkills || []).filter(
    (skill) => !classe.periciasrestantes.list.includes(skill)
  );

  const periciasbasicas =
    variant.initialSkillSwap && choices?.swapInitialSkill
      ? classe.periciasbasicas.map((group) => ({
          ...group,
          list: group.list.map((skill) =>
            skill === variant.initialSkillSwap!.from
              ? variant.initialSkillSwap!.to
              : skill
          ),
        }))
      : classe.periciasbasicas;

  if (
    swappedAbilities === classe.abilities &&
    extraSkills.length === 0 &&
    periciasbasicas === classe.periciasbasicas
  ) {
    return classe;
  }

  return {
    ...classe,
    abilities: swappedAbilities,
    periciasbasicas,
    periciasrestantes: {
      ...classe.periciasrestantes,
      list: [...classe.periciasrestantes.list, ...extraSkills],
    },
  };
}
