import api from "./axios";

/**
 * Follow user
 */
export const followUser = async (followerId, followingId) => {
  const response = await api.post(
    `/api/follows?followerId=${followerId}&followingId=${followingId}`
  );

  return response.data;
};

/**
 * Unfollow user
 */
export const unfollowUser = async (followerId, followingId) => {
  const response = await api.delete(
    `/api/follows?followerId=${followerId}&followingId=${followingId}`
  );

  return response.data;
};

/**
 * Check whether followerId follows followingId
 */
export const checkFollowing = async (followerId, followingId) => {
  const response = await api.get(
    `/api/follows/check?followerId=${followerId}&followingId=${followingId}`
  );

  return response.data;
};

/**
 * Followers count
 */
export const getFollowersCount = async (userId) => {
  const response = await api.get(
    `/api/follows/followers/${userId}`
  );

  return response.data;
};

/**
 * Following count
 */
export const getFollowingCount = async (userId) => {
  const response = await api.get(
    `/api/follows/following/${userId}`
  );

  return response.data;
};

/**
 * Followers list
 */
export const getFollowers = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const response = await api.get(
    `/api/follows/followers/list/${userId}`
  );

  return response.data;
};

/**
 * Following list
 */
export const getFollowing = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const response = await api.get(
    `/api/follows/following/list/${userId}`
  );

  return response.data;
};