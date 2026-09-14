import { describe, expect, it } from 'vitest';
import CAVALEIRO from '@/data/systems/tormenta20/classes/cavaleiro';
import { collectPowers } from '../collectSheetPowers';
import { PowerSourceArrays } from '../powerOrigins';
import { getPowerDisplayText } from '../powerText';

/**
 * O texto do livro para "Caminho do Cavaleiro" descreve as DUAS opções. A
 * escolha existia na ficha (`cavaleiroCaminho`) mas não aparecia em lugar
 * nenhum — o jogador via os dois caminhos e não sabia qual era o seu.
 */

const CAMINHO = CAVALEIRO.abilities.find(
  (ability) => ability.name === 'Caminho do Cavaleiro'
)!;

const sources = (
  cavaleiroCaminho?: 'Bastião' | 'Montaria'
): PowerSourceArrays => ({
  classPowers: [],
  raceAbilities: [],
  classAbilities: [CAMINHO],
  originPowers: [],
  deityPowers: [],
  generalPowers: [],
  className: 'Cavaleiro',
  raceName: 'Humano',
  cavaleiroCaminho,
});

const textoExibido = (caminho?: 'Bastião' | 'Montaria') => {
  const { powers } = collectPowers(sources(caminho));
  const found = powers.find((power) => power.name === 'Caminho do Cavaleiro');
  return getPowerDisplayText(found!);
};

describe('Caminho do Cavaleiro na ficha', () => {
  it('sem escolha, mostra o texto do livro inteiro', () => {
    const texto = textoExibido();
    expect(texto).toContain('Bastião:');
    expect(texto).toContain('Montaria:');
  });

  it('com Bastião, mostra só o Bastião', () => {
    const texto = textoExibido('Bastião');
    expect(texto).toMatch(/^\[Bastião\]/);
    expect(texto).toContain('redução de dano 5');
    expect(texto).not.toContain('cavalo de guerra');
  });

  it('com Montaria, mostra só a Montaria', () => {
    const texto = textoExibido('Montaria');
    expect(texto).toMatch(/^\[Montaria\]/);
    expect(texto).toContain('cavalo de guerra');
    expect(texto).not.toContain('redução de dano 5');
  });

  it('o recorte sai do texto do dado, não de uma cópia', () => {
    // Se o texto do livro mudar, o recorte acompanha em vez de divergir.
    expect(CAMINHO.text).toContain('Bastião:');
    expect(CAMINHO.text).toContain('Montaria:');
  });
});
