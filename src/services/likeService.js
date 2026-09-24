import api from "./axios";

export const likePost = async (userId, postId) => {
  const response = await api.post("/api/likes", {
    userId: Number(userId),
    postId: Number(postId),
  });

  return response.data;
};

export const unlikePost = async (userId, postId) => {
  const response = await api.delete("/api/likes", {
    params: {
      userId: Number(userId),
      postId: Number(postId),
    },
  });

  return response.data;
};

export const getLikeCount = async (postId) => {
  const response = await api.get(`/api/likes/count/${postId}`);
  return response.data;
};

export const checkLike = async (userId, postId) => {
  const response = await api.get("/api/likes/check", {
    params: {
      userId: Number(userId),
      postId: Number(postId),
    },
  });

  return response.data;
};