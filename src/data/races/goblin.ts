import Skill from '@/interfaces/Skills';
import { cloneDeep } from 'lodash';
import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';
import { RACE_SIZES } from './raceSizes/raceSizes';

const GOBLIN: Race = {
  name: 'Goblin',
  attributes: {
    attrs: [
      { attr: Atributo.DESTREZA, mod: 2 },
      { attr: Atributo.INTELIGENCIA, mod: 1 },
      { attr: Atributo.CARISMA, mod: -1 },
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    HYNINN: 1,
    MEGALOKK: 1,
    NIMB: 1,
    THWOR: 2,
  },
  size: RACE_SIZES.PEQUENO,
  abilities: [
    {
      name: 'Engenhoso',
      description:
        'Você não sofre penalidades em testes de perícia por não usar kits. Se usar o kit, recebe +2 no teste de perícia.',
    },
    {
      name: 'Espelunqueiro',
      description:
        'Você recebe visão no escuro e deslocamento de escalada igual ao seu deslocamento terrestre.',
      action(sheet, subSteps) {
        const sheetClone = cloneDeep(sheet);

        if (!sheetClone.sentidos?.includes('Visão no escuro')) {
          sheetClone.sentidos = [
            ...(sheetClone.sentidos || []),
            'Visão no escuro',
          ];
        }

        subSteps.push({
          name: 'Espelunqueiro',
          value: 'Você recebe visão no escuro',
        });

        return sheetClone;
      },
    },
    {
      name: 'Peste Esguia',
      description:
        'Seu tamanho é Pequeno (veja a página 106), mas seu deslocamento se mantém 9m. Apesar de pequenos, goblins são rápidos.',
    },
    {
      name: 'Rato das Ruas',
      description:
        'Você recebe +2 em Fortitude e sua recuperação de PV e PM nunca é inferior ao seu nível.',
      action(sheet, subSteps) {
        const sheetClone = cloneDeep(sheet);

        subSteps.push({
          name: 'Rato das Ruas',
          value: '+2 em Fortitude',
        });

        sheetClone.completeSkills = sheetClone.completeSkills?.map((skill) => {
          if (skill.name === Skill.FORTITUDE) {
            return {
              ...skill,
              others: (skill.others || 0) + 2,
            };
          }
          return skill;
        });

        return sheetClone;
      },
    },
  ],
};

export default GOBLIN;
