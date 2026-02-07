import { VariantClassOverrides } from '../../../../../interfaces/Class';
import Skill from '../../../../../interfaces/Skills';
import { Atributo } from '../../atributos';
import DRUIDA from '../../classes/druida';

const devotoFiel = DRUIDA.abilities.find((a) => a.name === 'Devoto Fiel')!;
const magias = DRUIDA.abilities.find((a) => a.name === 'Magias')!;

const ERMITAO: VariantClassOverrides = {
  name: 'Ermitão',
  isVariant: true,
  baseClassName: 'Druida',
  pv: 12,
  addpv: 3,
  periciasrestantes: {
    qtd: 2,
    list: [
      Skill.ADESTRAMENTO,
      Skill.ATLETISMO,
      Skill.CAVALGAR,
      Skill.CONHECIMENTO,
      Skill.CURA,
      Skill.FORTITUDE,
      Skill.INICIATIVA,
      Skill.INTUICAO,
      Skill.LUTA,
      Skill.MISTICISMO,
      Skill.OFICIO,
      Skill.PERCEPCAO,
      Skill.RELIGIAO,
    ],
  },
  proficiencias: [],
  abilities: [
    devotoFiel,
    {
      name: 'Empatia Selvagem',
      text: 'Você pode se comunicar com animais por meio de linguagem corporal e vocalizações. Você pode usar Adestramento com animais para mudar atitude e persuasão. Você também pode se comunicar com criaturas vegetais não inteligentes (Int –4 ou –5) e espíritos.',
      nivel: 1,
    },
    magias,
    {
      name: 'Sítio Sagrado',
      text: 'No 3º nível, você assume um local sagrado para sua divindade. Esse local contém dois tipos de terreno, e você pode realizar rituais especiais nele.',
      nivel: 3,
    },
    {
      name: 'Vínculo com a Terra',
      text: 'No 5º nível, quando você estiver em um terreno de um dos tipos de seu sítio sagrado, suas magias custam –1 PM (cumulativo com outras reduções).',
      nivel: 5,
    },
    {
      name: 'Temperado pelo Clima',
      text: 'No 11º nível, você recebe RD 5 contra dano dos tipos correspondentes aos terrenos associados ao seu sítio sagrado: aquático (eletricidade), ártico (frio), colina (impacto), deserto (fogo), floresta (corte), montanha (perfuração), pântano (ácido), planície (luz) e subterrâneo (trevas).',
      nivel: 11,
    },
    {
      name: 'Eixo de Pedras',
      text: 'No 20º nível, você cria um eixo de pedras ritualísticas em seu sítio sagrado. Uma vez por aventura, você pode lançar no eixo de pedras uma quantidade de magias cujo custo em PM total somado seja igual ao seu nível + sua Sabedoria. Essas magias devem ter execução de movimento, padrão ou completa. Até o fim da aventura, se estiver em um terreno de um dos tipos associados ao seu sítio sagrado, uma vez por rodada você pode descarregar uma dessas magias como ação livre sem pagar seu custo.',
      nivel: 20,
    },
  ],
  excludedPowers: [
    'Forma Selvagem',
    'Forma Selvagem Aprimorada',
    'Forma Selvagem Superior',
    'Forma Primal',
    'Magia Natural',
    'Presas Afiadas',
  ],
  attrPriority: [Atributo.SABEDORIA],
};

export default ERMITAO;
