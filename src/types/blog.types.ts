export type EmojiType = 'heart' | 'thumbsup' | 'fire' | 'laugh' | 'wow';

export const EMOJI_CONFIG: Record<EmojiType, { emoji: string; label: string }> =
  {
    heart: { emoji: '❤️', label: 'Amei' },
    thumbsup: { emoji: '👍', label: 'Curtir' },
    fire: { emoji: '🔥', label: 'Incrível' },
    laugh: { emoji: '😂', label: 'Haha' },
    wow: { emoji: '😮', label: 'Wow' },
  };

export const VALID_EMOJIS: EmojiType[] = [
  'heart',
  'thumbsup',
  'fire',
  'laugh',
  'wow',
];

export interface BlogBlock {
  id: string;
  title?: string;
  content: string;
  imageUrl?: string;
  imageCaption?: string;
  order: number;
}

export interface BlogPost {
  id: string;
  title: string;
  description: string;
  slug: string;
  authorEmail: string;
  authorId: string;
  authorName: string;
  coverImage?: string;
  blocks: BlogBlock[];
  publishedAt?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogReaction {
  count: number;
  hasReacted: boolean;
}

export interface BlockReactions {
  [emoji: string]: BlogReaction;
}

export interface PostReactions {
  [blockId: string]: BlockReactions;
}

export interface BlogComment {
  id: string;
  postId: string;
  authorId: string;
  authorFirebaseUid: string;
  authorUsername: string;
  authorName: string;
  authorPhotoURL?: string;
  authorSupportLevel?: import('./subscription.types').SupportLevel;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostInput {
  title: string;
  description: string;
  slug?: string;
  coverImage?: string;
  blocks: Omit<BlogBlock, 'id' | 'order'>[];
  isPublished?: boolean;
}

export interface BlockInput {
  id?: string;
  title?: string;
  content: string;
  imageUrl?: string;
  imageCaption?: string;
}

export interface UpdatePostInput {
  title?: string;
  description?: string;
  slug?: string;
  coverImage?: string;
  blocks?: BlockInput[];
  isPublished?: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  count: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
}
