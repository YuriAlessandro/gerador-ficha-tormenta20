import { VariantClassOverrides } from '../../../../../interfaces/Class';
import Skill from '../../../../../interfaces/Skills';
import { Atributo } from '../../atributos';
import { spellsCircle1 } from '../../magias/generalSpells';
import LUTADOR from '../../classes/lutador';
import PROFICIENCIAS from '../../proficiencias';

const briga = LUTADOR.abilities.find((a) => a.name === 'Briga')!;
const cascaGrossa = LUTADOR.abilities.find((a) => a.name === 'Casca Grossa')!;

const ATLETA: VariantClassOverrides = {
  name: 'Atleta',
  isVariant: true,
  baseClassName: 'Lutador',
  periciasbasicas: [
    {
      type: 'and',
      list: [Skill.ATLETISMO, Skill.LUTA],
    },
  ],
  periciasrestantes: {
    qtd: 4,
    list: [
      Skill.ACROBACIA,
      Skill.ADESTRAMENTO,
      Skill.CAVALGAR,
      Skill.CURA,
      Skill.FORTITUDE,
      Skill.INICIATIVA,
      Skill.INTIMIDACAO,
      Skill.OFICIO,
      Skill.PERCEPCAO,
      Skill.PILOTAGEM,
      Skill.PONTARIA,
      Skill.REFLEXOS,
    ],
  },
  proficiencias: [PROFICIENCIAS.LEVES, PROFICIENCIAS.SIMPLES],
  abilities: [
    briga,
    {
      name: 'Façanha Atlética',
      text: 'Quando faz um teste de perícia, você pode gastar uma quantidade de PM a sua escolha (limitada pela sua Força). Para cada PM que gastar, recebe +2 no teste.',
      nivel: 1,
    },
    {
      name: 'Arremesso Atlético',
      text: 'No 2º nível, o alcance de seus ataques com armas de arremesso aumenta em um passo (de curto para médio e de médio para longo). Além disso, quando ataca com uma dessas armas, você pode usar o dano da habilidade Briga no lugar do dano básico da arma. A partir do 10º nível, seus ataques com armas de arremesso contam como ataques desarmados para efeito de suas habilidades de lutador.',
      nivel: 2,
    },
    {
      name: 'Poderio Muscular',
      text: 'No 2º nível, você aprende e pode lançar Primor Atlético, mas apenas em si mesmo. Esta não é uma habilidade mágica e provém de seu extenso treinamento físico.',
      nivel: 2,
      sheetActions: [
        {
          source: { type: 'class', className: 'Atleta' },
          action: {
            type: 'learnSpell',
            availableSpells: [spellsCircle1.primorAtletico],
            pick: 1,
            customAttribute: Atributo.FORCA,
          },
        },
      ],
    },
    cascaGrossa,
    {
      name: 'Mais Alto e Mais Rápido',
      text: "No 5º nível, seu deslocamento aumenta em +3m. Além disso, você recebe deslocamento de escalada e natação igual à metade de seu deslocamento normal (se já os possui, em vez disso eles aumentam em +3m). Ao contrário do normal, esse deslocamento de natação não fornece a capacidade de respirar debaixo d'água, mas você soma seu nível de atleta no total de rodadas para prender sua respiração.",
      nivel: 5,
      sheetBonuses: [
        {
          source: {
            type: 'class',
            className: 'Atleta',
          },
          target: {
            type: 'Displacement',
          },
          modifier: {
            type: 'Fixed',
            value: 3,
          },
        },
      ],
    },
    {
      name: 'Disciplina Atlética',
      text: 'A partir do 9º nível, quando falha em um teste de resistência, você pode gastar 2 PM para rolar esse teste novamente, usando Atletismo no lugar da perícia original.',
      nivel: 9,
    },
    {
      name: 'Corpo Ideal',
      text: 'No 20º nível, você atinge o ápice físico de um corpo mortal. Você recebe imunidade a cansaço, condições de metabolismo e veneno, redução de dano 10 e seu dano desarmado e com armas de arremesso aumenta para 2d10 (criaturas Médias).',
      nivel: 20,
    },
  ],
};

export default ATLETA;
