import api from "./axios";

export const getConversation = async (
  userEmail,
  otherUserEmail
) => {
  if (!userEmail) {
    throw new Error("User email is required");
  }

  if (!otherUserEmail) {
    throw new Error("Other user email is required");
  }

  const response = await api.get(
    "/api/messages/conversation",
    {
      params: {
        userEmail,
        otherUserEmail,
      },
    }
  );

  return response.data;
};


/*
 * Get ONLY users who have an existing conversation
 * with the logged-in user.
 */
export const getConversations = async (userEmail) => {
  if (!userEmail) {
    throw new Error("User email is required");
  }

  const response = await api.get(
    "/api/messages/conversations",
    {
      params: {
        userEmail,
      },
    }
  );

  return response.data;
};