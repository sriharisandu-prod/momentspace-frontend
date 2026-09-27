import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;

const SOCKET_URL =
  `${process.env.REACT_APP_API_URL || "http://localhost:9090"}/ws`;

/*
 * =========================================================
 * CONNECT CALL SOCKET
 * =========================================================
 */
export const connectCallSocket = (
  userId,
  onCallReceived,
  onConnected,
  onError
) => {
  const normalizedUserId = Number(userId);

  if (!normalizedUserId) {
    console.error(
      "Cannot connect call socket. Invalid user ID:",
      userId
    );

    return null;
  }

  /*
   * Already connected
   */
  if (stompClient?.connected) {
    console.log(
      "CALL SOCKET ALREADY CONNECTED"
    );

    if (onConnected) {
      onConnected();
    }

    return stompClient;
  }

  /*
   * Existing client is trying to reconnect.
   */
  if (stompClient && !stompClient.connected) {
    try {
      stompClient.deactivate();
    } catch (error) {
      console.error(
        "Failed to deactivate previous call socket:",
        error
      );
    }

    stompClient = null;
  }

  console.log(
    "================================="
  );

  console.log(
    "CONNECTING CALL WEBSOCKET"
  );

  console.log(
    "URL:",
    SOCKET_URL
  );

  console.log(
    "USER ID:",
    normalizedUserId
  );

  console.log(
    "================================="
  );

  stompClient = new Client({
    webSocketFactory: () => {
      console.log(
        "CREATING CALL SOCKJS CONNECTION:",
        SOCKET_URL
      );

      return new SockJS(SOCKET_URL);
    },

    reconnectDelay: 5000,

    debug: (message) => {
      console.log(
        "[CALL STOMP]",
        message
      );
    },

    onConnect: () => {
      console.log(
        "================================="
      );

      console.log(
        "CALL WEBSOCKET CONNECTED"
      );

      console.log(
        "CURRENT USER ID:",
        normalizedUserId
      );

      console.log(
        "================================="
      );

      const destination =
        `/queue/calls/${normalizedUserId}`;

      console.log(
        "SUBSCRIBING TO:",
        destination
      );

      stompClient.subscribe(
        destination,
        (message) => {
          try {
            const signal =
              JSON.parse(message.body);

            console.log(
              "================================="
            );

            console.log(
              "CALL SIGNAL RECEIVED"
            );

            console.log(
              signal
            );

            console.log(
              "================================="
            );

            if (onCallReceived) {
              onCallReceived(signal);
            }
          } catch (error) {
            console.error(
              "FAILED TO PARSE CALL SIGNAL:",
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
        "CALL STOMP ERROR:",
        frame.headers?.message
      );

      console.error(
        "CALL STOMP ERROR BODY:",
        frame.body
      );

      if (onError) {
        onError(frame);
      }
    },

    onWebSocketError: (error) => {
      console.error(
        "CALL WEBSOCKET ERROR:",
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


/*
 * =========================================================
 * SEND CALL SIGNAL
 * =========================================================
 */
export const sendCallSignal = (
  signal
) => {
  if (!stompClient?.connected) {
    console.error(
      "Cannot send call signal. WebSocket not connected."
    );

    return false;
  }

  const normalizedSignal = {
    ...signal,

    callerId:
      signal.callerId !== null &&
      signal.callerId !== undefined
        ? Number(signal.callerId)
        : null,

    receiverId:
      signal.receiverId !== null &&
      signal.receiverId !== undefined
        ? Number(signal.receiverId)
        : null,

    callId:
      signal.callId !== null &&
      signal.callId !== undefined
        ? Number(signal.callId)
        : null,
  };

  console.log(
    "================================="
  );

  console.log(
    "CALL SIGNAL SENT"
  );

  console.log(
    normalizedSignal
  );

  console.log(
    "================================="
  );

  stompClient.publish({
    destination: "/app/call",

    body: JSON.stringify(
      normalizedSignal
    ),
  });

  return true;
};


/*
 * =========================================================
 * DISCONNECT
 * =========================================================
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
        "ERROR DISCONNECTING CALL SOCKET:",
        error
      );
    }

    stompClient = null;
  };


/*
 * =========================================================
 * CHECK CONNECTION
 * =========================================================
 */
export const isCallSocketConnected =
  () => {
    return Boolean(
      stompClient?.connected
    );
  };