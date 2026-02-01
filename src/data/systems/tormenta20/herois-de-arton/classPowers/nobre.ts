import { ClassPower } from '../../../../../interfaces/Class';
import { RequirementType } from '../../../../../interfaces/Poderes';
import Skill from '../../../../../interfaces/Skills';
import { Atributo } from '../../atributos';

const NOBRE_POWERS: ClassPower[] = [
  {
    name: 'Agente de Elite',
    text: 'Você recebe um agente especial, um parceiro veterano que fornece os benefícios de um parceiro a sua escolha ou um poder de outra classe, cujos pré-requisitos você cumpra (para efeitos de nível na classe desse poder, considere seu nível de nobre −4). No início de cada aventura, você pode trocar seu agente.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Título' },
        { type: RequirementType.NIVEL, value: 11 },
      ],
    ],
  },
  {
    name: 'Comandante de Campo',
    text: 'Seus capangas recebem +2 nas rolagens de dano e um bônus na Defesa igual ao seu Carisma. Além disso, quando contrata ou recebe capangas por qualquer motivo, você recebe um capanga adicional do mesmo tipo.',
    requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
  },
  {
    name: 'Comitiva',
    text: 'Seu limite de parceiros aumenta em +1. A partir do 11º nível, esse limite aumenta em +1 adicional.',
    requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
  },
  {
    name: 'Discurso de Batalha',
    text: 'Em seu primeiro turno de um combate, você pode gastar uma ação completa e fazer um teste de Diplomacia ou Intimidação. Se fizer isso, para cada 10 pontos no resultado do teste, você e seus aliados em alcance curto recebem 2 PM temporários. Esses PM temporários desaparecem no fim da cena.',
    requirements: [],
  },
  {
    name: 'Fofocas da Corte',
    text: 'Quando chega em um ambiente social (taverna, acampamento militar, praça de vila, salão de castelo etc.), você pode gastar 1 hora para se inteirar das "novidades". A critério do mestre, você recebe uma informação útil sobre os habitantes ou acontecimentos locais. Além disso, recebe 4d6 dados de auxílio. Sempre que faz um teste de perícia baseada em Carisma nesse ambiente, você pode gastar um desses dados e adicionar como um bônus no teste.',
    requirements: [
      [
        { type: RequirementType.PERICIA, name: 'Intuição' },
        { type: RequirementType.PERICIA, name: 'Investigação' },
      ],
    ],
  },
  {
    name: 'Guarda Pessoal',
    text: 'Você recebe um pelotão de infantaria veterano que atua como seu guarda-costas. No 11º nível, o pelotão se torna um parceiro mestre. Se perder seu pelotão de infantaria, você pode arregimentar outro após uma semana.',
    requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
  },
  {
    name: 'Hedonismo Aristocrático',
    text: 'Uma vez por dia, você pode gastar 1 hora e um valor a sua escolha entre T$ 100, T$ 500 e T$ 2.000 em luxos como comida, bebida e apresentações artísticas. Se tiver gastado T$ 100, você recebe 4 PM temporários por patamar, que duram até o fim do dia. Se tiver gastado T$ 500, o ganho aumenta para 5 PM por patamar e, se tiver gastado T$ 2.000, para 6 PM por patamar.',
    requirements: [],
  },
  {
    name: 'Instigar Violência',
    text: 'Uma vez por rodada por aliado, quando um aliado em alcance curto faz um acerto crítico em um inimigo, você pode gastar 3 PM para que esse aliado faça mais um ataque contra o mesmo inimigo.',
    requirements: [
      [
        { type: RequirementType.PERICIA, name: 'Guerra' },
        { type: RequirementType.NIVEL, value: 11 },
      ],
    ],
  },
  {
    name: 'Insuflar Investida',
    text: 'Quando faz uma investida, você pode gastar 1 PM por aliado a sua escolha em alcance curto. Se fizer isso, a próxima investida que cada um desses aliados fizer até o início do seu próximo turno causa +2d8 pontos de dano.',
    requirements: [[{ type: RequirementType.PODER, name: 'Estrategista' }]],
  },
  {
    name: 'Legado Mágico',
    text: 'Você recebe um item mágico menor a sua escolha, como um presente ou uma herança de família. No início de cada aventura, você pode substituir esse item por outro. A partir do 14º nível, quando substitui o item pode escolher um item mágico médio e, a partir do 17º nível, um item mágico maior.',
    requirements: [[{ type: RequirementType.NIVEL, value: 11 }]],
  },
  {
    name: 'Líder Enérgico',
    text: 'Você soma seu Carisma em Iniciativa. Além disso, se for o primeiro na iniciativa, em seu primeiro turno você pode usar uma habilidade de nobre com execução de ação de movimento ou padrão como ação livre.',
    requirements: [[{ type: RequirementType.PERICIA, name: 'Iniciativa' }]],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Líder Enérgico' },
        target: {
          type: 'ModifySkillAttribute',
          skill: Skill.INICIATIVA,
          attribute: Atributo.CARISMA,
        },
        modifier: { type: 'Attribute', attribute: Atributo.CARISMA },
      },
    ],
  },
  {
    name: 'Líder Impiedoso',
    text: 'Sempre que um aliado sob efeito da sua habilidade Gritar Ordens fizer um acerto crítico ou reduzir um inimigo para 0 PV ou menos, você recupera 1 PM.',
    requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
  },
  {
    name: 'Linhagem Distinta',
    text: 'Você descende de uma família ilustre — ou, por suas ações, tornou sua família ilustre. Seja como for, o nome de sua família o inspira a grandes feitos. Quando você usa Orgulho, o custo da habilidade diminui em –1 PM. Além disso, uma vez por cena, quando usa Orgulho, você pode gastar +5 PM. Se fizer isso, o bônus fornecido pela habilidade dobra e, ao fazer o teste de perícia afetado por ela, você rola dois dados e usa o melhor resultado.',
    requirements: [[{ type: RequirementType.NIVEL, value: 17 }]],
  },
  {
    name: 'Ordens Agressivas',
    text: 'Quando você usa Gritar Ordens, a habilidade também soma seu bônus na primeira rolagem de dano dos aliados até o início do seu próximo turno.',
    requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
  },
  {
    name: 'Ordens Encorajadoras',
    text: 'Quando você usa Gritar Ordens, a habilidade também fornece 10 PV temporários cumulativos. Esses pontos desaparecem no fim da cena.',
    requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
  },
  {
    name: 'Palavras de Efeito',
    text: 'Você soma seu Carisma no dano de sua habilidade Palavras Afiadas e a ação necessária para usá-la diminui em um passo (de completa para padrão, de padrão para movimento).',
    requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
  },
  {
    name: 'Palavras Ressonantes',
    text: 'Quando você usa Palavras Afiadas, sempre que rolar o resultado máximo ou um ponto abaixo do máximo em um dado da habilidade (por exemplo, um 5 ou 6 ao rolar 1d6), role um dado extra.',
    requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
  },
  {
    name: 'Protocolo Impecável',
    text: 'Quando chega em um ambiente social, você pode gastar 2 PM e fazer um teste de Nobreza (CD 20). Se passar, porta-se da maneira ideal para a situação, o que melhora a atitude de todas as criaturas em relação a você em uma categoria. Se passar por 10 ou mais, a critério do mestre você pode receber possibilidades de interação que normalmente não teria — por exemplo, ao chegar em um acampamento militar ou castelo, pode ser convidado para falar com o general ou o nobre comandante.',
    requirements: [
      [
        { type: RequirementType.PERICIA, name: 'Nobreza' },
        { type: RequirementType.PODER, name: 'Jogo da Corte' },
      ],
    ],
  },
  {
    name: 'Senescal',
    text: 'Você recebe +1 por patamar em testes de perícia para resolver ações de base, domínio ou negócio e, uma vez por turno dessas estruturas, pode executar uma ação de estrutura adicional.',
    requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
  },
  {
    name: 'Voz Límpida',
    text: 'Quando você usa uma habilidade de nobre que afete um ou mais aliados, o custo dessa habilidade diminui em –1 PM (isso não reduz efeitos baseados no custo em PM pago).',
    requirements: [],
  },
];

export default NOBRE_POWERS;
