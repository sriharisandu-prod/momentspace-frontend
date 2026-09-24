import api from "./axios";

export const savePost = async (userId, postId) => {
  const response = await api.post(
    `/api/saved?userId=${userId}&postId=${postId}`
  );

  return response.data;
};

export const unsavePost = async (userId, postId) => {
  const response = await api.delete(
    `/api/saved?userId=${userId}&postId=${postId}`
  );

  return response.data;
};

export const checkSaved = async (userId, postId) => {
  const response = await api.get(
    `/api/saved/check?userId=${userId}&postId=${postId}`
  );

  return response.data;
};

export const getSavedPosts = async (userId) => {
  const response = await api.get(
    `/api/saved/user/${userId}`
  );

  return response.data;
};