import {
  GeneralPower,
  GeneralPowerType,
  RequirementType,
} from '../../../../../interfaces/Poderes';
import Skill from '../../../../../interfaces/Skills';

/**
 * Poderes de Combate do suplemento Heróis de Arton
 */
const combatPowers: Record<string, GeneralPower> = {
  ARREMESSO_DEVASTADOR: {
    name: 'Arremesso Devastador',
    description:
      'Quando faz um ataque à distância com uma arma de arremesso, você pode gastar 1 PM. Se fizer isso e acertar o ataque, além do dano você faz uma manobra derrubar ou empurrar contra o alvo, usando o resultado do ataque como o teste de manobra.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [{ type: RequirementType.PODER, name: 'Arremesso Potente' }],
    ],
  },
  ATAQUE_COM_O_CABO: {
    name: 'Ataque com o Cabo',
    description:
      'Uma vez por rodada, quando usa a ação agredir enquanto empunha uma arma alongada, você pode gastar 1 PM. Se fizer isso, pode fazer um ataque extra com o cabo da arma. Você usa as mesmas estatísticas de um ataque normal da arma, mas seu dano básico se torna 1d6 (impacto) e seu crítico se torna x2.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [{ type: RequirementType.PODER, name: 'Estilo de Arma Longa' }],
    ],
  },
  ATAQUE_EM_ARCO: {
    name: 'Ataque em Arco',
    description:
      'Quando faz um ataque corpo a corpo, você pode gastar 2 PM. Se fizer isso, seu ataque pode acertar até três criaturas adjacentes entre si que estejam em seu alcance (faça um único teste de ataque e compare-o com a Defesa de cada criatura). Se você estiver atacando um bando, em vez disso seu ataque causa 50% a mais de dano.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [
        { type: RequirementType.PERICIA, name: Skill.LUTA },
        { type: RequirementType.NIVEL, value: 4 },
      ],
    ],
  },
  BRAVURA_INDOMITA: {
    name: 'Bravura Indômita',
    description:
      'Se estiver adjacente a dois ou mais inimigos aptos a atacá-lo, você recebe +2 em testes de ataque e na margem de ameaça.',
    type: GeneralPowerType.COMBATE,
    requirements: [[{ type: RequirementType.PERICIA, name: Skill.VONTADE }]],
  },
  BRIGA_DE_RUA: {
    name: 'Briga de Rua',
    description:
      'Você sabe chutar áreas sensíveis dos inimigos e usar outros truques sujos. Uma vez por rodada, quando faz uma finta, você pode gastar 1 PM. Se fizer isso e vencer o teste oposto da finta, além dos efeitos de fintar, você pode fazer um ataque desarmado contra o alvo como uma ação livre. Se acertar esse ataque, causa +2d6 pontos de dano.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [{ type: RequirementType.PODER, name: 'Briga' }],
      [{ type: RequirementType.PODER, name: 'Estilo Desarmado' }],
    ],
  },
  CHUVA_DE_GOLPES: {
    name: 'Chuva de Golpes',
    description:
      'Quando ataca com duas armas empunhadas usando o poder Estilo de Duas Armas, você pode fazer um ataque desarmado adicional.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Briga' },
        { type: RequirementType.PODER, name: 'Estilo de Duas Armas' },
      ],
      [
        { type: RequirementType.PODER, name: 'Estilo Desarmado' },
        { type: RequirementType.PODER, name: 'Estilo de Duas Armas' },
      ],
    ],
  },
  CATAFRACTARIO: {
    name: 'Catafractário',
    description:
      'Antigos guerreiros montados de Lamnor, os catafractários eram famosos por suas táticas defensivas. Embora suas unidades não existam mais, suas técnicas perduraram. Se estiver montado e vestindo armadura pesada, você recebe +1 na Defesa por nível de parceiro de sua montaria.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Encouraçado' },
        { type: RequirementType.PODER, name: 'Ginete' },
      ],
    ],
  },
  CONTRA_ATAQUE: {
    name: 'Contra-Ataque',
    description:
      'Uma vez por rodada, se uma criatura atacá-lo e errar, você pode gastar 2 PM para fazer um ataque corpo a corpo contra essa criatura.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [{ type: RequirementType.PODER, name: 'Combate Defensivo' }],
    ],
  },
  CORAGEM_AGUERRIDA: {
    name: 'Coragem Aguerrida',
    description:
      'Quando estiver com metade ou menos de seus PV totais, você recebe +2 em testes de perícia e na Defesa.',
    type: GeneralPowerType.COMBATE,
    requirements: [[{ type: RequirementType.PERICIA, name: Skill.VONTADE }]],
  },
  CORTE_LACERANTE: {
    name: 'Corte Lacerante',
    description:
      'Quando ataca com uma arma corpo a corpo de corte, você pode gastar 2 PM. Se acertar o ataque, você causa +1d10 pontos de dano e o alvo fica sangrando.',
    type: GeneralPowerType.COMBATE,
    requirements: [[{ type: RequirementType.PERICIA, name: Skill.LUTA }]],
  },
  DEFESA_ARMADA: {
    name: 'Defesa Armada',
    description:
      'Sua arma é tão grande que funciona como um escudo, protegendo-o dos ataques de seus inimigos! Se estiver usando uma arma corpo a corpo de duas mãos, você recebe +2 na Defesa e em Fortitude.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [{ type: RequirementType.PODER, name: 'Estilo de Duas Mãos' }],
    ],
  },
  ENCASTELADO: {
    name: 'Encastelado',
    description:
      'Se estiver usando uma armadura pesada, você recebe redução de dano 2. Essa RD aumenta em +1 para cada outro poder que você possua que tenha Encouraçado como pré-requisito.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Encouraçado' },
        { type: RequirementType.NIVEL, value: 5 },
      ],
    ],
  },
  ESCUDO_HEROICO: {
    name: 'Escudo Heroico',
    description:
      'Você pode empunhar e soltar seu escudo como ação livre e, quando ataca com ele, pode tratá-lo como uma arma de arremesso com alcance curto. Sempre que arremessa o escudo, você pode gastar 1 PM. Se fizer isso e acertar o ataque, você pode fazer com que ele retorne à sua mão (pegá-lo é uma reação) ou ricocheteie contra outro alvo; nesse caso, você faz um novo ataque à distância com uma penalidade cumulativa de –5. Você pode continuar atacando novos alvos até recuperar o escudo ou errar um ataque.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [{ type: RequirementType.PODER, name: 'Ataque com Escudo' }],
    ],
  },
  ESTOCADA_PUNGENTE: {
    name: 'Estocada Pungente',
    description:
      'Quando ataca com uma arma corpo a corpo de perfuração, você pode gastar 2 PM. Se acertar, o alvo sofre –5 em rolagens de dano por 1 rodada.',
    type: GeneralPowerType.COMBATE,
    requirements: [[{ type: RequirementType.PERICIA, name: Skill.LUTA }]],
  },
  ESTUDAR_O_ADVERSARIO: {
    name: 'Estudar o Adversário',
    description:
      'Na primeira vez na rodada em que erra um ataque, você recebe um bônus cumulativo de +2 em testes de ataque contra o mesmo alvo até o fim da cena.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [{ type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 1 }],
    ],
  },
  FIRULA_INSPIRADORA: {
    name: 'Firula Inspiradora',
    description:
      'Você pode gastar uma ação de movimento e 1 PM para realizar uma firula qualquer (girar sua arma, fazer uma dancinha…). Faça um teste de Atuação (CD 10). Se passar, você recebe +1 em testes de perícia e na Defesa, +1 adicional para cada 10 pontos pelos quais o resultado do teste exceder a CD, até o início do seu próximo turno.',
    type: GeneralPowerType.COMBATE,
    requirements: [],
  },
  MATADOR_DE_MONSTROS: {
    name: 'Matador de Monstros',
    description:
      'Você recebe +1d10 nas rolagens de dano contra criaturas de tamanho Grande ou maior, e essas criaturas não recebem bônus por tamanho em testes de manobras de combate contra você.',
    type: GeneralPowerType.COMBATE,
    requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
  },
  MOBILIDADE: {
    name: 'Mobilidade',
    description:
      'Quando usa a ação movimentar-se e percorre pelo menos 6m, você recebe +2 em testes de ataque e na Defesa até o início do seu próximo turno.',
    type: GeneralPowerType.COMBATE,
    requirements: [[{ type: RequirementType.PODER, name: 'Esquiva' }]],
  },
  NA_MOSCA: {
    name: 'Na Mosca',
    description:
      'Se fizer um ataque à distância, você pode gastar 1 PM. Se acertar o ataque, você causa um dado extra de dano do mesmo tipo (por exemplo, com uma besta pesada, causa +1d12).',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [{ type: RequirementType.PODER, name: 'Estilo de Arremesso' }],
      [{ type: RequirementType.PODER, name: 'Estilo de Disparo' }],
    ],
  },
  PANCADA_ESTONTEANTE: {
    name: 'Pancada Estonteante',
    description:
      'Quando ataca com uma arma corpo a corpo de impacto, você pode gastar 2 PM. Se você acertar o ataque, o alvo fica desprevenido por uma rodada (ou seja, até o fim do seu próximo turno).',
    type: GeneralPowerType.COMBATE,
    requirements: [[{ type: RequirementType.PERICIA, name: Skill.LUTA }]],
  },
  PRECISAO_LETAL: {
    name: 'Precisão Letal',
    description: 'A margem de ameaça de seus ataques aumenta em +1.',
    type: GeneralPowerType.COMBATE,
    requirements: [[{ type: RequirementType.NIVEL, value: 11 }]],
  },
  SANGUINARIO: {
    name: 'Sanguinário',
    description:
      'Sempre que você causar 10 ou mais pontos de dano em um ou mais inimigos, recebe um bônus cumulativo de +1 em rolagens de dano até o fim da cena (limitado pela sua Força).',
    type: GeneralPowerType.COMBATE,
    requirements: [],
  },
  SENTINELA_IMPLACAVEL: {
    name: 'Sentinela Implacável',
    description:
      'Uma vez por rodada, se você estiver empunhando uma arma de disparo carregada e um inimigo se mover dentro do alcance da arma, você pode gastar 2 PM para fazer um ataque contra essa criatura usando essa arma.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [
        { type: RequirementType.ATRIBUTO, name: 'Sabedoria', value: 1 },
        { type: RequirementType.PERICIA, name: Skill.INICIATIVA },
        { type: RequirementType.PERICIA, name: Skill.PERCEPCAO },
        { type: RequirementType.PODER, name: 'Estilo de Disparo' },
      ],
    ],
  },
  SEQUENCIA_DE_GOLPES: {
    name: 'Sequência de Golpes',
    description:
      'Você desfere uma tempestade de golpes, usando a força de um movimento para impulsionar o outro, sem dar chance para sua vítima reagir. Quando você acerta um ataque corpo a corpo em uma criatura, recebe um bônus cumulativo de +1 em testes de ataque e rolagens de dano contra a mesma criatura nesse turno (limitado pela sua Força).',
    type: GeneralPowerType.COMBATE,
    requirements: [],
  },
  TRUQUE_DA_MAO_LESTA: {
    name: 'Truque da Mão Lesta',
    description:
      'Se estiver usando uma arma corpo a corpo em uma mão e nada na outra, você pode trocar a arma de mãos rapidamente para confundir um inimigo adjacente. Esse inimigo fica desprevenido até o fim do seu turno e, se você acertá-lo nesse turno, seu dano com a arma aumenta em dois passos. Você pode usar este poder uma vez por inimigo em cada cena.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [{ type: RequirementType.PODER, name: 'Estilo de Uma Arma' }],
    ],
  },
};

export default combatPowers;
