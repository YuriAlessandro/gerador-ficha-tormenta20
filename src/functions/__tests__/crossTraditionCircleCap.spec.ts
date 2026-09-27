import {
  resolveCrossTraditionMaxCircle,
  getExclusiveCrossNames,
  pickWithMinimumCrossTradition,
  countTowardsCrossMinimum,
  buildSpellPool,
} from '../spellPathUtils';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import { allSpellSchools, Spell } from '../../interfaces/Spells';
import {
  HERANCA_APRIMORADA,
  HERANCA_SUPERIOR,
} from '../../data/systems/tormenta20/classes/arcanista';

/**
 * Helpers do teto de círculo da tradição oposta.
 *
 * Linhagem Abençoada (Deuses de Arton, pág. 33): "pode aprender magias divinas
 * de 1º círculo como magias de feiticeiro"; a Herança Aprimorada libera 2º e 3º
 * círculos e a Superior, 4º e 5º.
 */
describe('resolveCrossTraditionMaxCircle', () => {
  const ABENCOADA = {
    maxCircle: 1,
    maxCircleByPower: [
      { powerName: HERANCA_APRIMORADA, maxCircle: 3 },
      { powerName: HERANCA_SUPERIOR, maxCircle: 5 },
    ],
  };

  it('sem regra: null (sem teto) — default do Necromante e do Teurgista', () => {
    expect(resolveCrossTraditionMaxCircle(undefined, ['Qualquer'])).toBeNull();
  });

  it('sem poderes: usa o teto base', () => {
    expect(resolveCrossTraditionMaxCircle(ABENCOADA, [])).toBe(1);
  });

  it('Herança Aprimorada: 3º círculo', () => {
    expect(
      resolveCrossTraditionMaxCircle(ABENCOADA, [HERANCA_APRIMORADA])
    ).toBe(3);
  });

  it('Herança Superior: 5º círculo', () => {
    expect(resolveCrossTraditionMaxCircle(ABENCOADA, [HERANCA_SUPERIOR])).toBe(
      5
    );
  });

  it('as duas heranças: vence o maior teto', () => {
    expect(
      resolveCrossTraditionMaxCircle(ABENCOADA, [
        HERANCA_APRIMORADA,
        HERANCA_SUPERIOR,
      ])
    ).toBe(5);
  });

  it('poder desconhecido não destrava nada', () => {
    expect(resolveCrossTraditionMaxCircle(ABENCOADA, ['Magia Pungente'])).toBe(
      1
    );
  });
});

describe('getExclusiveCrossNames', () => {
  const CORE = [SupplementId.TORMENTA20_CORE];
  const arcane1 = dataRegistry.getArcaneSpellsByCircleAndSupplements(1, CORE);
  const divine1 = dataRegistry.getDivineSpellsByCircleAndSupplements(1, CORE);

  it('magia presente nas DUAS tradições não conta como cross', () => {
    // "Luz" é arcana E divina de 1º círculo: universal, não cross. Se ela
    // preenche o mínimo da Linhagem Abençoada é `countTowardsCrossMinimum`
    // quem decide.
    const arcaneNames = new Set(arcane1.map((s) => s.nome));
    const shared = divine1.find((s) => arcaneNames.has(s.nome));
    expect(shared).toBeDefined();

    const exclusive = getExclusiveCrossNames(divine1, arcane1);
    expect(exclusive.has(shared!.nome)).toBe(false);
  });

  it('magia exclusivamente divina conta como cross', () => {
    const arcaneNames = new Set(arcane1.map((s) => s.nome));
    const onlyDivine = divine1.find((s) => !arcaneNames.has(s.nome));
    expect(onlyDivine).toBeDefined();

    const exclusive = getExclusiveCrossNames(divine1, arcane1);
    expect(exclusive.has(onlyDivine!.nome)).toBe(true);
  });
});

describe('pickWithMinimumCrossTradition', () => {
  const makeSpell = (nome: string): Spell =>
    ({ nome, school: 'Evoc', spellCircle: '1º Circulo' } as Spell);

  const nativas = ['N1', 'N2', 'N3', 'N4', 'N5'].map(makeSpell);
  const cross = ['C1', 'C2'].map(makeSpell);
  const pool = [...nativas, ...cross];
  const crossNames = new Set(cross.map((s) => s.nome));

  it('garante o mínimo cross e respeita a quantidade total', () => {
    for (let i = 0; i < 30; i += 1) {
      const picked = pickWithMinimumCrossTradition(pool, crossNames, 4, 1);
      expect(picked).toHaveLength(4);
      expect(
        picked.filter((s) => crossNames.has(s.nome)).length
      ).toBeGreaterThanOrEqual(1);
      // Sem repetições.
      expect(new Set(picked.map((s) => s.nome)).size).toBe(4);
    }
  });

  it('mínimo 0: sorteio livre', () => {
    const picked = pickWithMinimumCrossTradition(pool, crossNames, 3, 0);
    expect(picked).toHaveLength(3);
  });

  it('degrada quando o pool cross é menor que o mínimo', () => {
    const picked = pickWithMinimumCrossTradition(
      nativas,
      new Set<string>(),
      3,
      2
    );
    expect(picked).toHaveLength(3);
  });

  it('nunca devolve mais que a quantidade pedida', () => {
    const picked = pickWithMinimumCrossTradition(pool, crossNames, 1, 2);
    expect(picked).toHaveLength(1);
  });
});

/**
 * Linhagem Abençoada: uma das 4 magias iniciais tem que ser divina. Universal
 * (arcana E divina) ocupa primeiro as vagas arcanas; o excedente conta como
 * divina.
 */
describe('countTowardsCrossMinimum', () => {
  const makeSpell = (nome: string): Spell =>
    ({ nome, school: 'Evoc', spellCircle: '1º Circulo' } as Spell);
  const arcanas = ['A1', 'A2', 'A3', 'A4'].map(makeSpell);
  const universais = ['U1', 'U2', 'U3', 'U4'].map(makeSpell);
  const divina = makeSpell('D1');
  const cross = new Set([divina.nome]);
  const shared = new Set(universais.map((s) => s.nome));
  const count = (selected: Spell[]) =>
    countTowardsCrossMinimum(selected, cross, shared, 4, 1);

  it('exclusiva divina sempre conta', () => {
    expect(count([divina])).toBe(1);
  });

  it('universal preenche as vagas arcanas antes de contar como divina', () => {
    expect(count([universais[0]])).toBe(0);
    expect(count(arcanas.slice(0, 2).concat(universais.slice(0, 2)))).toBe(1);
    expect(count(universais)).toBe(1);
  });

  it('3 arcanas + 1 universal completam a exigência', () => {
    expect(count([...arcanas.slice(0, 3), universais[0]])).toBe(1);
  });

  it('4 arcanas exclusivas não completam', () => {
    expect(count(arcanas)).toBe(0);
  });
});

describe('buildSpellPool — universais', () => {
  const SUPPLEMENTS = [
    SupplementId.TORMENTA20_CORE,
    SupplementId.TORMENTA20_DEUSES_ARTON,
  ];

  it('Linhagem Abençoada expõe as magias arcanas E divinas como universais', () => {
    const arcaneNames = new Set(
      dataRegistry
        .getArcaneSpellsByCircleAndSupplements(1, SUPPLEMENTS)
        .map((s) => s.nome)
    );
    const divineNames = dataRegistry
      .getDivineSpellsByCircleAndSupplements(1, SUPPLEMENTS)
      .map((s) => s.nome);
    const expected = divineNames.filter((nome) => arcaneNames.has(nome));

    const { sharedNames, crossNames } = buildSpellPool({
      spellPath: {
        spellType: 'Arcane',
        includeDivineSchools: allSpellSchools,
        crossTraditionRules: { maxCircle: 1, minInitialSpells: 1 },
      },
      maxCircle: 1,
      supplements: SUPPLEMENTS,
    });

    expect(expected.length).toBeGreaterThan(0);
    expect([...sharedNames].sort()).toEqual([...new Set(expected)].sort());
    expected.forEach((nome) => expect(crossNames.has(nome)).toBe(false));
  });

  it('sem tradição oposta não há universais', () => {
    const { sharedNames } = buildSpellPool({
      spellPath: { spellType: 'Arcane' },
      maxCircle: 1,
      supplements: SUPPLEMENTS,
    });
    expect(sharedNames.size).toBe(0);
  });
});
