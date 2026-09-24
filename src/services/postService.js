import api from "./axios";

// Create a new post / memory
export const createPost = async ({
  title,
  description,
  category,
  location,
  visibility,
  files,
}) => {
  const formData = new FormData();

  formData.append("title", title);
  formData.append("description", description);
  formData.append("category", category);
  formData.append("location", location);
  formData.append(
    "visibility",
    visibility
  );

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await api.post(
    "/api/posts",
    formData
  );

  return response.data;
};

// Get all posts
export const getAllPosts = async () => {
  const response = await api.get(
    "/api/posts"
  );

  return response.data;
};

// Get one post
export const getPostById = async (postId) => {
  const response = await api.get(
    `/api/posts/${postId}`
  );

  return response.data;
};