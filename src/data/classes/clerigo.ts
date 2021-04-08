import _ from 'lodash';
import CharacterSheet, { SubStep } from '../../interfaces/CharacterSheet';
import { ClassDescription } from '../../interfaces/Class';
import { RequirementType } from '../../interfaces/Poderes';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../atributos';
import { standardFaithProbability } from '../divindades';
import PROFICIENCIAS from '../proficiencias';

const CLERIGO: ClassDescription = {
  name: 'Clérigo',
  pv: 16,
  addpv: 4,
  pm: 5,
  addpm: 5,
  periciasbasicas: [
    {
      type: 'and',
      list: [Skill.RELIGIAO, Skill.VONTADE],
    },
  ],
  periciasrestantes: {
    qtd: 2,
    list: [
      Skill.CONHECIMENTO,
      Skill.CURA,
      Skill.DIPLOMACIA,
      Skill.FORTITUDE,
      Skill.INICIATIVA,
      Skill.INTUICAO,
      Skill.LUTA,
      Skill.MISTICISMO,
      Skill.NOBREZA,
      Skill.OFICIO,
      Skill.PERCEPCAO,
    ],
  },
  proficiencias: [PROFICIENCIAS.SIMPLES, PROFICIENCIAS.LEVES],
  abilities: [
    {
      name: 'Devoto',
      text:
        'Você se torna devoto de um deus maior. Você deve obedecer às Obrigações & Restrições de seu deus, mas, em troca, ganha os Poderes Concedidos dele. Veja a lista de deuses na página 97. Como alternativa, você pode cultuar o Panteão como um todo. Não recebe nenhum Poder Concedido, mas sua única Obrigação & Restrição é não usar armas cortantes ou perfurantes (porque derramam sangue, algo que clérigos do Panteão consideram proibido). O nome desta habilidade varia de acordo com a divindade escolhida: Devoto de Azgher, Devoto de Thyatis... ou Devoto dos Deuses, se escolher cultuar o Panteão como um todo.',
      nivel: 1,
    },
    {
      name: 'Magias',
      text:
        'Você pode lançar magias divinas de 1º círculo. A cada quatro níveis, pode lançar magias de um círculo maior (2º círculo no 5º nível, 3º círculo no 9º nível e assim por diante). Você começa com três magias de 1º círculo. A cada nível, aprende uma magia de qualquer círculo que possa lançar. Seu atributo-chave para lançar magias é Sabedoria e você soma seu bônus de Sabedoria no seu total de PM. Veja o Capítulo 4 para as regras de magia.',
      nivel: 1,
      action(sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet {
        const sheetClone = _.cloneDeep(sheet);

        const finalPM = sheet.pm + sheet.atributos.Sabedoria.mod;
        substeps.push({
          name: 'Magias',
          value: `+(Mod SAB) PMs inicias (${sheet.pm} + ${sheet.atributos.Sabedoria.mod} = ${finalPM})`,
        });

        return _.merge<CharacterSheet, Partial<CharacterSheet>>(sheetClone, {
          pm: finalPM,
        });
      },
    },
    {
      name: 'Mão da Divindade',
      text:
        'Você pode gastar uma ação completa e 15 PM para canalizar a energia de seu deus. Ao fazer isso, você lança três magias divinas quaisquer (de qualquer círculo, incluindo magias que você não conhece), como uma ação livre e sem gastar PM (mas ainda precisa pagar outros custos). Você pode aplicar aprimoramentos, mas precisa pagar por eles. Após usar esta habilidade, você fica atordoado por 1d4 rodadas. Corpos mortais não foram feitos para lidar com tanto poder.',
      nivel: 20,
    },
  ],
  powers: [
    {
      name: 'Abençoar Arma',
      text:
        'Você se torna proficiente na arma preferida de sua divindade. Se estiver empunhando essa arma, pode gastar uma ação de movimento e 3 PM para infundi-la com poder divino. Até o final da cena, a arma emite luz dourada ou púrpura (como uma tocha) e você pode usar seu modificador de Sabedoria em testes de ataque e rolagens de dano com ela (em vez do modificador padrão). Além disso, o dano da arma aumenta em um passo e ela é considerada mágica para propósitos de resistência a dano.',
      requirements: [[]],
    },
    {
      name: 'Aumento de Atributo',
      text:
        'Você recebe +2 em um atributo a sua escolha. Você pode escolher este poder várias vezes. A partir da segunda vez que escolhê-lo para o mesmo atributo, o aumento diminui para +1.',
      requirements: [[]],
      canRepeat: true,
    },
    {
      name: 'Autoridade Eclesiástica',
      text:
        'Você possui uma posição formal em uma igreja reconhecida pelos outros membros de sua fé. Os efeitos deste poder variam de acordo com a igreja e o deus — clérigos de Khalmyr, por exemplo, possuem autoridade como juízes no Reinado — e ficam a cargo do mestre. Como regra geral, você recebe +5 em testes de Diplomacia ou Intimidação ao lidar com devotos de sua divindade e paga metade do preço de itens alquímicos, poções e serviços em templos de sua divindade.',
      requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
    },
    {
      name: 'Canalizar Energia Positiva/Negativa',
      text:
        'Você pode gastar uma ação padrão e 1 PM para liberar uma onda de energia positiva ou negativa (de acordo com sua divindade) que afeta todas as criaturas em alcance curto. Energia positiva cura 1d6 pontos de dano em criaturas vivas a sua escolha e causa 1d6 pontos de dano de luz em mortos-vivos. Energia negativa tem o efeito inverso — causa dano de trevas em criaturas vivas a sua escolha e cura mortos-vivos. Uma criatura que sofra dano tem direito a um teste de Vontade (CD Car) para reduzi-lo à metade. Para cada 2 PM extras que você gastar, a cura ou dano aumenta em +1d6 PV (ou seja, pode gastar 3 PM para curar 2d6 PV, 5 PM para curar 3d6 PV e assim por diante).',
      requirements: [[]],
    },
    {
      name: 'Canalizar Amplo',
      text:
        'Quando você usa a habilidade Canalizar Energia, pode gastar +2 PM para aumentar o alcance dela para médio.',
      requirements: [
        [
          {
            type: RequirementType.PODER,
            name: 'Canalizar Energia Positiva/Negativa',
          },
        ],
      ],
    },
    {
      name: 'Comunhão Vital',
      text:
        'Quando lança uma magia que cure uma criatura, você pode pagar +2 PM para que outra criatura em alcance curto (incluindo você mesmo) recupere uma quantidade de pontos de vida igual à metade dos PV da cura original.',
      requirements: [[]],
    },
    {
      name: 'Conhecimento Mágico',
      text:
        'Você aprende duas magias divinas de qualquer círculo que possa lançar. Você pode escolher este poder quantas vezes quiser.',
      requirements: [[]],
    },
    {
      name: 'Expulsar/Comandar Mortos-Vivos',
      text:
        'Você pode usar uma ação padrão e 3 PM para expulsar (se sua divindade canaliza energia positiva) ou comandar (se canaliza energia negativa) todos os mortos-vivos em alcance curto. Mortos-vivos expulsos ficam apavorados por 1d6 rodadas. Mortos-vivos comandados ficam sob suas ordens; entretanto, o nível somado de mortos-vivos sob seu comando ao mesmo tempo não pode exceder o seu próprio nível +3. Dar uma ordem a mortos-vivos é uma ação de movimento. Mortos-vivos têm direito a um teste de Vontade (CD Car) para evitar qualquer destes efeitos.',
      requirements: [
        [
          {
            type: RequirementType.PODER,
            name: 'Canalizar Energia Positiva/Negativa',
          },
        ],
      ],
    },
    {
      name: 'Liturgia Mágica',
      text:
        'Você pode gastar uma ação de movimento para executar uma breve liturgia de sua fé. Se fizer isso, a CD para resistir à sua próxima magia divina (desde que lançada até o final de seu próximo turno) aumenta em +2.',
      requirements: [[]],
    },
    {
      name: 'Magia Sagrada/Profana',
      text:
        'Quando lança uma magia divina que causa dano, você pode gastar +1 PM. Se fizer isso, muda o tipo de dano da magia para luz ou trevas (de acordo com a sua divindade).',
      requirements: [[]],
    },
    {
      name: 'Mestre Celebrante',
      text:
        'O número de pessoas que você afeta com uma missa aumenta em dez vezes e os benefícios que elas recebem dobram.',
      requirements: [
        [{ type: RequirementType.PODER, name: 'Missa: Bênção da Vida' }],
        [{ type: RequirementType.PODER, name: 'Missa: Chamado às Armas' }],
        [{ type: RequirementType.PODER, name: 'Missa: Elevação do Espírito' }],
        [{ type: RequirementType.PODER, name: 'Missa: Escudo Divino' }],
        [{ type: RequirementType.PODER, name: 'Missa: Superar as Limitações' }],
      ],
    },
    {
      name: 'Missa: Bênção da Vida',
      text:
        'Você abençoa os presentes com energia positiva. Os participantes recebem pontos de vida temporários em um valor igual ao seu nível + seu bônus de Sabedoria.',
      requirements: [[]],
    },
    {
      name: 'Missa: Chamado às Armas',
      text:
        'Sua prece fortalece o espírito de luta. Os participantes recebem +1 em testes de ataque e rolagens de dano.',
      requirements: [[]],
    },
    {
      name: 'Missa: Elevação do Espírito',
      text:
        'Você inflama a determinação dos ouvintes. Os participantes recebem pontos de mana temporários em um valor igual ao seu bônus de Sabedoria.',
      requirements: [[]],
    },
    {
      name: 'Missa: Escudo Divino',
      text:
        'Sua fé protege os ouvintes. Os participantes recebem +1 em Defesa e testes de resistência.',
      requirements: [[]],
    },
    {
      name: 'Missa: Superar as Limitações',
      text:
        'Você encoraja os ouvintes a superar suas próprias habilidades. Cada participante recebe +1d6 num único teste a sua escolha.',
      requirements: [[]],
    },
    {
      name: 'Prece de Combate',
      text:
        'Quando lança uma magia divina com tempo de conjuração de uma ação padrão em si mesmo, você pode gastar +2 PM para lançá-la como uma ação de movimento.',
      requirements: [[]],
    },
    {
      name: 'Símbolo Sagrado Abençoado',
      text:
        'Você pode gastar uma ação de movimento e 1 PM para fazer uma prece e energizar seu símbolo sagrado até o fim da cena. Um símbolo sagrado energizado emite uma luz dourada ou prateada (se sua divindade canaliza energia positiva) ou púrpura ou avermelhada (se canaliza energia negativa) que ilumina como uma tocha. Enquanto você estiver empunhando um símbolo sagrado energizado, o custo em PM para lançar suas magias divinas diminui em 1.',
      requirements: [[]],
    },
  ],
  probDevoto: 0.95,
  qtdPoderesConcedidos: 'all',
  faithProbability: standardFaithProbability,
  attrPriority: [Atributo.SABEDORIA],
  setup: (classe) => {
    const modifiedClasse = _.cloneDeep(classe);
    modifiedClasse.spellPath = {
      initialSpells: 3,
      spellType: 'Divine',
      qtySpellsLearnAtLevel: () => 1,
      spellCircleAvailableAtLevel: (level) => {
        if (level < 5) return 1;
        if (level < 9) return 2;
        if (level < 13) return 3;
        if (level < 17) return 4;
        return 5;
      },
      keyAttribute: Atributo.SABEDORIA,
    };

    return modifiedClasse;
  },
};

export default CLERIGO;
