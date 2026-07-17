import { applyRaceCustomizationToSheet } from '../applyRaceCustomizationToSheet';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import Race, { RaceAbility } from '../../interfaces/Race';
import Skill from '../../interfaces/Skills';
import { RACE_SIZES } from '../../data/systems/tormenta20/races/raceSizes/raceSizes';

const makeFireAffinityAbility = (): RaceAbility => ({
  name: 'Afinidade Elemental (Fogo)',
  description: 'RD Fogo 5',
  sheetActions: [
    {
      source: { type: 'power', name: 'Afinidade Elemental (Fogo)' },
      action: { type: 'addSense', sense: 'Redução de fogo 5' },
    },
  ],
  sheetBonuses: [
    {
      source: { type: 'power', name: 'Afinidade Elemental (Fogo)' },
      target: { type: 'DamageReduction', damageType: 'Fogo' },
      modifier: { type: 'Fixed', value: 5 },
    },
  ],
});

const makeVooAbility = (): RaceAbility => ({
  name: 'Voo',
  description: 'Flutuar 1,5m',
  sheetActions: [
    {
      source: { type: 'power', name: 'Voo' },
      action: {
        type: 'addSense',
        sense: 'Flutuar 1,5m; Imune a dano por queda',
      },
    },
  ],
});

const makeVisaoFeericaAbility = (): RaceAbility => ({
  name: 'Visão Feérica',
  description: 'Visão na penumbra',
  sheetActions: [
    {
      source: { type: 'power', name: 'Visão Feérica' },
      action: {
        type: 'addSense',
        sense: 'Visão na penumbra; Visão Mística permanente',
      },
    },
  ],
});

const makeLinguaNaturezaAbility = (): RaceAbility => ({
  name: 'Língua da Natureza',
  description: '+2 Adestramento e Sobrevivência',
  sheetBonuses: [
    {
      source: { type: 'power', name: 'Língua da Natureza' },
      target: { type: 'Skill', name: Skill.ADESTRAMENTO },
      modifier: { type: 'Fixed', value: 2 },
    },
    {
      source: { type: 'power', name: 'Língua da Natureza' },
      target: { type: 'Skill', name: Skill.SOBREVIVENCIA },
      modifier: { type: 'Fixed', value: 2 },
    },
  ],
});

const makeFixedDuendeAbilities = (): RaceAbility[] => [
  { name: 'Tipo de Criatura', description: 'Feérico' },
  { name: 'Aversão a Ferro', description: 'Sofre dano' },
  { name: 'Aversão a Sinos', description: 'Sofre dano' },
];

const makeDuendeRace = (presenteAbilities: RaceAbility[]): Race => ({
  name: 'Duende',
  attributes: { attrs: [] },
  faithProbability: {},
  abilities: [...makeFixedDuendeAbilities(), ...presenteAbilities],
  size: RACE_SIZES.MEDIO,
});

/**
 * Simulates the post-random state: a sheet generated with 3 random presentes
 * already applied (sentidos, sheetBonuses, sheetActionHistory entries).
 */
const buildPendingDuendeSheet = () => {
  const sheet = createMockCharacterSheet();
  sheet.raca = makeDuendeRace([
    makeFireAffinityAbility(),
    makeVooAbility(),
    makeVisaoFeericaAbility(),
  ]);
  sheet.sentidos = [
    'Redução de fogo 5',
    'Flutuar 1,5m; Imune a dano por queda',
    'Visão na penumbra; Visão Mística permanente',
  ];
  sheet.sheetBonuses = [
    {
      source: { type: 'power', name: 'Afinidade Elemental (Fogo)' },
      target: { type: 'DamageReduction', damageType: 'Fogo' },
      modifier: { type: 'Fixed', value: 5 },
    },
  ];
  sheet.sheetActionHistory = [
    {
      source: { type: 'race', raceName: 'Duende' },
      changes: [
        { type: 'PowerAdded', powerName: 'Tipo de Criatura' },
        { type: 'PowerAdded', powerName: 'Aversão a Ferro' },
        { type: 'PowerAdded', powerName: 'Aversão a Sinos' },
        { type: 'PowerAdded', powerName: 'Afinidade Elemental (Fogo)' },
        { type: 'PowerAdded', powerName: 'Voo' },
        { type: 'PowerAdded', powerName: 'Visão Feérica' },
      ],
    },
    {
      source: { type: 'power', name: 'Afinidade Elemental (Fogo)' },
      powerName: 'Afinidade Elemental (Fogo)',
      changes: [{ type: 'SenseAdded', sense: 'Redução de fogo 5' }],
    },
    {
      source: { type: 'power', name: 'Voo' },
      powerName: 'Voo',
      changes: [
        {
          type: 'SenseAdded',
          sense: 'Flutuar 1,5m; Imune a dano por queda',
        },
      ],
    },
    {
      source: { type: 'power', name: 'Visão Feérica' },
      powerName: 'Visão Feérica',
      changes: [
        {
          type: 'SenseAdded',
          sense: 'Visão na penumbra; Visão Mística permanente',
        },
      ],
    },
  ];
  return sheet;
};

describe('applyRaceCustomizationToSheet', () => {
  describe('Duende presentes swap (regression for user-reported bug)', () => {
    it('removes senses from presentes that were dropped in customization', () => {
      const pending = buildPendingDuendeSheet();

      const newRace = makeDuendeRace([makeFireAffinityAbility()]);

      const result = applyRaceCustomizationToSheet(pending, newRace, {
        raceSizeCategory: 'medio',
      });

      expect(result.sentidos).toBeDefined();
      expect(result.sentidos).not.toContain(
        'Flutuar 1,5m; Imune a dano por queda'
      );
      expect(result.sentidos).not.toContain(
        'Visão na penumbra; Visão Mística permanente'
      );
      expect(result.sentidos).toContain('Redução de fogo 5');
    });

    it('keeps only sheetBonuses from selected presentes', () => {
      const pending = buildPendingDuendeSheet();

      const newRace = makeDuendeRace([makeFireAffinityAbility()]);

      const result = applyRaceCustomizationToSheet(pending, newRace);

      const fireRdBonuses = result.sheetBonuses.filter(
        (b) =>
          b.target.type === 'DamageReduction' && b.target.damageType === 'Fogo'
      );
      expect(fireRdBonuses).toHaveLength(1);
      expect(result.reducaoDeDano?.Fogo).toBe(5);
    });

    it('drops sheetActionHistory entries for dropped presentes', () => {
      const pending = buildPendingDuendeSheet();

      const newRace = makeDuendeRace([makeFireAffinityAbility()]);

      const result = applyRaceCustomizationToSheet(pending, newRace);

      const removedNames = ['Voo', 'Visão Feérica'];
      removedNames.forEach((name) => {
        const entry = result.sheetActionHistory.find(
          (e) => e.powerName === name
        );
        expect(entry).toBeUndefined();
      });

      const fireEntry = result.sheetActionHistory.find(
        (e) => e.powerName === 'Afinidade Elemental (Fogo)'
      );
      expect(fireEntry).toBeDefined();
    });

    it('replaces aggregate race history entry with the new abilities list', () => {
      const pending = buildPendingDuendeSheet();

      const newRace = makeDuendeRace([makeFireAffinityAbility()]);

      const result = applyRaceCustomizationToSheet(pending, newRace);

      const raceEntries = result.sheetActionHistory.filter(
        (e) => e.source.type === 'race' && e.source.raceName === 'Duende'
      );
      expect(raceEntries).toHaveLength(1);

      const powerNames = raceEntries[0].changes
        .filter((c) => c.type === 'PowerAdded')
        .map((c) => (c.type === 'PowerAdded' ? c.powerName : ''));

      expect(powerNames).toContain('Afinidade Elemental (Fogo)');
      expect(powerNames).not.toContain('Voo');
      expect(powerNames).not.toContain('Visão Feérica');
    });

    it('propagates metadata fields onto the sheet', () => {
      const pending = buildPendingDuendeSheet();

      const newRace = makeDuendeRace([makeFireAffinityAbility()]);

      const result = applyRaceCustomizationToSheet(pending, newRace, {
        raceSizeCategory: 'pequeno',
        duendeNature: 'mineral',
        duendePresentes: ['afinidade-fogo'],
        duendeTabuSkill: Skill.ATUACAO,
      });

      expect(result.raceSizeCategory).toBe('pequeno');
      expect(result.duendeNature).toBe('mineral');
      expect(result.duendePresentes).toEqual(['afinidade-fogo']);
      expect(result.duendeTabuSkill).toBe(Skill.ATUACAO);
    });
  });

  describe('Skill-based presente swap', () => {
    it('removes skill bonuses when an ability with sheetBonuses is dropped', () => {
      const sheet = createMockCharacterSheet();
      sheet.raca = makeDuendeRace([makeLinguaNaturezaAbility()]);
      sheet.sheetBonuses = [
        ...makeLinguaNaturezaAbility().sheetBonuses!.map((b) => ({ ...b })),
      ];
      sheet.sheetActionHistory = [
        {
          source: { type: 'race', raceName: 'Duende' },
          changes: [
            { type: 'PowerAdded', powerName: 'Tipo de Criatura' },
            { type: 'PowerAdded', powerName: 'Aversão a Ferro' },
            { type: 'PowerAdded', powerName: 'Aversão a Sinos' },
            { type: 'PowerAdded', powerName: 'Língua da Natureza' },
          ],
        },
      ];

      const newRace = makeDuendeRace([makeFireAffinityAbility()]);
      const result = applyRaceCustomizationToSheet(sheet, newRace);

      const skillBonuses = result.sheetBonuses.filter(
        (b) =>
          b.target.type === 'Skill' &&
          (b.target.name === Skill.ADESTRAMENTO ||
            b.target.name === Skill.SOBREVIVENCIA)
      );
      expect(skillBonuses).toHaveLength(0);

      expect(result.reducaoDeDano?.Fogo).toBe(5);
    });
  });

  describe('Idempotency', () => {
    it('keeps the sheet stable when the new race has the same abilities', () => {
      const pending = buildPendingDuendeSheet();
      const sameAbilities = pending.raca.abilities.map((a) => ({ ...a }));
      const sameRace = makeDuendeRace(
        sameAbilities.filter(
          (a) => !makeFixedDuendeAbilities().some((f) => f.name === a.name)
        )
      );

      const result = applyRaceCustomizationToSheet(pending, sameRace);

      expect(result.sentidos).toContain('Redução de fogo 5');
      expect(result.sentidos).toContain('Flutuar 1,5m; Imune a dano por queda');
      expect(result.sentidos).toContain(
        'Visão na penumbra; Visão Mística permanente'
      );
      expect(result.reducaoDeDano?.Fogo).toBe(5);
    });
  });

  describe('Edge cases', () => {
    it('does not throw when a removed ability has no sheetActions', () => {
      const sheet = createMockCharacterSheet();
      const purelyDescriptive: RaceAbility = {
        name: 'Encantar Objetos',
        description: 'Habilidade puramente descritiva',
      };
      sheet.raca = makeDuendeRace([purelyDescriptive]);
      sheet.sheetActionHistory = [
        {
          source: { type: 'race', raceName: 'Duende' },
          changes: [
            { type: 'PowerAdded', powerName: 'Tipo de Criatura' },
            { type: 'PowerAdded', powerName: 'Aversão a Ferro' },
            { type: 'PowerAdded', powerName: 'Aversão a Sinos' },
            { type: 'PowerAdded', powerName: 'Encantar Objetos' },
          ],
        },
      ];

      const newRace = makeDuendeRace([makeFireAffinityAbility()]);

      expect(() => applyRaceCustomizationToSheet(sheet, newRace)).not.toThrow();
    });
  });
});
