import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  connectCallSocket,
  sendCallSignal,
  disconnectCallSocket,
} from "../services/callSocketService";

import {
  createPeerConnection,
  getLocalMedia,
  addLocalTracks,
  createOffer,
  createAnswer,
  setRemoteDescription,
  addIceCandidate,
  stopLocalStream,
  closePeerConnection,
} from "../services/webrtcService";


const CallContext =
  createContext(null);


/*
 * =========================================================
 * CALL PROVIDER
 * =========================================================
 */
export const CallProvider = ({
  children,
}) => {
  /*
   * =======================================================
   * STATE
   * =======================================================
   */

  const [call, setCall] =
    useState(null);

  const [incomingCall, setIncomingCall] =
    useState(null);

  const [callConnected, setCallConnected] =
    useState(false);

  const [isMuted, setIsMuted] =
    useState(false);

  const [localStream, setLocalStream] =
    useState(null);

  const [remoteStream, setRemoteStream] =
    useState(null);

  const [callStatus, setCallStatus] =
    useState("IDLE");

  const [callSocketConnected, setCallSocketConnected] =
    useState(false);


  /*
   * =======================================================
   * REFS
   * =======================================================
   */

  const peerConnectionRef =
    useRef(null);

  const localStreamRef =
    useRef(null);

  const remoteStreamRef =
    useRef(null);

  const pendingCandidatesRef =
    useRef([]);

  const currentUserIdRef =
    useRef(null);


  /*
   * =======================================================
   * CURRENT USER
   * =======================================================
   */

  const getCurrentUser =
    () => {
      try {
        const storedUser =
          localStorage.getItem(
            "memorieshub_user"
          );

        if (!storedUser) {
          return null;
        }

        return JSON.parse(
          storedUser
        );
      } catch (error) {
        console.error(
          "FAILED TO READ CURRENT USER:",
          error
        );

        return null;
      }
    };


  /*
   * =======================================================
   * GET OTHER USER ID
   * =======================================================
   */

  const getOtherUserId =
    (signal) => {
      const currentUserId =
        Number(
          currentUserIdRef.current
        );

      const callerId =
        Number(signal?.callerId);

      const receiverId =
        Number(signal?.receiverId);

      if (
        callerId === currentUserId
      ) {
        return receiverId;
      }

      return callerId;
    };


  /*
   * =======================================================
   * INITIALIZE PEER CONNECTION
   * =======================================================
   */

  const initializePeerConnection =
    async ({
      callerId,
      receiverId,
      callId,
      callType,
    }) => {
      /*
       * Close previous connection.
       */
      if (
        peerConnectionRef.current
      ) {
        closePeerConnection(
          peerConnectionRef.current
        );

        peerConnectionRef.current =
          null;
      }


      const normalizedCallerId =
        Number(callerId);

      const normalizedReceiverId =
        Number(receiverId);

      const normalizedCallId =
        Number(callId);


      const peerConnection =
        createPeerConnection({
          /*
           * ICE
           */
          onIceCandidate:
            (candidate) => {
              const currentUserId =
                Number(
                  currentUserIdRef.current
                );

              const otherUserId =
                currentUserId ===
                normalizedCallerId
                  ? normalizedReceiverId
                  : normalizedCallerId;


              sendCallSignal({
                type:
                  "ICE_CANDIDATE",

                callerId:
                  currentUserId,

                receiverId:
                  otherUserId,

                callId:
                  normalizedCallId,

                callType,

                data:
                  JSON.stringify(
                    candidate
                  ),
              });
            },


          /*
           * Remote track
           */
          onTrack:
            (event) => {
              console.log(
                "REMOTE MEDIA RECEIVED:",
                event.track?.kind
              );

              let stream =
                event.streams?.[0];


              /*
               * Some browsers may not provide
               * event.streams[0].
               */
              if (!stream) {
                if (
                  !remoteStreamRef.current
                ) {
                  remoteStreamRef.current =
                    new MediaStream();
                }

                stream =
                  remoteStreamRef.current;

                stream.addTrack(
                  event.track
                );
              }


              remoteStreamRef.current =
                stream;

              setRemoteStream(
                stream
              );
            },


          /*
           * Connection state
           */
          onConnectionStateChange:
            (state) => {
              console.log(
                "WEBRTC CONNECTION STATE:",
                state
              );


              switch (state) {
                case "new":
                  setCallStatus(
                    "NEW"
                  );
                  break;

                case "connecting":
                  setCallStatus(
                    "CONNECTING"
                  );

                  setCallConnected(
                    false
                  );

                  break;

                case "connected":
                  console.log(
                    "WEBRTC MEDIA CONNECTED"
                  );

                  setCallStatus(
                    "CONNECTED"
                  );

                  setCallConnected(
                    true
                  );

                  break;

                case "disconnected":
                  console.warn(
                    "WEBRTC DISCONNECTED"
                  );

                  setCallStatus(
                    "DISCONNECTED"
                  );

                  setCallConnected(
                    false
                  );

                  break;

                case "failed":
                  console.error(
                    "WEBRTC CONNECTION FAILED"
                  );

                  setCallStatus(
                    "FAILED"
                  );

                  setCallConnected(
                    false
                  );

                  break;

                case "closed":
                  setCallStatus(
                    "CLOSED"
                  );

                  setCallConnected(
                    false
                  );

                  break;

                default:
                  break;
              }
            },


          /*
           * ICE state
           */
          onIceConnectionStateChange:
            (state) => {
              console.log(
                "WEBRTC ICE STATE:",
                state
              );
            },
        });


      peerConnectionRef.current =
        peerConnection;


      return peerConnection;
    };


  /*
   * =======================================================
   * START CALL
   * =======================================================
   *
   * IMPORTANT:
   *
   * startCall({
   *   receiverId: 5,
   *   callType: "VIDEO"
   * })
   *
   * =======================================================
   */

  const startCall =
    async ({
      receiverId,
      callType = "VOICE",
      callId = Date.now(),
    }) => {
      const currentUserId =
        Number(
          currentUserIdRef.current
        );

      const normalizedReceiverId =
        Number(receiverId);

      const normalizedCallId =
        Number(callId);


      if (!currentUserId) {
        console.error(
          "CANNOT START CALL: CURRENT USER ID MISSING"
        );

        return;
      }


      if (
        !normalizedReceiverId
      ) {
        console.error(
          "CANNOT START CALL: RECEIVER ID MISSING"
        );

        return;
      }


      if (
        currentUserId ===
        normalizedReceiverId
      ) {
        console.error(
          "CANNOT CALL YOURSELF"
        );

        return;
      }


      try {
        console.log(
          "================================="
        );

        console.log(
          "STARTING CALL"
        );

        console.log({
          callerId:
            currentUserId,

          receiverId:
            normalizedReceiverId,

          callId:
            normalizedCallId,

          callType,
        });

        console.log(
          "================================="
        );


        /*
         * Update UI immediately.
         */
        setCall({
          type:
            "CALL_STARTED",

          callerId:
            currentUserId,

          receiverId:
            normalizedReceiverId,

          callId:
            normalizedCallId,

          callType,
        });


        setIncomingCall(
          null
        );

        setCallStatus(
          "CALLING"
        );

        setCallConnected(
          false
        );


        /*
         * Get camera/microphone.
         */
        const stream =
          await getLocalMedia(
            callType
          );


        localStreamRef.current =
          stream;

        setLocalStream(
          stream
        );


        /*
         * Create peer connection.
         */
        await initializePeerConnection({
          callerId:
            currentUserId,

          receiverId:
            normalizedReceiverId,

          callId:
            normalizedCallId,

          callType,
        });


        /*
         * Add local tracks.
         */
        addLocalTracks(
          peerConnectionRef.current,
          stream
        );


        /*
         * Tell receiver.
         */
        const sent =
          sendCallSignal({
            type:
              "CALL_STARTED",

            callerId:
              currentUserId,

            receiverId:
              normalizedReceiverId,

            callId:
              normalizedCallId,

            callType,

            data:
              null,
          });


        if (!sent) {
          throw new Error(
            "CALL SIGNAL COULD NOT BE SENT"
          );
        }
      } catch (error) {
        console.error(
          "START CALL ERROR:",
          error
        );

        alert(
          "Unable to access your microphone/camera or connect the call. Please check browser permissions and WebSocket connection."
        );

        cleanupCall();
      }
    };


  /*
   * =======================================================
   * ACCEPT CALL
   * =======================================================
   */

  const acceptCall =
    async () => {
      if (!incomingCall) {
        console.error(
          "NO INCOMING CALL"
        );

        return;
      }


      const currentUserId =
        Number(
          currentUserIdRef.current
        );

      const callerId =
        Number(
          incomingCall.callerId
        );

      const receiverId =
        Number(
          incomingCall.receiverId
        );

      const callId =
        Number(
          incomingCall.callId
        );

      const callType =
        incomingCall.callType ||
        "VOICE";


      try {
        console.log(
          "================================="
        );

        console.log(
          "ACCEPTING CALL"
        );

        console.log(
          incomingCall
        );

        console.log(
          "================================="
        );


        /*
         * Get receiver's camera/microphone.
         */
        const stream =
          await getLocalMedia(
            callType
          );


        localStreamRef.current =
          stream;

        setLocalStream(
          stream
        );


        /*
         * Create peer connection.
         */
        await initializePeerConnection({
          callerId,
          receiverId,
          callId,
          callType,
        });


        /*
         * Add tracks.
         */
        addLocalTracks(
          peerConnectionRef.current,
          stream
        );


        /*
         * Create active call.
         */
        setCall({
          type:
            "CALL_ACCEPTED",

          callerId,

          receiverId,

          callId,

          callType,
        });


        setIncomingCall(
          null
        );

        setCallStatus(
          "ACCEPTED"
        );

        setCallConnected(
          false
        );


        /*
         * Tell original caller that
         * the call was accepted.
         *
         * IMPORTANT:
         *
         * Here callerId = current user
         * because current user is the
         * receiver who accepted.
         */
        sendCallSignal({
          type:
            "CALL_ACCEPTED",

          callerId:
            currentUserId,

          receiverId:
            callerId,

          callId,

          callType,

          data:
            null,
        });
      } catch (error) {
        console.error(
          "ACCEPT CALL ERROR:",
          error
        );

        alert(
          "Unable to access your microphone/camera."
        );

        cleanupCall();
      }
    };


  /*
   * =======================================================
   * HANDLE CALL SIGNAL
   * =======================================================
   */

  const handleCallSignal =
    async (signal) => {
      try {
        if (!signal) {
          return;
        }


        const currentUserId =
          Number(
            currentUserIdRef.current
          );

        const callerId =
          Number(signal.callerId);

        const receiverId =
          Number(signal.receiverId);


        console.log(
          "PROCESSING CALL SIGNAL:",
          signal
        );


        /*
         * Ignore signals that aren't
         * actually for this user.
         */
        if (
          receiverId !==
          currentUserId
        ) {
          console.warn(
            "CALL SIGNAL IS NOT FOR CURRENT USER"
          );

          return;
        }


        switch (
          signal.type
        ) {
          case "CALL_STARTED":
            /*
             * Don't display our own call
             * as an incoming call.
             */
            if (
              callerId ===
              currentUserId
            ) {
              return;
            }


            setIncomingCall({
              ...signal,

              callerId,

              receiverId,

              callId:
                Number(
                  signal.callId
                ),
            });


            setCallStatus(
              "RINGING"
            );

            break;


          case "CALL_ACCEPTED":
            await handleCallAccepted(
              signal
            );

            break;


          case "CALL_REJECTED":
            cleanupCall();

            break;


          case "CALL_ENDED":
            cleanupCall();

            break;


          case "WEBRTC_OFFER":
            await handleOffer(
              signal
            );

            break;


          case "WEBRTC_ANSWER":
            await handleAnswer(
              signal
            );

            break;


          case "ICE_CANDIDATE":
            await handleRemoteIceCandidate(
              signal
            );

            break;


          default:
            console.warn(
              "UNKNOWN CALL SIGNAL:",
              signal.type
            );
        }
      } catch (error) {
        console.error(
          "CALL SIGNAL PROCESSING ERROR:",
          error
        );
      }
    };


  /*
   * =======================================================
   * CALL ACCEPTED
   * =======================================================
   */

  const handleCallAccepted =
    async (signal) => {
      console.log(
        "REMOTE USER ACCEPTED CALL"
      );


      const peerConnection =
        peerConnectionRef.current;


      if (!peerConnection) {
        console.error(
          "NO PEER CONNECTION FOR CALL ACCEPTED"
        );

        return;
      }


      setCallStatus(
        "CONNECTING"
      );


      /*
       * Caller creates offer.
       */
      const offer =
        await createOffer(
          peerConnection
        );


      const currentUserId =
        Number(
          currentUserIdRef.current
        );


      /*
       * IMPORTANT:
       *
       * signal.callerId is the user
       * who accepted the call.
       *
       * So send offer to signal.callerId.
       */
      sendCallSignal({
        type:
          "WEBRTC_OFFER",

        callerId:
          currentUserId,

        receiverId:
          Number(
            signal.callerId
          ),

        callId:
          Number(
            signal.callId
          ),

        callType:
          signal.callType,

        data:
          JSON.stringify(
            offer
          ),
      });
    };


  /*
   * =======================================================
   * OFFER
   * =======================================================
   */

  const handleOffer =
    async (signal) => {
      console.log(
        "RECEIVED WEBRTC OFFER"
      );


      const peerConnection =
        peerConnectionRef.current;


      if (!peerConnection) {
        console.error(
          "NO PEER CONNECTION FOR OFFER"
        );

        return;
      }


      const offer =
        JSON.parse(
          signal.data
        );


      /*
       * Set remote offer.
       */
      await setRemoteDescription(
        peerConnection,
        offer
      );


      /*
       * Add ICE candidates that
       * arrived before the offer.
       */
      await flushPendingCandidates();


      /*
       * Create answer.
       */
      const answer =
        await createAnswer(
          peerConnection
        );


      const currentUserId =
        Number(
          currentUserIdRef.current
        );


      /*
       * Send answer back to
       * offer sender.
       */
      sendCallSignal({
        type:
          "WEBRTC_ANSWER",

        callerId:
          currentUserId,

        receiverId:
          Number(
            signal.callerId
          ),

        callId:
          Number(
            signal.callId
          ),

        callType:
          signal.callType,

        data:
          JSON.stringify(
            answer
          ),
      });
    };


  /*
   * =======================================================
   * ANSWER
   * =======================================================
   */

  const handleAnswer =
    async (signal) => {
      console.log(
        "RECEIVED WEBRTC ANSWER"
      );


      const peerConnection =
        peerConnectionRef.current;


      if (!peerConnection) {
        console.error(
          "NO PEER CONNECTION FOR ANSWER"
        );

        return;
      }


      const answer =
        JSON.parse(
          signal.data
        );


      await setRemoteDescription(
        peerConnection,
        answer
      );


      await flushPendingCandidates();
    };


  /*
   * =======================================================
   * REMOTE ICE
   * =======================================================
   */

  const handleRemoteIceCandidate =
    async (signal) => {
      try {
        const candidate =
          JSON.parse(
            signal.data
          );


        const peerConnection =
          peerConnectionRef.current;


        /*
         * Candidate may arrive before
         * remote SDP.
         */
        if (
          !peerConnection ||
          !peerConnection.remoteDescription
        ) {
          console.log(
            "QUEUEING ICE CANDIDATE"
          );

          pendingCandidatesRef.current.push(
            candidate
          );

          return;
        }


        await addIceCandidate(
          peerConnection,
          candidate
        );
      } catch (error) {
        console.error(
          "FAILED TO ADD REMOTE ICE:",
          error
        );
      }
    };


  /*
   * =======================================================
   * FLUSH ICE
   * =======================================================
   */

  const flushPendingCandidates =
    async () => {
      const peerConnection =
        peerConnectionRef.current;


      if (
        !peerConnection ||
        !peerConnection.remoteDescription
      ) {
        return;
      }


      const candidates =
        pendingCandidatesRef.current;


      pendingCandidatesRef.current =
        [];


      for (
        const candidate of candidates
      ) {
        try {
          await addIceCandidate(
            peerConnection,
            candidate
          );
        } catch (error) {
          console.error(
            "FAILED TO ADD QUEUED ICE:",
            error
          );
        }
      }
    };


  /*
   * =======================================================
   * REJECT CALL
   * =======================================================
   */

  const rejectCall =
    () => {
      if (!incomingCall) {
        return;
      }


      const currentUserId =
        Number(
          currentUserIdRef.current
        );


      const callerId =
        Number(
          incomingCall.callerId
        );


      sendCallSignal({
        type:
          "CALL_REJECTED",

        callerId:
          currentUserId,

        receiverId:
          callerId,

        callId:
          Number(
            incomingCall.callId
          ),

        callType:
          incomingCall.callType,

        data:
          null,
      });


      cleanupCall();
    };


  /*
   * =======================================================
   * END CALL
   * =======================================================
   */

  const endCall =
    () => {
      if (!call) {
        cleanupCall();

        return;
      }


      const currentUserId =
        Number(
          currentUserIdRef.current
        );


      const otherUserId =
        getOtherUserId(
          call
        );


      sendCallSignal({
        type:
          "CALL_ENDED",

        callerId:
          currentUserId,

        receiverId:
          Number(
            otherUserId
          ),

        callId:
          Number(
            call.callId
          ),

        callType:
          call.callType,

        data:
          null,
      });


      cleanupCall();
    };


  /*
   * =======================================================
   * MUTE
   * =======================================================
   */

  const toggleMute =
    () => {
      const stream =
        localStreamRef.current;


      if (!stream) {
        return;
      }


      const audioTracks =
        stream.getAudioTracks();


      if (
        audioTracks.length === 0
      ) {
        return;
      }


      const audioTrack =
        audioTracks[0];


      audioTrack.enabled =
        !audioTrack.enabled;


      setIsMuted(
        !audioTrack.enabled
      );
    };


  /*
   * =======================================================
   * CLEANUP
   * =======================================================
   */

  const cleanupCall =
    () => {
      console.log(
        "CLEANING UP CALL"
      );


      /*
       * Stop local media.
       */
      stopLocalStream(
        localStreamRef.current
      );


      localStreamRef.current =
        null;


      setLocalStream(
        null
      );


      /*
       * Close WebRTC.
       */
      closePeerConnection(
        peerConnectionRef.current
      );


      peerConnectionRef.current =
        null;


      /*
       * Clear remote stream.
       */
      remoteStreamRef.current =
        null;


      setRemoteStream(
        null
      );


      /*
       * Clear ICE.
       */
      pendingCandidatesRef.current =
        [];


      /*
       * Reset state.
       */
      setCall(
        null
      );

      setIncomingCall(
        null
      );

      setCallConnected(
        false
      );

      setIsMuted(
        false
      );

      setCallStatus(
        "IDLE"
      );
    };


  /*
   * =======================================================
   * CONNECT CALL SOCKET
   * =======================================================
   */

  useEffect(() => {
    const connectSocket =
      () => {
        const user =
          getCurrentUser();


        const userId =
          Number(
            user?.id
          );


        if (!userId) {
          console.warn(
            "CALL SOCKET NOT STARTED: USER ID NOT FOUND"
          );

          return;
        }


        currentUserIdRef.current =
          userId;


        connectCallSocket(
          userId,

          handleCallSignal,

          () => {
            console.log(
              "CALL SOCKET READY"
            );

            setCallSocketConnected(
              true
            );
          },

          (error) => {
            console.error(
              "CALL SOCKET ERROR:",
              error
            );

            setCallSocketConnected(
              false
            );
          }
        );
      };


    connectSocket();


    /*
     * Login can happen after the
     * provider has mounted.
     *
     * Give localStorage time to contain
     * the logged-in user.
     */
    const interval =
      setInterval(() => {
        if (
          !currentUserIdRef.current
        ) {
          connectSocket();
        }
      }, 1000);


    return () => {
      clearInterval(
        interval
      );

      disconnectCallSocket();

      setCallSocketConnected(
        false
      );
    };
  }, []);


  /*
   * =======================================================
   * CONTEXT
   * =======================================================
   */

  return (
    <CallContext.Provider
      value={{
        call,

        incomingCall,

        callConnected,

        callStatus,

        isMuted,

        localStream,

        remoteStream,

        callSocketConnected,

        startCall,

        acceptCall,

        rejectCall,

        endCall,

        toggleMute,

        cleanupCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};


/*
 * =========================================================
 * USE CALL
 * =========================================================
 */

export const useCall =
  () => {
    const context =
      useContext(
        CallContext
      );


    if (!context) {
      throw new Error(
        "useCall must be used inside CallProvider"
      );
    }


    return context;
  };


export default CallContext;