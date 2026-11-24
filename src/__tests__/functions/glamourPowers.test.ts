import { describe, expect, it } from 'vitest';
import { dataRegistry } from '@/data/registry';
import racePowers from '@/data/systems/tormenta20/herois-de-arton/powers/racePowers';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import {
  spellsCircle1,
  spellsCircle2,
} from '@/data/systems/tormenta20/magias/generalSpells';
import generateRandomSheet, { applyPower } from '@/functions/general';
import {
  getFilteredAvailableOptions,
  getPowerSelectionRequirements,
} from '@/functions/powers/manualPowerSelection';
import SelectOptions from '@/interfaces/SelectedOptions';
import { Spell, spellsCircles } from '@/interfaces/Spells';
import { SupplementId } from '@/types/supplement.types';

/**
 * Glamour, Glamour Maior (Duende/Eiradaan/Sílfide) e Grande Marca de Wynna
 * (Qareen) eram só texto: escolher o poder não abria o passo das magias e
 * nenhuma magia entrava na ficha.
 */

const SUPPS = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_HEROIS_ARTON,
];

const gerar = () =>
  generateRandomSheet({
    nivel: 5,
    classe: 'Guerreiro',
    raca: 'Elfo',
    origin: '',
    devocao: { label: 'Não devoto', value: '--' },
    supplements: SUPPS,
  } as unknown as SelectOptions);

const spellRequirement = (powerKey: string) =>
  getPowerSelectionRequirements(racePowers[powerKey])?.requirements.find(
    (req) => req.type === 'learnSpell'
  );

describe('Glamour e afins: escolha de magias', () => {
  it('Glamour pede 3 magias de 1º círculo', () => {
    const req = spellRequirement('GLAMOUR');
    expect(req?.pick).toBe(3);
  });

  it('Glamour oferece magias arcanas e divinas de 1º círculo', () => {
    const options = getFilteredAvailableOptions(
      spellRequirement('GLAMOUR')!,
      gerar(),
      SUPPS
    ) as Spell[];
    const names = options.map((s) => s.nome);

    expect(names).toContain(spellsCircle1.criarIlusao.nome); // arcana
    expect(names).toContain(spellsCircle1.curarFerimentos.nome); // divina
    expect(options.every((s) => s.spellCircle === spellsCircles.c1)).toBe(true);
  });

  it('Glamour Maior oferece 1º e 2º círculo, sem 3º', () => {
    const req = spellRequirement('GLAMOUR_MAIOR');
    expect(req?.pick).toBe(3);

    const options = getFilteredAvailableOptions(
      req!,
      gerar(),
      SUPPS
    ) as Spell[];
    const circles = new Set(options.map((s) => s.spellCircle));

    expect(circles).toEqual(new Set([spellsCircles.c1, spellsCircles.c2]));
    expect(options.map((s) => s.nome)).toContain(
      Object.values(spellsCircle2)[0].nome
    );
    // Sem duplicatas
    expect(new Set(options.map((s) => s.nome)).size).toBe(options.length);
  });

  it('Glamour Maior inclui magias dos suplementos ativos nos dois círculos', () => {
    const coreNames = new Set(
      [...Object.values(spellsCircle1), ...Object.values(spellsCircle2)].map(
        (s) => s.nome
      )
    );
    const supplementOnly = (circle: number) =>
      [
        ...dataRegistry.getArcaneSpellsByCircleAndSupplements(circle, SUPPS),
        ...dataRegistry.getDivineSpellsByCircleAndSupplements(circle, SUPPS),
      ]
        .map((s) => s.nome)
        .filter((nome) => !coreNames.has(nome));

    const extraC1 = supplementOnly(1);
    const extraC2 = supplementOnly(2);
    expect(extraC1.length).toBeGreaterThan(0);
    expect(extraC2.length).toBeGreaterThan(0);

    const names = (
      getFilteredAvailableOptions(
        spellRequirement('GLAMOUR_MAIOR')!,
        gerar(),
        SUPPS
      ) as Spell[]
    ).map((s) => s.nome);

    expect(names).toEqual(expect.arrayContaining([...extraC1, ...extraC2]));
  });

  it('Grande Marca de Wynna pede 1 magia de 1º círculo', () => {
    expect(spellRequirement('GRANDE_MARCA_DE_WYNNA')?.pick).toBe(1);
  });

  it('as magias escolhidas entram na ficha com atributo-chave Carisma', () => {
    const escolhidas = [
      spellsCircle1.criarIlusao,
      spellsCircle1.enfeiticar,
      spellsCircle1.curarFerimentos,
    ];
    const sheet = gerar();
    const [updated] = applyPower(sheet, racePowers.GLAMOUR, {
      spells: escolhidas,
    });

    escolhidas.forEach((spell) => {
      const learned = updated.spells.find((s) => s.nome === spell.nome);
      expect(learned?.customKeyAttr).toBe(Atributo.CARISMA);
    });
  });

  it('sem escolha manual (ficha aleatória), sorteia 3 magias', () => {
    const sheet = gerar();
    const before = sheet.spells.length;
    const [updated] = applyPower(sheet, racePowers.GLAMOUR);
    expect(updated.spells.length - before).toBe(3);
  });
});
