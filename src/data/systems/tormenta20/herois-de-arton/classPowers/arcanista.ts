import { ClassPower } from '../../../../../interfaces/Class';
import { RequirementType } from '../../../../../interfaces/Poderes';
import Skill from '../../../../../interfaces/Skills';
import { Atributo } from '../../atributos';

/**
 * Poderes de Arcanista do suplemento Heróis de Arton
 */
const ARCANISTA_POWERS: ClassPower[] = [
  {
    name: 'Agrilhoar os Caídos',
    text: 'Quando uma de suas magias de necromancia reduz os PV de um inimigo vivo a 0 ou menos, você pode aprisionar uma parte de seu espírito, que então fica flutuando ao seu redor. Para cada espírito, você recebe +2 na Defesa e em testes de resistência. Quando lança uma magia de dano, você pode libertar um espírito para causar +2d6 pontos de dano de trevas. Você pode acumular um máximo de espíritos simultâneos igual ao seu atributo-chave e eles permanecem ao seu redor até serem libertados ou até o fim do dia.',
    requirements: [[{ type: RequirementType.NIVEL, value: 3 }]],
  },
  {
    name: 'Alquimia Arcana',
    text: 'A CD para resistir aos preparados alquímicos e poções que você usa aumenta em +1 para cada círculo de magia a que você tiver acesso.',
    requirements: [
      [{ type: RequirementType.PERICIA, name: Skill.OFICIO_ALQUIMIA }],
    ],
  },
  {
    name: 'Apoteose Celestial',
    text: 'Sua conexão com o divino se torna ainda mais profunda, às custas de uma fração de sua mortalidade. Você recebe +1 em Sabedoria e aprende uma magia divina de cada círculo a que tenha acesso. Entretanto, sua Constituição diminui em –1.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Herança Superior' },
        { type: RequirementType.NIVEL, value: 17 },
        { type: RequirementType.TEXT, text: 'Linhagem celestial' },
      ],
    ],
  },
  {
    name: 'Apoteose Dracônica',
    text: 'A influência de sua magia dracônica se torna cada vez mais evidente, tornando-o mais e mais próximo dos dragões. As magias do seu elemento escolhido causam +1 ponto de dano por dado e, contra criaturas imunes a esse elemento, ainda causam metade do dano. Contudo, você não pode mais lançar magias do tipo oposto ao seu elemento escolhido (fogo para frio e ácido para eletricidade).',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Herança Superior' },
        { type: RequirementType.NIVEL, value: 17 },
        { type: RequirementType.TEXT, text: 'Linhagem dracônica' },
      ],
    ],
  },
  {
    name: 'Apoteose Feérica',
    text: 'Sua natureza feérica se acentua, mas isso o afasta do mundo dos mortais. Sempre que um ou mais inimigos falharem em um teste de Vontade contra uma de suas magias, você recebe 1 PM temporário cumulativo que dura até o fim da cena. Se a magia é de encantamento ou ilusão, em vez disso você recebe 2 PM temporários. Em ambos os casos, o ganho é limitado pelo total de PM gasto na magia. Contudo, você não pode mais lançar magias de convocação e necromancia.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Herança Superior' },
        { type: RequirementType.NIVEL, value: 17 },
        { type: RequirementType.TEXT, text: 'Linhagem feérica' },
      ],
    ],
  },
  {
    name: 'Apoteose Rubra',
    text: 'Você acolheu a corrupção rubra em seu ser — uma escolha que pode ser percebida por todos ao redor. Escolha uma magia que cause dano de cada círculo a que tem acesso. O tipo de dano dessas magias muda para psíquico. Além disso, quando lança uma magia de dano psíquico, você soma seu total de poderes da Tormenta na rolagem de dano. Este poder conta como um poder da Tormenta (exceto para perda de Carisma).',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Herança Superior' },
        { type: RequirementType.NIVEL, value: 17 },
        { type: RequirementType.TEXT, text: 'Linhagem rubra' },
      ],
    ],
  },
  {
    name: 'Arcanista de Linha de Frente',
    text: 'Quando você lança uma magia, criaturas adjacentes sofrem –2 em seus testes de resistência contra ela e, se ela causar dano, causa um dado extra do mesmo tipo.',
    requirements: [],
  },
  {
    name: 'Asas de Sapo',
    text: 'Você pode empunhar dois catalisadores diferentes em uma mão ao mesmo tempo e, quando lança uma magia, pode gastar ambos para aplicar seus efeitos.',
    requirements: [
      [{ type: RequirementType.PERICIA, name: Skill.OFICIO_ALQUIMIA }],
    ],
  },
  {
    name: 'Contingência Arcana',
    text: 'Quando lança Runa de Proteção com o aprimoramento que muda o alvo para "você", você pode substituir o componente material da magia por uma penalidade em PM igual ao círculo da magia inscrita na runa.',
    requirements: [[{ type: RequirementType.MAGIA, name: 'Runa de Proteção' }]],
  },
  {
    name: 'Contramágica Superior',
    text: 'Quando anula uma magia com uma contramágica, você recebe uma quantidade de PM temporários igual ao círculo da magia anulada (limitada pelos PM que gastou para anular).',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Contramágica Aprimorada' },
        { type: RequirementType.NIVEL, value: 9 },
      ],
    ],
  },
  {
    name: 'Especialista em Invocações',
    text: 'Você soma seu atributo-chave na Defesa de suas criaturas conjuradas por habilidades mágicas (incluindo capangas) e a ação necessária para comandá-las diminui em um passo (de padrão para movimento e de movimento para livre). Contudo, cada comando só pode ser executado uma vez por rodada.',
    requirements: [],
  },
  {
    name: 'Familiar Aprimorado',
    text: 'Seu familiar pode falar e passa a fornecer um segundo benefício, escolhido entre os tipos comuns de familiares.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Familiar' },
        { type: RequirementType.NIVEL, value: 5 },
      ],
    ],
  },
  {
    name: 'Ingrediente Especial',
    text: 'Quando usa uma poção, você pode usar um catalisador e aplicar seus efeitos a ela.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Caldeirão do Bruxo' },
        { type: RequirementType.NIVEL, value: 5 },
      ],
    ],
  },
  {
    name: 'Magia Performática',
    text: 'Quando lança uma magia diante de uma ou mais criaturas inteligentes (Int –3 ou mais), você pode fazer um teste de Atuação (CD 20 + custo em PM da magia) para lançá-la de forma impressionante. Se você passar, a CD da magia aumenta em +1. Esse bônus aumenta em +1 para cada 10 pontos pelos quais o teste passar da CD. Se falhar, a magia não funciona.',
    requirements: [
      [
        { type: RequirementType.ATRIBUTO, name: Atributo.CARISMA, value: 1 },
        { type: RequirementType.PERICIA, name: Skill.ATUACAO },
      ],
    ],
  },
  {
    name: 'Memória Súbita',
    text: 'Escolha uma de suas magias que não esteja memorizada. Você pode gastar uma ação de movimento para memorizar essa magia até o fim da cena. Se fizer isso, uma de suas outras magias memorizadas, a sua escolha, deixa de estar memorizada.',
    requirements: [[{ type: RequirementType.TIPO_ARCANISTA, name: 'Mago' }]],
  },
  {
    name: 'O Próprio Sangue',
    text: 'Se você aprender novamente como feiticeiro uma magia que já possa lançar por uma habilidade qualquer (como uma habilidade de raça ou um poder concedido), a CD para resistir a ela aumenta em +2.',
    requirements: [
      [{ type: RequirementType.TIPO_ARCANISTA, name: 'Feiticeiro' }],
    ],
  },
  {
    name: 'Raio Dividido',
    text: 'Você pode usar Raio Arcano como uma ação completa, em vez de padrão. Se fizer isso, ele afeta um número de alvos igual ao seu atributo-chave.',
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Raio Arcano' },
        { type: RequirementType.NIVEL, value: 5 },
      ],
    ],
  },
  {
    name: 'Sifão de Mana',
    text: 'Quando você lança uma magia e pelo menos um inimigo falha no teste de resistência contra ela, você recupera uma quantidade de pontos de mana igual ao círculo da magia (limitada pelo total de PM gastos nela).',
    requirements: [[{ type: RequirementType.NIVEL, value: 17 }]],
  },
  {
    name: 'Trama Célere',
    text: 'Uma vez por rodada, quando usa uma ação padrão para lançar uma magia, você pode gastar 2 PM para fazer uma conjuração dupla. Isso permite que você lance uma segunda magia de 1º círculo como ação livre, pagando seu custo em PM como normal.',
    requirements: [[{ type: RequirementType.NIVEL, value: 9 }]],
  },
  {
    name: 'Transliteração Impossível',
    text: 'Quando usa um pergaminho de uma magia que conheça, você recebe +2 PM para gastar em aprimoramentos e a magia não pode ser anulada por contramágica.',
    requirements: [[{ type: RequirementType.PODER, name: 'Escriba Arcano' }]],
  },
];

export default ARCANISTA_POWERS;
