import _ from 'lodash';
import CharacterSheet, { SubStep } from '../../interfaces/CharacterSheet';
import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';
import { RACE_SIZES } from './raceSizes/raceSizes';

class ANAO implements Race {
  name = 'Anão';

  attributes = {
    attrs: [
      { attr: Atributo.CONSTITUICAO, mod: 4 },
      { attr: Atributo.SABEDORIA, mod: 2 },
      { attr: Atributo.DESTREZA, mod: -2 },
    ],
  };

  faithProbability = {
    AHARADAK: 1,
    ARSENAL: 1,
    KHALMYR: 1,
    LINWU: 1,
    THWOR: 1,
    TENEBRA: 1,
  };

  size = RACE_SIZES.MEDIO;

  displacement = 6;

  abilities = [
    {
      name: 'Conhecimento das Rochas',
      description:
        'Você recebe visão no escuro e +2 em testes de Percepção e Sobrevivência realizados no subterrâneo.',
    },
    {
      name: 'Devagar e Sempre',
      description:
        'Seu deslocamento é 6m (em vez de 9m). Porém, seu deslocamento não é reduzido por uso de armadura ou excesso de carga.',
    },
    {
      name: 'Tradição de Heredrimm',
      description:
        'Você é perito nas armas tradicionais anãs, seja por ter treinado com elas, seja por usá-las como ferramentas de ofício. Para você, todos os machados, martelos, marretas e picaretas são armas simples. Você recebe +2 em ataques com essas armas. (Não contabilizado)',
    },
    {
      name: 'Duro com Pedra',
      description:
        'Você recebe +3 pontos de vida no 1º nível e +1 por nível seguinte.',
      action(sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet {
        const finalPV = sheet.pv + 3;
        substeps.push({
          name: 'Duro com Pedra',
          value: `+3 PV inicial (${sheet.pv} + 3 = ${finalPV})`,
        });

        const finalAddPV = sheet.classe.addpv + 1;
        substeps.push({
          name: 'Duro com Pedra',
          value: `+1 PV por nível (${sheet.classe.addpv} + 1 = ${finalAddPV})`,
        });

        return _.merge(sheet, {
          pv: finalPV,
          classe: {
            addpv: finalAddPV,
          },
        });
      },
    },
  ];
}

export default ANAO;
