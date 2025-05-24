import _ from 'lodash';
import CharacterSheet, { SubStep } from '../../interfaces/CharacterSheet';
import { ClassDescription } from '../../interfaces/Class';
import { RequirementType } from '../../interfaces/Poderes';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../atributos';
import PROFICIENCIAS from '../proficiencias';
import { addOrCheapenSpell, spellsCircle1 } from '../magias/generalSpells';

const CACADOR: ClassDescription = {
  name: 'Caçador',
  pv: 16,
  addpv: 4,
  pm: 4,
  addpm: 4,
  periciasbasicas: [
    {
      type: 'or',
      list: [Skill.LUTA, Skill.PONTARIA],
    },
    {
      type: 'and',
      list: [Skill.SOBREVIVENCIA],
    },
  ],
  periciasrestantes: {
    qtd: 6,
    list: [
      Skill.ADESTRAMENTO,
      Skill.ATLETISMO,
      Skill.CAVALGAR,
      Skill.CURA,
      Skill.FORTITUDE,
      Skill.FURTIVIDADE,
      Skill.INICIATIVA,
      Skill.INVESTIGACAO,
      Skill.LUTA,
      Skill.OFICIO,
      Skill.PERCEPCAO,
      Skill.PONTARIA,
      Skill.REFLEXOS,
    ],
  },
  proficiencias: [
    PROFICIENCIAS.LEVES,
    PROFICIENCIAS.MARCIAIS,
    PROFICIENCIAS.ESCUDOS,
    PROFICIENCIAS.SIMPLES,
  ],
  abilities: [
    {
      name: 'Marca da Presa',
      text: 'Você pode gastar uma ação de movimento e 1 PM para analisar uma criatura em alcance curto. Até o fim da cena, você recebe +1d4 nas rolagens de dano contra essa criatura. A cada quatro níveis, você pode gastar +1 PM para aumentar o bônus de dano (veja a tabela da classe).',
      nivel: 1,
    },
    {
      name: 'Rastreador',
      text: 'Você recebe +2 em Sobrevivência. Além disso, pode se mover com seu deslocamento normal enquanto rastreia sem sofrer penalidades no teste de Sobrevivência.',
      nivel: 1,
      action: (sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet => {
        const sheetClone = _.cloneDeep(sheet);

        const newCompleteSkills = sheetClone.completeSkills?.map((sk) => {
          let value = sk.others ?? 0;

          if (sk.name === 'Sobrevivência') {
            value += 2;
          }

          return { ...sk, others: value };
        });

        substeps.push({
          name: 'Rastreador',
          value: `+2 em Sobrevivência`,
        });

        return _.merge<CharacterSheet, Partial<CharacterSheet>>(sheetClone, {
          completeSkills: newCompleteSkills,
        });
      },
    },
    {
      name: 'Explorador',
      text: 'Escolha um tipo de terreno entre aquático, ártico, colina, deserto, floresta, montanha, pântano, planície, subterrâneo ou urbano. A partir do 11º nível, você também pode escolher área de Tormenta. Quando estiver no tipo de terreno escolhido, você soma sua Sabedoria (mínimo +1) na Defesa e nos testes de Acrobacia, Atletismo, Furtividade, Percepção e Sobrevivência. A cada quatro níveis, escolha outro tipo de terreno para receber o bônus ou aumente o bônus em um tipo de terreno já escolhido em +2.',
      nivel: 3,
    },
    {
      name: 'Caminho do Explorador',
      text: 'Você pode atravessar terrenos difíceis sem sofrer redução em seu deslocamento e a CD para rastrear você aumenta em +10. Esta habilidade só funciona em terrenos nos quais você tenha a habilidade Explorador.',
      nivel: 5,
    },
    {
      name: 'Mestre Caçador',
      text: 'No 20º nível, você pode usar a habilidade Marca da Presa como uma ação livre. Além disso, quando usa a habilidade, pode gastar 5 PM para aumentar sua margem de ameaça contra a criatura em +2. Se você reduz uma criatura contra a qual usou Marca da Presa a 0 pontos de vida, recupera 5 PM.',
      nivel: 20,
    },
  ],
  powers: [
    {
      name: 'Ambidestria',
      text: 'Se estiver usando duas armas (e pelo menos uma delas for leve) e fizer a ação atacar, você pode fazer dois ataques, um com cada arma. Se fizer isso, sofre –2 em todos os testes de ataque até o seu próximo turno.',
      requirements: [
        [{ type: RequirementType.ATRIBUTO, name: 'Destreza', value: 2 }],
      ],
    },
    {
      name: 'Armadilha: Arataca.',
      text: 'A vítima sofre 2d6 pontos de dano de perfuração e fica agarrada. Uma criatura agarrada pode escapar com uma ação padrão e um teste de Acrobacia ou Atletismo (CD Sab).',
      requirements: [],
    },
    {
      name: 'Armadilha: Espinhos',
      text: 'A vítima sofre 6d6 pontos de dano de perfuração. Um teste de Reflexos (CD Sab) reduz o dano à metade.',
      requirements: [],
    },
    {
      name: 'Armadilha: Laço',
      text: 'A vítima deve fazer um teste de Reflexos (CD Sab). Se passar, fica caída. Se falhar, fica agarrada. Uma criatura agarrada pode se soltar com uma ação padrão e um teste de Força ou Acrobacia (CD Sab).',
      requirements: [],
    },
    {
      name: 'Armadilha: Rede',
      text: 'Todas as criaturas na área ficam enredadas e não podem sair da área. Uma vítima pode se libertar com uma ação padrão e um teste de Força ou Acrobacia (CD 25). Além disso, a área ocupada pela rede é considerada terreno difícil. Nesta armadilha você escolhe quantas criaturas precisam estar na área para ativá-la.',
      requirements: [],
    },
    {
      name: 'Armadilheiro',
      text: ' Você soma sua Sabedoria no dano e na CD de suas armadilhas (cumulativo)',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Armadilha: Arataca' },
          { type: RequirementType.NIVEL, value: 5 },
        ],
        [
          { type: RequirementType.PODER, name: 'Armadilha: Espinhos' },
          { type: RequirementType.NIVEL, value: 5 },
        ],
        [
          { type: RequirementType.PODER, name: 'Armadilha: Laço' },
          { type: RequirementType.NIVEL, value: 5 },
        ],
        [
          { type: RequirementType.PODER, name: 'Armadilha: Rede' },
          { type: RequirementType.NIVEL, value: 5 },
        ],
      ],
    },
    {
      name: 'Arqueiro',
      text: 'Se estiver usando uma arma de ataque à distância, você soma seu bônus de Sabedoria nas rolagens de dano (limitado pelo seu nível).',
      requirements: [
        [{ type: RequirementType.ATRIBUTO, name: 'Sabedoria', value: 1 }],
      ],
    },
    {
      name: 'Aumento de Atributo',
      text: ' Você recebe +1 em um atributo. Você pode escolher este poder várias vezes, mas apenas uma vez por patamar para um mesmo atributo.',
      requirements: [],
      canRepeat: true,
    },
    {
      name: 'Bote',
      text: 'Se estiver empunhando duas armas e fizer uma investida, você pode pagar 1 PM para fazer um ataque adicional com sua arma secundária.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Ambidestria' },
          { type: RequirementType.NIVEL, value: 6 },
        ],
      ],
    },
    {
      name: 'Camuflagem',
      text: 'Você pode gastar 2 PM para se esconder mesmo sem camuflagem ou cobertura disponível.',
      requirements: [[{ type: RequirementType.NIVEL, value: 6 }]],
    },
    {
      name: 'Chuva de Lâminas',
      text: 'Uma vez por rodada, quando usa Ambidestria, você pode pagar 2 PM para fazer um ataque adicional com sua arma primária.',
      requirements: [
        [
          { type: RequirementType.ATRIBUTO, name: 'Destreza', value: 4 },
          { type: RequirementType.PODER, name: 'Ambidestria' },
          { type: RequirementType.NIVEL, value: 12 },
        ],
      ],
    },
    {
      name: 'Companheiro Animal',
      text: 'Você recebe um companheiro animal. Veja o quadro na página 62.',
      requirements: [
        [
          { type: RequirementType.PERICIA, name: 'Adestramento' },
          { type: RequirementType.ATRIBUTO, name: Atributo.CARISMA, value: 1 },
        ],
      ],
    },
    {
      name: 'Elo com a Natureza',
      text: 'Você soma seu bônus de Sabedoria em seu total de pontos de mana e aprende e pode lançar Caminhos da Natureza (atributo-chave Sabedoria).',
      requirements: [
        [
          { type: RequirementType.ATRIBUTO, name: 'Sabedoria', value: 1 },
          { type: RequirementType.NIVEL, value: 3 },
        ],
      ],
      action: (sheet, subSteps): CharacterSheet => {
        sheet.pmModifier.push({
          source: 'Elo com a Natureza',
          type: 'Attribute',
          attribute: Atributo.SABEDORIA,
        });

        const { spells, stepValue } = addOrCheapenSpell(
          sheet,
          spellsCircle1.caminhosDaNatureza,
          Atributo.SABEDORIA
        );

        if (stepValue) {
          subSteps.push({
            name: 'Elo com a Natureza',
            value: stepValue,
          });
        }

        return _.merge<CharacterSheet, Partial<CharacterSheet>>(sheet, {
          spells,
          pmModifier: sheet.pmModifier,
        });
      },
    },
    {
      name: 'Emboscar',
      text: 'Você pode gastar 2 PM para realizar uma ação padrão adicional em seu turno. Você só pode usar este poder na primeira rodada de um combate.',
      requirements: [[{ type: RequirementType.PERICIA, name: 'Furtividade' }]],
    },
    {
      name: 'Empatia Selvagem',
      text: 'Você pode se comunicar com animais por meio de linguagem corporal e vocalizações. Você pode usar Adestramento com animais para mudar atitude e persuasão (veja Diplomacia, na página 118).',
      requirements: [],
    },
    {
      name: 'Escaramuça',
      text: 'Quando se move 6m ou mais, você recebe +2 em Defesa e Reflexos e +1d8 nas rolagens de dano de ataques corpo a corpo e à distância em alcance curto até o início de seu próximo turno. Você não pode usar esta habilidade se estiver vestindo armadura pesada.',
      requirements: [
        [
          { type: RequirementType.ATRIBUTO, name: 'Destreza', value: 2 },
          { type: RequirementType.NIVEL, value: 6 },
        ],
      ],
    },
    {
      name: 'Escaramuça Superior',
      text: 'Quando usa Escaramuça, seus bônus aumentam para +5 em Defesa e Reflexos e +1d12 em rolagens de dano.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Escaramuça' },
          { type: RequirementType.NIVEL, value: 12 },
        ],
      ],
    },
    {
      name: 'Espreitar',
      text: 'Quando usa a habilidade Marca da Presa, você recebe um bônus de +1 em testes de perícia contra a criatura marcada. Esse bônus aumenta em +1 para cada PM adicional gasto na habilidade e também dobra com a habilidade Inimigo.',
      requirements: [],
    },
    {
      name: 'Ervas Curativas',
      text: 'Você pode gastar uma ação completa e uma quantidade de PM a sua escolha (limitado por sua Sabedoria) para aplicar ervas que curam ou desintoxicam em você ou num aliado adjacente. Para cada PM que gastar, cura 2d6 PV ou remove uma condição envenenado afetando o alvo.',
      requirements: [],
    },
    {
      name: 'Ímpeto',
      text: 'Você pode gastar 1 PM para aumentar seu deslocamento em +6m por uma rodada.',
      requirements: [],
    },
    {
      name: 'Inimigo de (Criatura)',
      text: 'Escolha um tipo de criatura entre animal, construto, espírito, monstro ou morto-vivo, ou duas raças humanoides (por exemplo, orcs e gnolls, ou elfos e qareen). Quando você usa a habilidade Marca da Presa contra uma criatura do tipo ou da raça escolhida, dobra os dados de bônus no dano. O nome desta habilidade varia de acordo com o tipo de criatura escolhida (Inimigo de Monstros, Inimigo de Mortos-Vivos etc.). Você pode escolher este poder outras vezes para inimigos diferentes.',
      canRepeat: true,
      requirements: [],
    },
    {
      name: 'Olho do Falcão',
      text: 'Você pode usar a habilidade Marca da Presa em criaturas em alcance longo.',
      requirements: [],
    },
    {
      name: 'Ponto Fraco',
      text: 'Quando usa a habilidade Marca da Presa, seus ataques contra a criatura marcada recebem +2 na margem de ameaça. Esse bônus dobra com a habilidade Inimigo.',
      requirements: [],
    },
  ],
  probDevoto: 0.3,
  faithProbability: {
    ALLIHANNA: 1,
    AZGHER: 1,
    MEGALOKK: 1,
    OCEANO: 1,
    VALKARIA: 1,
  },
  attrPriority: [Atributo.DESTREZA, Atributo.SABEDORIA, Atributo.FORCA],
};

export default CACADOR;
