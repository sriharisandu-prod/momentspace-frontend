import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./AuthContext";

import {
  getNotifications,
  markNotificationAsRead,
  getUnreadNotificationCount,
} from "../services/notificationService";

import {
  connectNotificationSocket,
  disconnectNotificationSocket,
} from "../services/notificationSocket";


const NotificationContext =
  createContext(null);


export const NotificationProvider = ({
  children,
}) => {

  const { user } = useAuth();

  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [loading, setLoading] =
    useState(false);


  /* =====================================================
     LOAD NOTIFICATIONS
  ===================================================== */

  const refreshNotifications =
    useCallback(async () => {

      if (!user?.id) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      try {

        setLoading(true);

        const [
          notificationData,
          unreadData,
        ] = await Promise.all([
          getNotifications(user.id),
          getUnreadNotificationCount(user.id),
        ]);


        setNotifications(
          Array.isArray(notificationData)
            ? notificationData
            : []
        );

        setUnreadCount(
          Number(unreadData) || 0
        );

      } catch (error) {

        console.error(
          "Failed to load notifications:",
          error
        );

      } finally {

        setLoading(false);
      }

    }, [user?.id]);


  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {

    refreshNotifications();

  }, [refreshNotifications]);


  /* =====================================================
     WEBSOCKET
  ===================================================== */

  useEffect(() => {

    if (!user?.id) {
      return;
    }


    const handleNewNotification =
      (notification) => {

        setNotifications(
          (previousNotifications) => [
            notification,
            ...previousNotifications,
          ]
        );


        setUnreadCount(
          (previousCount) =>
            previousCount + 1
        );
      };


    connectNotificationSocket(
      user.id,
      handleNewNotification
    );


    return () => {

      disconnectNotificationSocket();

    };

  }, [user?.id]);


  /* =====================================================
     MARK AS READ
  ===================================================== */

  const markAsRead = async (
    notificationId
  ) => {

    try {

      await markNotificationAsRead(
        notificationId
      );


      setNotifications(
        (previousNotifications) =>
          previousNotifications.map(
            (notification) => {

              if (
                notification.id ===
                notificationId
              ) {

                return {
                  ...notification,
                  isRead: true,
                };

              }

              return notification;
            }
          )
      );


      setUnreadCount(
        (previousCount) =>
          Math.max(
            0,
            previousCount - 1
          )
      );

    } catch (error) {

      console.error(
        "Failed to mark notification as read:",
        error
      );

      throw error;
    }
  };


  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};


export const useNotifications = () => {

  return useContext(
    NotificationContext
  );

};


export default NotificationContext;