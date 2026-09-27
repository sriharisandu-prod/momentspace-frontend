import React, {
  useEffect,
  useRef,
} from "react";

import {
  Phone,
  Video,
  PhoneOff,
  Mic,
  MicOff,
} from "lucide-react";

import {
  useCall,
} from "../context/CallContext";

import "./CallPanel.css";


const CallPanel = () => {

  const {
    call,
    incomingCall,

    callConnected,
    callStatus,

    isMuted,

    localStream,
    remoteStream,

    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
  } = useCall();


  /*
   * ==========================
   * VIDEO REFS
   * ==========================
   */

  const localVideoRef =
    useRef(null);

  const remoteVideoRef =
    useRef(null);

  const remoteAudioRef =
    useRef(null);


  /*
   * ==========================
   * LOCAL VIDEO
   * ==========================
   */

  useEffect(() => {

    if (
      localVideoRef.current &&
      localStream
    ) {

      console.log(
        "Setting LOCAL video stream"
      );

      localVideoRef.current.srcObject =
        localStream;

    }

  }, [localStream]);


  /*
   * ==========================
   * REMOTE VIDEO
   * ==========================
   */

  useEffect(() => {

    if (
      remoteVideoRef.current &&
      remoteStream
    ) {

      console.log(
        "Setting REMOTE video stream"
      );

      remoteVideoRef.current.srcObject =
        remoteStream;

    }


    if (
      remoteAudioRef.current &&
      remoteStream
    ) {

      remoteAudioRef.current.srcObject =
        remoteStream;

    }

  }, [remoteStream]);


  /*
   * ==========================
   * INCOMING CALL
   * ==========================
   */

  if (incomingCall) {

    const isVideo =
      incomingCall.callType ===
      "VIDEO";


    return (
      <div className="call-overlay">

        <div className="call-card">

          <div className="call-avatar">

            {isVideo ? (
              <Video size={32} />
            ) : (
              <Phone size={32} />
            )}

          </div>


          <h2>
            Incoming{" "}
            {isVideo
              ? "video"
              : "voice"}{" "}
            call
          </h2>


          <p>
            Someone is calling you
          </p>


          <div className="call-actions">

            {/* REJECT */}

            <button
              type="button"
              className="call-reject-button"
              onClick={rejectCall}
              aria-label="Reject call"
            >

              <PhoneOff
                size={22}
              />

            </button>


            {/* ACCEPT */}

            <button
              type="button"
              className="call-accept-button"
              onClick={acceptCall}
              aria-label="Accept call"
            >

              {isVideo ? (
                <Video size={22} />
              ) : (
                <Phone size={22} />
              )}

            </button>

          </div>

        </div>

      </div>
    );
  }


  /*
   * ==========================
   * NO ACTIVE CALL
   * ==========================
   */

  if (!call) {
    return null;
  }


  const isVideo =
    call.callType ===
    "VIDEO";


  /*
   * ==========================
   * VIDEO CALL
   * ==========================
   */

  if (isVideo) {

    return (
      <div
        className={
          "call-overlay call-video-mode"
        }
      >

        <div className="call-video-container">

          {/* REMOTE VIDEO */}

          <video
            ref={remoteVideoRef}
            className="call-remote-video"
            autoPlay
            playsInline
          />


          {/* LOCAL VIDEO */}

          <video
            ref={localVideoRef}
            className="call-local-video"
            autoPlay
            muted
            playsInline
          />


          {/* STATUS */}

          {!callConnected && (

            <div
              className={
                "call-video-status"
              }
            >

              <div className="call-avatar">

                <Video size={30} />

              </div>


              <h2>

                {callStatus ===
                "CALLING"
                  ? "Calling..."

                  : callStatus ===
                    "RINGING"
                    ? "Incoming call..."

                  : callStatus ===
                    "ACCEPTED"
                    ? "Connecting..."

                  : callStatus ===
                    "CONNECTING"
                    ? "Connecting..."

                  : callStatus ===
                    "FAILED"
                    ? "Connection failed"

                  : "Connecting..."}

              </h2>

            </div>

          )}


          {/* CONNECTED INDICATOR */}

          {callConnected && (

            <div
              className={
                "call-connected-indicator"
              }
            >
              Connected
            </div>

          )}

        </div>


        {/* REMOTE AUDIO */}

        <audio
          ref={remoteAudioRef}
          autoPlay
          playsInline
        />


        {/* CONTROLS */}

        <div
          className={
            "call-video-controls"
          }
        >

          {/* MUTE */}

          <button
            type="button"
            className="call-mute-button"
            onClick={toggleMute}
            aria-label={
              isMuted
                ? "Unmute microphone"
                : "Mute microphone"
            }
          >

            {isMuted ? (
              <MicOff size={22} />
            ) : (
              <Mic size={22} />
            )}

          </button>


          {/* END */}

          <button
            type="button"
            className="call-end-button"
            onClick={endCall}
            aria-label="End call"
          >

            <PhoneOff
              size={22}
            />

          </button>

        </div>

      </div>
    );
  }


  /*
   * ==========================
   * VOICE CALL
   * ==========================
   */

  return (
    <div className="call-overlay">

      <div className="call-card">

        <div className="call-avatar">

          <Phone size={32} />

        </div>


        <h2>

          {callConnected

            ? "Call connected"

            : callStatus ===
              "CALLING"

              ? "Calling..."

              : callStatus ===
                "RINGING"

                ? "Incoming call..."

                : callStatus ===
                  "FAILED"

                  ? "Connection failed"

                  : "Connecting..."}

        </h2>


        <p>
          Voice call
        </p>


        <div className="call-actions">

          {/* MUTE */}

          <button
            type="button"
            className="call-mute-button"
            onClick={toggleMute}
            aria-label={
              isMuted
                ? "Unmute microphone"
                : "Mute microphone"
            }
          >

            {isMuted ? (
              <MicOff size={22} />
            ) : (
              <Mic size={22} />
            )}

          </button>


          {/* END */}

          <button
            type="button"
            className="call-end-button"
            onClick={endCall}
            aria-label="End call"
          >

            <PhoneOff
              size={22}
            />

          </button>

        </div>

      </div>


      {/* IMPORTANT:
          The remote audio element must
          exist for voice calls too.
      */}

      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
      />

    </div>
  );
};


export default CallPanel;