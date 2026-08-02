import {
  resolveCrossTraditionMaxCircle,
  getExclusiveCrossNames,
  pickWithMinimumCrossTradition,
} from '../spellPathUtils';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import { Spell } from '../../interfaces/Spells';
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
    // "Luz" é arcana E divina de 1º círculo — escolhê-la não satisfaz a
    // exigência de "uma magia divina" da Linhagem Abençoada.
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
