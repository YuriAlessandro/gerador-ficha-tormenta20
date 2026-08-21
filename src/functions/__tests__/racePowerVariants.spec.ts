/**
 * Poderes de raça para variantes e para raças que "contam como" outra.
 *
 * O requisito `RequirementType.RACA` era avaliado com igualdade exata contra
 * `sheet.raca.name`, então três grupos ficavam de fora:
 *
 * 1. Raças Variantes (AdA): Soterrado ("variante da raça osteon", p. 354) e
 *    Trog Anão ("variante da raça trog", p. 39).
 * 2. Raças cuja habilidade racial diz "é considerado um X para efeitos
 *    relacionados a raça": Meio-Orc → Orc, Meio-Elfo → Elfo, Moreau → Humano.
 * 3. Nomes que o livro usa nos requisitos mas que não são o nome do catálogo:
 *    "Suraggel", "Aggelus", "Sulfure", "Sereia/Tritão".
 *
 * A cura é `Race.countsAsRaces` (mapa em `raceCountsAs.ts`) lida por
 * `isRaceOrVariantOf`. A relação é de mão única e não pode vazar entre raças
 * irmãs — daí os casos negativos.
 */
import { describe, it, expect } from 'vitest';
import _ from 'lodash';
import { isPowerAvailable } from '../powers';
import { rehydrateSheet, stripSheetForStorage } from '../sheetPayloadOptimizer';
import { normalizeSheet } from '../sheetNormalizer';
import { SupplementId } from '../../types/supplement.types';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import racePowers from '../../data/systems/tormenta20/herois-de-arton/powers/racePowers';
import Race from '../../interfaces/Race';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import CharacterSheet from '../../interfaces/CharacterSheet';

import SOTERRADO from '../../data/systems/tormenta20/ameacas-de-arton/races/soterrado';
import TROG_ANAO from '../../data/systems/tormenta20/ameacas-de-arton/races/trog-anao';
import MEIO_ORC from '../../data/systems/tormenta20/ameacas-de-arton/races/meio-orc';
import MOREAU from '../../data/systems/tormenta20/ameacas-de-arton/races/moreau';
import HARPIA from '../../data/systems/tormenta20/ameacas-de-arton/races/harpia';
import KOBOLDS from '../../data/systems/tormenta20/ameacas-de-arton/races/kobolds';
import MEIO_ELFO from '../../data/systems/tormenta20/herois-de-arton/races/meioElfo';
import OSTEON from '../../data/systems/tormenta20/races/osteon';
import TROG from '../../data/systems/tormenta20/races/trog';
import ELFO from '../../data/systems/tormenta20/races/elfo';
import SEREIA from '../../data/systems/tormenta20/races/sereia';
import AGGELUS from '../../data/systems/tormenta20/races/aggelus';
import SULFURE from '../../data/systems/tormenta20/races/sulfure';

/**
 * Ficha mínima com a raça trocada. Usa Elfo/etc. do catálogo, nunca Humano
 * como base de comparação: Humano sorteia um poder geral a cada recálculo e
 * deixa o teste intermitente.
 */
function sheetOf(race: Race, overrides: Partial<Race> = {}): CharacterSheet {
  const sheet = createMockCharacterSheet();
  sheet.raca = { ...race, ...overrides };
  return sheet;
}

describe('Raças Variantes herdam os poderes de raça da base', () => {
  it('Soterrado alcança os poderes de Osteon', () => {
    expect(isPowerAvailable(sheetOf(SOTERRADO), racePowers.OSSOS_AFIADOS)).toBe(
      true
    );
    expect(
      isPowerAvailable(sheetOf(SOTERRADO), racePowers.EXPLOSAO_OSSEA)
    ).toBe(true);
    expect(
      isPowerAvailable(sheetOf(SOTERRADO), racePowers.MANIPULACAO_ESQUELETICA)
    ).toBe(true);
  });

  it('Trog Anão alcança os poderes de Trog', () => {
    expect(
      isPowerAvailable(sheetOf(TROG_ANAO), racePowers.SALIVA_CORROSIVA)
    ).toBe(true);
    expect(isPowerAvailable(sheetOf(TROG_ANAO), racePowers.QUATRO_BRACOS)).toBe(
      true
    );
  });

  it('a relação é de mão única: a base não ganha os da variante', () => {
    // Osteon não é Trog nem Soterrado.
    expect(isPowerAvailable(sheetOf(OSTEON), racePowers.SALIVA_CORROSIVA)).toBe(
      false
    );
    // Trog não alcança poder exclusivo de Osteon.
    expect(isPowerAvailable(sheetOf(TROG), racePowers.OSSOS_AFIADOS)).toBe(
      false
    );
  });
});

describe('"considerado um X para efeitos relacionados a raça"', () => {
  it('Meio-Orc alcança os poderes de Orc (Sangue Orc, AdA p. 31)', () => {
    expect(isPowerAvailable(sheetOf(MEIO_ORC), racePowers.QUATRO_BRACOS)).toBe(
      true
    );

    // Dupla Conjuração tem pré-requisitos além da raça — satisfazê-los isola
    // o gate racial como a única coisa que estava barrando.
    const sheet = sheetOf(MEIO_ORC);
    sheet.atributos[Atributo.DESTREZA] = {
      name: Atributo.DESTREZA,
      value: 2,
    };
    sheet.generalPowers = [racePowers.DUPLA_INTELIGENCIA];
    expect(isPowerAvailable(sheet, racePowers.DUPLA_CONJURACAO)).toBe(true);
  });

  it('Meio-Elfo alcança os poderes de Elfo (Sangue Élfico)', () => {
    expect(
      isPowerAvailable(sheetOf(MEIO_ELFO), racePowers.ESGRIMA_ELFICA)
    ).toBe(true);
    expect(
      isPowerAvailable(sheetOf(MEIO_ELFO), racePowers.ARQUEARIA_ELFICA)
    ).toBe(true);
  });

  it('Meio-Elfo mantém os poderes que já citavam Meio-Elfo direto', () => {
    expect(isPowerAvailable(sheetOf(MEIO_ELFO), racePowers.CITADINO)).toBe(
      true
    );
    expect(
      isPowerAvailable(sheetOf(MEIO_ELFO), racePowers.ESCAPADA_CRIATIVA)
    ).toBe(true);
  });

  it('Elfo NÃO ganha os poderes exclusivos de Meio-Elfo', () => {
    expect(isPowerAvailable(sheetOf(ELFO), racePowers.ESCAPADA_CRIATIVA)).toBe(
      false
    );
    expect(isPowerAvailable(sheetOf(ELFO), racePowers.CITADINO)).toBe(false);
  });

  it('Moreau alcança os poderes de Humano (AdA p. 303)', () => {
    expect(isPowerAvailable(sheetOf(MOREAU), racePowers.CITADINO)).toBe(true);

    // Comandar Aprimorado exige Car 2 + o poder Comandar além da raça.
    const sheet = sheetOf(MOREAU);
    sheet.atributos[Atributo.CARISMA] = { name: Atributo.CARISMA, value: 2 };
    sheet.generalPowers = [
      { name: 'Comandar' } as (typeof sheet.generalPowers)[number],
    ];
    expect(isPowerAvailable(sheet, racePowers.COMANDAR_APRIMORADO)).toBe(true);
  });
});

describe('Magia Ofídica exige a herança do Moreau, não só a raça', () => {
  it('Moreau da Serpente alcança Magia Ofídica', () => {
    const sheet = sheetOf(MOREAU, { heritage: 'Serpente' });
    expect(isPowerAvailable(sheet, racePowers.MAGIA_OFIDICA)).toBe(true);
  });

  it('Moreau de outra herança NÃO alcança', () => {
    const sheet = sheetOf(MOREAU, { heritage: 'Lobo' });
    expect(isPowerAvailable(sheet, racePowers.MAGIA_OFIDICA)).toBe(false);
  });

  it('Moreau sem herança definida NÃO alcança', () => {
    const sheet = sheetOf(MOREAU, { heritage: undefined });
    expect(isPowerAvailable(sheet, racePowers.MAGIA_OFIDICA)).toBe(false);
  });
});

describe('apelidos do livro que divergem do nome do catálogo', () => {
  it('as duas heranças de Suraggel alcançam os poderes de "Suraggel"', () => {
    expect(
      isPowerAvailable(sheetOf(AGGELUS), racePowers.ASAS_EXTRAPLANARES)
    ).toBe(true);
    expect(
      isPowerAvailable(sheetOf(SULFURE), racePowers.ASAS_EXTRAPLANARES)
    ).toBe(true);
    expect(isPowerAvailable(sheetOf(AGGELUS), racePowers.ASAS_DE_ACO)).toBe(
      true
    );
  });

  it('os poderes exclusivos de cada herança não vazam para a irmã', () => {
    expect(isPowerAvailable(sheetOf(AGGELUS), racePowers.CRIANCA_DA_LUZ)).toBe(
      true
    );
    expect(isPowerAvailable(sheetOf(SULFURE), racePowers.CRIANCA_DA_LUZ)).toBe(
      false
    );

    expect(
      isPowerAvailable(sheetOf(SULFURE), racePowers.CRIANCA_DAS_TREVAS)
    ).toBe(true);
    expect(
      isPowerAvailable(sheetOf(AGGELUS), racePowers.CRIANCA_DAS_TREVAS)
    ).toBe(false);
  });

  it('Sereia alcança os poderes de "Sereia/Tritão"', () => {
    expect(isPowerAvailable(sheetOf(SEREIA), racePowers.CANTO_DA_SEREIA)).toBe(
      true
    );
    expect(isPowerAvailable(sheetOf(SEREIA), racePowers.PIRATA_OCEANICO)).toBe(
      true
    );
    expect(
      isPowerAvailable(sheetOf(SEREIA), racePowers.CAMUFLAGEM_MIMETICA)
    ).toBe(true);
  });

  it('Harpia alcança Asas de Aço (o requisito escrevia "Hárpia")', () => {
    expect(isPowerAvailable(sheetOf(HARPIA), racePowers.ASAS_DE_ACO)).toBe(
      true
    );
  });

  it('Kobolds alcança Entre as Pernas (o requisito escrevia "Kobold")', () => {
    const sheet = sheetOf(KOBOLDS);
    sheet.skills = [Skill.ACROBACIA];
    expect(isPowerAvailable(sheet, racePowers.ENTRE_AS_PERNAS)).toBe(true);
  });
});

describe('countsAsRaces sobrevive à persistência', () => {
  const SUPPLEMENTS = [
    SupplementId.TORMENTA20_CORE,
    SupplementId.TORMENTA20_AMEACAS_ARTON,
    SupplementId.TORMENTA20_HEROIS_ARTON,
  ];

  it('sobrevive à ida e volta pela nuvem', () => {
    // `stripSheetForStorage` usa lista FIXA de campos de `raca`: campo novo que
    // não entre nela é descartado em silêncio.
    const stored = JSON.parse(
      JSON.stringify(stripSheetForStorage(_.cloneDeep(sheetOf(SOTERRADO))))
    ) as Record<string, unknown>;
    const loaded = rehydrateSheet(stored, SUPPLEMENTS);

    expect(loaded.raca.countsAsRaces).toContain('Osteon');
    expect(isPowerAvailable(loaded, racePowers.OSSOS_AFIADOS)).toBe(true);
  });

  it('ficha da nuvem salva antes do campo existir é curada pelo catálogo', () => {
    const sheet = sheetOf(SOTERRADO);
    delete sheet.raca.countsAsRaces;

    const loaded = rehydrateSheet(
      sheet as unknown as Record<string, unknown>,
      SUPPLEMENTS
    );

    expect(loaded.raca.countsAsRaces).toContain('Osteon');
  });

  it('ficha do localStorage sem o campo é curada por normalizeSheet', () => {
    // O histórico local não passa por `rehydrateSheet` — entra via
    // `restoreSpellPath` → `normalizeSheet`.
    const sheet = sheetOf(TROG_ANAO);
    delete sheet.raca.countsAsRaces;

    normalizeSheet(sheet);

    expect(sheet.raca.countsAsRaces).toContain('Trog');
    expect(isPowerAvailable(sheet, racePowers.SALIVA_CORROSIVA)).toBe(true);
  });

  it('não inventa parentesco para quem não tem', () => {
    const sheet = sheetOf(ELFO);
    normalizeSheet(sheet);

    expect(sheet.raca.countsAsRaces).toBeUndefined();
  });
});
