import type { Atributo } from '../data/systems/tormenta20/atributos';
import type { SheetBonus } from './CharacterSheet';

/**
 * Idade — dois conjuntos de regras que ocupam o mesmo espaço na ficha.
 *
 * 1. **Envelhecimento** (Tormenta20, p. 108) — regra do livro BÁSICO, sempre
 *    ativa. Todo personagem tem uma idade em anos, e passar de certos marcos
 *    aplica modificadores cumulativos de atributo.
 * 2. **Idades Variadas** (Heróis de Arton, p. 288-291) — regra OPCIONAL, ligada
 *    por escolha do jogador. Sete faixas etárias com níveis extras, complicações
 *    e benefícios de origem alterados.
 *
 * As duas são mutuamente exclusivas nos modificadores de atributo: quando
 * Idades Variadas está ligada, ela SUBSTITUI os modificadores do livro básico
 * (é o que o próprio Heróis de Arton determina). A idade em anos, porém, é
 * sempre a mesma — é ela que decide o estágio base e a faixa de HdA.
 */

/** Modificador permanente de atributo concedido pela idade. */
export interface AgeAttributeModifier {
  attribute: Atributo;
  value: number;
}

/* -------------------------------------------------------------------------- */
/* Livro básico — Envelhecimento (T20, p. 108)                                 */
/* -------------------------------------------------------------------------- */

/**
 * Estágios de envelhecimento do livro básico. "Jovem" não existe como termo no
 * livro — é o estado default, antes dos 45 anos, sem modificador nenhum.
 */
export type BaseAgeStageId = 'jovem' | 'maduro' | 'velho';

export interface BaseAgeStage {
  id: BaseAgeStageId;
  label: string;
  /** Idade mínima em referência HUMANA; outras raças escalam (ver getAgeStages). */
  minAge: number;
  /** Resumo dos modificadores, para a UI. */
  summary: string;
  description: string;
  /**
   * Modificadores ACUMULADOS até este estágio.
   *
   * O livro descreve os modificadores como cumulativos ("um personagem velho
   * recebe um total de For −3, Des −3, Con −3, Int +2, Sab +2, Car +2"), e é
   * esse total que fica guardado aqui — não o incremento do estágio. Assim o
   * estágio é a única fonte da verdade e a troca vira um delta simples, sem
   * depender de por quais estágios o personagem passou.
   */
  attributeModifiers: AgeAttributeModifier[];
}

/**
 * Grupos de idade inicial (T20, p. 108). A rolagem varia conforme a classe:
 * classes que dependem de instinto e vigor começam mais novas que as que
 * dependem de estudo.
 */
export type InitialAgeGroupId = 'instintivo' | 'treinado' | 'estudado';

export interface InitialAgeGroup {
  id: InitialAgeGroupId;
  /** Fórmula da rolagem, no formato aceito por `rollDice`. */
  formula: string;
  /** Quantidade de dados e faces, para rolar sem parser. */
  qtdDados: number;
  numFaces: number;
  /** Valor fixo somado à rolagem. */
  bonus: number;
}

/* -------------------------------------------------------------------------- */
/* Heróis de Arton — Idades Variadas (p. 288-291)                              */
/* -------------------------------------------------------------------------- */

/**
 * Sete faixas etárias. Jovem é a padrão e a única que não altera a ficha; todas
 * as outras trazem benefícios e penalidades, e o livro avisa explicitamente que
 * elas NÃO são equilibradas entre si.
 */
export type AgeBracketId =
  | 'crianca'
  | 'adolescente'
  | 'jovem'
  | 'adulto'
  | 'maduro'
  | 'velho'
  | 'anciao';

/**
 * Complicação de idade ("O Peso da Idade", p. 290). Funciona como uma
 * complicação normal e usa a mesma forma estrutural — `name` + `sheetBonuses` —
 * para poder passar pelo mesmo `applyPower` do motor de poderes.
 *
 * Diferente das complicações do cap. de Complicações, estas NÃO concedem poder
 * geral: são o preço dos níveis extras da faixa etária.
 */
export interface AgeComplication {
  name: string;
  description: string;
  sheetBonuses?: SheetBonus[];
}

export interface AgeBracket {
  id: AgeBracketId;
  label: string;
  /** Faixa de anos em referência HUMANA; outras raças escalam (ver getAgeRange). */
  minAge: number;
  /** Ausente na última faixa (Ancião, 80+). */
  maxAge?: number;
  /** Resumo da coluna "Modificadores" da Tabela 4-2. */
  summary: string;
  description: string;
  /**
   * Modificadores PERMANENTES de atributo da faixa (Criança, Velho, Ancião).
   *
   * Não são `sheetBonuses`: o motor nunca muta `atributos[attr].value` a partir
   * de um bônus — um alvo `Attribute` é expandido nas perícias/Defesa derivadas
   * e sumiria do atributo em si. Idade é modificador de construção de
   * personagem, igual ao racial, e por isso segue o mesmo caminho: aplicado uma
   * vez na criação da ficha, e ajustado por delta quando o jogador troca a
   * faixa pelo drawer de edição.
   */
  attributeModifiers?: AgeAttributeModifier[];
  /** Demais efeitos numéricos fixos da faixa (Defesa, PM, perícias, tamanho). */
  sheetBonuses?: SheetBonus[];
  /** Níveis adicionais em relação ao resto do grupo (Maduro 1, Velho 2, Ancião 3). */
  extraLevels: number;
  /** Quantas complicações de idade a faixa exige (Adulto 1, …, Ancião 4). */
  requiredComplications: number;
  /** Benefícios de origem recebidos: Criança 0, Adolescente 1, demais 2. */
  originBenefits: number;
  /**
   * Adulto ("Já Vi Coisas"): PODE receber um poder geral; se receber, também
   * recebe a complicação de idade. É a única faixa em que ambos são opcionais e
   * andam juntos.
   */
  optionalGeneralPower?: boolean;
  /** Velho e Ancião não podem escolher Aumento de Atributo para atributos físicos. */
  blocksPhysicalAttributeIncrease?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Bloco gravado na ficha                                                      */
/* -------------------------------------------------------------------------- */

export interface SheetAge {
  /**
   * Idade em anos. É o dado PRIMÁRIO desde que o envelhecimento do livro básico
   * passou a valer para toda ficha: tanto `stage` quanto `bracket` são
   * derivados dele (e da longevidade da raça).
   */
  years?: number;
  /**
   * Estágio de envelhecimento do livro básico, congelado na criação. Derivável
   * de `years`, mas gravado para que o delta da edição saiba de onde partir —
   * mesmo motivo de `extraLevels`.
   */
  stage?: BaseAgeStageId;
  /**
   * Faixa de Idades Variadas. Só existe quando a regra opcional está ligada
   * nesta ficha; ausente significa que valem os modificadores do livro básico.
   */
  bracket?: AgeBracketId;
  /** Cópias embutidas das complicações de idade escolhidas (só Idades Variadas). */
  complications: AgeComplication[];
  /** Poder geral de "Já Vi Coisas" (só Adulto, Idades Variadas). */
  grantedPowerName?: string;
  /**
   * Níveis extras concedidos pela faixa, CONGELADOS na criação. Trocar a faixa
   * etária depois não reescreve a progressão — o campo existe para que a ficha
   * saiba de onde veio o nível, não para recalculá-lo.
   */
  extraLevels: number;
}

/** Intervalo de anos de um estágio/faixa para uma raça específica. */
export interface AgeRange {
  minAge: number;
  /** Ausente no último estágio/faixa (sem teto). */
  maxAge?: number;
}
