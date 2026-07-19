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
      // O quadro "O Sítio Sagrado" do livro foi incorporado ao texto porque não
      // há suporte a quadros auxiliares nas habilidades de classe.
      name: 'Sítio Sagrado',
      text: 'No 3º nível, você assume um local sagrado para sua divindade. Uma área erma com 5 km de raio, o sítio sagrado é um refúgio para o ermitão e fornece diversas habilidades a ele, algumas das quais o acompanham para além das fronteiras deste local. Caso o sítio sagrado seja destruído, você perde todos os seus PM e só pode recuperá-los ao criar um novo sítio. Fazer isso ocupa um tempo entre aventuras. • Aliados da Natureza. Dentro do sítio, criaturas não inteligentes (Int –4 ou –5) têm atitude melhor com você, conforme seu tipo: no 7º nível, animais são amistosos e espíritos e monstros, indiferentes. No 15º nível suas categorias de atitude melhoram um passo. Você pode comandar criaturas prestativas para lutar ao seu lado e ajudar a defender o sítio sagrado, mas elas não irão segui-lo para fora dele. O mestre decide quais criaturas estão presentes no sítio (de forma geral, a qualquer momento há um número de criaturas com ND total somado igual ao seu nível). • Terreno Associado. Ao receber seu sítio sagrado, escolha um terreno entre aquático, ártico, colina, deserto, floresta, montanha, pântano, planície ou subterrâneo. Esse será o tipo de terreno associado ao seu sítio sagrado. Sempre que estiver em um terreno desse tipo, você soma sua Sabedoria (mínimo +1) em Furtividade, Percepção, Misticismo, Religião e Sobrevivência. No 7º nível, e a cada quatro níveis subsequentes, escolha mais um tipo de terreno para associar ao seu sítio ou aumente o bônus de perícias de um tipo de terreno já escolhido em +2. Você também é capaz de atingir uma conexão mais forte com sua divindade dentro do sítio sagrado. Dentro dele, seu redutor de PM por Vínculo com a Terra muda para –2. • Caminhos Sagrados. Quando está em um terreno de um tipo associado ao seu sítio, você não sofre redução de deslocamento por terreno difícil natural e a CD para rastreá-lo aumenta em +10. • Base. O sítio sagrado conta como uma base básica. Você paga apenas a metade do custo para aumentar o porte dessa base e para construir cômodos nela.',
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
