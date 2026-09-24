import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const SOCKET_URL =
  `${process.env.REACT_APP_API_URL || "http://localhost:9090"}/ws`;

let stompClient = null;

export const connectNotificationSocket = (
  userId,
  onNotification
) => {
  if (!userId) {
    console.error(
      "Notification WebSocket: user ID is missing"
    );

    return null;
  }

  if (stompClient?.active) {
    return stompClient;
  }

  stompClient = new Client({
    webSocketFactory: () => {
      return new SockJS(SOCKET_URL);
    },

    reconnectDelay: 5000,

    debug: () => {},

    onConnect: () => {
      console.log(
        "Notification WebSocket connected"
      );

      stompClient.subscribe(
        `/topic/notifications/${userId}`,
        (message) => {
          try {
            const notification =
              JSON.parse(message.body);

            console.log(
              "New notification:",
              notification
            );

            if (onNotification) {
              onNotification(notification);
            }
          } catch (error) {
            console.error(
              "Failed to parse notification:",
              error
            );
          }
        }
      );
    },

    onStompError: (frame) => {
      console.error(
        "Notification STOMP error:",
        frame.headers["message"]
      );

      console.error(
        "Notification STOMP body:",
        frame.body
      );
    },

    onWebSocketError: (error) => {
      console.error(
        "Notification WebSocket error:",
        error
      );
    },

    onDisconnect: () => {
      console.log(
        "Notification WebSocket disconnected"
      );
    },
  });

  stompClient.activate();

  return stompClient;
};

export const disconnectNotificationSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
};

export const isNotificationSocketConnected = () => {
  return Boolean(
    stompClient?.connected
  );
};