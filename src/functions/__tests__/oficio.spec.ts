import { buildCustomOficio, MAX_OFICIO_LABEL_LENGTH } from '../oficio';
import Skill, { isCustomOficio, isOficioSkill } from '../../interfaces/Skills';

const expectOk = (result: ReturnType<typeof buildCustomOficio>): string => {
  if (!result.ok) throw new Error(`Esperava ok, veio erro: ${result.error}`);
  return result.value;
};

describe('buildCustomOficio', () => {
  it('monta o nome no formato do livro', () => {
    expect(expectOk(buildCustomOficio('Ferreiro'))).toBe('Ofício (Ferreiro)');
  });

  it('faz trim e colapsa espaços internos', () => {
    expect(expectOk(buildCustomOficio('  ferreiro   anão  '))).toBe(
      'Ofício (Ferreiro anão)'
    );
  });

  it('capitaliza só a primeira letra, preservando o resto', () => {
    expect(expectOk(buildCustomOficio('caçador de rúbis'))).toBe(
      'Ofício (Caçador de rúbis)'
    );
  });

  it('é idempotente quando já vem no formato completo', () => {
    const once = expectOk(buildCustomOficio('Ferreiro'));
    expect(expectOk(buildCustomOficio(once))).toBe(once);
  });

  it('aceita o prefixo sem parênteses', () => {
    expect(expectOk(buildCustomOficio('Ofício Ferreiro'))).toBe(
      'Ofício (Ferreiro)'
    );
  });

  it('rejeita vazio e só espaços', () => {
    expect(buildCustomOficio('')).toMatchObject({ ok: false });
    expect(buildCustomOficio('   ')).toMatchObject({ ok: false });
  });

  it('rejeita acima do limite de caracteres', () => {
    const long = 'a'.repeat(MAX_OFICIO_LABEL_LENGTH + 1);
    expect(buildCustomOficio(long)).toMatchObject({ ok: false });
    expect(
      buildCustomOficio('a'.repeat(MAX_OFICIO_LABEL_LENGTH))
    ).toMatchObject({ ok: true });
  });

  it('rejeita parênteses no meio (quebrariam a extração do PDF)', () => {
    expect(buildCustomOficio('Ferreiro (anão)')).toMatchObject({ ok: false });
  });

  it('aceita acentos, dígitos, hífen e apóstrofo', () => {
    expect(expectOk(buildCustomOficio("Ferreiro-mór d'Aço 2"))).toBe(
      "Ofício (Ferreiro-mór d'Aço 2)"
    );
  });

  it('rejeita duplicata do catálogo ignorando caixa e acento', () => {
    expect(buildCustomOficio('alquimia')).toMatchObject({ ok: false });
    expect(buildCustomOficio('Alquímia')).toMatchObject({ ok: false });
    expect(buildCustomOficio('CULINARIA')).toMatchObject({ ok: false });
  });

  it('rejeita duplicata contra os já escolhidos', () => {
    const existing = ['Ofício (Ferreiro anão)'];
    expect(buildCustomOficio('ferreiro anao', existing)).toMatchObject({
      ok: false,
    });
    expect(buildCustomOficio('Ferreiro élfico', existing)).toMatchObject({
      ok: true,
    });
  });

  it('produz um nome reconhecido como Ofício customizado', () => {
    const value = expectOk(buildCustomOficio('Ferreiro'));
    expect(isOficioSkill(value)).toBe(true);
    expect(isCustomOficio(value)).toBe(true);
    expect(isCustomOficio(Skill.OFICIO_ALQUIMIA)).toBe(false);
    expect(isCustomOficio(Skill.OFICIO)).toBe(false);
  });
});
