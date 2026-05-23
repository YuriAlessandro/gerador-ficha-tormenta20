import { useEffect, useState } from 'react';
import BlogService from '../../../premium/services/blog.service';
import BuildsService, {
  BuildData,
} from '../../../premium/services/builds.service';
import ForumService from '../../../premium/services/forum.service';
import { BlogPost } from '../../../premium/interfaces/blog.types';
import { ForumThread } from '../../../premium/interfaces/forum.types';

interface UseCommunityHighlightsResult {
  blogPosts: BlogPost[];
  forumThreads: ForumThread[];
  builds: BuildData[];
  loading: boolean;
}

const BLOG_LIMIT = 5;
const FORUM_LIMIT = 14;
const BUILDS_LIMIT = 4;

const useCommunityHighlights = (): UseCommunityHighlightsResult => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [forumThreads, setForumThreads] = useState<ForumThread[]>([]);
  const [builds, setBuilds] = useState<BuildData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      const [blogResult, forumResult, buildsResult] = await Promise.allSettled([
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

      setLoading(false);
    };

    fetchAll();

    return () => {
      cancelled = true;
    };
  }, []);

  return { blogPosts, forumThreads, builds, loading };
};

export default useCommunityHighlights;
