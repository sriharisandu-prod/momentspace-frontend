import api from "./axios";

/**
 * =========================================================
 * GET USER BY ID
 * =========================================================
 *
 * GET /api/users/{id}
 */
export const getUserById = async (id) => {
  if (!id) {
    throw new Error("User ID is required");
  }

  const response = await api.get(`/api/users/${id}`);

  return response.data;
};

/**
 * =========================================================
 * GET ALL USERS
 * =========================================================
 *
 * GET /api/users
 *
 * Kept because other parts of the application may still use it.
 */
export const getAllUsers = async () => {
  const response = await api.get("/api/users");

  return response.data;
};

/**
 * =========================================================
 * SEARCH USERS
 * =========================================================
 *
 * GET /api/users/search?query=value
 *
 * Searches:
 * - username
 * - email
 */
export const searchUsers = async (query) => {
  const value = query?.trim();

  if (!value) {
    return [];
  }

  const response = await api.get("/api/users/search", {
    params: {
      query: value,
    },
  });

  return Array.isArray(response.data)
    ? response.data
    : [];
};

/**
 * =========================================================
 * FIND USER BY EMAIL
 * =========================================================
 *
 * Kept for compatibility with any existing code.
 */
export const getUserByEmail = async (email) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const response = await api.get(
    "/api/users/search",
    {
      params: {
        query: email,
      },
    }
  );

  const users = Array.isArray(response.data)
    ? response.data
    : [];

  const user = users.find(
    (item) =>
      item.email &&
      item.email.toLowerCase() ===
        email.toLowerCase()
  );

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

/**
 * =========================================================
 * UPDATE USER PROFILE
 * =========================================================
 *
 * PUT /api/users/{id}
 *
 * Backend expects multipart/form-data.
 */
export const updateUser = async (
  id,
  username,
  email,
  profileImage = null
) => {

  if (!id) {
    throw new Error("User ID is required");
  }

  if (!username || !username.trim()) {
    throw new Error("Username is required");
  }

  if (!email || !email.trim()) {
    throw new Error("Email is required");
  }

  const formData = new FormData();

  formData.append(
    "username",
    username.trim()
  );

  formData.append(
    "email",
    email.trim()
  );

  if (profileImage instanceof File) {
    formData.append(
      "profileImage",
      profileImage
    );
  }

  const response = await api.put(
    `/api/users/${id}`,
    formData
  );

  return response.data;
};

/**
 * =========================================================
 * DELETE USER
 * =========================================================
 */
export const deleteUser = async (id) => {

  if (!id) {
    throw new Error("User ID is required");
  }

  const response = await api.delete(
    `/api/users/${id}`
  );

  return response.data;
};