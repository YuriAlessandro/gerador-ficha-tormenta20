import {
  BASE_AGE_STAGES,
  DEFAULT_INITIAL_AGE_GROUP,
  INITIAL_AGE_GROUPS,
  INITIAL_AGE_GROUP_BY_CLASS,
  getRaceAgeScaling,
} from '../data/systems/tormenta20/ages';
import type { Atributo } from '../data/systems/tormenta20/atributos';
import type {
  AgeAttributeModifier,
  AgeRange,
  BaseAgeStage,
  BaseAgeStageId,
  AgeBracketId,
  InitialAgeGroup,
  SheetAge,
} from '../interfaces/Age';
import type { ClassDescription, ClassNames } from '../interfaces/Class';
import { getAgeAttributeModifiers } from '../premium/functions/ages';
import { rollDice } from './randomUtils';

/**
 * Envelhecimento (Tormenta20, p. 108) — funções de regra do livro BÁSICO.
 *
 * Valem para toda ficha, sem depender de suplemento. As Idades Variadas de
 * Heróis de Arton vivem em `src/premium/functions/ages.ts` e, quando ligadas,
 * substituem os modificadores de atributo daqui.
 *
 * Todas as funções aceitam `undefined` e devolvem o valor neutro: uma ficha sem
 * estágio é indistinguível de uma ficha Jovem, que é o padrão e o único estágio
 * que não altera nada.
 */

/**
 * Marco etário de um estágio para uma raça, já escalado pela longevidade.
 *
 * Raças longevas amadurecem no mesmo ritmo de humanos e só esticam da
 * maturidade em diante (box "Idades das Raças"), então o marco do estágio Jovem
 * — que é zero — nunca escala.
 */
function scaledMinAge(stage: BaseAgeStage, raceName: string | undefined) {
  const { multiplier, fromAdultOnly } = getRaceAgeScaling(raceName);
  const scales = !fromAdultOnly || stage.id !== 'jovem';
  return Math.round(stage.minAge * (scales ? multiplier : 1));
}

/**
 * Estágios de envelhecimento com o intervalo de anos de cada um, para a raça
 * informada.
 *
 * Os intervalos são CONTÍGUOS por construção: o teto de um estágio é sempre o
 * piso do seguinte menos um. Escalar piso e teto independentemente abriria
 * buracos nas raças longevas (um elfo ficaria sem estágio entre o fim do Jovem
 * humano e o início do Maduro élfico), e uma idade sem estágio é um estado que
 * a ficha não sabe representar.
 */
export function getBaseAgeStages(
  raceName: string | undefined
): (BaseAgeStage & AgeRange)[] {
  const minAges = BASE_AGE_STAGES.map((stage) => scaledMinAge(stage, raceName));

  return BASE_AGE_STAGES.map((stage, index) => ({
    ...stage,
    minAge: minAges[index],
    maxAge:
      index === BASE_AGE_STAGES.length - 1 ? undefined : minAges[index + 1] - 1,
  }));
}

/** Intervalo de anos de um estágio para a raça informada. */
export function getBaseAgeStageRange(
  stageId: BaseAgeStageId | undefined,
  raceName: string | undefined
): AgeRange | undefined {
  return getBaseAgeStages(raceName).find((stage) => stage.id === stageId);
}

/**
 * Estágio correspondente a uma idade em anos — a ponte entre o que o jogador
 * digita e o que a ficha aplica.
 */
export function getBaseAgeStageForYears(
  years: number | undefined,
  raceName: string | undefined
): BaseAgeStageId {
  if (years === undefined || Number.isNaN(years)) return 'jovem';

  const stages = getBaseAgeStages(raceName);
  // Percorre do mais velho para o mais novo: o primeiro cujo piso a idade
  // alcança é o estágio. Idades abaixo de tudo caem no Jovem, que começa em 0.
  const match = [...stages].reverse().find((stage) => years >= stage.minAge);
  return match?.id ?? 'jovem';
}

export function getBaseAgeStage(
  stageId: BaseAgeStageId | undefined
): BaseAgeStage | undefined {
  if (!stageId) return undefined;
  return BASE_AGE_STAGES.find((stage) => stage.id === stageId);
}

/**
 * Modificadores de atributo ACUMULADOS do estágio.
 *
 * Seguem o caminho dos modificadores raciais: aplicados uma vez na criação da
 * ficha, e não a cada recálculo. Não podem virar `sheetBonuses` porque o motor
 * expande um alvo `Attribute` nas perícias/Defesa derivadas em vez de somá-lo ao
 * atributo — a penalidade sumiria da linha do atributo.
 */
export function getBaseAgeAttributeModifiers(
  stageId: BaseAgeStageId | undefined
): AgeAttributeModifier[] {
  return getBaseAgeStage(stageId)?.attributeModifiers ?? [];
}

/**
 * Delta a aplicar nos atributos ao mudar de estágio (drawer de edição): o que o
 * estágio novo concede menos o que o antigo concedia.
 *
 * Como os modificadores gravados já são acumulados, a subtração direta basta —
 * não é preciso saber por quais estágios o personagem passou.
 */
export function getBaseAgeAttributeDelta(
  fromStage: BaseAgeStageId | undefined,
  toStage: BaseAgeStageId | undefined
): AgeAttributeModifier[] {
  const totals = new Map<Atributo, number>();

  getBaseAgeAttributeModifiers(fromStage).forEach(({ attribute, value }) => {
    totals.set(attribute, (totals.get(attribute) ?? 0) - value);
  });
  getBaseAgeAttributeModifiers(toStage).forEach(({ attribute, value }) => {
    totals.set(attribute, (totals.get(attribute) ?? 0) + value);
  });

  return [...totals.entries()]
    .filter(([, value]) => value !== 0)
    .map(([attribute, value]) => ({ attribute, value }));
}

/* -------------------------------------------------------------------------- */
/* Idade inicial                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Grupo de idade inicial da classe. Variantes de classe (Heróis de Arton) não
 * têm entrada própria e caem na classe base, que é de onde herdam o conceito.
 */
export function getInitialAgeGroup(
  classDescription: Pick<ClassDescription, 'name' | 'baseClassName'> | undefined
): InitialAgeGroup {
  const byName = classDescription
    ? INITIAL_AGE_GROUP_BY_CLASS[classDescription.name as ClassNames]
    : undefined;
  const byBase = classDescription?.baseClassName
    ? INITIAL_AGE_GROUP_BY_CLASS[classDescription.baseClassName]
    : undefined;

  return INITIAL_AGE_GROUPS[byName ?? byBase ?? DEFAULT_INITIAL_AGE_GROUP];
}

/**
 * Idade inicial rolada (p. 108).
 *
 * NÃO escala pela longevidade da raça, e o livro é explícito: o box "Raças
 * Longevas" diz que essas raças usam a MESMA idade inicial, multiplicando
 * apenas as categorias de envelhecimento e a longevidade máxima. Heróis de
 * Arton reforça a leitura — "tanto humanos quanto elfos serão crianças dos 9
 * aos 12, adolescentes dos 13 aos 17 e jovens a partir dos 18".
 *
 * A distinção não é cosmética: escalar punha um elfo arcanista em ~110 anos e,
 * como a faixa é derivada dos anos, ele caía sozinho na faixa Adulto —
 * arrastando o passo de complicações de idade que o jogador não pediu.
 */
export function rollInitialAge(
  classDescription: Pick<ClassDescription, 'name' | 'baseClassName'> | undefined
): number {
  const group = getInitialAgeGroup(classDescription);

  return rollDice(group.qtdDados, group.numFaces) + group.bonus;
}

/* -------------------------------------------------------------------------- */
/* Total combinado das duas regras                                             */
/* -------------------------------------------------------------------------- */

/**
 * Modificadores de atributo TOTAIS do bloco de idade da ficha.
 *
 * As duas regras nunca somam: quando há `bracket`, Idades Variadas está ligada e
 * substitui o envelhecimento do livro básico (é o que o próprio Heróis de Arton
 * determina). Sem `bracket`, valem os modificadores do estágio base.
 *
 * Sem o submódulo premium, `getAgeAttributeModifiers` devolve `[]` — e uma ficha
 * sem premium também nunca tem `bracket`, então o caminho base é o único ativo.
 */
export function getAgeAttributeTotals(
  age: SheetAge | undefined
): AgeAttributeModifier[] {
  if (!age) return [];
  if (age.bracket) return getAgeAttributeModifiers(age.bracket);
  return getBaseAgeAttributeModifiers(age.stage);
}

/**
 * Delta a aplicar nos atributos ao editar a idade de uma ficha existente: o
 * total novo menos o total antigo.
 *
 * Cobre inclusive a troca de REGRA (ligar ou desligar Idades Variadas numa ficha
 * pronta), porque compara totais em vez de assumir que os dois lados usam a
 * mesma tabela.
 */
export function getAgeAttributeTotalsDelta(
  from: SheetAge | undefined,
  to: SheetAge | undefined
): AgeAttributeModifier[] {
  const totals = new Map<Atributo, number>();

  getAgeAttributeTotals(from).forEach(({ attribute, value }) => {
    totals.set(attribute, (totals.get(attribute) ?? 0) - value);
  });
  getAgeAttributeTotals(to).forEach(({ attribute, value }) => {
    totals.set(attribute, (totals.get(attribute) ?? 0) + value);
  });

  return [...totals.entries()]
    .filter(([, value]) => value !== 0)
    .map(([attribute, value]) => ({ attribute, value }));
}

/**
 * Idade com que um personagem ENTRA num estágio, para quando o jogador escolhe
 * o estágio em vez de digitar os anos.
 *
 * O estágio Jovem começa em zero, e "0 anos" não é uma resposta útil — ali a
 * idade de entrada é a menor que a rolagem da classe pode dar, que é justamente
 * a idade com que aventureiros daquela classe costumam começar. Nos demais
 * estágios, o piso do próprio estágio.
 */
export function getStageEntryAge(
  stageId: BaseAgeStageId | undefined,
  raceName: string | undefined,
  classDescription: Pick<ClassDescription, 'name' | 'baseClassName'> | undefined
): number {
  const range = getBaseAgeStageRange(stageId, raceName);
  if (range && range.minAge > 0) return range.minAge;

  // A menor rolagem possível da classe — e sem escalar pela raça, pelo mesmo
  // motivo de `rollInitialAge`: a idade inicial é igual para todas as raças.
  const group = getInitialAgeGroup(classDescription);
  return group.qtdDados + group.bonus;
}

/**
 * Modificadores de idade a partir do estado do ASSISTENTE, onde a ficha ainda
 * não existe e a idade é só um punhado de campos soltos.
 *
 * O estágio é derivado dos anos na hora em vez de lido do estado: no assistente
 * a raça ainda muda, e com ela a escala dos marcos.
 */
export function getAgeAttributeTotalsForSelection(
  selection:
    | { years?: number; variedAges?: boolean; bracket?: AgeBracketId }
    | undefined,
  raceName: string | undefined
): AgeAttributeModifier[] {
  if (!selection) return [];

  return getAgeAttributeTotals({
    years: selection.years,
    stage: getBaseAgeStageForYears(selection.years, raceName),
    bracket: selection.variedAges ? selection.bracket : undefined,
    complications: [],
    extraLevels: 0,
  });
}
