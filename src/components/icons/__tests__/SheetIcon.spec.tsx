/**
 * O resolvedor de ícones e o catálogo do game-icons.
 *
 * O catálogo real são ~4.200 arquivos no jsDelivr, buscados por rede. Aqui o
 * `fetch` é dublado: o que está sob teste é o contrato do id com namespace e o
 * cache — não o conteúdo dos desenhos.
 */
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import SheetIcon from '../SheetIcon';
import GameIcon, {
  GAME_ICONS_CDN,
  clearGameIconCache,
  glyphOf,
} from '../gameIcons/GameIcon';

const SVG = (d: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="${d}"/></svg>`;

const mockFetch = (impl: (url: string) => Promise<Response> | Response) => {
  const spy = vi.fn((url: string) => Promise.resolve(impl(url)));
  // @ts-expect-error — dublê mínimo, só o que o GameIcon usa.
  global.fetch = spy;
  return spy;
};

const okResponse = (body: string) =>
  ({ ok: true, text: () => Promise.resolve(body) } as Response);

beforeEach(() => {
  clearGameIconCache();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('SheetIcon — roteamento por namespace', () => {
  it('resolve um ícone do MUI pelo nome', () => {
    const { container } = render(<SheetIcon iconKey='mui:Shield' />);

    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(
      container.querySelector('[data-testid="ShieldIcon"]')
    ).not.toBeNull();
  });

  it('cai no genérico quando o nome do MUI não existe', () => {
    const { container } = render(<SheetIcon iconKey='mui:NaoExisteIcone' />);

    expect(
      container.querySelector('[data-testid="WidgetsIcon"]')
    ).not.toBeNull();
  });

  it('cai no genérico sem id, em vez de não renderizar nada', () => {
    // Item de menu sem ícone desalinha a lista inteira.
    const { container } = render(<SheetIcon />);

    expect(
      container.querySelector('[data-testid="WidgetsIcon"]')
    ).not.toBeNull();
  });

  it('busca o desenho no catálogo para um id `gi:`', async () => {
    const fetchSpy = mockFetch(() => okResponse(SVG('M10 10 H90 V90 H10 Z')));

    const { container } = render(<SheetIcon iconKey='gi:lorc/crystal-ball' />);

    await waitFor(() => {
      expect(container.querySelector('path')).not.toBeNull();
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      `${GAME_ICONS_CDN}/lorc/crystal-ball.svg`
    );
    // Travado num commit: o conteúdo da URL nunca muda.
    expect(GAME_ICONS_CDN).toMatch(
      /^https:\/\/cdn\.jsdelivr\.net\/gh\/game-icons\/icons@[0-9a-f]{40}$/
    );
    expect(container.querySelector('path')?.getAttribute('d')).toBe(
      'M10 10 H90 V90 H10 Z'
    );
  });
});

describe('GameIcon — cache e falhas', () => {
  it('busca cada ícone uma única vez, mesmo com vários na tela', async () => {
    const fetchSpy = mockFetch(() => okResponse(SVG('M1 1')));

    const { container } = render(
      <>
        <GameIcon icon='lorc/sword' />
        <GameIcon icon='lorc/sword' />
        <GameIcon icon='lorc/sword' />
      </>
    );

    await waitFor(() => {
      expect(container.querySelectorAll('path')).toHaveLength(3);
    });

    // O cache guarda a Promise, então três montagens simultâneas geram uma
    // requisição só — e não três do mesmo arquivo.
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('não derruba a ficha quando o ícone não carrega', async () => {
    mockFetch(() => Promise.reject(new Error('offline')));

    const { container } = render(<GameIcon icon='lorc/sword' />);

    // O SvgIcon continua na tela, vazio: o espaço é preservado e a lista não
    // salta nem quebra.
    await waitFor(() => {
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
    expect(container.querySelector('path')).toBeNull();
  });

  it('trata 404 como ausência, não como erro', async () => {
    mockFetch(
      () => ({ ok: false, text: () => Promise.resolve('') } as Response)
    );

    const { container } = render(<GameIcon icon='lorc/nao-existe' />);

    await waitFor(() => {
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
    expect(container.querySelector('path')).toBeNull();
  });
});

describe('glyphOf — SVG original do acervo', () => {
  it('descarta o quadrado de fundo e fica com o glifo', () => {
    const original =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">' +
      '<path d="M0 0h512v512H0z"/><path fill="#fff" d="M10 10z"/></svg>';

    expect(glyphOf(original)).toBe('M10 10z');
  });

  it('junta os traçados quando o glifo tem mais de um', () => {
    const original =
      '<svg><path d="M0 0h512v512H0z"/><path d="M1 1z"/><path d="M2 2z"/></svg>';

    expect(glyphOf(original)).toBe('M1 1z M2 2z');
  });

  it('com um path só, ele já é o glifo', () => {
    expect(glyphOf('<svg><path d="M5 5z"/></svg>')).toBe('M5 5z');
  });
});
