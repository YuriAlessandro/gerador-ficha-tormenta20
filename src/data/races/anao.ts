import _ from 'lodash';
import CharacterSheet, { SubStep } from '../../interfaces/CharacterSheet';
import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';
import { Armas } from '../equipamentos';

const DWARF_WEAPONS = [
  Armas.MACHADO_DE_BATALHA.nome,
  Armas.MACHADO_DE_GUERRA.nome,
  Armas.MACHADO_ANAO.nome,
  Armas.MACHADO_TAURICO.nome,
  Armas.MARTELO_DE_GUERRA.nome,
  Armas.PICARETA.nome,
];

const ANAO: Race = {
  name: 'Anão',
  attributes: {
    attrs: [
      { attr: Atributo.CONSTITUICAO, mod: 2 },
      { attr: Atributo.SABEDORIA, mod: 1 },
      { attr: Atributo.DESTREZA, mod: -1 },
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    ARSENAL: 1,
    KHALMYR: 1,
    LINWU: 1,
    THWOR: 1,
    TENEBRA: 1,
  },
  getDisplacement: () => 6,
  abilities: [
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
      action(sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet {
        const cloneSheet = _.cloneDeep(sheet);

        cloneSheet.bag.equipments.Arma = cloneSheet.bag.equipments.Arma.map(
          (equipment) => {
            if (DWARF_WEAPONS.includes(equipment.nome)) {
              return {
                ...equipment,
                tipo: 'Simples',
                atkBonus: (equipment.atkBonus || 0) + 2,
              };
            }
            return equipment;
          }
        );

        substeps.push({
          name: 'Tradição de Heredrimm',
          value: `+2 em ataques com armas simples anãs`,
        });

        return cloneSheet;
      },
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
  ],
};

export default ANAO;
