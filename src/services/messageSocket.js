import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const SOCKET_URL = "http://localhost:9090/ws";

let stompClient = null;

export const connectMessageSocket = (onMessage) => {
  /*
   * If an old connection exists,
   * close it first.
   */
  if (stompClient) {
    try {
      stompClient.deactivate();
    } catch (error) {
      console.error(
        "Failed to deactivate previous message socket:",
        error
      );
    }

    stompClient = null;
  }

  console.log("Connecting message WebSocket...");

  stompClient = new Client({
    webSocketFactory: () => {
      return new SockJS(SOCKET_URL);
    },

    reconnectDelay: 5000,

    debug: () => {},

    onConnect: () => {
      console.log("Message WebSocket connected");

      /*
       * IMPORTANT:
       *
       * Your current backend uses:
       *
       * @SendTo("/topic/messages")
       *
       * Therefore the frontend MUST subscribe
       * to the same destination.
       */
      stompClient.subscribe(
        "/topic/messages",
        (message) => {
          try {
            const parsedMessage =
              JSON.parse(message.body);

            console.log(
              "Incoming message:",
              parsedMessage
            );

            if (onMessage) {
              onMessage(parsedMessage);
            }
          } catch (error) {
            console.error(
              "Failed to parse incoming message:",
              error
            );
          }
        }
      );

      console.log(
        "Subscribed to /topic/messages"
      );
    },

    onStompError: (frame) => {
      console.error(
        "STOMP error:",
        frame
      );
    },

    onWebSocketError: (error) => {
      console.error(
        "WebSocket error:",
        error
      );
    },

    onWebSocketClose: () => {
      console.log(
        "Message WebSocket closed"
      );
    },
  });

  stompClient.activate();
};


export const sendMessage = (message) => {
  if (
    !stompClient ||
    !stompClient.connected
  ) {
    console.error(
      "Message WebSocket is not connected"
    );

    return false;
  }

  console.log(
    "Sending message:",
    message
  );

  stompClient.publish({
    destination: "/app/sendMessage",
    body: JSON.stringify(message),
  });

  return true;
};


export const disconnectMessageSocket = () => {
  if (stompClient) {
    try {
      stompClient.deactivate();
    } catch (error) {
      console.error(
        "Failed to disconnect message socket:",
        error
      );
    }

    stompClient = null;
  }
};