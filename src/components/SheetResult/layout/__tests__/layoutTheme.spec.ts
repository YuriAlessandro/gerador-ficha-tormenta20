import { describe, expect, it } from 'vitest';
import { cssBackgroundUrl, isSafeBackgroundUrl } from '../layoutTheme';

describe('cssBackgroundUrl — a URL nunca escapa do url() do CSS', () => {
  it('envolve a URL em aspas', () => {
    expect(cssBackgroundUrl('https://exemplo.com/fundo.png')).toBe(
      'url("https://exemplo.com/fundo.png")'
    );
  });

  it('mantém parênteses, que dentro das aspas são inofensivos', () => {
    expect(cssBackgroundUrl('https://exemplo.com/a_(b).png')).toBe(
      'url("https://exemplo.com/a_(b).png")'
    );
  });

  it.each([
    // Sem aspas no CSS, `)` fecharia o url() e abriria outra camada.
    'https://exemplo.com/a.png"), url("https://rastreio.com/x.png',
    "https://exemplo.com/a.png'), url('https://rastreio.com/x.png",
    'https://exemplo.com/a\\"b.png',
    'https://exemplo.com/a b.png',
    'https://exemplo.com/a\nb.png',
    'http://exemplo.com/sem-https.png',
    // Montada por partes só para o lint não confundir o caso de teste com eval.
    ['javascript', 'alert(1)'].join(':'),
    'não é url',
  ])('recusa %s', (url) => {
    expect(isSafeBackgroundUrl(url)).toBe(false);
    expect(cssBackgroundUrl(url)).toBeUndefined();
  });

  it('não devolve nada sem URL', () => {
    expect(cssBackgroundUrl(undefined)).toBeUndefined();
    expect(cssBackgroundUrl('')).toBeUndefined();
  });
});
