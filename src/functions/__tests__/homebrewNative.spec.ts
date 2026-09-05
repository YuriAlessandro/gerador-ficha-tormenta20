import { describe, expect, it, afterEach } from 'vitest';
import { dataRegistry } from '../../data/registry';
import { compileHomebrewToSupplement } from '../../premium/functions/homebrewBootstrap';
import { NATIVE_HOMEBREW_MODULES } from '../../premium/data/nativeHomebrews';
import { SupplementId } from '../../types/supplement.types';

const MODULE_ID = 'nimb:sincretismos';
const SOURCE_ID: string = 'homebrew:65f3aabbccddeeff00112233';

const nativeContent = (moduleId: string) =>
  ({ type: 'native', data: { moduleId } } as const);

describe('homebrew nativo', () => {
  afterEach(() => {
    dataRegistry.unregisterRuntimeSupplement(SOURCE_ID);
  });

  it('resolve o módulo de código e reetiqueta com o id do registro', () => {
    const data = compileHomebrewToSupplement(
      nativeContent(MODULE_ID),
      'Sincretismos de Arton',
      SOURCE_ID
    );

    expect(data).not.toBeNull();
    // O id PRECISA ser o do registro: `computeUsedRuntimeSupplements` casa pela
    // chave do registry, não pelo id que o módulo declara.
    expect(data?.id).toBe(SOURCE_ID);
    expect(data?.displayName).toBe('Sincretismos de Arton');
    expect(NATIVE_HOMEBREW_MODULES[MODULE_ID].id).not.toBe(SOURCE_ID);
  });

  it('devolve null para um moduleId desconhecido (frontend desatualizado)', () => {
    expect(
      compileHomebrewToSupplement(
        nativeContent('nimb:nao-existe'),
        'Fantasma',
        SOURCE_ID
      )
    ).toBeNull();
  });

  it('entrega o conteúdo do módulo pelos getters do registry', () => {
    const data = compileHomebrewToSupplement(
      nativeContent(MODULE_ID),
      'Sincretismos de Arton',
      SOURCE_ID
    );
    dataRegistry.registerRuntimeSupplement(SOURCE_ID, data!);

    // Conteúdo que SÓ um módulo de código entrega: os sincretismos, que o
    // criador declarativo de homebrew não sabe produzir.
    const sincretismos = dataRegistry.getSincretismosBySupplements([
      SOURCE_ID as SupplementId,
    ]);
    // Contagem travada: o Volume 1 tem 38 sincretismos, e é essa lista que a
    // página pública do homebrew exibe. Uma transcrição que perca entradas
    // passaria despercebida sem isto.
    expect(sincretismos).toHaveLength(38);
    sincretismos.forEach((sincretismo) => {
      expect(sincretismo.deities).toHaveLength(2);
      expect(sincretismo.name.length).toBeGreaterThan(0);
    });

    // O rótulo da fonte sai do `displayName`, e não do id cru.
    expect(dataRegistry.getSupplementLabel(SOURCE_ID).name).toBe(
      'Sincretismos de Arton'
    );
  });
});
