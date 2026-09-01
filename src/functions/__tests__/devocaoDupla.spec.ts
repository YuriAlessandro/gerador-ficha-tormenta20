/**
 * Devoção Dupla (Sincretismos de Arton): o personagem conta como devoto de
 * dois deuses maiores ao mesmo tempo.
 *
 * A regra inteira se apoia numa mudança só no motor — `RequirementType.DEVOTO`
 * avalia contra o CONJUNTO de deuses da ficha. É isso que faz o poder único de
 * um sincretismo (um AND de duas cláusulas DEVOTO) reprovar devoto simples e
 * aprovar devoto duplo, sem tipo de requisito novo.
 */
import {
  getSheetDeityNames,
  hasDualDevotion,
  isDevoto,
} from '../powers/deityNames';
import {
  getGrantedPowerPool,
  getPowerDeityNames,
  isDualDevotionPower,
} from '../powers/grantedPowerPool';
import { getCapturablePowers, getMajorDeities } from '../powers/poderCapturado';
import { PODER_CAPTURADO_KEY } from '../powers/poderCapturadoKey';
import { getEffectiveDeityName } from '../powers/poderCapturadoEffects';
import { isPowerAvailable } from '../powers';
import { normalizeSheet } from '../sheetNormalizer';
import { stripSheetForStorage } from '../sheetPayloadOptimizer';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Divindade from '../../interfaces/Divindade';
import {
  GeneralPower,
  GeneralPowerType,
  RequirementType,
} from '../../interfaces/Poderes';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import { NATIVE_SINCRETISMOS_SUPPLEMENT } from '../../premium/data/nativeHomebrews/sincretismos-de-arton';

const SOURCE_ID = 'homebrew:65f3aabbccddeeff00112233';
const SUPPLEMENTS = [SupplementId.TORMENTA20_CORE, SOURCE_ID as SupplementId];
const CORE_ONLY = [SupplementId.TORMENTA20_CORE];

// Par real do Volume 1: A Irmandade Heráldica (Khalmyr + Tanna-Toh).
const PODER_UNICO = 'Mestre instrutor';
const DEUS_A = 'Khalmyr';
const DEUS_B = 'Tanna-Toh';

const findDeity = (name: string): Divindade => {
  const deity = dataRegistry.getDeityByName(name, SUPPLEMENTS);
  if (!deity) throw new Error(`Divindade não encontrada: ${name}`);
  return deity;
};

const buildDevoto = (primaria: string, secundaria?: string): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  sheet.devoto = {
    divindade: findDeity(primaria),
    poderes: [],
    ...(secundaria ? { divindadeSecundaria: secundaria } : {}),
  };
  return sheet;
};

const grantedPowerNamed = (name: string): GeneralPower => {
  const power = findDeity(DEUS_A)
    .poderes.concat(findDeity(DEUS_B).poderes)
    .find((p) => p.name === name);
  if (!power) throw new Error(`Poder não encontrado: ${name}`);
  return power;
};

describe('Devoção Dupla', () => {
  beforeAll(() => {
    dataRegistry.registerRuntimeSupplement(SOURCE_ID, {
      ...NATIVE_SINCRETISMOS_SUPPLEMENT,
      id: SOURCE_ID as SupplementId,
    });
  });

  afterAll(() => {
    dataRegistry.unregisterRuntimeSupplement(SOURCE_ID);
  });

  describe('getSheetDeityNames', () => {
    it('devolve um nome para devoto simples e dois para devoto duplo', () => {
      expect(getSheetDeityNames(buildDevoto(DEUS_A))).toEqual([DEUS_A]);
      expect(getSheetDeityNames(buildDevoto(DEUS_A, DEUS_B))).toEqual([
        DEUS_A,
        DEUS_B,
      ]);
    });

    it('devolve vazio para não devoto', () => {
      const sheet = createMockCharacterSheet();
      delete sheet.devoto;
      expect(getSheetDeityNames(sheet)).toEqual([]);
      expect(isDevoto(sheet)).toBe(false);
    });

    it('descarta secundária igual à primária', () => {
      expect(getSheetDeityNames(buildDevoto(DEUS_A, DEUS_A))).toEqual([DEUS_A]);
      expect(hasDualDevotion(buildDevoto(DEUS_A, DEUS_A))).toBe(false);
    });

    it('Poder Capturado ativo é exclusivo — sobrepõe a devoção real', () => {
      const sheet = buildDevoto(DEUS_A, DEUS_B);
      sheet.activeEffects = [
        {
          powerKey: PODER_CAPTURADO_KEY,
          optionId: 'Tannatoh|Erudição Divina',
        },
      ] as CharacterSheet['activeEffects'];

      expect(getSheetDeityNames(sheet)).toEqual(['Tannatoh']);
      // `getEffectiveDeityName` delega e devolve o primeiro: mesma semântica
      // singular de antes.
      expect(getEffectiveDeityName(sheet)).toBe('Tannatoh');
    });

    it('getEffectiveDeityName devolve a primária num devoto duplo', () => {
      expect(getEffectiveDeityName(buildDevoto(DEUS_A, DEUS_B))).toBe(DEUS_A);
    });
  });

  describe('requisito DEVOTO', () => {
    it('devoto duplo cumpre requisitos dos DOIS deuses', () => {
      const duplo = buildDevoto(DEUS_A, DEUS_B);
      const simples = buildDevoto(DEUS_A);

      const poderDeValkaria = findDeity(DEUS_B).poderes[0];
      expect(isPowerAvailable(duplo, poderDeValkaria)).toBe(true);
      expect(isPowerAvailable(simples, poderDeValkaria)).toBe(false);
    });

    it('o poder único do sincretismo exige os dois deuses', () => {
      const unico = grantedPowerNamed(PODER_UNICO);

      expect(isPowerAvailable(buildDevoto(DEUS_A), unico)).toBe(false);
      expect(isPowerAvailable(buildDevoto(DEUS_B), unico)).toBe(false);
      expect(isPowerAvailable(buildDevoto(DEUS_A, DEUS_B), unico)).toBe(true);
      // Ordem do par não importa.
      expect(isPowerAvailable(buildDevoto(DEUS_B, DEUS_A), unico)).toBe(true);
    });

    it("requisito 'any' passa a valer pelo conjunto", () => {
      const anyPower: GeneralPower = {
        name: 'Teste',
        description: '',
        type: GeneralPowerType.CONCEDIDOS,
        requirements: [[{ type: RequirementType.DEVOTO, name: 'any' }]],
      };
      const naoDevoto = createMockCharacterSheet();
      delete naoDevoto.devoto;

      expect(isPowerAvailable(buildDevoto(DEUS_A), anyPower)).toBe(true);
      expect(isPowerAvailable(naoDevoto, anyPower)).toBe(false);
    });

    it('requisito NEGADO reprova pelas duas divindades', () => {
      // Regressão: "Arma Sagrada exclui devotos de Lena e Marah". Um devoto
      // duplo de Khalmyr + Lena tem que ser reprovado pela metade Lena.
      const armaSagrada: GeneralPower = {
        name: 'Arma Sagrada (teste)',
        description: '',
        type: GeneralPowerType.CONCEDIDOS,
        requirements: [
          [
            { type: RequirementType.DEVOTO, name: 'Lena', not: true },
            { type: RequirementType.DEVOTO, name: 'Marah', not: true },
          ],
        ],
      };

      expect(isPowerAvailable(buildDevoto(DEUS_A), armaSagrada)).toBe(true);
      expect(isPowerAvailable(buildDevoto(DEUS_A, 'Lena'), armaSagrada)).toBe(
        false
      );
    });
  });

  describe('piscina de poderes concedidos', () => {
    it('une as duas listas sem duplicar', () => {
      const pool = getGrantedPowerPool([DEUS_A, DEUS_B], SUPPLEMENTS);
      const nomes = pool.map((p) => p.name);

      expect(new Set(nomes).size).toBe(nomes.length);
      expect(nomes).toEqual(
        expect.arrayContaining([findDeity(DEUS_A).poderes[0].name])
      );
      expect(nomes).toEqual(
        expect.arrayContaining([findDeity(DEUS_B).poderes[0].name])
      );
      expect(nomes).toContain(PODER_UNICO);
    });

    it('sem o suplemento ativo o poder único não aparece', () => {
      const pool = getGrantedPowerPool([DEUS_A, DEUS_B], CORE_ONLY);
      expect(pool.map((p) => p.name)).not.toContain(PODER_UNICO);
    });

    it('identifica o poder único e a quais deuses cada poder pertence', () => {
      const unico = grantedPowerNamed(PODER_UNICO);
      // Um poder que nomeia SÓ Khalmyr. Nem todo poder da lista dele serve:
      // vários são OR de grupos e pertencem legitimamente a dois deuses
      // (ex.: Thwor ou Valkaria) — esses não são exclusivos de devoção dupla,
      // que é o AND dentro de um mesmo grupo.
      const soDeKhalmyr = findDeity(DEUS_A).poderes.find(
        (p) =>
          p.name !== PODER_UNICO &&
          getPowerDeityNames(p, [DEUS_A, DEUS_B]).length === 1
      )!;

      expect(isDualDevotionPower(unico)).toBe(true);
      expect(isDualDevotionPower(soDeKhalmyr)).toBe(false);

      expect(getPowerDeityNames(unico, [DEUS_A, DEUS_B])).toEqual([
        DEUS_A,
        DEUS_B,
      ]);
      expect(getPowerDeityNames(soDeKhalmyr, [DEUS_A, DEUS_B])).toEqual([
        DEUS_A,
      ]);
    });
  });

  describe('Clérigo Usurpador', () => {
    it('não pode capturar o poder único de uma devoção dupla', () => {
      const usurpador = createMockCharacterSheet();
      const khalmyr = getMajorDeities(SUPPLEMENTS).find(
        (d) => d.name === DEUS_A
      )!;

      const unico = getCapturablePowers(usurpador, khalmyr).find(
        (c) => c.power.name === PODER_UNICO
      );

      expect(unico).toBeDefined();
      expect(unico?.available).toBe(false);
      expect(unico?.reason).toBe('dual-devotion-only');
    });
  });

  describe('persistência', () => {
    it('sobrevive ao strip para a nuvem e à normalização', () => {
      const sheet = buildDevoto(DEUS_A, DEUS_B);
      sheet.devoto!.sincretismo = 'A Irmandade Heráldica';

      const stripped = stripSheetForStorage(sheet) as unknown as CharacterSheet;
      expect(stripped.devoto?.divindadeSecundaria).toBe(DEUS_B);
      expect(stripped.devoto?.sincretismo).toBe('A Irmandade Heráldica');
      // O catálogo gordo continua sendo descartado.
      expect(stripped.devoto?.divindade.poderes).toEqual([]);

      normalizeSheet(stripped);
      expect(stripped.devoto?.divindadeSecundaria).toBe(DEUS_B);
      expect(stripped.devoto?.sincretismo).toBe('A Irmandade Heráldica');
    });

    it('normaliza lixo nos campos novos', () => {
      const sheet = buildDevoto(DEUS_A);
      (
        sheet.devoto as unknown as Record<string, unknown>
      ).divindadeSecundaria = 42;
      (sheet.devoto as unknown as Record<string, unknown>).sincretismo = {};

      normalizeSheet(sheet);
      expect(sheet.devoto?.divindadeSecundaria).toBeUndefined();
      expect(sheet.devoto?.sincretismo).toBeUndefined();
    });
  });
});
