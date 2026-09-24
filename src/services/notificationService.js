import api from "./axios";

export const getNotifications = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const response = await api.get(
    `/api/notifications/${userId}`
  );

  return response.data;
};

export const markNotificationAsRead = async (
  notificationId
) => {
  if (!notificationId) {
    throw new Error("Notification ID is required");
  }

  const response = await api.patch(
    `/api/notifications/${notificationId}`
  );

  return response.data;
};

export const getUnreadNotificationCount = async (
  userId
) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const response = await api.get(
    `/api/notifications/unread/${userId}`
  );

  return response.data;
};