import { rehydrateSheet, stripSheetForStorage } from '../sheetPayloadOptimizer';
import { migrateSheet, needsMigration } from '../migrateSheet';
import { normalizeSheet } from '../sheetNormalizer';
import { getLastLevelSummary } from '../revertLevel';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { ClassPower } from '../../interfaces/Class';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';

/**
 * O poder de Clérigo se chama "Símbolo Sagrado Energizado" (JdA p. 58); o app
 * o cadastrou como "Símbolo Sagrado Abençoado". Fichas salvas guardam o nome
 * do poder, que é a chave do refresh do catálogo, do resumo/desfazer nível e
 * dos pré-requisitos — o nome antigo precisa continuar ligado ao poder.
 */
const OLD_NAME = 'Símbolo Sagrado Abençoado';
const NEW_NAME = 'Símbolo Sagrado Energizado';
const SUPPLEMENTS = [SupplementId.TORMENTA20_CORE];

const clerigo = () => {
  const classe = dataRegistry
    .getClassesBySupplements(SUPPLEMENTS)
    .find((c) => c.name === 'Clérigo');
  if (!classe) throw new Error('Clérigo não encontrado no registry');
  return classe;
};

const catalogPower = (): ClassPower => {
  const power = clerigo().powers.find((p) => p.name.startsWith('Símbolo'));
  if (!power) throw new Error('poder do símbolo sagrado não encontrado');
  return power;
};

/**
 * Clérigo nv2 salvo antes da troca: o poder escolhido no nível 2 e o
 * histórico da subida guardam o nome antigo, e a cópia da classe (formato de
 * ficha não "stripped") também.
 */
const savedSheet = (): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  const legacyPower = { ...catalogPower(), name: OLD_NAME };
  sheet.nivel = 2;
  sheet.classe = {
    ...clerigo(),
    powers: clerigo().powers.map((p) =>
      p.name === catalogPower().name ? legacyPower : p
    ),
  };
  sheet.classPowers = [legacyPower];
  sheet.sheetActionHistory = [
    {
      source: { type: 'levelUp', level: 2 },
      changes: [{ type: 'PowerAdded', powerName: OLD_NAME }],
    },
  ];
  return JSON.parse(JSON.stringify(sheet)) as CharacterSheet;
};

const historyPowerNames = (sheet: CharacterSheet) =>
  sheet.sheetActionHistory
    .flatMap((entry) => entry.changes)
    .map((change) => ('powerName' in change ? change.powerName : undefined))
    .filter(Boolean);

describe('Símbolo Sagrado Energizado (JdA p. 58)', () => {
  it('o catálogo do Clérigo usa o nome do livro', () => {
    const names = clerigo().powers.map((p) => p.name);
    expect(names).toContain(NEW_NAME);
    expect(names).not.toContain(OLD_NAME);
  });

  it('normalizeSheet renomeia o poder, a cópia da classe e o histórico', () => {
    const sheet = savedSheet();
    normalizeSheet(sheet);

    expect(sheet.classPowers?.map((p) => p.name)).toEqual([NEW_NAME]);
    expect(sheet.classe.powers.map((p) => p.name)).toContain(NEW_NAME);
    expect(sheet.classe.powers.map((p) => p.name)).not.toContain(OLD_NAME);
    expect(historyPowerNames(sheet)).toEqual([NEW_NAME]);
  });

  it('o resumo do nível continua reconhecendo o poder escolhido', () => {
    const sheet = savedSheet();
    normalizeSheet(sheet);

    expect(getLastLevelSummary(sheet).powers).toEqual([NEW_NAME]);
  });

  it('rehydrateSheet (ficha não stripped) liga o nome antigo ao catálogo', () => {
    const sheet = rehydrateSheet(
      savedSheet() as unknown as Record<string, unknown>,
      SUPPLEMENTS
    );

    expect(sheet.classPowers).toHaveLength(1);
    expect(sheet.classPowers?.[0].name).toBe(NEW_NAME);
    expect(sheet.classPowers?.[0].text).toBe(catalogPower().text);
  });

  it('rehydrateSheet (ficha stripped) liga o nome antigo ao catálogo', () => {
    const stripped = JSON.parse(
      JSON.stringify(stripSheetForStorage(savedSheet()))
    ) as Record<string, unknown>;
    const sheet = rehydrateSheet(stripped, SUPPLEMENTS);

    expect(sheet.classPowers?.map((p) => p.name)).toEqual([NEW_NAME]);
    expect(historyPowerNames(sheet)).toEqual([NEW_NAME]);
  });

  it('migrateSheet detecta e renomeia fichas com o nome antigo', () => {
    const sheet = savedSheet();
    expect(needsMigration(sheet)).toBe(true);

    const migrated = migrateSheet(sheet);
    expect(migrated.classPowers?.map((p) => p.name)).toEqual([NEW_NAME]);
    expect(needsMigration(migrated)).toBe(false);
  });
});
