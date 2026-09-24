import { describe, expect, it } from 'vitest';
import {
  SkillOthersEntry,
  hasSkillOthersDetail,
} from '../skills/skillBonusBreakdown';

describe('hasSkillOthersDetail', () => {
  const entry = (label: string, value: number): SkillOthersEntry => ({
    label,
    value,
  });

  it('não exibe detalhamento quando não há parcela nenhuma', () => {
    expect(hasSkillOthersDetail([])).toBe(false);
  });

  it('não exibe detalhamento quando a única parcela é a genérica', () => {
    // Resto de `others` sem origem rastreável (ex.: os +5 do Frade): o tooltip
    // só repetiria o número já visível na coluna.
    expect(hasSkillOthersDetail([entry('Outros', 5)])).toBe(false);
  });

  it('exibe detalhamento com uma penalidade de armadura sozinha', () => {
    expect(hasSkillOthersDetail([entry('Penalidade de armadura', -1)])).toBe(
      true
    );
  });

  it('exibe detalhamento com um poder sozinho', () => {
    expect(hasSkillOthersDetail([entry('Sentidos Aguçados', 2)])).toBe(true);
  });

  it('exibe detalhamento quando a genérica acompanha uma parcela nomeada', () => {
    expect(
      hasSkillOthersDetail([entry('Outros', 5), entry('Golpista Divino', 2)])
    ).toBe(true);
  });
});
