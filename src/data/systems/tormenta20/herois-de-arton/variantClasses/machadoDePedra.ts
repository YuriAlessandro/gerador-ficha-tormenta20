import { VariantClassOverrides } from '../../../../../interfaces/Class';
import Skill from '../../../../../interfaces/Skills';
import BARBARO from '../../classes/barbaro';
import PROFICIENCIAS from '../../proficiencias';

const furia = BARBARO.abilities.find((a) => a.name === 'Furia')!;
const instintoSelvagem = BARBARO.abilities.find(
  (a) => a.name === 'Instinto Selvagem'
)!;

const MACHADO_DE_PEDRA: VariantClassOverrides = {
  name: 'Machado de Pedra',
  isVariant: true,
  baseClassName: 'Bárbaro',
  periciasrestantes: {
    qtd: 2,
    list: [
      Skill.ADESTRAMENTO,
      Skill.ATLETISMO,
      Skill.CAVALGAR,
      Skill.INICIATIVA,
      Skill.INTIMIDACAO,
      Skill.OFICIO,
      Skill.PERCEPCAO,
      Skill.PONTARIA,
      Skill.SOBREVIVENCIA,
      Skill.VONTADE,
    ],
  },
  proficiencias: [PROFICIENCIAS.ESCUDOS],
  abilities: [
    furia,
    {
      name: 'Machado de Pedra',
      text: 'Você não recebe proficiência com armas simples. Você sabe usar apenas adaga, azagaia, clava, funda, lança, machadinha e tacape. No 9º nível, aprende a usar uma arma simples ou marcial a sua escolha. Entretanto, quando ataca com uma arma natural, um ataque desarmado ou uma dessas armas, você recebe +1 no teste de ataque e na rolagem de dano.',
      nivel: 1,
    },
    {
      name: 'Tanga de Peles',
      text: 'Você não recebe proficiência com armaduras leves. Entretanto, se não estiver usando armadura, você soma sua Constituição na Defesa. Além disso, no 3º nível, e a cada quatro níveis seguintes, você recebe +1 na Defesa.',
      nivel: 1,
    },
    {
      name: 'Fúria Primitiva',
      text: 'A partir do 2º nível, se não estiver usando armadura e estiver empunhando uma das armas de sua habilidade Machado de Pedra, o custo de sua Fúria é reduzido em –1 PM. Além disso, uma vez por cena, quando entra em fúria, você recebe uma quantidade de PV temporários igual ao seu nível + sua Constituição.',
      nivel: 2,
    },
    instintoSelvagem,
    {
      name: 'Resiliência Primal',
      text: 'A partir do 5º nível, graças a seu vigor e força de vontade, você ignora parte de seus ferimentos. Você recebe redução de dano 3. A cada três níveis, sua RD aumenta em 3, até um máximo de RD 15 no 17º nível.',
      nivel: 5,
    },
    {
      name: 'Fúria Rústica',
      text: 'No 20º nível, quando entra em fúria, você pode gastar 5 PM. Se fizer isso, durante a fúria você recebe Cura Acelerada 10 (cumulativo com outras Curas Aceleradas) e, quando faz a ação agredir, pode fazer um ataque desarmado adicional.',
      nivel: 20,
    },
  ],
};

export default MACHADO_DE_PEDRA;
