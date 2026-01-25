import api from './api';
import {
  BlogPost,
  BlogBlock,
  BlogComment,
  PostReactions,
  CreatePostInput,
  UpdatePostInput,
  PaginatedResponse,
  EmojiType,
} from '../types/blog.types';

// Helper types for raw MongoDB data with _id
interface RawBlogBlock extends Omit<BlogBlock, 'id'> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: string;
}

interface RawBlogPost extends Omit<BlogPost, 'id' | 'blocks'> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: string;
  blocks: RawBlogBlock[];
}

interface RawBlogComment extends Omit<BlogComment, 'id'> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: string;
}

/* eslint-disable no-underscore-dangle */
// Transform functions to map MongoDB _id to id
const mapBlock = (block: RawBlogBlock): BlogBlock => ({
  ...block,
  id: block._id,
});

const mapPost = (post: RawBlogPost): BlogPost => ({
  ...post,
  id: post._id,
  blocks: post.blocks.map(mapBlock),
});

const mapComment = (comment: RawBlogComment): BlogComment => ({
  ...comment,
  id: comment._id,
});
/* eslint-enable no-underscore-dangle */

interface PostResponse {
  success: boolean;
  data: RawBlogPost;
  message?: string;
}

interface PostsListResponse {
  success: boolean;
  data: RawBlogPost[];
  count: number;
}

interface RawPaginatedResponse {
  success: boolean;
  data: RawBlogPost[];
  count: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

interface ReactionsResponse {
  success: boolean;
  data: PostReactions;
}

interface CommentsResponse {
  success: boolean;
  data: RawBlogComment[];
  count: number;
}

interface CommentResponse {
  success: boolean;
  data: RawBlogComment;
  message?: string;
}

interface ReactionToggleResponse {
  success: boolean;
  action: 'added' | 'removed';
  message?: string;
}

interface AuthorCheckResponse {
  success: boolean;
  data: { isAuthor: boolean };
}

class BlogService {
  // ==================== POSTS ====================

  /**
   * Get all published posts with pagination
   */
  static async getAllPosts(
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<BlogPost>> {
    const { data } = await api.get<RawPaginatedResponse>(
      `/api/blog/posts?page=${page}&limit=${limit}`
    );
    return {
      ...data,
      data: data.data.map(mapPost),
    };
  }

  /**
   * Get recent posts for landing page
   */
  static async getRecentPosts(limit = 3): Promise<BlogPost[]> {
    const { data } = await api.get<PostsListResponse>(
      `/api/blog/posts/recent?limit=${limit}`
    );
    return data.data.map(mapPost);
  }

  /**
   * Get a single post by slug
   */
  static async getPostBySlug(slug: string): Promise<BlogPost> {
    const { data } = await api.get<PostResponse>(`/api/blog/posts/${slug}`);
    return mapPost(data.data);
  }

  /**
   * Get user's draft posts (for authors)
   */
  static async getMyDrafts(): Promise<BlogPost[]> {
    const { data } = await api.get<PostsListResponse>(
      '/api/blog/posts/my-drafts'
    );
    return data.data.map(mapPost);
  }

  /**
   * Get a single post by ID (for editing - authors only)
   */
  static async getPostById(id: string): Promise<BlogPost> {
    const { data } = await api.get<PostResponse>(`/api/blog/posts/by-id/${id}`);
    return mapPost(data.data);
  }

  /**
   * Create a new post
   */
  static async createPost(postData: CreatePostInput): Promise<BlogPost> {
    const { data } = await api.post<PostResponse>('/api/blog/posts', postData);
    return mapPost(data.data);
  }

  /**
   * Update an existing post
   */
  static async updatePost(
    id: string,
    updates: UpdatePostInput
  ): Promise<BlogPost> {
    const { data } = await api.put<PostResponse>(
      `/api/blog/posts/${id}`,
      updates
    );
    return mapPost(data.data);
  }

  /**
   * Delete a post
   */
  static async deletePost(id: string): Promise<void> {
    await api.delete(`/api/blog/posts/${id}`);
  }

  // ==================== REACTIONS ====================

  /**
   * Toggle a reaction on a block
   */
  static async toggleReaction(
    postId: string,
    blockId: string,
    emoji: EmojiType
  ): Promise<'added' | 'removed'> {
    const { data } = await api.post<ReactionToggleResponse>(
      `/api/blog/posts/${postId}/blocks/${blockId}/reactions`,
      { emoji }
    );
    return data.action;
  }

  /**
   * Get aggregated reactions for a post
   */
  static async getPostReactions(
    postId: string,
    userFirebaseUid?: string
  ): Promise<PostReactions> {
    const params = userFirebaseUid ? `?userFirebaseUid=${userFirebaseUid}` : '';
    const { data } = await api.get<ReactionsResponse>(
      `/api/blog/posts/${postId}/reactions${params}`
    );
    return data.data;
  }

  // ==================== COMMENTS ====================

  /**
   * Get comments for a post
   */
  static async getComments(postId: string): Promise<BlogComment[]> {
    const { data } = await api.get<CommentsResponse>(
      `/api/blog/posts/${postId}/comments`
    );
    return data.data.map(mapComment);
  }

  /**
   * Create a comment on a post
   */
  static async createComment(
    postId: string,
    content: string
  ): Promise<BlogComment> {
    const { data } = await api.post<CommentResponse>(
      `/api/blog/posts/${postId}/comments`,
      { content }
    );
    return mapComment(data.data);
  }

  /**
   * Delete a comment
   */
  static async deleteComment(postId: string, commentId: string): Promise<void> {
    await api.delete(`/api/blog/posts/${postId}/comments/${commentId}`);
  }

  // ==================== AUTHOR ====================

  /**
   * Check if current user is an authorized blog author
   */
  static async checkAuthorStatus(): Promise<boolean> {
    try {
      const { data } = await api.get<AuthorCheckResponse>(
        '/api/blog/check-author'
      );
      return data.data.isAuthor;
    } catch {
      return false;
    }
  }
}

export default BlogService;
