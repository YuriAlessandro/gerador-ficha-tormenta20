import { VariantClassOverrides } from '../../../../../interfaces/Class';
import Skill from '../../../../../interfaces/Skills';
import { Atributo } from '../../atributos';
import { spellsCircle1 } from '../../magias/generalSpells';
import PROFICIENCIAS from '../../proficiencias';

const BURGUES: VariantClassOverrides = {
  name: 'Burguês',
  isVariant: true,
  baseClassName: 'Nobre',
  pv: 12,
  addpv: 3,
  periciasbasicas: [
    {
      type: 'and',
      list: [Skill.DIPLOMACIA, Skill.VONTADE],
    },
  ],
  periciasrestantes: {
    qtd: 6,
    list: [
      Skill.ADESTRAMENTO,
      Skill.ATUACAO,
      Skill.CAVALGAR,
      Skill.CONHECIMENTO,
      Skill.DIPLOMACIA,
      Skill.ENGANACAO,
      Skill.FORTITUDE,
      Skill.GUERRA,
      Skill.INICIATIVA,
      Skill.INTIMIDACAO,
      Skill.INTUICAO,
      Skill.INVESTIGACAO,
      Skill.JOGATINA,
      Skill.LUTA,
      Skill.NOBREZA,
      Skill.OFICIO,
      Skill.PERCEPCAO,
      Skill.PONTARIA,
    ],
  },
  proficiencias: [PROFICIENCIAS.LEVES, PROFICIENCIAS.SIMPLES],
  abilities: [
    {
      name: 'Meios de Produção',
      text: 'No início de cada aventura, você recebe T$ 100 em dinheiro, itens mundanos ou poções a sua escolha. Esse valor aumenta para T$ 300 no patamar veterano, T$ 600 no campeão e T$ 1.000 no lenda.',
      nivel: 1,
    },
    {
      name: 'Negociante Nato',
      text: 'No 3º nível, quando chega em uma nova comunidade, você pode gastar 1 dia fazendo contatos com o comércio local para fazer um teste de Diplomacia (CD 20). Se passar, pode vender itens nessa comunidade por 60% do seu preço (em vez de 50%). Para cada 10 pontos pelos quais o resultado do teste exceder a CD, você aumenta o preço de venda em +10% (até o máximo de 100%). Esta habilidade não se acumula com barganha, e NPCs ainda estão limitados a comprar somente o que desejam, com o dinheiro que possuem.',
      nivel: 3,
    },
    {
      name: 'Suborno',
      text: 'No 4º nível, você aprende e pode lançar Enfeitiçar (atributo-chave Carisma). Esta não é uma habilidade mágica e provém de sua capacidade de instigar os outros com promessas de enriquecimento. A CD para resistir a essa magia aumenta em +2 se você tiver consumido pelo menos 1 tibar de ouro para pagar seu custo.',
      nivel: 4,
      sheetActions: [
        {
          source: { type: 'class', className: 'Burguês' },
          action: {
            type: 'learnSpell',
            availableSpells: [spellsCircle1.enfeiticar],
            pick: 1,
            customAttribute: Atributo.CARISMA,
          },
        },
      ],
    },
    {
      name: 'Ostentação',
      text: 'A partir do 5º nível, você pode se beneficiar de um item vestido adicional. Além disso, a CD para resistir às suas habilidades de burguês aumenta em +1 se você possuir um item banhado a ouro, cravejado de gemas ou de mitral. Esse aumento é cumulativo; possuir três itens diferentes com as três modificações aumenta a CD em +3.',
      nivel: 5,
    },
    {
      name: 'Novo Rico',
      text: 'No 9º nível, para cada item mágico que você estiver vestindo, você recebe +1 PM por nível de poder do item (somente após 1 dia de uso).',
      nivel: 9,
    },
    {
      name: 'Magnata',
      text: 'No 20º nível, quando você usa Desmoralizar, a penalidade em testes de ataque também se aplica à CD das habilidades das criaturas afetadas. Além disso, sempre que consome um tibar de ouro para pagar o custo em PM de uma habilidade, você recebe 10 PV temporários cumulativos, que duram até o fim da cena.',
      nivel: 20,
    },
  ],
};

export default BURGUES;
