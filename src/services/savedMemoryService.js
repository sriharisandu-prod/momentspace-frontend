import api from "./axios";

export const saveMemory = async (userId, postId) => {
  const response = await api.post("/api/saved-memories", null, {
    params: {
      userId: Number(userId),
      postId: Number(postId),
    },
  });

  return response.data;
};

export const unsaveMemory = async (userId, postId) => {
  const response = await api.delete("/api/saved-memories", {
    params: {
      userId: Number(userId),
      postId: Number(postId),
    },
  });

  return response.data;
};

export const checkSavedMemory = async (userId, postId) => {
  const response = await api.get("/api/saved-memories/check", {
    params: {
      userId: Number(userId),
      postId: Number(postId),
    },
  });

  return response.data;
};

export const getSavedMemories = async (userId) => {
  const response = await api.get(
    `/api/saved-memories/user/${Number(userId)}`
  );

  return response.data;
};