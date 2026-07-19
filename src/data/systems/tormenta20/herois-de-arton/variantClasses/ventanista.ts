import { VariantClassOverrides } from '../../../../../interfaces/Class';
import Skill from '../../../../../interfaces/Skills';
import { Atributo } from '../../atributos';
import LADINO from '../../classes/ladino';

const evasao = LADINO.abilities.find((a) => a.name === 'Evasão')!;
const esquivaSobrenatural = LADINO.abilities.find(
  (a) => a.name === 'Esquiva Sobrenatural'
)!;
const olhosNasCostas = LADINO.abilities.find(
  (a) => a.name === 'Olhos nas Costas'
)!;
const evasaoAprimorada = LADINO.abilities.find(
  (a) => a.name === 'Evasão Aprimorada'
)!;

const VENTANISTA: VariantClassOverrides = {
  name: 'Ventanista',
  isVariant: true,
  baseClassName: 'Ladino',
  periciasrestantes: {
    qtd: 8,
    list: [
      Skill.ACROBACIA,
      Skill.ATLETISMO,
      Skill.ATUACAO,
      Skill.CAVALGAR,
      Skill.CONHECIMENTO,
      Skill.DIPLOMACIA,
      Skill.ENGANACAO,
      Skill.FURTIVIDADE,
      Skill.INICIATIVA,
      Skill.INTIMIDACAO,
      Skill.INTUICAO,
      Skill.INVESTIGACAO,
      Skill.JOGATINA,
      Skill.NOBREZA,
      Skill.OFICIO,
      Skill.PERCEPCAO,
      Skill.PILOTAGEM,
    ],
  },
  abilities: [
    {
      name: 'Charme',
      text: 'Você soma seu Carisma em seu total de PM. Quando faz um teste de perícia (exceto testes de ataque), você pode gastar uma quantidade de PM a sua escolha (limitada pelo seu Carisma). Para cada PM que gastar, recebe +2 no teste.',
      nivel: 1,
      sheetBonuses: [
        {
          source: {
            type: 'power',
            name: 'Charme',
          },
          target: {
            type: 'PM',
          },
          modifier: {
            type: 'Attribute',
            attribute: Atributo.CARISMA,
          },
        },
      ],
    },
    {
      name: 'Truques do Ofício',
      text: 'Você pode lançar magias arcanas de 1º círculo, mas apenas de encantamento e ilusão. Esta não é uma habilidade mágica e provém da sua capacidade de enganar outras pessoas (veja "Magias Simuladas"). À medida que sobe de nível, pode lançar magias de círculos maiores (2º círculo no 6º nível, 3º círculo no 10º nível e 4º círculo no 14º nível). Você começa com duas magias de 1º círculo. A cada nível par (2º, 4º etc.), aprende uma magia de qualquer círculo que possa lançar. Você pode lançar essas magias vestindo armaduras leves sem precisar de testes de Misticismo. Seu atributo-chave para lançar magias é Inteligência.',
      nivel: 1,
    },
    evasao,
    {
      name: 'Disfarce Elaborado',
      text: 'No 3º nível, você aprende a simular habilidades práticas úteis para seus disfarces. Sempre que fizer um teste de Enganação para disfarce, você pode escolher um poder (exceto poderes da Tormenta) cujos pré-requisitos cumpra e que esteja relacionado a esse disfarce. Enquanto estiver disfarçado dessa forma, você sofre uma penalidade de –3 PM e pode usar o poder escolhido. A cada seis níveis, você pode assumir uma penalidade adicional de –3 PM ao se disfarçar para escolher um poder adicional (2 poderes no 9º nível e 3 poderes no 15º nível).',
      nivel: 3,
    },
    esquivaSobrenatural,
    {
      name: 'Virar a Casaca',
      text: 'No 7º nível, se estiver disfarçado, você pode gastar 1 PM para remover seu disfarce. Quando faz isso, você pode fazer um teste de esconder-se usando Enganação no lugar de Furtividade, mesmo sem camuflagem ou cobertura disponível.',
      nivel: 7,
    },
    olhosNasCostas,
    evasaoAprimorada,
    {
      name: 'Provocação Ousada',
      text: 'A partir do 11º nível, em seu primeiro turno em cada cena, você pode gastar uma ação completa para provocar seus inimigos. Você pode deixar um cartão de visitas visível, declarar seu plano ou fazer outra ação que alerte seus inimigos de sua presença e de suas intenções. Até o fim da cena, seus inimigos recebem +2 em testes de Percepção, Sobrevivência e Vontade contra você. Entretanto, no início de seus turnos você recupera 2 PM. Esta habilidade só tem efeito se houver um risco associado a declarar suas ações (a critério do mestre) e recupera um máximo de PM por cena igual ao seu nível.',
      nivel: 11,
    },
    {
      name: 'O Grande Golpe',
      text: 'No 20º nível, no início de cada aventura, você pode escolher uma quantidade de magias, arcanas ou divinas, igual à sua Inteligência (você pode escolher a mesma magia mais de uma vez). Para cada escolha feita, defina um tipo de cena entre ação, exploração e interpretação. Até o fim da aventura, para cada vez que uma magia foi escolhida, se estiver em uma cena do tipo definido para ela, você pode lançá-la sem gastar PM (limite de PM 20, atributo-chave Inteligência). Esta não é uma habilidade mágica e provém da sua capacidade de enganar outras pessoas (veja "Magias Simuladas").',
      nivel: 20,
    },
  ],
  spellPath: {
    initialSpells: 2,
    spellType: 'Arcane',
    schools: ['Encan', 'Ilusão'],
    qtySpellsLearnAtLevel: (level: number) => (level % 2 === 0 ? 1 : 0),
    spellCircleAvailableAtLevel: (level: number) => {
      if (level < 6) return 1;
      if (level < 10) return 2;
      if (level < 14) return 3;
      return 4;
    },
    keyAttribute: Atributo.INTELIGENCIA,
  },
  attrPriority: [Atributo.CARISMA, Atributo.INTELIGENCIA],
};

export default VENTANISTA;
