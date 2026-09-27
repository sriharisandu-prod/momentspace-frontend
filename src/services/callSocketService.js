import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;

const SOCKET_URL =
  `${process.env.REACT_APP_API_URL || "http://localhost:9090"}/ws`;


/**
 * Connect the current user to the call WebSocket.
 */
export const connectCallSocket = (
  userId,
  onCallReceived,
  onConnected,
  onError
) => {

  if (!userId) {
    console.error(
      "Cannot connect call socket: user ID is missing."
    );

    return null;
  }

  if (stompClient?.connected) {
    console.log(
      "Call WebSocket is already connected."
    );

    return stompClient;
  }

  console.log(
    "Connecting call WebSocket:",
    SOCKET_URL
  );

  stompClient = new Client({

    webSocketFactory: () => {
      console.log(
        "Creating SockJS connection:",
        SOCKET_URL
      );

      return new SockJS(SOCKET_URL);
    },

    reconnectDelay: 5000,

    debug: (message) => {
      console.log("[STOMP]", message);
    },

    onConnect: () => {

      console.log(
        "CALL WEBSOCKET CONNECTED"
      );

      const destination =
        `/queue/calls/${userId}`;

      console.log(
        "Subscribing to:",
        destination
      );

      stompClient.subscribe(
        destination,
        (message) => {

          try {

            const signal =
              JSON.parse(message.body);

            console.log(
              "CALL SIGNAL RECEIVED:",
              signal
            );

            if (onCallReceived) {
              onCallReceived(signal);
            }

          } catch (error) {

            console.error(
              "Failed to parse call signal:",
              error
            );

          }

        }
      );

      if (onConnected) {
        onConnected();
      }
    },

    onStompError: (frame) => {

      console.error(
        "STOMP ERROR:",
        frame.headers?.message
      );

      console.error(
        "STOMP ERROR BODY:",
        frame.body
      );

      if (onError) {
        onError(frame);
      }
    },

    onWebSocketError: (error) => {

      console.error(
        "WEBSOCKET ERROR:",
        error
      );

      if (onError) {
        onError(error);
      }
    },

    onWebSocketClose: () => {

      console.warn(
        "CALL WEBSOCKET CLOSED"
      );

    },

  });

  stompClient.activate();

  return stompClient;
};


/**
 * Send a call signal to the backend.
 */
export const sendCallSignal = (
  signal
) => {

  if (!stompClient?.connected) {

    console.error(
      "Cannot send call signal: WebSocket is not connected."
    );

    return false;
  }

  console.log(
    "CALL SIGNAL SENT:",
    signal
  );

  stompClient.publish({

    destination:
      "/app/call",

    body:
      JSON.stringify(signal),

  });

  return true;
};


/**
 * Disconnect the WebSocket.
 */
export const disconnectCallSocket =
  async () => {

    if (!stompClient) {
      return;
    }

    try {

      await stompClient.deactivate();

    } catch (error) {

      console.error(
        "Error disconnecting call socket:",
        error
      );

    }

    stompClient = null;
  };


/**
 * Check whether the socket is currently connected.
 */
export const isCallSocketConnected =
  () => {

    return Boolean(
      stompClient?.connected
    );

  };