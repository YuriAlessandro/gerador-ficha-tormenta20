import { ItemE } from '@/interfaces/Rewards';
import { SupplementId } from '@/types/supplement.types';

/**
 * Encantos para esotéricos (Heróis de Arton, cap. 3 — Arsenal dos Heróis,
 * pp. 260-262). O livro básico não tem encantos de esotérico.
 *
 * Os efeitos que o motor de magias consegue representar estão em
 * `spellModifiers` (valem com o esotérico empunhado, como as melhorias); os
 * demais — condicionais a alvo, cena ou abate — ficam no texto.
 */
const enchantment = (
  name: string,
  effect: string,
  extra: Partial<ItemE> = {}
): ItemE => ({
  min: 0,
  max: 0,
  enchantment: name,
  effect,
  supplementId: SupplementId.TORMENTA20_HEROIS_ARTON,
  ...extra,
});

/** "Suas magias que causam dano de X causam um dado extra do mesmo tipo." */
const extraDieOf = (damageType: string): Partial<ItemE> => ({
  spellModifiers: [
    {
      filter: { damageTypes: [damageType] },
      effect: {
        type: 'RollBonus',
        rolls: 'damage',
        extraDice: 1,
        damageTypes: [damageType],
      },
    },
  ],
});

export const esotericEnchantments: ItemE[] = [
  enchantment(
    'Abafador',
    'Se uma criatura falhar num teste de resistência contra uma magia sua, a CD das habilidades dela diminui em –2 por uma rodada.'
  ),
  enchantment(
    'Bélico',
    'Quando lança uma magia de dano, você causa +1d10 pontos de dano de essência.',
    {
      spellModifiers: [
        {
          filter: { damaging: true },
          effect: {
            type: 'ExtraRoll',
            label: 'Dano de essência',
            dice: '1d10',
            damageType: 'essência',
          },
        },
      ],
    }
  ),
  enchantment(
    'Caridoso',
    'Quando você lança uma magia em um aliado e gasta pelo menos 1 PM, recebe 1 PM temporário para gastar em aprimoramentos na próxima magia que lançar nessa cena. Esse PM não conta no limite de gasto de pontos de mana.'
  ),
  enchantment(
    'Chocante',
    'Suas magias que causam dano de eletricidade causam um dado extra de dano do mesmo tipo e deixam o alvo ofuscado por 1 rodada.',
    extraDieOf('eletricidade')
  ),
  enchantment(
    'Clemente',
    'Suas magias de cura curam um dado extra do mesmo tipo.',
    {
      spellModifiers: [
        {
          filter: { healing: true },
          effect: { type: 'RollBonus', rolls: 'healing', extraDice: 1 },
        },
      ],
    }
  ),
  enchantment(
    'Contido',
    'Quando lança uma magia de dano, você pode gastar +1 PM para que ela cause dano não letal.',
    {
      excludes: ['Pulverizante'],
      spellModifiers: [
        {
          filter: { damaging: true },
          effect: {
            type: 'CastOption',
            id: 'contido',
            label: 'causa dano não letal',
            addPm: 1,
          },
        },
      ],
    }
  ),
  enchantment(
    'Embusteiro',
    'Permite que você use o poder Magia Discreta. Se você já o possui, em vez disso o custo para usá-lo diminui em –1 PM e você pode somar seu Carisma na CD do teste de Misticismo para perceber que você lançou uma magia.'
  ),
  enchantment(
    'Emergencial',
    'Se estiver empunhando este esotérico, uma vez por rodada, quando você ou um aliado em alcance curto sofre dano, você pode gastar 4 PM para lançar uma magia de cura na vítima desse dano como uma reação. Apenas magias com execução de ação de movimento, padrão ou completa podem ser lançadas dessa forma.'
  ),
  enchantment(
    'Encadeado',
    'Uma vez por cena, quando você reduz os PV de um inimigo a 0 ou menos com uma magia, você pode causar metade do dano da magia a outro inimigo dentro do alcance original dela. O inimigo tem direito ao mesmo teste de resistência original e não sofre qualquer outro efeito da magia, apenas o dano.'
  ),
  enchantment(
    'Escultor',
    'Quando você lança uma magia com efeito de cone ou linha, pode gastar 1 PM para mudar a área dessa magia de cone para linha ou vice-versa. O comprimento de um cone que se torna linha dobra e o de uma linha que se torna cone é reduzido a um terço.'
  ),
  enchantment(
    'Frugal',
    'Quando você lança uma magia que exige um teste de resistência e afeta um ou mais inimigos, pode diminuir a CD da magia em –2. Se fizer isso, o custo da magia também é diminuído em –2 PM.',
    {
      spellModifiers: [
        {
          filter: { resisted: true },
          effect: {
            type: 'CastOption',
            id: 'frugal',
            label: '–2 na CD e –2 PM',
            addPm: 0,
            effects: [
              { type: 'PmReduction', value: 2, cumulative: true },
              { type: 'SpellDC', value: -2 },
            ],
          },
        },
      ],
    }
  ),
  enchantment(
    'Glacial',
    'Suas magias que causam dano de frio causam um dado extra de dano do mesmo tipo e deixam os alvos vulneráveis por 1 rodada.',
    extraDieOf('frio')
  ),
  enchantment(
    'Imperioso',
    'Quando você lança uma magia que exige que você gaste ações para comandar o efeito dela, a ação que você gasta para emitir esse comando diminui em uma categoria (de completa para padrão, de padrão para movimento, de movimento para livre; apenas um comando como ação livre por rodada).'
  ),
  enchantment(
    'Implacável',
    'Quando você lança uma magia, pode gastar +2 PM para afetar um alvo contra o qual você não tenha linha de efeito. Você deve estar vendo o alvo ou tê-lo visto em seu último turno, e ele ainda precisa estar no alcance. Pré-requisito: outro encanto.',
    {
      requiresOtherEnchantment: true,
      spellModifiers: [
        {
          effect: {
            type: 'CastOption',
            id: 'implacavel',
            label: 'afeta um alvo sem linha de efeito (visto no último turno)',
            addPm: 2,
          },
        },
      ],
    }
  ),
  enchantment(
    'Incriminador',
    'Uma vez por cena, quando você lança uma magia, pode gastar 3 PM para criar uma ilusão que mostra a magia sendo lançada por outra criatura a sua escolha em alcance médio. Criaturas que identificarem a magia têm direito a um teste de Vontade (CD da magia) para desacreditar.',
    {
      spellModifiers: [
        {
          effect: {
            type: 'CastOption',
            id: 'incriminador',
            label: 'ilusão: outra criatura parece lançar a magia (1/cena)',
            addPm: 3,
          },
        },
      ],
    }
  ),
  enchantment(
    'Inflamável',
    'Suas magias que causam dano de fogo causam um dado extra de dano do mesmo tipo e deixam o alvo em chamas (se já fizerem isso, o dano causado por essa condição aumenta em +1d6).',
    extraDieOf('fogo')
  ),
  enchantment(
    'Inquisidor',
    'Quando você lança uma magia divina contra uma criatura que não seja devota da divindade do esotérico, a CD da magia aumenta em +1. Se possuir a habilidade de classe Devoto Fiel dessa divindade, em vez disso a CD aumenta em +2.'
  ),
  enchantment(
    'Insistente',
    'Quando você lança uma magia que causa dano por mais de uma rodada (como Flecha Ácida), os efeitos que normalmente só se aplicariam quando a magia é lançada (como Arcano de Batalha) se aplicam também à segunda rodada.'
  ),
  enchantment(
    'Khalmyrita',
    'Quando lança uma magia com efeito variável, em vez de rolar os dados você pode escolher um valor igual à média da rolagem. Um esotérico khalmyrita não pode ser nímbico.',
    { excludes: ['Nímbico'] }
  ),
  enchantment(
    'Majestoso',
    'A CD para resistir a suas magias arcanas aumenta em +1. Se você tiver a habilidade de classe Magias, em vez disso aumenta em +2. Pré-requisito: outro encanto.',
    {
      requiresOtherEnchantment: true,
      spellModifiers: [
        {
          filter: { tradition: 'arcane', lacksPower: 'Magias' },
          effect: { type: 'SpellDC', value: 1 },
        },
        {
          filter: { tradition: 'arcane', hasPower: 'Magias' },
          effect: { type: 'SpellDC', value: 2 },
        },
      ],
    }
  ),
  enchantment(
    'Nímbico',
    'Quando lança uma magia com efeito variável, você pode rolar novamente qualquer número de dados da rolagem original (limitado pelos seus PM atuais). Contudo, a cada resultado par numa dessas rolagens adicionais, você perde 1 PM. Um esotérico nímbico não pode ser khalmyrita.',
    { excludes: ['Khalmyrita'] }
  ),
  enchantment(
    'Pulverizante',
    'Quando lança uma magia que reduz os PV de uma criatura a 0 ou menos, você pode gastar 2 PM para que a criatura seja desintegrada, restando apenas um fino pó (equipamento também, exceto itens mágicos). Um esotérico pulverizante não pode ser contido. Pré-requisito: outro encanto.',
    { requiresOtherEnchantment: true, excludes: ['Contido'] }
  ),
  enchantment(
    'Retaliador',
    'Quando você evitar dano de um inimigo (na forma de RD) com o efeito de uma de suas magias, a CD da sua próxima magia de dano lançada até o fim do seu próximo turno aumenta em +1 para cada 10 pontos de dano evitado.'
  ),
  enchantment(
    'Sanguessuga',
    'Se você lançar uma magia e um ou mais inimigos falharem no teste de resistência contra ela, você recebe 10 PV temporários.'
  ),
  enchantment(
    'Traiçoeiro',
    'Se você lançar uma magia hostil e afetar um aliado, todas as criaturas afetadas pela magia (incluindo o aliado) sofrem –2 em seus testes de resistência. O aliado não pode ter resistência ou imunidade contra o efeito da magia, nem se beneficiar dele, para este encanto funcionar.'
  ),
  enchantment(
    'Verdugo',
    'Na primeira vez em cada cena que você reduz um inimigo a 0 PV ou menos com uma magia lançada com este esotérico, o dano causado por suas magias aumenta em +1 por dado até o fim da cena.'
  ),
];

const HEROIS_ARTON_ENCHANTMENTS = {
  esoterics: esotericEnchantments,
};

export default HEROIS_ARTON_ENCHANTMENTS;
