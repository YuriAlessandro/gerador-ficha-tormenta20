import { ClassPower } from '../../../../../interfaces/Class';
import { RequirementType } from '../../../../../interfaces/Poderes';
import { Atributo } from '../../atributos';

const LUTADOR_POWERS: ClassPower[] = [
  {
    name: 'Aquecimento',
    text: 'Em seu primeiro turno de um combate, você pode gastar uma ação completa para aquecer seus músculos. Você soma sua Constituição em seus testes de ataque desarmado (limitada pelo seu nível) e recebe uma quantidade de PV temporários igual a sua Constituição + seu nível. Ambos os bônus duram até o fim da cena.',
    requirements: [],
  },
  {
    name: 'Caminhar pelas Paredes',
    text: 'Você recebe +10 em testes de Atletismo para saltar e pode se deslocar por paredes e tetos. Contudo, se terminar seu movimento enquanto se desloca em uma parede, você cai (e sofre os efeitos normais de uma queda).',
    requirements: [[{ type: RequirementType.PERICIA, name: 'Atletismo' }]],
  },
  {
    name: 'Caminho Suave',
    text: 'Quando faz um teste de manobra com um ataque desarmado, você pode gastar uma quantidade de PM a sua escolha (limitada pela sua Sabedoria). Para cada PM que gastar, você recebe +2 no teste.',
    requirements: [
      [{ type: RequirementType.ATRIBUTO, name: Atributo.SABEDORIA, value: 1 }],
    ],
  },
  {
    name: 'Combinação: Boca do Estômago',
    text: 'Quando faz um ataque, você pode gastar 1 PM para que seu golpe seja debilitante. Se acertar, você recebe um bônus na rolagem de dano igual à sua contagem de combinações e o oponente fica enjoado até o fim do seu próximo turno.',
    requirements: [],
  },
  {
    name: 'Combinação: Chute Circular',
    text: 'Quando faz um ataque, você pode gastar 2 PM para que seu golpe seja giratório. Se acertar, para cada ponto em sua contagem de combinações você causa +1d6 pontos de dano. Além disso, você pode fazer uma manobra empurrar contra o mesmo oponente como uma ação livre (use o resultado do ataque como o teste de manobra).',
    requirements: [
      [
        {
          type: RequirementType.TEXT,
          text: 'Outro poder de Combinação',
        },
      ],
    ],
  },
  {
    name: 'Combinação: Chute no Joelho',
    text: 'Quando faz um ataque, você pode gastar 1 PM para que seu golpe seja um chute baixo cruel. Se acertar, até o fim do seu próximo turno o oponente fica lento e sofre uma penalidade em testes de ataque e rolagens de dano igual à sua contagem de combinações.',
    requirements: [],
  },
  {
    name: 'Combinação: Esquiva Técnica',
    text: 'Uma vez por rodada, quando sofre um ataque corpo a corpo, você pode gastar 2 PM para fazer um teste de Reflexos oposto ao teste de Percepção do atacante. Você recebe um bônus nesse teste igual à sua contagem de combinações. Se vencer o teste oposto, você evita o ataque e recebe +5 em seu próximo teste de ataque desarmado contra o atacante nessa rodada.',
    requirements: [
      [
        {
          type: RequirementType.TEXT,
          text: 'Um poder de Combinação',
        },
      ],
    ],
  },
  {
    name: 'Combinação: Quebra-guarda',
    text: 'Quando faz um ataque, você pode gastar 1 PM para que seu golpe supere defesas. Se fizer isso, recebe um bônus no teste de ataque igual à sua contagem de combinações. Se acertar, o oponente não pode usar habilidades para reduzir o dano do ataque ou receber RD adicional contra ele. Além disso, o oponente fica vulnerável até o fim do seu próximo turno.',
    requirements: [],
  },
  {
    name: 'Combinação: Um-Dois',
    text: 'Quando faz um ataque, você pode gastar 1 PM para atacar de vários lados. Se fizer isso, você não precisa de um aliado para flanquear o oponente (faz isso sozinho). Além disso, se acertar, recebe um bônus na Defesa igual à sua contagem de combinações até o fim do seu próximo turno.',
    requirements: [[{ type: RequirementType.PODER, name: 'Jogo de Pernas' }]],
  },
  {
    name: 'Combinação: Técnica de Sacrifício',
    text: 'Quando faz um ataque, você pode gastar 1 PM para que ele seja um movimento de projeção. Para isso, faça uma manobra agarrar com um bônus igual à sua contagem de combinações. Se vencer o teste de manobra, além de agarrar o oponente, você se joga no chão com ele. Ambos ficam caídos, mas ele sofre dano como se você tivesse acertado um ataque desarmado.',
    requirements: [],
  },
  {
    name: 'Corpo Fechado',
    text: 'Quando faz um teste de resistência, você pode gastar 1 PM para somar sua Constituição no teste.',
    requirements: [],
  },
  {
    name: 'Dança Marcial',
    text: 'Você pode gastar uma ação de movimento e 2 PM para receber +2 na Defesa, em Acrobacia e em testes de Enganação para fintar. A partir do 6º nível, e a cada cinco níveis seguintes (11º e 16º), você pode gastar +1 PM para aumentar esses bônus em +1. Os bônus duram até o fim da cena ou até você ficar atordoado ou sob alguma condição de movimento.',
    requirements: [
      [
        { type: RequirementType.PERICIA, name: 'Acrobacia' },
        { type: RequirementType.PERICIA, name: 'Atuação' },
      ],
    ],
  },
  {
    name: 'Gingado Elusivo',
    text: 'Se estiver sob efeito de sua Dança Marcial, uma vez por rodada, quando sofre um efeito hostil, você pode gastar 2 PM para receber +5 na Defesa e em testes de Reflexos contra ele. Após a resolução do efeito, você salta para um espaço adjacente desocupado.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Dança Marcial' },
        { type: RequirementType.NIVEL, value: 7 },
      ],
    ],
  },
  {
    name: 'Invencível',
    text: 'Você é um campeão de incontáveis embates, famoso e endurecido por isso. Quando faz um teste de perícia baseada em Carisma, você pode gastar 2 PM para somar a sua Força no teste. Além disso, sempre que é reduzido a 0 ou menos pontos de vida, pode gastar 5 PM para recuperar PV igual à metade dos seus PV máximos.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Nome na Arena' },
        { type: RequirementType.NIVEL, value: 17 },
      ],
    ],
  },
  {
    name: 'Jogo de Pernas',
    text: 'Uma vez por rodada, quando faz um ataque corpo a corpo, você pode se mover 1,5m em qualquer direção, antes ou depois do ataque. Esse movimento não ativa reações de seus inimigos (como de Ataque Reflexo).',
    requirements: [
      [{ type: RequirementType.ATRIBUTO, name: Atributo.DESTREZA, value: 1 }],
    ],
  },
  {
    name: 'Mestre das Combinações',
    text: 'Sua contagem de combinações aumenta em +2 (em vez de +1) para cada ataque de Combinação diferente com o qual você acertar o oponente.',
    requirements: [
      [
        {
          type: RequirementType.TEXT,
          text: 'Dois poderes de Combinação',
        },
      ],
    ],
  },
  {
    name: 'Rilhar os Dentes',
    text: 'Quando sofre dano de um ataque corpo a corpo, você pode gastar 1 PM para receber RD igual a 5 + sua Constituição contra esse dano.',
    requirements: [],
  },
  {
    name: 'Rolamento Escapatório',
    text: 'Quando falha em um teste para evitar uma condição de movimento (como o teste oposto para evitar ser agarrado), você pode gastar 2 PM para rolá-lo novamente usando Acrobacia.',
    requirements: [[{ type: RequirementType.PERICIA, name: 'Acrobacia' }]],
  },
  {
    name: 'Ruas Furiosas',
    text: 'Quando destrói um objeto empunhado por um inimigo com a manobra quebrar, você recebe uma quantidade de PV temporários igual a 1d6 x sua Constituição.',
    requirements: [],
  },
  {
    name: 'Sequência Defensiva',
    text: 'Quando acerta um ataque desarmado em uma criatura, você recebe um bônus cumulativo de +2 na Defesa contra essa criatura até o início do seu próximo turno.',
    requirements: [],
  },
];

export default LUTADOR_POWERS;
