import { ClassPower } from '../../../../../interfaces/Class';
import { RequirementType } from '../../../../../interfaces/Poderes';
import Skill from '../../../../../interfaces/Skills';
import { Atributo } from '../../atributos';

/**
 * Poderes de Guerreiro do suplemento Heróis de Arton
 */
const GUERREIRO_POWERS: ClassPower[] = [
  {
    name: 'Análise Tática',
    text: 'Você recebe +2 em Guerra e pode fazer testes dessa perícia para identificar criatura contra humanoides (veja Misticismo em Tormenta20, p. 121).',
    requirements: [[{ type: RequirementType.PERICIA, name: Skill.GUERRA }]],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Análise Tática' },
        target: { type: 'Skill', name: Skill.GUERRA },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  {
    name: 'Arremesso de Investida',
    text: 'Quando faz uma investida, você pode gastar 1 PM para realizar um ataque à distância adicional com uma arma de arremesso contra o alvo da investida.',
    requirements: [],
  },
  {
    name: 'Bloqueio Brutal',
    text: 'Uma vez por rodada, quando é atingido por um ataque, você pode gastar 2 PM para fazer uma rolagem de dano corpo a corpo e subtrair o resultado dessa rolagem do dano causado pelo ataque.',
    requirements: [
      [{ type: RequirementType.ATRIBUTO, name: Atributo.FORCA, value: 5 }],
    ],
  },
  {
    name: 'Corte Ágil',
    text: 'Uma vez por rodada, quando faz um ataque com uma arma ágil ou leve, você pode gastar 1 PM para se mover até metade do seu deslocamento antes ou depois de fazer o ataque. Esse movimento não ativa reações dos inimigos (como de Ataque Reflexo).',
    requirements: [
      [{ type: RequirementType.ATRIBUTO, name: Atributo.DESTREZA, value: 1 }],
    ],
  },
  {
    name: 'Criar Oportunidade',
    text: 'Quando você ou um aliado em alcance curto atacar uma criatura sob efeito do seu Xadrez de Batalha, você pode gastar 1 PM para que esse ataque cause +1d10 pontos de dano.',
    requirements: [
      [{ type: RequirementType.PODER, name: 'Xadrez de Batalha' }],
    ],
  },
  {
    name: 'Defesa Estratégica',
    text: 'Você soma sua Inteligência na Defesa, limitada pelo seu nível.',
    requirements: [
      [
        {
          type: RequirementType.ATRIBUTO,
          name: Atributo.INTELIGENCIA,
          value: 1,
        },
      ],
    ],
  },
  {
    name: 'Determinação Inabalável',
    text: 'Enquanto estiver com metade dos seus pontos de vida ou menos, você recebe +2 em testes de resistência e o custo de sua habilidade Durão diminui em –1 PM.',
    requirements: [[{ type: RequirementType.NIVEL, value: 11 }]],
  },
  {
    name: 'Estrategista Inspirador',
    text: 'Em seu primeiro turno de um combate, você pode gastar uma ação padrão e fazer um teste de Guerra. Se fizer isso, para cada 10 pontos no resultado do teste, você e seus aliados em alcance curto recebem 1 PM temporário. Esses PM temporários desaparecem no fim da cena.',
    requirements: [[{ type: RequirementType.PERICIA, name: Skill.GUERRA }]],
  },
  {
    name: 'Executor',
    text: 'Você recebe +1d6 nas rolagens de dano contra criaturas que estejam com menos da metade dos pontos de vida. A cada quatro níveis além do 1º, esse dano extra aumenta em um passo.',
    requirements: [],
  },
  {
    name: 'Fender Defesas',
    text: 'Quando você acerta um ataque usando Ataque Especial, a criatura sofre uma penalidade na Defesa igual ao total de PM gastos nessa habilidade por 1 rodada.',
    requirements: [],
  },
  {
    name: 'Inércia do Aço',
    text: 'Quando acerta um ataque com uma arma de duas mãos em uma criatura, você pode gastar 3 PM para causar metade do dano desse ataque a cada inimigo adjacente a essa criatura.',
    requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
  },
  {
    name: 'Investida Ricochete',
    text: 'Uma vez por rodada, quando faz uma investida e acerta o ataque, você pode gastar 2 PM para atacar outra criatura que você consiga alcançar como parte dessa investida.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Bater e Correr' },
        { type: RequirementType.NIVEL, value: 5 },
      ],
    ],
  },
  {
    name: 'Manobra Dupla',
    text: 'Uma vez por rodada, quando faz uma manobra de combate usando uma arma versátil, você pode pagar 1 PM para executar uma manobra diferente extra.',
    requirements: [],
  },
  {
    name: 'Mente Disciplinada',
    text: 'Sempre que você é afetado por uma habilidade de um aliado que fornece um bônus numérico em testes de perícia, rolagens de dano ou na Defesa, para você esse bônus aumenta em +1.',
    requirements: [[{ type: RequirementType.NIVEL, value: 6 }]],
  },
  {
    name: 'Operações Combinadas',
    text: 'Quando usa Ordens de Engajamento, você pode gastar +3 PM. Se fizer isso, pode atacar junto do aliado e, se um de vocês usar habilidades com custo em PM que forneçam bônus a esse ataque ou a seu dano, o outro também é afetado (apenas se isso for aplicável ao ataque).',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Ordens de Engajamento' },
        { type: RequirementType.NIVEL, value: 14 },
      ],
    ],
  },
  {
    name: 'Ordens de Engajamento',
    text: 'Uma vez por rodada, quando acerta um ataque em uma criatura sob efeito do seu Xadrez de Batalha, você pode gastar 2 PM para que um aliado em alcance curto possa fazer um ataque contra essa criatura.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Criar Oportunidade' },
        { type: RequirementType.NIVEL, value: 11 },
      ],
    ],
  },
  {
    name: 'Recuperar Fôlego',
    text: 'Uma vez por cena, se estiver com 0 PM, você pode gastar uma ação de movimento para recuperar 1d8 PM.',
    requirements: [],
  },
  {
    name: 'Resiliência Marcial',
    text: 'Sempre que sofrer dano letal, você recebe redução de dano 1 cumulativa (limitada pelo seu nível). Esse efeito dura até o fim da cena ou até você recuperar pontos de vida de qualquer forma.',
    requirements: [[{ type: RequirementType.NIVEL, value: 4 }]],
  },
  {
    name: 'Soldado de Infantaria',
    text: 'Você recebe +3m em seu deslocamento e seu limite de carga aumenta em 6 espaços.',
    requirements: [],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Soldado de Infantaria' },
        target: { type: 'Displacement' },
        modifier: { type: 'Fixed', value: 3 },
      },
      {
        source: { type: 'power', name: 'Soldado de Infantaria' },
        target: { type: 'MaxSpaces' },
        modifier: { type: 'Fixed', value: 6 },
      },
    ],
  },
  {
    name: 'Velho de Guerra',
    text: 'Seus olhos já viram muito e você não se abala facilmente. Você recebe +5 em Intimidação e imunidade a medo. Além disso, uma vez por cena pode gastar 5 PM para evitar completamente um efeito qualquer (ataque, magia etc.) usado contra você por outra criatura. Se o efeito for de área ou tiver outros alvos, continua funcionando normalmente contra eles.',
    requirements: [[{ type: RequirementType.NIVEL, value: 17 }]],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Velho de Guerra' },
        target: { type: 'Skill', name: Skill.INTIMIDACAO },
        modifier: { type: 'Fixed', value: 5 },
      },
    ],
  },
  {
    name: 'Xadrez de Batalha',
    text: 'Você pode gastar uma ação de movimento e 1 PM para analisar um oponente em alcance curto. Se fizer isso, você recebe +2 na Defesa e em testes de Reflexos contra essa criatura até o fim da cena. Esse bônus aumenta em +1 para cada outro poder que você possua que tenha Xadrez de Batalha como pré-requisito.',
    requirements: [[{ type: RequirementType.PERICIA, name: Skill.GUERRA }]],
  },
];

export default GUERREIRO_POWERS;
