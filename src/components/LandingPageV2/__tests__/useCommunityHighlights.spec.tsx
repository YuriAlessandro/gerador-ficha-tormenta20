/**
 * A home pedia as vitrines da comunidade ordenadas por média de avaliação, o que
 * na prática devolvia sempre os mesmos 16 itens (a maioria empatada em média 0,
 * desempatada pela ordem de inserção). O sorteio diário é feito no backend, então
 * o que o frontend precisa garantir é só o contrato da chamada.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';

const mocks = vi.hoisted(() => ({
  getRecentPosts: vi.fn(),
  getThreads: vi.fn(),
  getAllPublicBuilds: vi.fn(),
  getAllPublicHomebrews: vi.fn(),
  getPublicBestiary: vi.fn(),
}));

vi.mock('../../../premium/services/blog.service', () => ({
  default: { getRecentPosts: mocks.getRecentPosts },
}));
vi.mock('../../../premium/services/forum.service', () => ({
  default: { getThreads: mocks.getThreads },
}));
vi.mock('../../../premium/services/builds.service', () => ({
  default: { getAllPublicBuilds: mocks.getAllPublicBuilds },
}));
vi.mock('../../../premium/services/homebrew.service', () => ({
  default: { getAllPublicHomebrews: mocks.getAllPublicHomebrews },
}));
vi.mock('../../../premium/services/bestiary.service', () => ({
  default: { getPublicBestiary: mocks.getPublicBestiary },
}));

// eslint-disable-next-line import/first
import useCommunityHighlights from '../hooks/useCommunityHighlights';

const Probe: React.FC = () => {
  const { loading } = useCommunityHighlights();
  return <div>{loading ? 'carregando' : 'pronto'}</div>;
};

describe('useCommunityHighlights', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getRecentPosts.mockResolvedValue([]);
    mocks.getThreads.mockResolvedValue({ data: [] });
    mocks.getAllPublicBuilds.mockResolvedValue({ data: [] });
    mocks.getAllPublicHomebrews.mockResolvedValue({ data: [] });
    mocks.getPublicBestiary.mockResolvedValue({ data: [] });
  });

  it('pede a vitrine diária de homebrews, mantendo o sort antigo como fallback', async () => {
    render(<Probe />);

    await waitFor(() => expect(mocks.getAllPublicHomebrews).toHaveBeenCalled());

    const [filters] = mocks.getAllPublicHomebrews.mock.calls[0];
    expect(filters).toMatchObject({
      showcase: 'daily',
      // Backend antigo ignora `showcase` e precisa cair no comportamento de
      // hoje, não no default do endpoint (`updatedAt`).
      sortBy: 'rating',
      sortOrder: 'desc',
    });
  });

  it('pede a vitrine diária do bestiário, mantendo o sort antigo como fallback', async () => {
    render(<Probe />);

    await waitFor(() => expect(mocks.getPublicBestiary).toHaveBeenCalled());

    const [filters, page] = mocks.getPublicBestiary.mock.calls[0];
    expect(filters).toMatchObject({
      showcase: 'daily',
      sortBy: 'rating',
      sortOrder: 'desc',
    });
    expect(page).toBe(1);
  });

  it('não manda showcase nas seções que não são vitrine da comunidade', async () => {
    render(<Probe />);

    await waitFor(() => expect(mocks.getAllPublicBuilds).toHaveBeenCalled());

    const [buildFilters] = mocks.getAllPublicBuilds.mock.calls[0];
    expect(buildFilters).not.toHaveProperty('showcase');
  });
});
