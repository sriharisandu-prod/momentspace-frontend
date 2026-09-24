// src/services/memoryService.js

const API_URL =
  `${process.env.REACT_APP_API_URL || "http://localhost:9090/api"}/posts`;

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("jwtToken") ||
    localStorage.getItem("accessToken")
  );
};

const getAuthHeaders = () => {
  const token = getToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

/**
 * Get all memories
 * GET /api/posts
 */
const getAllMemories = async () => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch memories: ${response.status}`);
  }

  return response.json();
};

/**
 * Get single memory
 * GET /api/posts/{id}
 */
const getPostById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch memory: ${response.status}`);
  }

  return response.json();
};

/**
 * Create memory
 *
 * Backend expects:
 * description
 * category
 * location
 * files
 *
 * POST /api/posts
 */
const createPost = async ({
  description,
  category,
  location,
  files,
}) => {
  const formData = new FormData();

  formData.append("description", description);
  formData.append("category", category.toUpperCase());
  formData.append("location", location);

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),

      // IMPORTANT:
      // Do NOT set Content-Type manually.
      // Browser will automatically set multipart/form-data boundary.
    },
    body: formData,
  });

  const contentType = response.headers.get("content-type");

  let data = null;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message || `Failed to create memory: ${response.status}`;

    throw new Error(message);
  }

  return data;
};

/**
 * Update memory
 *
 * PUT /api/posts/{id}
 */
const updatePost = async ({
  id,
  description,
  category,
  location,
  files = [],
}) => {
  const formData = new FormData();

  formData.append("description", description);
  formData.append("category", category.toUpperCase());
  formData.append("location", location);

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  });

  const contentType = response.headers.get("content-type");

  let data = null;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message || `Failed to update memory: ${response.status}`;

    throw new Error(message);
  }

  return data;
};

/**
 * Delete memory
 *
 * DELETE /api/posts/{id}
 */
const deletePost = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      text || `Failed to delete memory: ${response.status}`
    );
  }

  return true;
};

/**
 * Delete individual media
 *
 * DELETE /api/posts/{postId}/media/{mediaId}
 */
const deletePostMedia = async (postId, mediaId) => {
  const response = await fetch(
    `${API_URL}/${postId}/media/${mediaId}`,
    {
      method: "DELETE",
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      text || `Failed to delete media: ${response.status}`
    );
  }

  return true;
};

const memoryService = {
  getAllMemories,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  deletePostMedia,
};

export default memoryService;