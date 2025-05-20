import { cloneDeep } from 'lodash';
import Skill from '@/interfaces/Skills';
import CharacterSheet, { SubStep } from '../../interfaces/CharacterSheet';
import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';
import { addOrCheapenSpell, spellsCircle1 } from '../magias/generalSpells';

const SULFURE: Race = {
  name: 'Suraggel (Sulfure)',
  attributes: {
    attrs: [
      { attr: Atributo.DESTREZA, mod: 2 },
      { attr: Atributo.INTELIGENCIA, mod: 1 },
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    KALLYADRANOCH: 1,
    TENEBRA: 1,
  },
  abilities: [
    {
      name: 'Herança Divina',
      description:
        'Você é uma criatura do tipo espírito e recebe visão no escuro.',
      action(sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet {
        const sheetClone = cloneDeep(sheet);

        if (!sheetClone.sentidos?.includes('Visão no Escuro')) {
          sheetClone.sentidos?.push('Visão no Escuro');
        }

        substeps.push({
          name: 'Herança Divina',
          value: 'Recebe Visão no escuro',
        });

        return sheetClone;
      },
    },
    {
      name: 'Sombras Profanas',
      description:
        'Você recebe +2 em Enganação e Furtividade. Além disso, pode lançar Escuridão (como uma magia divina; atributo-chave Inteligência). Caso aprenda novamente essa magia, o custo para lançá-la diminui em –1 PM.',
      action(sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet {
        const sheetClone = cloneDeep(sheet);

        sheetClone.completeSkills = sheetClone.completeSkills?.map((skill) => {
          if (
            skill.name === Skill.ENGANACAO ||
            skill.name === Skill.FURTIVIDADE
          ) {
            substeps.push({
              name: 'Sombras Profanas',
              value: `Recebe +2 em ${skill.name}`,
            });

            return {
              ...skill,
              others: (skill.others || 0) + 2,
            };
          }
          return skill;
        });

        const { stepValue, spells } = addOrCheapenSpell(
          sheetClone,
          spellsCircle1.escuridao,
          Atributo.INTELIGENCIA
        );
        sheetClone.spells = spells;

        if (stepValue) {
          substeps.push({
            name: 'Sombras Profanas',
            value: stepValue,
          });
        }

        return sheetClone;
      },
    },
  ],
};

export default SULFURE;
