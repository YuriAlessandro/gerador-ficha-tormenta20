import { cloneDeep, merge } from 'lodash';
import { getNotRepeatedRandom } from '../../functions/randomUtils';
import CharacterSheet, { SubStep } from '../../interfaces/CharacterSheet';
import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';
import PROFICIENCIAS from '../proficiencias';

const KLIREN: Race = {
  name: 'Kliren',
  attributes: {
    attrs: [
      { attr: Atributo.INTELIGENCIA, mod: 4 },
      { attr: Atributo.CARISMA, mod: 2 },
      { attr: Atributo.FORCA, mod: -2 },
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
        'Sua natureza multifacetada fez com que você aprendesse conhecimentos variados. Você se torna treinado em uma perícia a sua escolha (não precisa ser da sua classe).Sua natureza multifacetada fez com que você aprendesse conhecimentos variados. Você se torna treinado em uma perícia a sua escolha (não precisa ser da sua classe).',
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
      name: 'Lógica Gnômica',
      description:
        'Quando faz um teste de atributo ou perícia, você pode gastar 2 PM para substituir o modificador de atributo utilizado por Inteligência. Por exemplo, ao fazer um teste de Atletismo você pode gastar 2 PM para usar seu modificador de Inteligência em vez do modificador de Força.Quando faz um teste de atributo ou perícia, você pode gastar 2 PM para substituir o modificador de atributo utilizado por Inteligência. Por exemplo, ao fazer um teste de Atletismo você pode gastar 2 PM para usar seu modificador de Inteligência em vez do modificador de Força.',
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

        return sheetClone;
      },
    },
  ],
};

export default KLIREN;
