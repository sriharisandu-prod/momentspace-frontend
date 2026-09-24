import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;

const SOCKET_URL =
  `${process.env.REACT_APP_API_URL || "http://localhost:9090"}/ws`;


export const connectCallSocket = (
  userId,
  onCallReceived,
  onConnected,
  onError
) => {

  if (!userId) {
    console.error(
      "User ID is required for WebSocket connection."
    );

    return null;
  }


  if (stompClient?.active) {
    return stompClient;
  }


  stompClient = new Client({

    webSocketFactory: () =>
      new SockJS(
        SOCKET_URL
      ),

    reconnectDelay: 5000,

    debug: () => {},


    onConnect: () => {

      console.log(
        "Call WebSocket connected."
      );


      stompClient.subscribe(
        `/queue/calls/${userId}`,
        (message) => {

          try {

            const signal =
              JSON.parse(
                message.body
              );


            console.log(
              "Incoming call signal:",
              signal
            );


            if (onCallReceived) {

              onCallReceived(
                signal
              );

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
        "STOMP error:",
        frame.headers["message"],
        frame.body
      );


      if (onError) {
        onError(frame);
      }

    },


    onWebSocketError: (error) => {

      console.error(
        "WebSocket error:",
        error
      );


      if (onError) {
        onError(error);
      }

    },

  });


  stompClient.activate();


  return stompClient;
};


export const sendCallSignal = (
  signal
) => {

  if (
    !stompClient?.connected
  ) {

    console.error(
      "Call WebSocket is not connected."
    );

    return false;

  }


  stompClient.publish({

    destination:
      "/app/call",

    body:
      JSON.stringify(
        signal
      ),

  });


  return true;
};


export const disconnectCallSocket =
  () => {

    if (stompClient) {

      stompClient.deactivate();

      stompClient = null;

    }

  };


export const isCallSocketConnected =
  () => {

    return Boolean(
      stompClient?.connected
    );

  };