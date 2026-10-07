import {
  getSpellTradition,
  matchesTraditionFilter,
} from '../spells/spellTradition';

describe('getSpellTradition', () => {
  it('resolve magia só arcana, só divina e universal do livro básico', () => {
    expect(getSpellTradition('Bola de Fogo')).toBe('arcane');
    expect(getSpellTradition('Curar Ferimentos')).toBe('divine');
    expect(getSpellTradition('Luz')).toBe('universal');
  });

  it('resolve magias de suplemento', () => {
    expect(getSpellTradition('Armadura Elemental')).toBe('arcane');
    expect(getSpellTradition('Percepção Rubra')).toBe('universal');
  });

  it('ignora o sufixo das magias renomeadas por raça e poder', () => {
    expect(getSpellTradition('Luz (Apenas Truque)')).toBe('universal');
    expect(getSpellTradition('Compreensão (Sempre Ativo)')).toBe('universal');
  });

  it('devolve undefined para magia fora do catálogo', () => {
    expect(getSpellTradition('Magia Que Não Existe')).toBeUndefined();
  });
});

describe('matchesTraditionFilter', () => {
  it('deixa a universal passar nos dois filtros', () => {
    expect(matchesTraditionFilter('universal', 'arcane')).toBe(true);
    expect(matchesTraditionFilter('universal', 'divine')).toBe(true);
  });

  it('separa arcana de divina', () => {
    expect(matchesTraditionFilter('arcane', 'divine')).toBe(false);
    expect(matchesTraditionFilter('divine', 'divine')).toBe(true);
  });

  it('só mostra magia sem tipo conhecido em "Todas"', () => {
    expect(matchesTraditionFilter(undefined, 'all')).toBe(true);
    expect(matchesTraditionFilter(undefined, 'arcane')).toBe(false);
  });
});
