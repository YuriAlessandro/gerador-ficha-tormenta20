/**
 * Regression tests para o guard de integridade do pipeline de save
 * (bug do wipe, jul/2026): o fluxo "Editar" de Meus Personagens carregava a
 * ficha da listagem leve (sem atributos/skills/bag), o normalizeSheet
 * preenchia zeros e o primeiro save gravava a ficha zerada na nuvem — e um
 * delta com campo crítico ausente fazia o backend dar $unset permanente.
 */
import { describe, it, expect } from 'vitest';
import {
  computeSheetDelta,
  stripSheetForStorage,
  detectCriticalWipe,
  isSheetIntegrityError,
  SheetIntegrityError,
  NEVER_UNSET_SHEET_KEYS,
} from '../../functions/sheetPayloadOptimizer';
import generateRandomSheet from '../../functions/general';
import SelectOptions from '../../interfaces/SelectedOptions';
import { SupplementId } from '../../types/supplement.types';
import { allSpellSchools } from '../../interfaces/Spells';
import { SpellPath } from '../../interfaces/Class';
import { Atributo } from '../../data/systems/tormenta20/atributos';

const zeroedAtributos = {
  Força: { name: 'Força', value: 0 },
  Destreza: { name: 'Destreza', value: 0 },
  Constituição: { name: 'Constituição', value: 0 },
  Inteligência: { name: 'Inteligência', value: 0 },
  Sabedoria: { name: 'Sabedoria', value: 0 },
  Carisma: { name: 'Carisma', value: 0 },
};

const healthyAtributos = {
  ...zeroedAtributos,
  Força: { name: 'Força', value: 2 },
  Carisma: { name: 'Carisma', value: 1 },
};

const healthyBaseline: Record<string, unknown> = {
  atributos: healthyAtributos,
  skills: ['Luta', 'Fortitude'],
  bag: { equipments: { Arma: [{ nome: 'Espada longa' }], Armadura: [] } },
  nivel: 3,
  manualMaxPV: 30,
};

const wipedSheet: Record<string, unknown> = {
  atributos: zeroedAtributos,
  skills: [],
  bag: { equipments: {} },
  nivel: 3,
};

describe('computeSheetDelta - proteção de chaves críticas', () => {
  it('ainda emite null ($unset) para chave não-crítica removida', () => {
    const updated = { ...healthyBaseline };
    delete updated.manualMaxPV;
    const delta = computeSheetDelta(healthyBaseline, updated);
    expect(delta).not.toBeNull();
    expect(delta?.manualMaxPV).toBeNull();
  });

  it.each([...NEVER_UNSET_SHEET_KEYS])(
    'nunca emite null ($unset) para a chave crítica "%s"',
    (key) => {
      const baseline = { ...healthyBaseline, [key]: { some: 'data' } };
      const updated = { ...baseline };
      delete updated[key];
      const delta = computeSheetDelta(baseline, updated);
      // A chave crítica ausente é ignorada — nunca vira $unset
      expect(delta?.[key]).not.toBeNull();
      if (delta) expect(key in delta).toBe(false);
    }
  );
});

describe('detectCriticalWipe - com baseline', () => {
  it('detecta os dois grupos ao zerar atributos e esvaziar skills', () => {
    const wiped = detectCriticalWipe(healthyBaseline, wipedSheet);
    expect(wiped).toContain('atributos');
    expect(wiped).toContain('skills');
    expect(wiped).toContain('bag');
    expect(wiped.length).toBeGreaterThanOrEqual(2);
  });

  it('wipe de um único grupo retorna só aquele grupo (vender tudo é legítimo)', () => {
    const soldEverything = {
      ...healthyBaseline,
      bag: { equipments: { Arma: [] } },
    };
    expect(detectCriticalWipe(healthyBaseline, soldEverything)).toEqual([
      'bag',
    ]);
  });

  it('ignora ameaças (isThreat)', () => {
    expect(
      detectCriticalWipe(healthyBaseline, { ...wipedSheet, isThreat: true })
    ).toEqual([]);
    expect(
      detectCriticalWipe({ ...healthyBaseline, isThreat: true }, wipedSheet)
    ).toEqual([]);
  });

  it('não acusa nada quando o baseline já estava zerado', () => {
    expect(detectCriticalWipe(wipedSheet, wipedSheet)).toEqual([]);
  });
});

describe('detectCriticalWipe - sem baseline (assinatura absoluta)', () => {
  it('detecta a assinatura do wipe (atributos todos zero + skills vazio)', () => {
    expect(detectCriticalWipe(undefined, wipedSheet)).toEqual([
      'atributos',
      'skills',
    ]);
  });

  it('não acusa ficha com atributos reais', () => {
    expect(detectCriticalWipe(undefined, healthyBaseline)).toEqual([]);
  });

  it('não acusa ameaças mesmo sem atributos', () => {
    expect(
      detectCriticalWipe(undefined, { ...wipedSheet, isThreat: true })
    ).toEqual([]);
  });
});

describe('detectCriticalWipe - sem falso positivo com ficha real', () => {
  it('ficha gerada comparada com o próprio stripped não acusa wipe', () => {
    const selectedOptions: SelectOptions = {
      nivel: 1,
      classe: '',
      raca: '',
      origin: '',
      devocao: { label: 'Não devoto', value: '--' },
      supplements: [SupplementId.TORMENTA20_CORE],
    };
    const sheet = generateRandomSheet(selectedOptions);
    const stripped = stripSheetForStorage(sheet);
    expect(detectCriticalWipe(stripped, stripped)).toEqual([]);
    expect(detectCriticalWipe(undefined, stripped)).toEqual([]);
  });
});

describe('isSheetIntegrityError', () => {
  it('reconhece a instância direta', () => {
    expect(isSheetIntegrityError(new SheetIntegrityError(['atributos']))).toBe(
      true
    );
  });

  it('reconhece o erro serializado pelo Redux (unwrap)', () => {
    expect(
      isSheetIntegrityError({
        name: 'SheetIntegrityError',
        message: 'Salvamento bloqueado',
      })
    ).toBe(true);
  });

  it('não acusa outros erros', () => {
    expect(isSheetIntegrityError(new Error('network'))).toBe(false);
    expect(isSheetIntegrityError(undefined)).toBe(false);
  });
});

/**
 * `stripSheetForStorage` reconstrói `classe.spellPath` campo a campo — todo
 * campo novo tem que ser adicionado lá, senão a regra some ao salvar na nuvem.
 * Linhagem Abençoada: 4 magias iniciais + teto de 1º círculo para as divinas.
 */
describe('stripSheetForStorage - spellPath da Linhagem Abençoada', () => {
  it('preserva initialSpells, includeDivineSchools e crossTraditionRules', () => {
    const sheet = generateRandomSheet({
      nivel: 1,
      raca: 'Humano',
      classe: 'Arcanista',
      origin: '',
      devocao: { label: '--', value: '--' },
      supplements: [SupplementId.TORMENTA20_CORE],
    } as SelectOptions);

    sheet.classe.subname = 'Feiticeiro';
    sheet.classe.spellPath = {
      initialSpells: 4,
      spellType: 'Arcane',
      includeDivineSchools: allSpellSchools,
      crossTraditionRules: {
        maxCircle: 1,
        maxCircleByPower: [{ powerName: 'Herança Aprimorada', maxCircle: 3 }],
        minInitialSpells: 1,
      },
      qtySpellsLearnAtLevel: () => 1,
      spellCircleAvailableAtLevel: () => 1,
      keyAttribute: Atributo.CARISMA,
    };

    // `stripSheetForStorage` devolve Record<string, unknown> (payload de rede).
    const stripped = stripSheetForStorage(sheet) as unknown as {
      classe: { spellPath?: SpellPath };
    };
    const { spellPath } = stripped.classe;

    expect(spellPath?.initialSpells).toBe(4);
    expect(spellPath?.includeDivineSchools).toEqual(allSpellSchools);
    expect(spellPath?.crossTraditionRules).toEqual({
      maxCircle: 1,
      maxCircleByPower: [{ powerName: 'Herança Aprimorada', maxCircle: 3 }],
      minInitialSpells: 1,
    });
  });
});
