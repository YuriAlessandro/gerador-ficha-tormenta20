import { cloneDeep, merge } from 'lodash';
import Skill from '@/interfaces/Skills';
import { getNotRepeatedRandom } from '../../functions/randomUtils';
import CharacterSheet, { SubStep } from '../../interfaces/CharacterSheet';
import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';
import PROFICIENCIAS from '../proficiencias';

const KLIREN: Race = {
  name: 'Kliren',
  attributes: {
    attrs: [
      { attr: Atributo.INTELIGENCIA, mod: 2 },
      { attr: Atributo.CARISMA, mod: 1 },
      { attr: Atributo.FORCA, mod: -1 },
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    TANNATOH: 1,
    THWOR: 1,
  },
  abilities: [
    {
      name: 'Híbrido',
      description:
        'Sua natureza multifacetada fez com que você aprendesse conhecimentos variados. Você se torna treinado em uma perícia a sua escolha (não precisa ser da sua classe).',
      action(sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet {
        const sheetClone = cloneDeep(sheet);
        const randomSkill = getNotRepeatedRandom(sheetClone.skills, 'skill');
        substeps.push({
          name: 'Híbrido',
          value: `Perícia treinada (${randomSkill})`,
        });

        return merge(sheetClone, {
          skills: [...sheetClone.skills, randomSkill],
        });
      },
    },
    {
      name: 'Engenhosidade',
      description:
        'Quando faz um teste de perícia, você pode gastar 2 PM para somar sua Inteligência no teste. Você não pode usar esta habilidade em testes de ataque. Caso receba esta habilidade novamente, seu custo é reduzido em –1 PM.',
    },
    {
      name: 'Ossos Frágeis',
      description:
        'Você sofre 1 ponto de dano adicional por dado de dano de impacto. Por exemplo, se for atingido por uma clava (dano 1d6), sofre 1d6+1 pontos de dano. Se cair de 3m de altura (dano 2d6), sofre 2d6+2 pontos de dano.',
    },
    {
      name: 'Vanguardista',
      description:
        'Você recebe proficiência em armas de fogo e +2 em testes de Ofício (um qualquer, a sua escolha).',
      action(sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet {
        const sheetClone = cloneDeep(sheet);

        if (!sheetClone.classe.proficiencias.includes(PROFICIENCIAS.FOGO)) {
          sheetClone.classe.proficiencias.push(PROFICIENCIAS.FOGO);
          substeps.push({
            name: 'Vanguardista',
            value: 'Proficiência com armas de fogo',
          });
        }

        const oficioSkills = [
          Skill.OFICIO,
          Skill.OFICIO_ARMEIRO,
          Skill.OFICIO_ARTESANATO,
          Skill.OFICIO_ALQUIMIA,
          Skill.OFICIO_CULINARIA,
          Skill.OFICIO_ALFAIATE,
          Skill.OFICIO_ALVENARIA,
          Skill.OFICIO_CARPINTEIRO,
          Skill.OFICIO_JOALHEIRO,
          Skill.OFICIO_FAZENDEIRO,
          Skill.OFICIO_PESCADOR,
          Skill.OFICIO_ESTALAJADEIRO,
          Skill.OFICIO_ESCRITA,
          Skill.OFICIO_ESCULTOR,
          Skill.OFICIO_EGENHOQUEIRO,
          Skill.OFICIO_PINTOR,
          Skill.OFICIO_MINERADOR,
        ];

        // To make better sheets, let's use a skill from this type that is already on the sheet

        const allowedSkills = sheetClone.skills.filter((skill) =>
          oficioSkills.includes(skill)
        );

        let randomSkill = getNotRepeatedRandom([], 'skill', allowedSkills);

        // If there is no skill of this type, let's get a new random one (just for safety)
        if (!randomSkill)
          randomSkill = getNotRepeatedRandom([], 'skill', oficioSkills);

        sheetClone.skills.push(randomSkill);

        substeps.push({
          name: 'Vanguardista',
          value: `+2 em ${randomSkill}`,
        });

        if (
          !sheetClone.completeSkills?.some(
            (skill) => skill.name === randomSkill
          )
        ) {
          sheetClone.completeSkills = [
            ...(sheetClone.completeSkills || []),
            { name: randomSkill, others: 2 },
          ];
        } else {
          sheetClone.completeSkills = Object.values(
            sheetClone.completeSkills || {}
          ).map((skill) => {
            if (skill.name === randomSkill) {
              return {
                ...skill,
                others: (skill.others || 0) + 2,
              };
            }
            return skill;
          });
        }

        return sheetClone;
      },
    },
  ],
};

export default KLIREN;
