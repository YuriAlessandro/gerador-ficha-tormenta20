import React, { useState, useEffect, useCallback } from 'react';
import { BlogComment } from '../../types/blog.types';
import BlogService from '../../services/blog.service';
import {
  CommentSection as UnifiedCommentSection,
  CommentData,
} from '../Comments';

interface BlogCommentSectionProps {
  postId: string;
}

/**
 * Blog-specific comment section that wraps the unified CommentSection.
 * Handles data fetching and CRUD operations for blog post comments.
 */
const BlogCommentSection: React.FC<BlogCommentSectionProps> = ({ postId }) => {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapBlogCommentToCommentData = (comment: BlogComment): CommentData => ({
    id: comment.id,
    authorFirebaseUid: comment.authorFirebaseUid,
    authorUsername: comment.authorUsername,
    authorName: comment.authorName,
    authorPhotoURL: comment.authorPhotoURL,
    authorSupportLevel: comment.authorSupportLevel,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  });

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await BlogService.getComments(postId);
      setComments(data.map(mapBlogCommentToCommentData));
    } catch (err) {
      setError('Erro ao carregar comentários');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async (content: string) => {
    const newComment = await BlogService.createComment(postId, content);
    setComments((prev) => [mapBlogCommentToCommentData(newComment), ...prev]);
  };

  const handleDelete = async (commentId: string) => {
    await BlogService.deleteComment(postId, commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  return (
    <UnifiedCommentSection
      comments={comments}
      loading={loading}
      error={error}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      maxLength={2000}
    />
  );
};

export default BlogCommentSection;
