import Race from '../../../../interfaces/Race';
import { Atributo } from '../atributos';
import { spellsCircle1 } from '../magias/generalSpells';

const seaSongSpells = [
  spellsCircle1.amedrontar,
  spellsCircle1.comando,
  spellsCircle1.despedacar,
  spellsCircle1.enfeiticar,
  spellsCircle1.hipnotismo,
  spellsCircle1.sono,
];

// const goodWeapons = [Armas.TRIDENTE.nome, Armas.LANCA.nome, Armas.AZAGAIA.nome];

const SEREIA: Race = {
  name: 'Sereia',
  attributes: {
    attrs: [
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    OCEANO: 1,
    THWOR: 1,
  },
  abilities: [
    {
      name: 'Canção dos Mares',
      description:
        'Você pode lançar duas das magias a seguir: Amedrontar, Comando, Despedaçar, Enfeitiçar, Hipnotismo ou Sono (atributo-chave Carisma). Caso aprenda novamente uma dessas magias, seu custo diminui em –1 PM.',
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Canção dos Mares',
          },
          action: {
            type: 'learnSpell',
            availableSpells: seaSongSpells,
            pick: 2,
            customAttribute: Atributo.CARISMA,
          },
        },
      ],
    },
    {
      name: 'Mestre do Tridente',
      description:
        'Para você, o tridente é uma arma simples. Além disso, você recebe +2 em rolagens de dano com azagaias, lanças e tridentes',
      sheetBonuses: [
        {
          source: {
            type: 'race',
            raceName: 'Sereia',
          },
          target: {
            type: 'WeaponDamage',
            weaponTags: ['armaDeMar'],
          },
          modifier: {
            type: 'Fixed',
            value: 2,
          },
        },
        // "O tridente é uma arma simples para você": proficiência nomeada,
        // reconhecida por isProficientWithWeapon (evita o -5 de não
        // proficiência). Lança e Azagaia já são armas simples.
        {
          source: {
            type: 'race',
            raceName: 'Sereia',
          },
          target: {
            type: 'Proficiency',
            proficiency: 'Tridente',
          },
          modifier: {
            type: 'Fixed',
            value: 1,
          },
        },
      ],
    },
    {
      name: 'Transformação Anfíbia',
      description:
        'Você pode respirar debaixo d’água e possui uma cauda que fornece deslocamento de natação 12m. Quando fora d’água, sua cauda desaparece e dá lugar a pernas (deslocamento 9m). Se permanecer mais de um dia sem contato com água, você não recupera PM com descanso até voltar para a água (ou, pelo menos, tomar um bom banho!).',
    },
  ],
};

export default SEREIA;
