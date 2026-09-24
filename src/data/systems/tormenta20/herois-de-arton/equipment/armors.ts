import { DefenseEquipment } from '../../../../../interfaces/Equipment';
import { BonusCondition } from '../../../../../interfaces/CharacterSheet';
import { skillsByAttributeBonuses } from '../../../../../functions/sheetBonuses/skillsByAttributeBonuses';
import { Atributo } from '../../atributos';
import Skill from '../../../../../interfaces/Skills';

/**
 * Bônus de armadura precisam de `wearingArmorNamed`: `applyEquipmentBonuses`
 * varre a mochila inteira, então sem a condição o bônus valeria com a armadura
 * apenas guardada.
 */
const worn = (nome: string): BonusCondition => ({
  combinator: 'AND',
  clauses: [{ kind: 'wearingArmorNamed', value: nome }],
});

/**
 * Armaduras e Escudos do suplemento Heróis de Arton - Tormenta 20
 */

// ==========================================
// ARMADURAS LEVES
// ==========================================

/**
 * "Permite usar o poder Atraente. Se você já tiver esse poder, em vez disso o
 * bônus fornecido por ele aumenta para +5" (Heróis de Arton, p. 225).
 *
 * Duas leituras, uma só condição com o `negate` invertido — nunca coexistem,
 * então não há como somar +2 e +5.
 */
const ARMADURA_SENSUAL_ATRAENTE = (hasAtraente: boolean): BonusCondition => ({
  combinator: 'AND',
  clauses: [
    // Sem esta cláusula o bônus valeria com a armadura GUARDADA na mochila:
    // `applyEquipmentBonuses` varre a mochila inteira, não o que está vestido.
    { kind: 'wearingArmorNamed', value: 'Armadura sensual' },
    { kind: 'hasPower', value: 'Atraente', negate: !hasAtraente },
  ],
});

/**
 * Exceção consciente ao critério de automação do catálogo: o poder Atraente é
 * situacional ("contra criaturas que possam se sentir fisicamente atraídas por
 * você") e por isso `destinyPowers.ts` NÃO o automatiza. Aqui o bônus é
 * automatizado mesmo assim, por decisão de produto — foi pedido direto por
 * usuário. Se um dia o poder Atraente ganhar `sheetBonuses` próprios, isto aqui
 * passa a somar em dobro e precisa ser revisto junto.
 */
const ARMADURA_SENSUAL: DefenseEquipment = {
  nome: 'Armadura sensual',
  defenseBonus: 1,
  armorPenalty: 0,
  spaces: 2,
  group: 'Armadura',
  preco: 55,
  descricao:
    'Permite usar o poder Atraente (+2 em perícias baseadas em Carisma contra ' +
    'criaturas que possam se sentir fisicamente atraídas por você); se você já ' +
    'tiver o poder, o bônus dele aumenta para +5. Em muitos lugares de Arton ' +
    'não é traje apropriado — fora de combate, o mestre pode anular o bônus ou ' +
    'transformá-lo em penalidade.',
  sheetBonuses: [
    // Sem o poder: a armadura o CONCEDE, com o valor original de +2.
    ...skillsByAttributeBonuses(
      Atributo.CARISMA,
      'Armadura sensual',
      2,
      ARMADURA_SENSUAL_ATRAENTE(false)
    ),
    // Com o poder: o bônus dele "aumenta para +5" (substitui, não acumula).
    ...skillsByAttributeBonuses(
      Atributo.CARISMA,
      'Armadura sensual',
      5,
      ARMADURA_SENSUAL_ATRAENTE(true)
    ),
  ],
};

const ARMADURA_DE_FOLHAS: DefenseEquipment = {
  nome: 'Armadura de folhas',
  defenseBonus: 2,
  armorPenalty: 0,
  spaces: 2,
  group: 'Armadura',
  preco: 75,
  descricao:
    'Se for treinado em Sobrevivência, você recebe +2 PM com esta armadura (somente após 1 dia de uso), cumulativo com outros efeitos de itens.',
  sheetBonuses: [
    {
      source: { type: 'equipment', equipmentName: 'Armadura de folhas' },
      target: { type: 'PM' },
      modifier: { type: 'Fixed', value: 2 },
      condition: {
        combinator: 'AND',
        clauses: [
          { kind: 'wearingArmorNamed', value: 'Armadura de folhas' },
          { kind: 'hasSkill', value: Skill.SOBREVIVENCIA },
        ],
      },
    },
  ],
};

const ARMADURA_DE_ENGENHOQUEIRO_GOBLIN: DefenseEquipment = {
  nome: 'Armadura de engenhoqueiro goblin',
  defenseBonus: 3,
  armorPenalty: -2,
  spaces: 2,
  group: 'Armadura',
  preco: 85,
  // Sem automação: a regra de carga extra depende de quantos itens estão
  // pendurados (a penalidade vai de –2 a –10), o que a ficha não modela.
  descricao:
    'Coberta de ganchos, bolsos e prendedores para guardar tralha de ofício. Quanto mais itens pendurados, maior a penalidade de armadura (de –2 a –10).',
};

const COTA_DE_MOEDAS: DefenseEquipment = {
  nome: 'Cota de moedas',
  defenseBonus: 4,
  armorPenalty: -3,
  spaces: 2,
  group: 'Armadura',
  preco: 350,
  descricao:
    'Malha formada por tibares entrelaçados. Você recebe +2 em Diplomacia (cumulativo com melhorias da armadura). O mestre pode mudar o bônus para –2 diante de quem despreza ostentação.',
  sheetBonuses: [
    {
      source: { type: 'equipment', equipmentName: 'Cota de moedas' },
      target: { type: 'Skill', name: Skill.DIPLOMACIA },
      modifier: { type: 'Fixed', value: 2 },
      condition: worn('Cota de moedas'),
    },
  ],
};

const COLETE_FORA_DA_LEI: DefenseEquipment = {
  nome: 'Colete fora da lei',
  defenseBonus: 5,
  armorPenalty: -5,
  spaces: 2,
  group: 'Armadura',
  preco: 750,
  // Bônus de Defesa contextual: o motor não distingue o tipo de arma do
  // atacante ao calcular Defesa.
  descricao:
    'Sua forma arredondada redireciona projéteis: contra armas de disparo, seu bônus na Defesa aumenta em +2.',
};

// ==========================================
// ARMADURAS PESADAS
// ==========================================

const BRIGANTINA: DefenseEquipment = {
  nome: 'Brigantina',
  defenseBonus: 6,
  armorPenalty: 0,
  spaces: 5,
  group: 'Armadura',
  isHeavyArmor: true,
  preco: 75,
  descricao:
    'Placas metálicas rebitadas sobre couro. Contra armas de perfuração, seu bônus na Defesa diminui em –2.',
};

const ARMADURA_DE_CHUMBO: DefenseEquipment = {
  nome: 'Armadura de chumbo',
  defenseBonus: 7,
  armorPenalty: -5,
  spaces: 5,
  group: 'Armadura',
  isHeavyArmor: true,
  preco: 750,
  // "Resistência a magia" não tem alvo de bônus; a RD de armadura é calculada
  // à parte (`getDefenseMaterialRd`) e bônus de RD vindos de item são
  // descartados de propósito em `applyEquipmentBonuses`.
  descricao:
    'Fornece redução de dano 2/mundano e resistência a magia +2, cumulativo com outros efeitos de itens.',
};

const ARMADURA_DE_JUSTA: DefenseEquipment = {
  nome: 'Armadura de justa',
  defenseBonus: 9,
  armorPenalty: -5,
  spaces: 5,
  group: 'Armadura',
  isHeavyArmor: true,
  preco: 1200,
  descricao:
    'Proteção extra no lado do peito oposto à lança. Fornece +5 em testes para resistir a ser derrubado.',
};

const ARMADURA_DE_HUSSARDO_ALADO: DefenseEquipment = {
  nome: 'Armadura de hussardo alado',
  defenseBonus: 10,
  armorPenalty: -6,
  spaces: 5,
  group: 'Armadura',
  isHeavyArmor: true,
  preco: 4500,
  descricao:
    'Ao fazer uma investida montada, você pode fazer um teste de Intimidação para assustar o alvo (uma vez por cena com cada oponente). Contra armas de perfuração, seu bônus na Defesa aumenta em +2; se não estiver montado, sua penalidade de armadura aumenta em 2.',
};

const ARMADURA_DE_PEDRA: DefenseEquipment = {
  nome: 'Armadura de pedra',
  defenseBonus: 12,
  armorPenalty: -5,
  spaces: 5,
  group: 'Armadura',
  isHeavyArmor: true,
  preco: 5500,
  descricao:
    'Fornece redução de dano 2 (cumulativo com outros efeitos de itens). Seu deslocamento é reduzido à metade (em vez de em 3m) e ela não pode receber melhoria de material especial.',
};

// ==========================================
// ESCUDOS
// ==========================================

const BROQUEL: DefenseEquipment = {
  nome: 'Broquel',
  defenseBonus: 0,
  armorPenalty: -1,
  spaces: 0.5,
  group: 'Escudo',
  preco: 25,
  // Reação por rodada, com teste de ataque: não é um delta fixo na ficha.
  descricao:
    'Protege só a mão e o pulso (impedindo o uso dessa mão) e NÃO fornece bônus na Defesa. Em vez disso, uma vez por rodada, ao ser atingido você pode fazer um teste de ataque corpo a corpo e reduzir o dano em 2 para cada 10 pontos do resultado. Pode ser usado para atacar como escudo leve. RD 5, PV 10.',
};

const ESCUDO_DE_VIME: DefenseEquipment = {
  nome: 'Escudo de vime',
  defenseBonus: 2,
  armorPenalty: -2,
  spaces: 2,
  group: 'Escudo',
  preco: 15,
  // Camuflagem e cessão de bônus a um aliado não têm representação na ficha.
  descricao:
    'Exige as duas mãos, impedindo empunhar qualquer outro item, e não pode ser usado montado ou para atacar. Fornece camuflagem leve e, no seu turno, você pode ceder seu bônus na Defesa e a camuflagem a um aliado adjacente. Um acerto crítico em você ou nele destrói o escudo. RD 2, PV 20.',
};

const ESCUDO_TORRE: DefenseEquipment = {
  nome: 'Escudo torre',
  defenseBonus: 2,
  armorPenalty: -4,
  spaces: 2,
  group: 'Escudo',
  preco: 45,
  descricao:
    'Não pode ser usado para atacar nem por personagem montado. Com uma ação de movimento você pode fixá-lo no chão, virando uma barreira que fornece cobertura leve (recolocá-lo é outra ação de movimento). RD 10, PV 30.',
};

const SAGNA: DefenseEquipment = {
  nome: 'Sagna',
  defenseBonus: 2,
  armorPenalty: -3,
  spaces: 2,
  group: 'Escudo',
  preco: 20,
  // Regras de natação: dependem da situação, não de um valor fixo na ficha.
  descricao:
    'Também serve de prancha. Ao usá-lo assim, a penalidade de armadura dele e da sua armadura não se aplicam a natação; ao passar num teste para nadar você avança seu deslocamento normal (ou, se já tiver deslocamento de natação, ele aumenta em +3m). Pode ser usado para atacar como escudo pesado. RD 5, PV 10.',
};

export const HEROIS_ARTON_ARMORS = {
  // Armaduras Leves
  ARMADURA_SENSUAL,
  ARMADURA_DE_FOLHAS,
  ARMADURA_DE_ENGENHOQUEIRO_GOBLIN,
  COTA_DE_MOEDAS,
  COLETE_FORA_DA_LEI,
  // Armaduras Pesadas
  BRIGANTINA,
  ARMADURA_DE_CHUMBO,
  ARMADURA_DE_JUSTA,
  ARMADURA_DE_HUSSARDO_ALADO,
  ARMADURA_DE_PEDRA,
  // Escudos
  BROQUEL,
  ESCUDO_DE_VIME,
  ESCUDO_TORRE,
  SAGNA,
} satisfies Record<string, DefenseEquipment>;
