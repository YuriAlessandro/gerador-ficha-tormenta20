import { useEffect, useState } from 'react';
import BlogService from '../../../premium/services/blog.service';
import BuildsService, {
  BuildData,
} from '../../../premium/services/builds.service';
import ForumService from '../../../premium/services/forum.service';
import HomebrewService from '../../../premium/services/homebrew.service';
import BestiaryService, {
  BestiaryPublicationData,
} from '../../../premium/services/bestiary.service';
import { BlogPost } from '../../../premium/interfaces/blog.types';
import { ForumThread } from '../../../premium/interfaces/forum.types';
import { Homebrew } from '../../../premium/interfaces/Homebrew';

interface UseCommunityHighlightsResult {
  blogPosts: BlogPost[];
  forumThreads: ForumThread[];
  builds: BuildData[];
  homebrews: Homebrew[];
  bestiary: BestiaryPublicationData[];
  loading: boolean;
}

const BLOG_LIMIT = 5;
const FORUM_LIMIT = 14;
// Banners de comunidade usam grade de múltiplas linhas — 16 ≈ 4 linhas no
// desktop (4 colunas) e mais no mobile, deixando a home cheia de conteúdo.
const BUILDS_LIMIT = 16;
const HOMEBREW_LIMIT = 16;
const BESTIARY_LIMIT = 16;

const useCommunityHighlights = (): UseCommunityHighlightsResult => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [forumThreads, setForumThreads] = useState<ForumThread[]>([]);
  const [builds, setBuilds] = useState<BuildData[]>([]);
  const [homebrews, setHomebrews] = useState<Homebrew[]>([]);
  const [bestiary, setBestiary] = useState<BestiaryPublicationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      const [
        blogResult,
        forumResult,
        buildsResult,
        homebrewsResult,
        bestiaryResult,
      ] = await Promise.allSettled([
        BlogService.getRecentPosts(BLOG_LIMIT),
        ForumService.getThreads({
          page: 1,
          limit: FORUM_LIMIT,
          sortBy: 'recent',
        }),
        BuildsService.getAllPublicBuilds(
          { sortBy: 'createdAt', sortOrder: 'desc' },
          1,
          BUILDS_LIMIT
        ),
        HomebrewService.getAllPublicHomebrews({
          sortBy: 'rating',
          sortOrder: 'desc',
          limit: HOMEBREW_LIMIT,
        }),
        BestiaryService.getPublicBestiary(
          { sortBy: 'rating', sortOrder: 'desc' },
          1,
          BESTIARY_LIMIT
        ),
      ]);

      if (cancelled) return;

      if (blogResult.status === 'fulfilled') {
        setBlogPosts(blogResult.value);
      }
      if (forumResult.status === 'fulfilled') {
        setForumThreads(forumResult.value.data);
      }
      if (buildsResult.status === 'fulfilled') {
        setBuilds(buildsResult.value.data);
      }
      if (homebrewsResult.status === 'fulfilled') {
        setHomebrews(homebrewsResult.value.data);
      }
      if (bestiaryResult.status === 'fulfilled') {
        setBestiary(bestiaryResult.value.data);
      }

      setLoading(false);
    };

    fetchAll();

    return () => {
      cancelled = true;
    };
  }, []);

  return { blogPosts, forumThreads, builds, homebrews, bestiary, loading };
};

export default useCommunityHighlights;
