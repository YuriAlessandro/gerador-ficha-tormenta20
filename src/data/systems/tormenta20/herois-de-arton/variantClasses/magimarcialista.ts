import { VariantClassOverrides } from '../../../../../interfaces/Class';
import Skill from '../../../../../interfaces/Skills';
import BARDO from '../../classes/bardo';

const magias = BARDO.abilities.find((a) => a.name === 'Magias')!;

const MAGIMARCIALISTA: VariantClassOverrides = {
  name: 'Magimarcialista',
  isVariant: true,
  baseClassName: 'Bardo',
  pv: 16,
  addpv: 4,
  periciasbasicas: [
    {
      type: 'and',
      list: [Skill.ATUACAO, Skill.LUTA],
    },
  ],
  periciasrestantes: {
    qtd: 6,
    list: [
      Skill.ACROBACIA,
      Skill.ATLETISMO,
      Skill.CAVALGAR,
      Skill.CONHECIMENTO,
      Skill.DIPLOMACIA,
      Skill.ENGANACAO,
      Skill.FORTITUDE,
      Skill.GUERRA,
      Skill.INICIATIVA,
      Skill.JOGATINA,
      Skill.MISTICISMO,
      Skill.REFLEXOS,
    ],
  },
  abilities: [
    {
      name: 'Cadência Magimarcial',
      text: 'Sempre que lança uma magia de bardo você recebe uma carga arcana e, sempre que faz a ação agredir, recebe uma carga marcial. Você pode acumular um máximo de cargas de cada tipo igual ao seu Carisma e elas duram até o fim da cena.',
      nivel: 1,
    },
    magias,
    {
      name: 'Magificação',
      text: 'Se tiver pelo menos 1 carga arcana e 1 carga marcial, você recebe +2 em testes de ataque e rolagens de dano e é considerado sob Inspiração para efeitos baseados nisso. A cada cinco níveis, esses bônus aumentam em +1.',
      nivel: 1,
    },
    {
      name: 'Bravado Magimarcial',
      text: 'No 2º nível, quando lança uma magia, você pode gastar 1 carga marcial para reduzir seu custo em –1 PM (cumulativo com outras reduções) e, quando faz um ataque, pode gastar 1 carga arcana para receber +1d6 na rolagem de dano.',
      nivel: 2,
    },
    {
      name: 'Dança Defensiva',
      text: 'No 3º nível, quando faz um teste de resistência, você pode gastar 1 carga marcial para receber +5 nesse teste e, quando sofre dano, pode gastar 1 carga arcana para receber redução de dano 10 contra esse dano.',
      nivel: 3,
    },
    {
      name: 'Arte Sublime',
      text: 'A partir do 7º nível, quando usa Bravado Magimarcial ou Dança Defensiva, você pode gastar uma carga adicional do tipo exigido para dobrar seu efeito.',
      nivel: 7,
    },
    {
      name: 'Crescendo Vitorioso',
      text: 'No 20º nível, no início de cada combate, você recebe 1 carga arcana e 1 carga marcial. Além disso, você soma seu total de cargas marciais na CD para resistir às suas habilidades de bardo e o total de suas cargas arcanas em seus testes de ataque e rolagens de dano.',
      nivel: 20,
    },
  ],
};

export default MAGIMARCIALISTA;
