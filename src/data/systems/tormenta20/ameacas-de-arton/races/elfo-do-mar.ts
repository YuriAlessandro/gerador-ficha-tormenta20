import Race from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';

const ELFO_DO_MAR: Race = {
  name: 'Elfo-do-Mar',
  attributes: {
    attrs: [
      { attr: Atributo.DESTREZA, mod: 2 },
      { attr: Atributo.CONSTITUICAO, mod: 1 },
      { attr: Atributo.INTELIGENCIA, mod: -1 },
    ],
  },
  faithProbability: {
    ALLIHANNA: 1,
    ARSENAL: 1,
    HYNINN: 1,
    MEGALOKK: 1,
    OCEANO: 1,
  },
  abilities: [
    {
      name: 'Arsenal Oceano',
      description:
        'Você recebe proficiência em arpão, rede e tridente e +2 em testes de ataque com essas armas. Se receber proficiência em uma dessas armas novamente, pode considerá-la uma arma leve.',
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Arsenal Oceano',
          },
          action: {
            type: 'addProficiency',
            availableProficiencies: ['Arpão', 'Rede', 'Tridente'],
            pick: 3,
          },
        },
      ],
      sheetBonuses: [
        {
          source: {
            type: 'power',
            name: 'Arsenal Oceano',
          },
          target: {
            type: 'WeaponAttack',
            weaponName: 'Arpão',
          },
          modifier: {
            type: 'Fixed',
            value: 2,
          },
        },
        {
          source: {
            type: 'power',
            name: 'Arsenal Oceano',
          },
          target: {
            type: 'WeaponAttack',
            weaponName: 'Rede',
          },
          modifier: {
            type: 'Fixed',
            value: 2,
          },
        },
        {
          source: {
            type: 'power',
            name: 'Arsenal Oceano',
          },
          target: {
            type: 'WeaponAttack',
            weaponName: 'Tridente',
          },
          modifier: {
            type: 'Fixed',
            value: 2,
          },
        },
      ],
    },
    {
      name: 'Cria das Águas',
      description:
        "Você possui deslocamento de natação igual a seu deslocamento em terra e visão na penumbra. Quando dentro d'água, você recebe percepção às cegas e +2 em Defesa e +2 em testes de Furtividade e Sobrevivência.",
    },
    {
      name: 'Dependência de Água',
      description:
        'Se permanecer mais de um dia sem contato com água, você não recupera PM com descanso e não pode voltar para a água (sem tomar um bom banho).',
    },
  ],
};

export default ELFO_DO_MAR;
