import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';
import { RACE_SIZES } from './raceSizes/raceSizes';

const DUENDE: Race = {
  name: 'Duende',
  attributes: {
    attrs: [
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
    ],
  },
  setup: (race, choices) => {
    const raceClone = { ...race };

    // Tamanho
    const tamanho = choices.tamanho || 'Pequeno';
    if (tamanho === 'Minúsculo') {
      raceClone.size = RACE_SIZES.MINUSCULO;
      raceClone.getDisplacement = () => 6;
      raceClone.attributes.attrs.push({ attr: Atributo.FORCA, mod: -1 });
    } else if (tamanho === 'Pequeno') {
      raceClone.size = RACE_SIZES.PEQUENO;
      raceClone.getDisplacement = () => 6;
    } else if (tamanho === 'Médio') {
      raceClone.size = RACE_SIZES.MEDIO;
      raceClone.getDisplacement = () => 9;
    } else if (tamanho === 'Grande') {
      raceClone.size = RACE_SIZES.GRANDE;
      raceClone.getDisplacement = () => 9;
      raceClone.attributes.attrs.push({ attr: Atributo.DESTREZA, mod: -1 });
    }

    // Natureza
    const natureza = choices.natureza || 'Animal';
    if (natureza === 'Animal') {
      // Bonus de atributo da natureza animal
      raceClone.attributes.attrs.push({ attr: 'any', mod: 1 });
    } else if (natureza === 'Vegetal') {
      raceClone.abilities.push({
        name: 'Natureza Vegetal',
        description: 'Imune a atordoamento e metamorfose. Pode usar Florescer Feérico.',
      });
    } else if (natureza === 'Mineral') {
      raceClone.abilities.push({
        name: 'Natureza Mineral',
        description: 'Imunidade a efeitos de metabolismo, RD 5 (corte, fogo, perfuração).',
      });
    }

    // Presentes
    const presentes = choices.presentes || [];
    presentes.forEach((presente) => {
      raceClone.abilities.push({
        name: presente,
        description: `Você pode usar a magia ${presente}.`,
      });
    });

    // Tabu
    const tabu = choices.tabu || 'Diplomacia';
    raceClone.abilities.push({
      name: 'Tabu',
      description: `Você possui uma regra de comportamento que não pode quebrar. Você sofre -5 de penalidade em ${tabu}. Quebrar o tabu tem consequências severas.`,
      sheetBonuses: [
        {
          source: {
            type: 'power',
            name: 'Tabu',
          },
          target: {
            type: 'Skill',
            name: tabu,
          },
          modifier: {
            type: 'Fixed',
            value: -5,
          },
        },
      ],
    });

    return raceClone;
  },
  faithProbability: {
    ALLIHANNA: 1,
    HYNINN: 1,
    NIMB: 1,
    THWOR: 2,
  },
  size: RACE_SIZES.PEQUENO,
  getDisplacement: () => 9,
  abilities: [
    {
      name: 'Tipo de Criatura',
      description: 'Você é uma criatura do tipo Espírito.',
    },
    // Limitações
    {
      name: 'Aversão a Ferro',
      description: 'Você sofre 1 ponto de dano adicional por dado de dano de armas de ferro/aço e 1d6 de dano por rodada se empunhar ou vestir itens de ferro/aço.',
    },
    {
      name: 'Aversão a Sinos',
      description: 'Ao ouvir um sino, fica alquebrado e esmorecido até o fim da cena.',
    },
  ],
};

export default DUENDE;
