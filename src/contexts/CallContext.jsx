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


export const CallProvider = ({
  children,
}) => {

  /*
   * ==========================
   * STATE
   * ==========================
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


  /*
   * ==========================
   * REFS
   * ==========================
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
   * ==========================
   * GET CURRENT USER
   * ==========================
   */

  const getCurrentUser = () => {

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
        "Failed to read logged-in user:",
        error
      );

      return null;
    }

  };


  /*
   * ==========================
   * GET OTHER USER
   * ==========================
   */

  const getOtherUserId = (
    signal
  ) => {

    const currentUserId =
      currentUserIdRef.current;

    if (
      signal.callerId ===
      currentUserId
    ) {

      return signal.receiverId;

    }

    return signal.callerId;
  };


  /*
   * ==========================
   * CREATE PEER CONNECTION
   * ==========================
   */

  const initializePeerConnection =
    async ({
      callerId,
      receiverId,
      callId,
      callType,
    }) => {

      /*
       * Close old connection first.
       */
      if (peerConnectionRef.current) {

        closePeerConnection(
          peerConnectionRef.current
        );

        peerConnectionRef.current =
          null;
      }


      const peerConnection =
        createPeerConnection({

          /*
           * --------------------
           * ICE
           * --------------------
           */

          onIceCandidate:
            (candidate) => {

              const currentUserId =
                currentUserIdRef.current;

              const otherUserId =
                currentUserId ===
                callerId
                  ? receiverId
                  : callerId;

              sendCallSignal({

                type:
                  "ICE_CANDIDATE",

                callerId:
                  currentUserId,

                receiverId:
                  otherUserId,

                callId,

                callType,

                data:
                  JSON.stringify(
                    candidate
                  ),

              });

            },


          /*
           * --------------------
           * REMOTE TRACK
           * --------------------
           */

          onTrack:
            (event) => {

              console.log(
                "REMOTE MEDIA RECEIVED:",
                event.track.kind
              );

              const stream =
                event.streams?.[0];

              if (!stream) {

                console.warn(
                  "Remote track has no stream."
                );

                return;
              }

              remoteStreamRef.current =
                stream;

              setRemoteStream(
                stream
              );

            },


          /*
           * --------------------
           * WEBRTC STATE
           * --------------------
           */

          onConnectionStateChange:
            (state) => {

              console.log(
                "ACTUAL WEBRTC CONNECTION:",
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
           * --------------------
           * ICE STATE
           * --------------------
           */

          onIceConnectionStateChange:
            (state) => {

              console.log(
                "ICE STATE:",
                state
              );

            },

        });


      peerConnectionRef.current =
        peerConnection;

      return peerConnection;
    };


  /*
   * ==========================
   * START CALL
   * ==========================
   */

  const startCall = async ({
    receiverId,
    callType = "VOICE",
    callId = Date.now(),
  }) => {

    const currentUserId =
      currentUserIdRef.current;

    if (!currentUserId) {

      console.error(
        "Cannot start call: current user ID missing."
      );

      return;
    }

    if (!receiverId) {

      console.error(
        "Cannot start call: receiver ID missing."
      );

      return;
    }

    try {

      console.log(
        "STARTING CALL:",
        {
          callerId:
            currentUserId,

          receiverId,

          callType,

          callId,
        }
      );


      setCall({
        type:
          "CALL_STARTED",

        callerId:
          currentUserId,

        receiverId,

        callId,

        callType,
      });


      setCallStatus(
        "CALLING"
      );

      setCallConnected(
        false
      );


      /*
       * Get microphone/camera.
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
       * Create WebRTC connection.
       */

      await initializePeerConnection({

        callerId:
          currentUserId,

        receiverId,

        callId,

        callType,

      });


      /*
       * Add microphone/camera.
       */

      addLocalTracks(
        peerConnectionRef.current,
        stream
      );


      /*
       * Tell receiver that
       * a call is starting.
       */

      sendCallSignal({

        type:
          "CALL_STARTED",

        callerId:
          currentUserId,

        receiverId,

        callId,

        callType,

        data:
          null,

      });

    } catch (error) {

      console.error(
        "START CALL ERROR:",
        error
      );

      alert(
        "Unable to access your microphone/camera. Please allow permission and try again."
      );

      cleanupCall();
    }
  };


  /*
   * ==========================
   * ACCEPT CALL
   * ==========================
   */

  const acceptCall = async () => {

    if (!incomingCall) {

      console.error(
        "No incoming call to accept."
      );

      return;
    }

    const currentUserId =
      currentUserIdRef.current;

    const {
      callerId,
      receiverId,
      callId,
      callType,
    } = incomingCall;


    try {

      console.log(
        "ACCEPTING CALL:",
        incomingCall
      );


      /*
       * Receiver's local media.
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
       * Create receiver peer connection.
       */

      await initializePeerConnection({

        callerId,

        receiverId,

        callId,

        callType,

      });


      /*
       * Add microphone/camera.
       */

      addLocalTracks(
        peerConnectionRef.current,
        stream
      );


      /*
       * Update UI.
       */

      setCall({
        ...incomingCall,

        type:
          "CALL_ACCEPTED",
      });

      setIncomingCall(
        null
      );

      setCallStatus(
        "ACCEPTED"
      );


      /*
       * Tell caller.
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

      rejectCall();
    }
  };


  /*
   * ==========================
   * HANDLE CALL SIGNAL
   * ==========================
   */

  const handleCallSignal =
    async (signal) => {

      console.log(
        "PROCESSING SIGNAL:",
        signal
      );


      try {

        switch (
          signal.type
        ) {


          /*
           * --------------------
           * INCOMING CALL
           * --------------------
           */

          case "CALL_STARTED":

            /*
             * Don't treat our own
             * call as incoming.
             */

            if (
              signal.callerId ===
              currentUserIdRef.current
            ) {

              return;
            }


            setIncomingCall(
              signal
            );

            setCallStatus(
              "RINGING"
            );

            break;


          /*
           * --------------------
           * CALL ACCEPTED
           * --------------------
           */

          case "CALL_ACCEPTED":

            await handleCallAccepted(
              signal
            );

            break;


          /*
           * --------------------
           * CALL REJECTED
           * --------------------
           */

          case "CALL_REJECTED":

            cleanupCall();

            break;


          /*
           * --------------------
           * CALL ENDED
           * --------------------
           */

          case "CALL_ENDED":

            cleanupCall();

            break;


          /*
           * --------------------
           * OFFER
           * --------------------
           */

          case "WEBRTC_OFFER":

            await handleOffer(
              signal
            );

            break;


          /*
           * --------------------
           * ANSWER
           * --------------------
           */

          case "WEBRTC_ANSWER":

            await handleAnswer(
              signal
            );

            break;


          /*
           * --------------------
           * ICE
           * --------------------
           */

          case "ICE_CANDIDATE":

            await handleRemoteIceCandidate(
              signal
            );

            break;


          default:

            console.warn(
              "Unknown call signal:",
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
   * ==========================
   * CALL ACCEPTED
   * ==========================
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
          "Peer connection doesn't exist."
        );

        return;
      }


      setCallStatus(
        "CONNECTING"
      );


      /*
       * Caller creates OFFER.
       */

      const offer =
        await createOffer(
          peerConnection
        );


      const currentUserId =
        currentUserIdRef.current;


      /*
       * Send offer to receiver.
       */

      sendCallSignal({

        type:
          "WEBRTC_OFFER",

        callerId:
          currentUserId,

        receiverId:
          signal.callerId,

        callId:
          signal.callId,

        callType:
          signal.callType,

        data:
          JSON.stringify(
            offer
          ),

      });

    };


  /*
   * ==========================
   * OFFER
   * ==========================
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
          "No peer connection for offer."
        );

        return;
      }


      const offer =
        JSON.parse(
          signal.data
        );


      await setRemoteDescription(
        peerConnection,
        offer
      );


      /*
       * Add queued ICE candidates
       * after remote description.
       */

      await flushPendingCandidates();


      /*
       * Create ANSWER.
       */

      const answer =
        await createAnswer(
          peerConnection
        );


      const currentUserId =
        currentUserIdRef.current;


      sendCallSignal({

        type:
          "WEBRTC_ANSWER",

        callerId:
          currentUserId,

        receiverId:
          signal.callerId,

        callId:
          signal.callId,

        callType:
          signal.callType,

        data:
          JSON.stringify(
            answer
          ),

      });

    };


  /*
   * ==========================
   * ANSWER
   * ==========================
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
          "No peer connection for answer."
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
   * ==========================
   * REMOTE ICE
   * ==========================
   */

  const handleRemoteIceCandidate =
    async (signal) => {

      const candidate =
        JSON.parse(
          signal.data
        );


      const peerConnection =
        peerConnectionRef.current;


      /*
       * Candidate can arrive before
       * remote description.
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


      try {

        await addIceCandidate(
          peerConnection,
          candidate
        );

      } catch (error) {

        console.error(
          "FAILED TO ADD ICE CANDIDATE:",
          error
        );

      }
    };


  /*
   * ==========================
   * FLUSH ICE
   * ==========================
   */

  const flushPendingCandidates =
    async () => {

      const peerConnection =
        peerConnectionRef.current;


      if (!peerConnection) {
        return;
      }


      if (
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
   * ==========================
   * REJECT CALL
   * ==========================
   */

  const rejectCall = () => {

    if (!incomingCall) {
      return;
    }


    const currentUserId =
      currentUserIdRef.current;


    sendCallSignal({

      type:
        "CALL_REJECTED",

      callerId:
        currentUserId,

      receiverId:
        incomingCall.callerId,

      callId:
        incomingCall.callId,

      callType:
        incomingCall.callType,

      data:
        null,

    });


    setIncomingCall(
      null
    );

    setCallStatus(
      "IDLE"
    );
  };


  /*
   * ==========================
   * END CALL
   * ==========================
   */

  const endCall = () => {

    if (!call) {
      return;
    }


    const currentUserId =
      currentUserIdRef.current;


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
        otherUserId,

      callId:
        call.callId,

      callType:
        call.callType,

      data:
        null,

    });


    cleanupCall();
  };


  /*
   * ==========================
   * MUTE
   * ==========================
   */

  const toggleMute = () => {

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
   * ==========================
   * CLEANUP
   * ==========================
   */

  const cleanupCall = () => {

    console.log(
      "CLEANING UP CALL"
    );


    /*
     * Stop camera/microphone.
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
     * Clear ICE queue.
     */

    pendingCandidatesRef.current =
      [];


    /*
     * Reset UI.
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
   * ==========================
   * CONNECT SOCKET
   * ==========================
   */

  useEffect(() => {

    const user =
      getCurrentUser();


    if (!user?.id) {

      console.warn(
        "Call socket not started: user ID not found."
      );

      return;
    }


    currentUserIdRef.current =
      user.id;


    connectCallSocket(

      user.id,

      handleCallSignal,

      () => {

        console.log(
          "CALL SOCKET READY"
        );

      },

      (error) => {

        console.error(
          "CALL SOCKET ERROR:",
          error
        );

      }

    );


    return () => {

      disconnectCallSocket();

    };

  }, []);


  /*
   * ==========================
   * CONTEXT
   * ==========================
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
 * ==========================
 * HOOK
 * ==========================
 */

export const useCall = () => {

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