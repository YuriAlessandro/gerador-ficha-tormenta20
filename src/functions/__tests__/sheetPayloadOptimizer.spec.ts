import {
  stripSheetForStorage,
  computeSheetDelta,
  rehydrateSheet,
} from '../sheetPayloadOptimizer';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { ClassDescription } from '../../interfaces/Class';
import GUERREIRO from '../../data/systems/tormenta20/classes/guerreiro';
import PROFICIENCIAS from '../../data/systems/tormenta20/proficiencias';
import { SupplementId } from '../../types/supplement.types';

/**
 * Ficha de teste com uma classe que o registry conhece — o rehydrate só
 * reconstrói dados de classe quando `getClassByName` resolve. O mock padrão usa
 * "Simple Test Class", que não existe no catálogo. Também isola `classe` para
 * não mutar o objeto compartilhado do mock entre testes.
 */
function guerreiroSheet(): CharacterSheet {
  const sheet = createMockCharacterSheet();
  sheet.classe = {
    ...sheet.classe,
    name: GUERREIRO.name,
    proficiencias: [...GUERREIRO.proficiencias],
  };
  sheet.sheetActionHistory = [];
  return sheet;
}

describe('stripSheetForStorage', () => {
  it('omite chaves de nível superior cujo valor é undefined', () => {
    const sheet = createMockCharacterSheet();
    sheet.manualMaxPV = undefined;
    sheet.manualMaxPM = undefined;

    const stripped = stripSheetForStorage(sheet);

    expect('manualMaxPV' in stripped).toBe(false);
    expect('manualMaxPM' in stripped).toBe(false);
  });

  it('preserva chaves cujo valor é zero, string vazia ou null', () => {
    const sheet = createMockCharacterSheet() as unknown as Record<
      string,
      unknown
    >;
    sheet.manualPVEdit = 0;
    sheet.bonusPV = null;
    sheet.alcunha = '';

    const stripped = stripSheetForStorage(sheet as unknown as CharacterSheet);

    expect(stripped.manualPVEdit).toBe(0);
    expect(stripped.bonusPV).toBe(null);
    expect(stripped.alcunha).toBe('');
  });

  it('preserva proficiências concedidas por origem/poder', () => {
    const sheet = guerreiroSheet();
    sheet.classe.proficiencias = [
      ...GUERREIRO.proficiencias,
      PROFICIENCIAS.FOGO,
    ];

    const stripped = stripSheetForStorage(sheet);

    expect((stripped.classe as ClassDescription).proficiencias).toContain(
      PROFICIENCIAS.FOGO
    );
  });
});

/**
 * Regressão do bug reportado na origem "Procurado: Vivo ou Morto": a
 * proficiência com armas de fogo sumia da ficha ao salvar/recarregar, porque o
 * strip zerava `classe.proficiencias` e o rehydrate só restaurava a lista da
 * classe — e o guard de histórico do applyPower impedia a reaplicação.
 */
describe('rehydrateSheet — proficiências', () => {
  const SUPPLEMENTS = [SupplementId.TORMENTA20_CORE];

  it('sobrevive ao round-trip strip → rehydrate', () => {
    const sheet = guerreiroSheet();
    sheet.classe.proficiencias = [
      ...GUERREIRO.proficiencias,
      PROFICIENCIAS.FOGO,
    ];

    const rehydrated = rehydrateSheet(stripSheetForStorage(sheet), SUPPLEMENTS);

    expect(rehydrated.classe.proficiencias).toContain(PROFICIENCIAS.FOGO);
    GUERREIRO.proficiencias.forEach((p) =>
      expect(rehydrated.classe.proficiencias).toContain(p)
    );
  });

  it('cura ficha antiga gravada com proficiencias zeradas, via histórico', () => {
    const sheet = guerreiroSheet();
    sheet.sheetActionHistory = [
      {
        source: {
          type: 'origin',
          originName: 'Procurado: Vivo ou Morto (Smokestone)',
        },
        powerName: 'Procurado: Vivo ou Morto',
        changes: [
          { type: 'ProficiencyAdded', proficiency: PROFICIENCIAS.FOGO },
        ],
      },
    ];

    // Simula o payload gravado pela versão anterior do strip.
    const stored = stripSheetForStorage(sheet);
    (stored.classe as ClassDescription).proficiencias = [];

    const rehydrated = rehydrateSheet(stored, SUPPLEMENTS);

    expect(rehydrated.classe.proficiencias).toContain(PROFICIENCIAS.FOGO);
  });

  it('não duplica proficiência presente na classe e no histórico', () => {
    const sheet = guerreiroSheet();
    sheet.sheetActionHistory = [
      {
        source: { type: 'origin', originName: 'Qualquer' },
        changes: [
          { type: 'ProficiencyAdded', proficiency: PROFICIENCIAS.MARCIAIS },
        ],
      },
    ];

    const rehydrated = rehydrateSheet(stripSheetForStorage(sheet), SUPPLEMENTS);

    const ocorrencias = rehydrated.classe.proficiencias.filter(
      (p) => p === PROFICIENCIAS.MARCIAIS
    );
    expect(ocorrencias).toHaveLength(1);
  });
});

describe('computeSheetDelta', () => {
  it('retorna null quando nada mudou', () => {
    const baseline = { nome: 'A', nivel: 1 };
    const updated = { nome: 'A', nivel: 1 };

    expect(computeSheetDelta(baseline, updated)).toBe(null);
  });

  it('inclui apenas chaves alteradas', () => {
    const baseline = { nome: 'A', nivel: 1, pv: 20 };
    const updated = { nome: 'B', nivel: 1, pv: 25 };

    expect(computeSheetDelta(baseline, updated)).toEqual({
      nome: 'B',
      pv: 25,
    });
  });

  it('emite null para chaves ausentes em updated (deleção explícita)', () => {
    const baseline = { nome: 'A', manualMaxPV: 50 };
    const updated = { nome: 'A' };

    expect(computeSheetDelta(baseline, updated)).toEqual({
      manualMaxPV: null,
    });
  });

  it('regressão: chave limpa via stripSheetForStorage vira null no delta', () => {
    // Cenário do bug: usuário define manualMaxPV, depois apaga (undefined).
    // stripSheetForStorage deve omitir a chave; computeSheetDelta deve
    // emitir null para que o backend interprete como $unset.
    const baselineSheet = createMockCharacterSheet();
    baselineSheet.manualMaxPV = 50;
    const baseline = stripSheetForStorage(baselineSheet);

    const updatedSheet = createMockCharacterSheet();
    updatedSheet.manualMaxPV = undefined;
    const updated = stripSheetForStorage(updatedSheet);

    const delta = computeSheetDelta(baseline, updated);

    expect(delta).not.toBe(null);
    expect(delta!.manualMaxPV).toBe(null);
  });

  it('ignora o marcador __stripped__', () => {
    const baselineSheet = createMockCharacterSheet();
    const updatedSheet = createMockCharacterSheet();
    updatedSheet.nome = 'Outro Nome';

    const baseline = stripSheetForStorage(baselineSheet);
    const updated = stripSheetForStorage(updatedSheet);

    const delta = computeSheetDelta(baseline, updated);

    expect(delta).not.toBe(null);
    expect('__stripped__' in delta!).toBe(false);
  });
});
