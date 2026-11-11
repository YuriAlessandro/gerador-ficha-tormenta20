import type { Atributo } from '../data/systems/tormenta20/atributos';
import type { SpellSchool } from './Spells';

/**
 * Modificadores de magia: o efeito que um PODER, HABILIDADE ou ITEM aplica às
 * magias do personagem ("suas magias de cura de luz custam –1 PM", "a CD das
 * suas magias arcanas aumenta em +1", "magias que dão bônus em ataque também
 * dão +1 na margem de ameaça").
 *
 * É declarado nos DADOS, no campo `spellModifiers` da entidade que concede o
 * efeito (ao lado de `sheetBonuses`), para que homebrew possa declarar o mesmo.
 * O motor em `functions/spells/modifiers` coleta, filtra por magia e resolve
 * tudo num perfil único consumido pelo lançamento, pela lista de magias, pelo
 * PDF, pelo Foundry e pelos efeitos ativos.
 */

/** Filtro de magias. Campos combinam em E; listas são OU. Vazio = todas. */
export interface SpellModifierFilter {
  /** Nomes exatos de magia ("Curar Ferimentos"). */
  spellNames?: string[];
  schools?: SpellSchool[];
  tradition?: 'arcane' | 'divine';
  /** Alcances exatos ("Pessoal"). */
  ranges?: string[];
  /** Círculos (1–5). */
  circles?: number[];
  /** Execuções exatas ("Padrão", "Movimento", "Completa"). */
  executions?: string[];
  /**
   * Energia que o devoto canaliza ("positiva"/"negativa"); divindade que
   * canaliza "qualquer" passa nas duas.
   */
  channelEnergy?: 'positiva' | 'negativa';
  /**
   * Só as magias que o jogador marcou para ESTA fonte (Foco em Magia: "escolha
   * uma magia"). Ver `SpellModifierChoiceSpec`.
   */
  chosen?: boolean;
  /** Só magias com rolagem de cura ("magias de cura"). */
  healing?: boolean;
  /** Só magias com rolagem de dano ("magias de dano"). */
  damaging?: boolean;
  /** Só magias que permitem teste de resistência. */
  resisted?: boolean;
  /** Só magias com área (Magia Dividida). */
  area?: boolean;
  /**
   * Só magias com rolagem de dano de um destes tipos ("magias que causam dano
   * de fogo"). Tipos em minúsculas; ver `getRollDamageType`.
   */
  damageTypes?: string[];
  /**
   * Só se o personagem tem esta classe (principal, variante ou multiclasse
   * conjuradora) — "magias de bardo".
   */
  casterClass?: string;
  /**
   * Só magias cujo atributo-chave é um destes (Deslumbrante: "habilidades
   * baseadas em Carisma").
   */
  keyAttributes?: Atributo[];
  /**
   * Só se a ficha tem este poder ou habilidade, inclusive de classe
   * (Majestoso: "se você tiver a habilidade de classe Magias").
   */
  hasPower?: string;
  /**
   * Só se o personagem é devoto desta divindade. `'chosen'` = a divindade
   * escolhida na melhoria do item (Canônico).
   */
  devoteeOf?: string;
}

/** Tipos de bônus de efeito ativo que contam como "bônus em X". */
export type SpellEffectBonusKind = 'attack' | 'defense' | 'resistance';

export type SpellModifierEffect =
  /**
   * Redução de custo. Por regra (JdA, Reduções de Custo) reduções NÃO
   * acumulam — vale a maior —, exceto as que o texto declara cumulativas.
   */
  | { type: 'PmReduction'; value: number; cumulative?: boolean }
  /** Custo reduzido à metade, depois de todo o resto (Alta Arcana). */
  | { type: 'PmHalve' }
  /** Bônus nas rolagens de cura ou de dano da magia. */
  | {
      type: 'RollBonus';
      rolls: 'healing' | 'damage';
      perDie?: number;
      flat?: number;
      /** Soma um atributo (Urro Divino: Constituição, mínimo +1). */
      flatAttribute?: Atributo;
      flatAttributeMin?: number;
      /**
       * Dados extras iguais ao primeiro dado da rolagem (Cetro elemental: "o
       * dano aumenta em um dado do mesmo tipo").
       */
      extraDice?: number;
      /**
       * Só rolagens de dano destes tipos (Aspecto do Inverno: "dano de frio
       * causa +1 por dado"). `'chosen'` = os tipos escolhidos para a fonte
       * (escolha `of: 'damageType'`, Cetro elemental).
       */
      damageTypes?: string[] | 'chosen';
    }
  /**
   * Quantos esotéricos a magia pode usar ao mesmo tempo (padrão 1; Esoterismo,
   * Heróis de Arton: "dois itens esotéricos diferentes simultaneamente").
   */
  | { type: 'EsotericLimit'; value: number }
  /** Maximiza as rolagens da magia (Espírito dos Solstícios). */
  | { type: 'RollMaximize' }
  /** Muda o tipo de dano das rolagens de dano (Magia Sagrada/Profana). */
  | { type: 'DamageTypeOverride'; damageType: string }
  /**
   * Opção que o jogador liga NA HORA de lançar, pagando `addPm` (Magia
   * Pungente, Magia Acelerada, Urro Divino…). Os `effects` só valem com a
   * opção marcada; sem `effects`, a opção só cobra o PM e entra no registro
   * do lançamento (o efeito fica no texto: execução, alcance…).
   */
  | {
      type: 'CastOption';
      id: string;
      label: string;
      addPm: number;
      effects?: SpellModifierEffect[];
      /**
       * Efeito ativo (chave do registro de efeitos) oferecido depois do
       * lançamento quando a opção é marcada — já pago pelo `addPm`
       * (Barreira Mística: +4 na Defesa até o próximo turno).
       */
      activeEffectKey?: string;
    }
  /** Bônus na CD para resistir à magia. */
  | { type: 'SpellDC'; value: number }
  /**
   * PM extras para gastar em aprimoramentos (Bolsa de pó, Tomo de guerra).
   * Não cumulativos entre si (Magia Instintiva, Heróis de Arton): vale o maior.
   */
  | { type: 'AprimoramentoPm'; value: number }
  /**
   * Rolagem extra somada ao lançamento (Costela de lich: +1d6 de trevas).
   * `damageType: 'spell'` = o tipo de dano da própria magia, o primeiro quando
   * ela tem mais de um (Energético: "+1d6 pontos de dano do mesmo tipo"); o
   * rótulo vira "Dano de <tipo>".
   */
  | { type: 'ExtraRoll'; label: string; dice: string; damageType?: string }
  /**
   * Efeito ativo da magia: cada bônus de `kind` aumenta em +`value` (Luva de
   * ferro: bônus na Defesa ou em resistências).
   */
  | { type: 'EffectBonusIncrease'; kind: SpellEffectBonusKind; value: number }
  /**
   * Efeito ativo da magia: cada bônus de `kind` ganha também +`value` na
   * margem de ameaça (Medalhão Afiado).
   */
  | { type: 'EffectThreatMargin'; kind: SpellEffectBonusKind; value: number }
  /**
   * Efeito ativo da magia: PV temporários iguais a `multiplier` × o bônus de
   * `kind` concedido (Égide da Fé, Bênção Fortalecedora).
   */
  | { type: 'EffectTempPV'; kind: SpellEffectBonusKind; multiplier: number }
  /**
   * Aprimoramento novo para as magias do filtro (Proeminência Solar, Explosão
   * Fulgente: "+1 PM: criaturas que falhem na resistência ficam em chamas").
   */
  | { type: 'ExtraAprimoramento'; addPm: number; text: string }
  /**
   * Nas rolagens de dano (só destes tipos, se informados), cada resultado 1
   * é rolado de novo uma vez (Gelo eterno: "pode rolar novamente qualquer
   * resultado 1 na rolagem de dano dela").
   */
  | { type: 'RerollOnes'; damageTypes?: string[] }
  /**
   * Limite de PM gastos na magia (JdA p. 224: nível na classe da magia).
   * `value` e `attribute` somam (Orbe cristalina: +1; Magia Ilimitada:
   * atributo-chave); `multiplier` vale depois (Celebrar Ritual: dobro).
   */
  | {
      type: 'PmLimit';
      value?: number;
      /** `'key'` = atributo-chave da magia. */
      attribute?: Atributo | 'key';
      multiplier?: number;
    };

export interface SpellModifier {
  filter?: SpellModifierFilter;
  effect: SpellModifierEffect;
}

/** Quantas magias a fonte deixa escolher. */
export type SpellChoiceCount =
  | { type: 'fixed'; value: number }
  /** Uma por vez que o poder foi escolhido (Foco em Magia). */
  | { type: 'picks' }
  /** Igual a um atributo, com mínimo (Aspecto da Primavera: Carisma, mín. 1). */
  | { type: 'attribute'; attribute: Atributo; min?: number };

/**
 * "Escolha N magias…": quantas e quais podem ser escolhidas. As escolhas
 * ficam em `CharacterSheet.spellModifierChoices[nome da fonte]` e valem para
 * os modificadores com `filter.chosen`.
 */
export interface SpellModifierChoiceSpec {
  count: SpellChoiceCount;
  eligible?: SpellModifierFilter;
  /**
   * O que se escolhe: uma magia (padrão) ou uma escola (Tomo hermético: "uma
   * escola de magia específica"). A escola é marcada a partir de qualquer
   * magia dela.
   */
  of?: SpellChoiceOf;
}

/**
 * O que a escolha registra: a magia, a escola dela, ou o tipo de dano dela
 * (Cetro elemental: a pedra define o tipo; marca-se a partir de uma magia que
 * causa dano desse tipo).
 */
export type SpellChoiceOf = 'spell' | 'school' | 'damageType';

/** Entidade de dados que pode declarar modificadores de magia. */
export interface HasSpellModifiers {
  spellModifiers?: SpellModifier[];
  spellChoice?: SpellModifierChoiceSpec;
}
