import api from "./axios";

/**
 * Create a comment
 *
 * POST /api/comments
 *
 * Body:
 * {
 *   userId,
 *   postId,
 *   content
 * }
 */
export const createComment = async (userId, postId, content) => {
  const response = await api.post("/api/comments", {
    userId,
    postId,
    content,
  });

  return response.data;
};

/**
 * Get all comments for a post
 *
 * GET /api/comments/post/{postId}
 */
export const getCommentsByPostId = async (postId) => {
  const response = await api.get(`/api/comments/post/${postId}`);

  return response.data;
};

/**
 * Get comment count
 *
 * GET /api/comments/count/{postId}
 */
export const getCommentCount = async (postId) => {
  const response = await api.get(`/api/comments/count/${postId}`);

  return response.data;
};

/**
 * Delete comment
 *
 * DELETE /api/comments/{commentId}
 */
export const deleteComment = async (commentId) => {
  const response = await api.delete(`/api/comments/${commentId}`);

  return response.data;
};