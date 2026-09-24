import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  connectCallSocket,
  disconnectCallSocket,
  sendCallSignal,
} from "../services/callService";


const useCall = (userId) => {

  const [isConnected, setIsConnected] =
    useState(false);

  const [incomingCall, setIncomingCall] =
    useState(null);

  const [activeCall, setActiveCall] =
    useState(null);

  const [callConnected, setCallConnected] =
    useState(false);

  const [isMuted, setIsMuted] =
    useState(false);


  /*
   * =========================
   * WEBRTC REFS
   * =========================
   */

  const peerConnectionRef =
    useRef(null);

  const localStreamRef =
    useRef(null);

  const remoteStreamRef =
    useRef(null);

  const pendingIceCandidatesRef =
    useRef([]);


  /*
   * =========================
   * VIDEO / AUDIO REFS
   * =========================
   */

  const localVideoRef =
    useRef(null);

  const remoteVideoRef =
    useRef(null);

  const remoteAudioRef =
    useRef(null);


  /*
   * =========================
   * CALL REFS
   * =========================
   */

  const callIdRef =
    useRef(null);

  const activeCallRef =
    useRef(null);


  /*
   * =========================
   * KEEP ACTIVE CALL REF
   * =========================
   */

  useEffect(() => {

    activeCallRef.current =
      activeCall;

  }, [activeCall]);


  /*
   * =========================
   * ATTACH LOCAL STREAM
   * =========================
   */

  const attachLocalStream =
    useCallback(
      (stream) => {

        localStreamRef.current =
          stream;


        if (
          localVideoRef.current
        ) {

          localVideoRef.current.srcObject =
            stream;

        }

      },
      []
    );


  /*
   * =========================
   * ATTACH REMOTE STREAM
   * =========================
   */

  const attachRemoteStream =
    useCallback(
      (stream) => {

        remoteStreamRef.current =
          stream;


        if (
          remoteVideoRef.current
        ) {

          remoteVideoRef.current.srcObject =
            stream;

        }


        if (
          remoteAudioRef.current
        ) {

          remoteAudioRef.current.srcObject =
            stream;

        }

      },
      []
    );


  /*
   * =========================
   * GET MICROPHONE / CAMERA
   * =========================
   */

  const getLocalMedia =
    useCallback(
      async (callType) => {

        if (
          localStreamRef.current
        ) {

          return localStreamRef.current;

        }


        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices.getUserMedia
        ) {

          throw new Error(
            "Camera and microphone access is not available."
          );

        }


        const isVideo =
          callType === "VIDEO";


        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              audio: true,
              video: isVideo,
            }
          );


        attachLocalStream(
          stream
        );


        return stream;

      },
      [attachLocalStream]
    );


  /*
   * =========================
   * CLEANUP WEBRTC
   * =========================
   */

  const cleanupCall =
    useCallback(() => {

      console.log(
        "Cleaning up WebRTC call."
      );


      /*
       * Stop microphone/camera.
       */

      if (
        localStreamRef.current
      ) {

        localStreamRef.current
          .getTracks()
          .forEach(
            (track) => {
              track.stop();
            }
          );

        localStreamRef.current =
          null;

      }


      /*
       * Close peer connection.
       */

      if (
        peerConnectionRef.current
      ) {

        try {

          peerConnectionRef.current.close();

        } catch (error) {

          console.error(
            "Failed to close peer connection:",
            error
          );

        }

        peerConnectionRef.current =
          null;

      }


      remoteStreamRef.current =
        null;


      pendingIceCandidatesRef.current =
        [];


      callIdRef.current =
        null;


      activeCallRef.current =
        null;


      setActiveCall(
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


      /*
       * Clear media elements.
       */

      if (
        localVideoRef.current
      ) {

        localVideoRef.current.srcObject =
          null;

      }


      if (
        remoteVideoRef.current
      ) {

        remoteVideoRef.current.srcObject =
          null;

      }


      if (
        remoteAudioRef.current
      ) {

        remoteAudioRef.current.srcObject =
          null;

      }

    }, []);


  /*
   * =========================
   * CREATE PEER CONNECTION
   * =========================
   */

  const createPeerConnection =
    useCallback(
      async (call) => {

        if (
          peerConnectionRef.current
        ) {

          return peerConnectionRef.current;

        }


        const peerConnection =
          new RTCPeerConnection({

            iceServers: [

              {
                urls:
                  "stun:stun.l.google.com:19302",
              },

              {
                urls:
                  "stun:stun1.l.google.com:19302",
              },

            ],

          });


        peerConnectionRef.current =
          peerConnection;


        /*
         * Get local media.
         */

        const localStream =
          await getLocalMedia(
            call.callType
          );


        /*
         * Add local tracks.
         */

        localStream
          .getTracks()
          .forEach(
            (track) => {

              peerConnection.addTrack(
                track,
                localStream
              );

            }
          );


        /*
         * Remote media.
         */

        peerConnection.ontrack =
          (event) => {

            console.log(
              "Remote WebRTC track received."
            );


            let remoteStream =
              remoteStreamRef.current;


            if (!remoteStream) {

              remoteStream =
                new MediaStream();

              remoteStreamRef.current =
                remoteStream;

            }


            const alreadyExists =
              remoteStream
                .getTracks()
                .some(
                  (track) =>
                    track.id ===
                    event.track.id
                );


            if (!alreadyExists) {

              remoteStream.addTrack(
                event.track
              );

            }


            attachRemoteStream(
              remoteStream
            );


            setCallConnected(
              true
            );

          };


        /*
         * ICE candidates.
         */

        peerConnection.onicecandidate =
          (event) => {

            if (
              !event.candidate
            ) {

              return;

            }


            const currentCall =
              activeCallRef.current ||
              call;


            if (!currentCall) {

              return;

            }


            const otherUserId =
              Number(
                currentCall.callerId
              ) ===
              Number(userId)

                ? Number(
                    currentCall.receiverId
                  )

                : Number(
                    currentCall.callerId
                  );


            sendCallSignal({

              type:
                "ICE_CANDIDATE",

              callerId:
                currentCall.callerId,

              receiverId:
                otherUserId,

              callId:
                currentCall.callId,

              callType:
                currentCall.callType,

              data:
                JSON.stringify(
                  event.candidate
                ),

            });

          };


        /*
         * Connection state.
         */

        peerConnection.onconnectionstatechange =
          () => {

            console.log(
              "WebRTC connection state:",
              peerConnection.connectionState
            );


            if (
              peerConnection.connectionState ===
              "connected"
            ) {

              setCallConnected(
                true
              );

            }


            if (
              peerConnection.connectionState ===
                "failed" ||
              peerConnection.connectionState ===
                "disconnected" ||
              peerConnection.connectionState ===
                "closed"
            ) {

              setCallConnected(
                false
              );

            }

          };


        return peerConnection;

      },
      [
        attachRemoteStream,
        getLocalMedia,
        userId,
      ]
    );


  /*
   * =========================
   * SEND WEBRTC SIGNAL
   * =========================
   */

  const sendWebRTCSignal =
    useCallback(
      (type, data) => {

        const currentCall =
          activeCallRef.current;


        if (
          !currentCall ||
          !userId
        ) {

          return false;

        }


        const otherUserId =
          Number(
            currentCall.callerId
          ) ===
          Number(userId)

            ? Number(
                currentCall.receiverId
              )

            : Number(
                currentCall.callerId
              );


        return sendCallSignal({

          type,

          callerId:
            currentCall.callerId,

          receiverId:
            otherUserId,

          callId:
            currentCall.callId,

          callType:
            currentCall.callType,

          data:
            typeof data === "string"
              ? data
              : JSON.stringify(data),

        });

      },
      [userId]
    );


  /*
   * =========================
   * RECEIVE CALL SIGNAL
   * =========================
   */

  const handleCallReceived =
    useCallback(
      async (signal) => {

        console.log(
          "Received call signal:",
          signal
        );


        switch (
          signal.type
        ) {


          /*
           * =====================
           * INCOMING CALL
           * =====================
           */

          case "CALL_STARTED":

            setIncomingCall(
              signal
            );

            break;


          /*
           * =====================
           * CALL ACCEPTED
           * =====================
           */

          case "CALL_ACCEPTED": {

            setActiveCall(
              signal
            );

            activeCallRef.current =
              signal;

            setIncomingCall(
              null
            );


            try {

              const peerConnection =
                await createPeerConnection(
                  signal
                );


              const offer =
                await peerConnection.createOffer();


              await peerConnection.setLocalDescription(
                offer
              );


              sendWebRTCSignal(
                "WEBRTC_OFFER",
                offer
              );

            } catch (error) {

              console.error(
                "Failed to create WebRTC offer:",
                error
              );

            }

            break;
          }


          /*
           * =====================
           * WEBRTC OFFER
           * =====================
           */

          case "WEBRTC_OFFER": {

            try {

              const call =
                activeCallRef.current;


              if (!call) {

                console.error(
                  "No active call for WebRTC offer."
                );

                break;

              }


              const peerConnection =
                await createPeerConnection(
                  call
                );


              const offer =
                typeof signal.data ===
                "string"

                  ? JSON.parse(
                      signal.data
                    )

                  : signal.data;


              await peerConnection.setRemoteDescription(
                new RTCSessionDescription(
                  offer
                )
              );


              /*
               * Add ICE candidates that
               * arrived before the offer.
               */

              for (
                const candidate
                of pendingIceCandidatesRef.current
              ) {

                try {

                  await peerConnection.addIceCandidate(
                    new RTCIceCandidate(
                      candidate
                    )
                  );

                } catch (error) {

                  console.error(
                    "Failed to add queued ICE candidate:",
                    error
                  );

                }

              }


              pendingIceCandidatesRef.current =
                [];


              const answer =
                await peerConnection.createAnswer();


              await peerConnection.setLocalDescription(
                answer
              );


              sendWebRTCSignal(
                "WEBRTC_ANSWER",
                answer
              );

            } catch (error) {

              console.error(
                "Failed to process WebRTC offer:",
                error
              );

            }

            break;
          }


          /*
           * =====================
           * WEBRTC ANSWER
           * =====================
           */

          case "WEBRTC_ANSWER": {

            try {

              const peerConnection =
                peerConnectionRef.current;


              if (!peerConnection) {

                break;

              }


              const answer =
                typeof signal.data ===
                "string"

                  ? JSON.parse(
                      signal.data
                    )

                  : signal.data;


              await peerConnection.setRemoteDescription(
                new RTCSessionDescription(
                  answer
                )
              );


              for (
                const candidate
                of pendingIceCandidatesRef.current
              ) {

                try {

                  await peerConnection.addIceCandidate(
                    new RTCIceCandidate(
                      candidate
                    )
                  );

                } catch (error) {

                  console.error(
                    "Failed to add queued ICE candidate:",
                    error
                  );

                }

              }


              pendingIceCandidatesRef.current =
                [];

            } catch (error) {

              console.error(
                "Failed to process WebRTC answer:",
                error
              );

            }

            break;
          }


          /*
           * =====================
           * ICE CANDIDATE
           * =====================
           */

          case "ICE_CANDIDATE": {

            try {

              const candidate =
                typeof signal.data ===
                "string"

                  ? JSON.parse(
                      signal.data
                    )

                  : signal.data;


              const peerConnection =
                peerConnectionRef.current;


              if (
                !peerConnection ||
                !peerConnection.remoteDescription
              ) {

                pendingIceCandidatesRef.current.push(
                  candidate
                );

                break;

              }


              await peerConnection.addIceCandidate(
                new RTCIceCandidate(
                  candidate
                )
              );

            } catch (error) {

              console.error(
                "Failed to process ICE candidate:",
                error
              );

            }

            break;
          }


          /*
           * =====================
           * CALL REJECTED
           * =====================
           */

          case "CALL_REJECTED":

            cleanupCall();

            break;


          /*
           * =====================
           * CALL ENDED
           * =====================
           */

          case "CALL_ENDED":

            cleanupCall();

            break;


          default:

            console.warn(
              "Unknown call signal:",
              signal.type
            );

        }

      },
      [
        cleanupCall,
        createPeerConnection,
        sendWebRTCSignal,
      ]
    );


  /*
   * =========================
   * START CALL
   * =========================
   */

  const startCall =
    useCallback(
      async (
        receiverId,
        callType
      ) => {

        if (
          !userId ||
          !receiverId
        ) {

          return;

        }


        try {

          /*
           * Request microphone/camera
           * from the user's button click.
           */

          await getLocalMedia(
            callType
          );


          const callId =
            Date.now();


          callIdRef.current =
            callId;


          const signal = {

            type:
              "CALL_STARTED",

            callerId:
              Number(userId),

            receiverId:
              Number(receiverId),

            callId,

            callType,

            data:
              null,

          };


          const sent =
            sendCallSignal(
              signal
            );


          if (!sent) {

            console.error(
              "Unable to start call. WebSocket is not connected."
            );

            cleanupCall();

            return;

          }


          setActiveCall(
            signal
          );

          activeCallRef.current =
            signal;

        } catch (error) {

          console.error(
            "Unable to access microphone/camera:",
            error
          );


          alert(
            "Please allow microphone/camera access to make this call."
          );

        }

      },
      [
        cleanupCall,
        getLocalMedia,
        userId,
      ]
    );


  /*
   * =========================
   * ACCEPT CALL
   * =========================
   */

  const acceptCall =
    useCallback(
      async () => {

        if (
          !incomingCall ||
          !userId
        ) {

          return;

        }


        try {

          /*
           * User clicks Accept,
           * so browser can request media.
           */

          await getLocalMedia(
            incomingCall.callType
          );


          const signal = {

            type:
              "CALL_ACCEPTED",

            callerId:
              incomingCall.callerId,

            receiverId:
              incomingCall.receiverId,

            callId:
              incomingCall.callId,

            callType:
              incomingCall.callType,

            data:
              null,

          };


          /*
           * Send acceptance back
           * to original caller.
           */

          const sent =
            sendCallSignal({

              ...signal,

              receiverId:
                incomingCall.callerId,

            });


          if (!sent) {

            return;

          }


          setActiveCall(
            signal
          );

          activeCallRef.current =
            signal;


          setIncomingCall(
            null
          );


          /*
           * Receiver creates peer connection
           * before the offer arrives.
           */

          await createPeerConnection(
            signal
          );

        } catch (error) {

          console.error(
            "Failed to accept call:",
            error
          );


          alert(
            "Unable to access microphone/camera. Please check your browser permissions."
          );

        }

      },
      [
        createPeerConnection,
        getLocalMedia,
        incomingCall,
        userId,
      ]
    );


  /*
   * =========================
   * REJECT CALL
   * =========================
   */

  const rejectCall =
    useCallback(
      () => {

        if (
          !incomingCall ||
          !userId
        ) {

          return;

        }


        sendCallSignal({

          type:
            "CALL_REJECTED",

          callerId:
            incomingCall.callerId,

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

      },
      [
        incomingCall,
        userId,
      ]
    );


  /*
   * =========================
   * END CALL
   * =========================
   */

  const endCall =
    useCallback(
      () => {

        const currentCall =
          activeCallRef.current;


        if (
          !currentCall ||
          !userId
        ) {

          cleanupCall();

          return;

        }


        const otherUserId =
          Number(
            currentCall.callerId
          ) ===
          Number(userId)

            ? Number(
                currentCall.receiverId
              )

            : Number(
                currentCall.callerId
              );


        sendCallSignal({

          type:
            "CALL_ENDED",

          callerId:
            currentCall.callerId,

          receiverId:
            otherUserId,

          callId:
            currentCall.callId,

          callType:
            currentCall.callType,

          data:
            null,

        });


        cleanupCall();

      },
      [
        cleanupCall,
        userId,
      ]
    );


  /*
   * =========================
   * MUTE / UNMUTE
   * =========================
   */

  const toggleMute =
    useCallback(
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


        const nextMuted =
          !isMuted;


        audioTracks.forEach(
          (track) => {

            track.enabled =
              !nextMuted;

          }
        );


        setIsMuted(
          nextMuted
        );

      },
      [isMuted]
    );


  /*
   * =========================
   * CALL SOCKET
   * =========================
   */

  useEffect(() => {

    if (!userId) {

      return;

    }


    connectCallSocket(

      userId,

      handleCallReceived,

      () => {

        console.log(
          "Call socket connected."
        );

        setIsConnected(
          true
        );

      },

      () => {

        console.log(
          "Call socket disconnected/error."
        );

        setIsConnected(
          false
        );

      }

    );


    return () => {

      disconnectCallSocket();

      cleanupCall();

      setIsConnected(
        false
      );

    };

  }, [
    userId,
    handleCallReceived,
    cleanupCall,
  ]);


  /*
   * =========================
   * RETURN
   * =========================
   */

  return {

    isConnected,

    incomingCall,

    activeCall,

    callConnected,

    isMuted,

    startCall,

    acceptCall,

    rejectCall,

    endCall,

    toggleMute,

    sendWebRTCSignal,

    localVideoRef,

    remoteVideoRef,

    remoteAudioRef,

  };

};


export default useCall;