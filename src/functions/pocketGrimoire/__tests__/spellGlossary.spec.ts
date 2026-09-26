import { describe, it, expect } from 'vitest';
import { explainTerm } from '../spellGlossary';

describe('explainTerm', () => {
  it('execução', () => {
    expect(explainTerm('execution', 'Padrão')).toMatch(/ação padrão/i);
    expect(explainTerm('execution', 'Movimento')).toMatch(/movimento/i);
    expect(explainTerm('execution', 'Completa')).toMatch(/rodada inteira/i);
    expect(explainTerm('execution', 'Livre')).toMatch(/uma magia/i);
    expect(explainTerm('execution', 'Reação')).toMatch(/fora do seu turno/i);
  });

  it('alcance com distâncias', () => {
    expect(explainTerm('range', 'Curto')).toMatch(/9m.*6 quadrados/);
    expect(explainTerm('range', 'Médio')).toMatch(/30m.*20 quadrados/);
    expect(explainTerm('range', 'Longo')).toMatch(/90m.*60 quadrados/);
    expect(explainTerm('range', 'Toque')).toMatch(/tocar/i);
    expect(explainTerm('range', 'Pessoal')).toMatch(/próprio conjurador/i);
    expect(explainTerm('range', 'Ilimitado (veja o texto)')).toMatch(
      /mesmo mundo/i
    );
  });

  it('duração, inclusive combinações', () => {
    expect(explainTerm('duration', 'Instantânea')).toMatch(/consequências/i);
    expect(explainTerm('duration', 'Sustentada')).toMatch(/1 PM/);
    const combined = explainTerm('duration', 'Cena, até ser descarregada');
    expect(combined).toMatch(/cena/i);
    expect(combined).toMatch(/descarregad/i);
    expect(explainTerm('duration', '1 dia')).toMatch(/tempo definido/i);
    expect(explainTerm('duration', '1d4 rodadas')).toMatch(/tempo definido/i);
  });

  it('resistência: tipo de teste e efeito', () => {
    const text = explainTerm('resistance', 'Vontade parcial');
    expect(text).toMatch(/Vontade/);
    expect(text).toMatch(/menor/i);
    expect(explainTerm('resistance', 'Reflexos reduz à metade')).toMatch(
      /metade/i
    );
    expect(explainTerm('resistance', 'Fortitude anula')).toMatch(
      /não tem efeito/i
    );
    expect(explainTerm('resistance', 'Vontade desacredita')).toMatch(/ilusão/i);
  });

  it('valores fora do padrão ficam sem explicação', () => {
    expect(explainTerm('execution', 'Veja texto')).toBeUndefined();
    expect(explainTerm('range', 'Veja texto')).toBeUndefined();
    expect(explainTerm('duration', 'Especial')).toBeUndefined();
    expect(explainTerm('area', 'Esfera com 6m de raio')).toBeUndefined();
  });
});
