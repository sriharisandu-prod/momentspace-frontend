/**
 * WebRTC ICE servers.
 *
 * STUN helps browsers discover their public network address.
 *
 * For production reliability, you should eventually add
 * a TURN server as well.
 */
const ICE_SERVERS = [

  {
    urls:
      "stun:stun.l.google.com:19302",
  },

];


/**
 * Create a WebRTC peer connection.
 */
export const createPeerConnection = ({
  onIceCandidate,
  onTrack,
  onConnectionStateChange,
  onIceConnectionStateChange,
}) => {

  const peerConnection =
    new RTCPeerConnection({
      iceServers:
        ICE_SERVERS,
    });


  /*
   * ICE candidate generated locally.
   */
  peerConnection.onicecandidate =
    (event) => {

      if (!event.candidate) {
        return;
      }

      console.log(
        "LOCAL ICE CANDIDATE:",
        event.candidate
      );

      if (onIceCandidate) {

        onIceCandidate(
          event.candidate
        );

      }

    };


  /*
   * Remote audio/video track received.
   */
  peerConnection.ontrack =
    (event) => {

      console.log(
        "REMOTE TRACK RECEIVED:",
        event.track.kind
      );

      console.log(
        "REMOTE STREAMS:",
        event.streams
      );

      if (onTrack) {

        onTrack(event);

      }

    };


  /*
   * Actual WebRTC connection state.
   */
  peerConnection.onconnectionstatechange =
    () => {

      console.log(
        "WEBRTC CONNECTION STATE:",
        peerConnection.connectionState
      );

      if (onConnectionStateChange) {

        onConnectionStateChange(
          peerConnection.connectionState
        );

      }

    };


  /*
   * ICE connection state.
   */
  peerConnection.oniceconnectionstatechange =
    () => {

      console.log(
        "ICE CONNECTION STATE:",
        peerConnection.iceConnectionState
      );

      if (onIceConnectionStateChange) {

        onIceConnectionStateChange(
          peerConnection.iceConnectionState
        );

      }

    };


  /*
   * Signaling state.
   */
  peerConnection.onsignalingstatechange =
    () => {

      console.log(
        "SIGNALING STATE:",
        peerConnection.signalingState
      );

    };


  /*
   * ICE gathering.
   */
  peerConnection.onicegatheringstatechange =
    () => {

      console.log(
        "ICE GATHERING STATE:",
        peerConnection.iceGatheringState
      );

    };


  return peerConnection;
};


/**
 * Get microphone/camera.
 */
export const getLocalMedia =
  async (callType) => {

    const isVideo =
      callType === "VIDEO";

    console.log(
      "Requesting media:",
      {
        audio: true,
        video: isVideo,
      }
    );

    const stream =
      await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideo,
      });

    console.log(
      "Local media obtained:",
      stream.getTracks()
    );

    return stream;
  };


/**
 * Add local microphone/camera tracks
 * to the peer connection.
 */
export const addLocalTracks = (
  peerConnection,
  localStream
) => {

  if (!peerConnection) {
    return;
  }

  if (!localStream) {
    return;
  }

  localStream
    .getTracks()
    .forEach((track) => {

      console.log(
        "Adding local track:",
        track.kind
      );

      peerConnection.addTrack(
        track,
        localStream
      );

    });
};


/**
 * Create WebRTC offer.
 */
export const createOffer =
  async (peerConnection) => {

    const offer =
      await peerConnection.createOffer();

    await peerConnection.setLocalDescription(
      offer
    );

    return offer;
  };


/**
 * Create WebRTC answer.
 */
export const createAnswer =
  async (peerConnection) => {

    const answer =
      await peerConnection.createAnswer();

    await peerConnection.setLocalDescription(
      answer
    );

    return answer;
  };


/**
 * Set remote offer/answer.
 */
export const setRemoteDescription =
  async (
    peerConnection,
    description
  ) => {

    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(
        description
      )
    );

  };


/**
 * Add remote ICE candidate.
 */
export const addIceCandidate =
  async (
    peerConnection,
    candidate
  ) => {

    if (!peerConnection) {
      return;
    }

    if (!candidate) {
      return;
    }

    await peerConnection.addIceCandidate(
      new RTCIceCandidate(candidate)
    );
  };


/**
 * Stop microphone/camera.
 */
export const stopLocalStream =
  (localStream) => {

    if (!localStream) {
      return;
    }

    localStream
      .getTracks()
      .forEach((track) => {

        track.stop();

      });

  };


/**
 * Close peer connection.
 */
export const closePeerConnection =
  (peerConnection) => {

    if (!peerConnection) {
      return;
    }

    try {

      peerConnection.ontrack = null;
      peerConnection.onicecandidate = null;

      peerConnection.close();

    } catch (error) {

      console.error(
        "Error closing peer connection:",
        error
      );

    }

  };