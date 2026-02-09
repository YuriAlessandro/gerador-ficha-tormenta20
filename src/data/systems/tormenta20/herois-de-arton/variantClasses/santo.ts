import { VariantClassOverrides } from '../../../../../interfaces/Class';
import Skill from '../../../../../interfaces/Skills';
import { Atributo } from '../../atributos';
import PALADINO from '../../classes/paladino';

const codigoDoHeroi = PALADINO.abilities.find(
  (a) => a.name === 'Código de Héroi'
)!;

const SANTO: VariantClassOverrides = {
  name: 'Santo',
  isVariant: true,
  baseClassName: 'Paladino',
  pm: 4,
  addpm: 4,
  periciasbasicas: [
    {
      type: 'and',
      list: [Skill.RELIGIAO, Skill.VONTADE],
    },
  ],
  periciasrestantes: {
    qtd: 2,
    list: [
      Skill.ADESTRAMENTO,
      Skill.ATLETISMO,
      Skill.CONHECIMENTO,
      Skill.CURA,
      Skill.DIPLOMACIA,
      Skill.FORTITUDE,
      Skill.GUERRA,
      Skill.INICIATIVA,
      Skill.INTUICAO,
      Skill.LUTA,
      Skill.OFICIO,
      Skill.PERCEPCAO,
    ],
  },
  abilities: [
    {
      name: 'Abençoado',
      text: 'Você soma seu Carisma no seu total de pontos de mana no 1º nível. Além disso, torna-se devoto de um deus disponível para paladinos (Azgher, Khalmyr, Lena, Lin-Wu, Marah, Tanna-Toh, Thyatis, Valkaria). Veja as regras de devotos na página 96. Ao contrário de devotos normais, você recebe dois poderes concedidos por se tornar devoto, em vez de apenas um. Você não pode escolher ser um santo do bem.',
      nivel: 1,
      sheetBonuses: [
        {
          source: {
            type: 'power',
            name: 'Abençoado',
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
    codigoDoHeroi,
    {
      name: 'Ladainha de Combate',
      text: 'Você pode gastar uma ação padrão e 2 PM para gerar uma aura de 9m de raio com duração sustentada. Você e os aliados dentro da aura recebem +1 em testes de ataque, rolagens de dano e na Defesa. A cada quatro níveis, você pode gastar +2 PM para aumentar esses bônus em +1. Sua ladainha conta como Aura Sagrada para pré-requisitos e efeitos de poderes de paladino. No 5º nível, você e os aliados dentro da aura causam +1d8 pontos de dano de luz com ataques contra devotos de deuses que canalizam apenas energia negativa e criaturas malignas (a critério do mestre). No 9º nível, suas armas e as dos aliados dentro da aura recebem o encanto veloz.',
      nivel: 1,
    },
    {
      name: 'Santo Curandeiro',
      text: 'A partir do 2º nível, você pode gastar uma ação de movimento e uma quantidade de PM a sua escolha (limitada pelo seu Carisma). Para cada PM que você gastar, o aliado em alcance médio com a maior redução em seus PV (por dano ou perda de vida) recupera 2d8 pontos de vida por luz. A partir do 6º nível, quando usa Santo Curandeiro, você também pode remover uma condição do alvo entre abalado, apavorado, atordoado, cego, doente, exausto, fatigado ou surdo.',
      nivel: 2,
    },
    {
      name: 'Vaso do Espírito',
      text: 'A partir do 3º nível, quando faz um teste de resistência, você pode gastar 1 PM para somar seu Carisma nesse teste.',
      nivel: 3,
    },
    {
      name: 'Mártir',
      text: 'A partir do 6º nível, quando um aliado em alcance médio faz um teste de resistência, você pode gastar 1 PM para conceder a ele um bônus nesse teste igual ao seu próprio Carisma. A partir do 12º nível, uma vez por cena, se ele ainda assim falhar, você pode sofrer o efeito no lugar dele (mas você é afetado mesmo que seja imune ao efeito).',
      nivel: 6,
    },
    {
      name: 'Pira Santa',
      text: 'No 8º nível, enquanto estiver sob efeito de Ladainha de Combate, você pode gastar uma ação de movimento e uma quantidade de PM a sua escolha (limitada pelo seu Carisma). Para cada PM que gastar, o inimigo de maior ND em alcance médio sofre 2d8 pontos de dano de luz e fica ofuscado por 1 rodada (Fort CD Car reduz à metade).',
      nivel: 8,
    },
    {
      name: 'Vingador Santificado',
      text: 'No 20º nível, quando usa Ladainha de Combate, você pode gastar +5 PM. Se fizer isso, os bônus numéricos fornecidos por sua Ladainha dobram e você e os aliados dentro da aura recebem imunidade a acertos críticos e RD igual a 5 + seu Carisma.',
      nivel: 20,
    },
  ],
  attrPriority: [Atributo.CARISMA, Atributo.SABEDORIA],
};

export default SANTO;
