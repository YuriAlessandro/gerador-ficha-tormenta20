import { cloneDeep } from 'lodash';
import Skill from '@/interfaces/Skills';
import CharacterSheet, { SubStep } from '../../interfaces/CharacterSheet';
import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';
import { addOrCheapenSpell, spellsCircle1 } from '../magias/generalSpells';

const AGGELUS: Race = {
  name: 'Suraggel (Aggelus)',
  attributes: {
    attrs: [
      { attr: Atributo.SABEDORIA, mod: 2 },
      { attr: Atributo.CARISMA, mod: 1 },
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    AZGHER: 1,
    KHALMYR: 1,
    MARAH: 1,
    THYATIS: 1,
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
      name: 'Luz Sagrada',
      description:
        'Você recebe +2 em Diplomacia e Intuição. Além disso, pode lançar Luz (como uma magia divina; atributo-chave Carisma). Caso aprenda novamente essa magia, o custo para lançá-la diminui em –1 PM.',
      action(sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet {
        const sheetClone = cloneDeep(sheet);

        sheetClone.completeSkills = sheetClone.completeSkills?.map((skill) => {
          if (
            skill.name === Skill.DIPLOMACIA ||
            skill.name === Skill.INTUICAO
          ) {
            substeps.push({
              name: 'Luz Sagrada',
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
          spellsCircle1.luz,
          Atributo.CARISMA
        );
        sheetClone.spells = spells;

        if (stepValue) {
          substeps.push({
            name: 'Luz Sagrada',
            value: stepValue,
          });
        }

        return sheetClone;
      },
    },
  ],
};

export default AGGELUS;
