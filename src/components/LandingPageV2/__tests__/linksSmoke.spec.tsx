import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import BlogHighlights from '../BlogHighlights';
import ForumActivity from '../ForumActivity';
import CommunityBanner from '../CommunityBanner';
import { BlogPost } from '../../../premium/interfaces/blog.types';
import { ForumThread } from '../../../premium/interfaces/forum.types';

const posts = [
  {
    id: '1',
    slug: 'primeiro-post',
    title: 'Primeiro Post',
    description: 'desc',
    authorName: 'Yuri',
    createdAt: '2026-07-01T00:00:00.000Z',
  },
  {
    id: '2',
    slug: 'segundo-post',
    title: 'Segundo Post',
    description: 'desc',
    authorName: 'Yuri',
    createdAt: '2026-07-02T00:00:00.000Z',
  },
] as unknown as BlogPost[];

const threads = [
  {
    id: 't1',
    slug: 'thread-um',
    title: 'Thread Um',
    body: 'corpo',
    authorUsername: 'yuri',
    commentCount: 3,
    createdAt: '2026-07-01T00:00:00.000Z',
  },
] as unknown as ForumThread[];

describe('links da home', () => {
  it('renderiza posts do blog como âncoras com href', () => {
    render(
      <MemoryRouter>
        <BlogHighlights posts={posts} loading={false} />
      </MemoryRouter>
    );

    expect(screen.getByText('Ver todos').closest('a')).toHaveAttribute(
      'href',
      '/blog'
    );
    expect(screen.getByText('Primeiro Post').closest('a')).toHaveAttribute(
      'href',
      '/blog/primeiro-post'
    );
    expect(screen.getByText('Segundo Post').closest('a')).toHaveAttribute(
      'href',
      '/blog/segundo-post'
    );
  });

  it('renderiza cards e CTAs da comunidade como âncoras com href', () => {
    render(
      <MemoryRouter>
        <CommunityBanner
          icon={null}
          title='Homebrews'
          subtitle='sub'
          gradient='none'
          shadowColor='#000'
          exploreLabel='Explorar homebrews'
          exploreLink='/homebrews'
          createLabel='Criar homebrew'
          createLink='/meus-homebrews'
          items={[
            {
              id: 'hb1',
              title: 'Raça Nova',
              icon: null,
              accentColor: '#fff',
              to: '/homebrew/hb1',
            },
          ]}
          emptyText='vazio'
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Explorar homebrews').closest('a')).toHaveAttribute(
      'href',
      '/homebrews'
    );
    expect(screen.getByText('Criar homebrew').closest('a')).toHaveAttribute(
      'href',
      '/meus-homebrews'
    );
    expect(screen.getByText('Raça Nova').closest('a')).toHaveAttribute(
      'href',
      '/homebrew/hb1'
    );
  });

  it('renderiza threads do fórum como âncoras com href', () => {
    render(
      <MemoryRouter>
        <ForumActivity threads={threads} loading={false} isAuthenticated />
      </MemoryRouter>
    );

    expect(screen.getByText('Thread Um').closest('a')).toHaveAttribute(
      'href',
      '/forum/thread-um'
    );
    expect(screen.getByText('Criar post').closest('a')).toHaveAttribute(
      'href',
      '/forum/novo'
    );
  });
});
