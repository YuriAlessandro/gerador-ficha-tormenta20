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
      text: 'Você soma seu Carisma no seu total de PM. Além disso, pode gastar 1 PM para receber +2 em um teste de perícia baseada em Carisma.',
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
      text: 'Você pode lançar magias arcanas das escolas Encantamento e Ilusão de 1º círculo. A cada cinco níveis pode lançar magias de um círculo maior (2º círculo no 6º nível, 3º círculo no 10º nível e 4º círculo no 14º nível). Você começa com duas magias de 1º círculo e aprende uma nova magia a cada nível par. Seu atributo-chave para lançar magias é Inteligência.',
      nivel: 1,
    },
    evasao,
    {
      name: 'Disfarce Elaborado',
      text: 'A partir do 3º nível, você pode gastar 2 PM e uma ação completa para criar um disfarce mágico, mudando sua aparência, voz e até mesmo seu cheiro. Você recebe +10 em testes de Enganação para disfarce e pode se disfarçar de uma raça diferente (mas de tamanho similar). O disfarce dura até o fim da cena.',
      nivel: 3,
    },
    esquivaSobrenatural,
    {
      name: 'Virar a Casaca',
      text: 'No 7º nível, quando um inimigo acerta um ataque contra você, você pode gastar 3 PM como reação para tentar seduzi-lo a mudar de lado temporariamente. O alvo deve fazer um teste de Vontade (CD Car). Se falhar, fica fascinado por você até o fim da cena ou até que você ou um aliado o ataque. Enquanto fascinado, o alvo não atacará você nem seus aliados.',
      nivel: 7,
    },
    olhosNasCostas,
    evasaoAprimorada,
    {
      name: 'Provocação Ousada',
      text: 'No 11º nível, você pode gastar 3 PM e uma ação padrão para provocar todos os inimigos em alcance curto. Cada inimigo provocado deve fazer um teste de Vontade (CD Car). Se falhar, fica abalado pelo restante da cena e sofre –2 em testes de ataque contra alvos que não sejam você.',
      nivel: 11,
    },
    {
      name: 'O Grande Golpe',
      text: 'No 20º nível, você se torna um mestre da manipulação e da enganação. Uma vez por cena, você pode gastar 10 PM como uma ação completa para tentar convencer todas as criaturas inteligentes em alcance médio de algo absurdo (como que você é um aliado, que a batalha acabou ou que elas devem ir embora). Cada criatura afetada deve fazer um teste de Vontade (CD Car + 5). Se falhar, acredita em você e age de acordo por 1d4+1 rodadas.',
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
