import { rehydrateSheet, stripSheetForStorage } from '../sheetPayloadOptimizer';
import {
  applySerializedOverrides,
  buildSpellPathFromSetup,
  serializeSpellPath,
} from '../multiclass';
import { restoreSpellPath } from '../general';
import { hasDerivedSpellAccess } from '../spells/derivedSpells';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { ClassDescription } from '../../interfaces/Class';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';

/**
 * `spellPath` carrega funções e não sobrevive à serialização, então é
 * reconstruído em vários pontos independentes. Um campo novo (`spellAccess`)
 * some SILENCIOSAMENTE se algum deles esquecer de copiá-lo — e o sintoma é a
 * aba de magias do Usurpador ficar vazia só depois de salvar e recarregar.
 *
 * Este spec é a rede de proteção desses pontos.
 */
describe('spellAccess sobrevive ao ciclo de persistência', () => {
  const SUPPLEMENTS: SupplementId[] = [
    SupplementId.TORMENTA20_CORE,
    SupplementId.TORMENTA20_HEROIS_ARTON,
  ];

  const usurpadorClass = (): ClassDescription => {
    const classe = dataRegistry
      .getClassesBySupplements(SUPPLEMENTS)
      .find((c) => c.name === 'Usurpador');
    if (!classe) throw new Error('Usurpador não encontrado no registry');
    return classe;
  };

  const buildUsurpador = (): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.nivel = 9;
    sheet.classe = { ...usurpadorClass() };
    sheet.spells = [];
    return sheet;
  };

  it('a classe do registry já nasce com spellAccess', () => {
    expect(usurpadorClass().spellPath?.spellAccess).toBe('allOfType');
  });

  it('sobrevive a strip → JSON → rehydrate', () => {
    const sheet = buildUsurpador();
    const stripped = stripSheetForStorage(sheet);

    // O strip monta o spellPath campo a campo: é exatamente aqui que um campo
    // novo é descartado se ninguém lembrar dele.
    const strippedClasse = stripped.classe as ClassDescription;
    expect(strippedClasse.spellPath?.spellAccess).toBe('allOfType');

    const roundTripped = JSON.parse(JSON.stringify(stripped)) as Record<
      string,
      unknown
    >;
    const rehydrated = rehydrateSheet(roundTripped, SUPPLEMENTS);
    expect(rehydrated.classe.spellPath?.spellAccess).toBe('allOfType');
  });

  it('sobrevive a JSON → restoreSpellPath (carga de ficha)', () => {
    const sheet = buildUsurpador();
    const loaded = JSON.parse(JSON.stringify(sheet)) as CharacterSheet;

    // Perda esperada da serialização: as funções somem.
    expect(typeof loaded.classe.spellPath?.spellCircleAvailableAtLevel).toBe(
      'undefined'
    );

    restoreSpellPath(loaded, dataRegistry.getClassesBySupplements(SUPPLEMENTS));

    expect(typeof loaded.classe.spellPath?.spellCircleAvailableAtLevel).toBe(
      'function'
    );
    expect(loaded.classe.spellPath?.spellAccess).toBe('allOfType');
    expect(hasDerivedSpellAccess(loaded)).toBe(true);
  });

  it('sobrevive a serializeSpellPath → applySerializedOverrides', () => {
    // Caminho usado pelo rebuild inline do LevelUpWizardModal quando a ficha
    // chega com o spellPath sem funções.
    const spellPath = usurpadorClass().spellPath!;
    const serialized = serializeSpellPath(spellPath, 'Usurpador');
    expect(serialized.spellAccess).toBe('allOfType');

    const rebuilt = buildSpellPathFromSetup('Usurpador', undefined, undefined, [
      ...SUPPLEMENTS,
    ]);
    expect(rebuilt).not.toBeNull();
    expect(rebuilt?.spellAccess).toBe('allOfType');

    // E um spellPath sem o campo recebe o valor gravado na ficha.
    const semAcesso = { ...rebuilt!, spellAccess: undefined };
    applySerializedOverrides(semAcesso, serialized);
    expect(semAcesso.spellAccess).toBe('allOfType');
  });

  it('não vaza para classes que aprendem magias normalmente', () => {
    const clerigo = dataRegistry
      .getClassesBySupplements(SUPPLEMENTS)
      .find((c) => c.name === 'Clérigo');
    const spellPath = clerigo?.setup?.(clerigo)?.spellPath;
    expect(spellPath?.spellAccess).toBeUndefined();
    expect(
      serializeSpellPath(spellPath!, 'Clérigo').spellAccess
    ).toBeUndefined();
  });
});
