import { validateHomebrew } from '../../premium/functions/homebrewValidation';

/**
 * Cobre a validação de Coleções (contêiner que referencia outros homebrews por
 * id). Coleção não compila — só o envelope + memberIds são validados.
 */
describe('homebrew collection validation', () => {
  const envelope = {
    type: 'collection' as const,
    editorMode: 'basic' as const,
    schemaVersion: 1,
    name: 'Meu Mundo Completo',
    description: 'Tudo reunido.',
    visibility: 'public' as const,
  };

  it('accepts a valid collection', () => {
    const result = validateHomebrew({
      ...envelope,
      content: { type: 'collection', data: { memberIds: ['a1', 'b2', 'c3'] } },
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects empty memberIds', () => {
    const result = validateHomebrew({
      ...envelope,
      content: { type: 'collection', data: { memberIds: [] } },
    });
    expect(result.valid).toBe(false);
  });

  it('rejects non-string / duplicate member ids', () => {
    const bad = validateHomebrew({
      ...envelope,
      content: {
        type: 'collection',
        data: { memberIds: ['a1', 123 as unknown as string] },
      },
    });
    expect(bad.valid).toBe(false);

    const dup = validateHomebrew({
      ...envelope,
      content: { type: 'collection', data: { memberIds: ['a1', 'a1'] } },
    });
    expect(dup.valid).toBe(false);
  });
});
