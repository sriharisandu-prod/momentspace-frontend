import React from "react";

import {
  Phone,
  Video,
  PhoneOff,
  Mic,
  MicOff,
} from "lucide-react";

import "./CallPanel.css";


const CallPanel = ({
  call,
  incomingCall,

  onAccept,
  onReject,
  onEnd,

  callConnected,

  isMuted,
  onToggleMute,

  localVideoRef,
  remoteVideoRef,
  remoteAudioRef,
}) => {

  /*
   * =========================
   * INCOMING CALL
   * =========================
   */

  if (incomingCall) {

    const isVideo =
      incomingCall.callType === "VIDEO";


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

            <button
              type="button"
              className="call-reject-button"
              onClick={onReject}
              aria-label="Reject call"
            >
              <PhoneOff size={22} />
            </button>

            <button
              type="button"
              className="call-accept-button"
              onClick={onAccept}
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
   * =========================
   * NO CALL
   * =========================
   */

  if (!call) {
    return null;
  }


  const isVideo =
    call.callType === "VIDEO";


  /*
   * =========================
   * VIDEO CALL
   * =========================
   */

  if (isVideo) {

    return (
      <div className="call-overlay call-video-mode">

        <div className="call-video-container">

          <video
            ref={remoteVideoRef}
            className="call-remote-video"
            autoPlay
            playsInline
          />

          <video
            ref={localVideoRef}
            className="call-local-video"
            autoPlay
            muted
            playsInline
          />


          {!callConnected && (
            <div className="call-video-status">

              <div className="call-avatar">
                <Video size={30} />
              </div>

              <h2>
                {call.type === "CALL_STARTED"
                  ? "Calling..."
                  : "Connecting..."}
              </h2>

            </div>
          )}

        </div>


        <audio
          ref={remoteAudioRef}
          autoPlay
        />


        <div className="call-video-controls">

          <button
            type="button"
            className="call-mute-button"
            onClick={onToggleMute}
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


          <button
            type="button"
            className="call-end-button"
            onClick={onEnd}
            aria-label="End call"
          >
            <PhoneOff size={22} />
          </button>

        </div>

      </div>
    );
  }


  /*
   * =========================
   * VOICE CALL
   * =========================
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
            : call.type === "CALL_STARTED"
              ? "Calling..."
              : "Connecting..."}
        </h2>

        <p>
          Voice call
        </p>

        <div className="call-actions">

          <button
            type="button"
            className="call-mute-button"
            onClick={onToggleMute}
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


          <button
            type="button"
            className="call-end-button"
            onClick={onEnd}
            aria-label="End call"
          >
            <PhoneOff size={22} />
          </button>

        </div>

      </div>

    </div>
  );
};


export default CallPanel;