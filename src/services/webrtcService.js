/*
 * =========================================================
 * WEBRTC CONFIGURATION
 * =========================================================
 *
 * STUN helps the two browsers discover their public
 * network addresses.
 *
 * For production, especially on Render/Vercel users behind
 * restrictive NAT/firewalls, a TURN server is recommended.
 */

const ICE_SERVERS = [
  {
    urls: "stun:stun.l.google.com:19302",
  },
];


/*
 * =========================================================
 * CREATE PEER CONNECTION
 * =========================================================
 */
export const createPeerConnection = ({
  onIceCandidate,
  onTrack,
  onConnectionStateChange,
  onIceConnectionStateChange,
}) => {
  const peerConnection =
    new RTCPeerConnection({
      iceServers: ICE_SERVERS,
    });


  /*
   * ICE candidate
   */
  peerConnection.onicecandidate =
    (event) => {
      if (
        event.candidate &&
        onIceCandidate
      ) {
        onIceCandidate(
          event.candidate
        );
      }
    };


  /*
   * Remote media
   */
  peerConnection.ontrack =
    (event) => {
      console.log(
        "WEBRTC REMOTE TRACK:",
        event.track.kind
      );

      if (onTrack) {
        onTrack(event);
      }
    };


  /*
   * Connection state
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
   * ICE connection state
   */
  peerConnection.oniceconnectionstatechange =
    () => {
      console.log(
        "WEBRTC ICE STATE:",
        peerConnection.iceConnectionState
      );

      if (onIceConnectionStateChange) {
        onIceConnectionStateChange(
          peerConnection.iceConnectionState
        );
      }
    };


  return peerConnection;
};


/*
 * =========================================================
 * GET LOCAL MEDIA
 * =========================================================
 */
export const getLocalMedia =
  async (callType) => {
    const isVideo =
      String(callType).toUpperCase() ===
      "VIDEO";

    console.log(
      "REQUESTING LOCAL MEDIA:",
      {
        audio: true,
        video: isVideo,
      }
    );

    const stream =
      await navigator.mediaDevices.getUserMedia(
        {
          audio: true,
          video: isVideo,
        }
      );

    console.log(
      "LOCAL MEDIA ACQUIRED"
    );

    return stream;
  };


/*
 * =========================================================
 * ADD LOCAL TRACKS
 * =========================================================
 */
export const addLocalTracks = (
  peerConnection,
  stream
) => {
  if (
    !peerConnection ||
    !stream
  ) {
    return;
  }

  stream
    .getTracks()
    .forEach((track) => {
      console.log(
        "ADDING LOCAL TRACK:",
        track.kind
      );

      peerConnection.addTrack(
        track,
        stream
      );
    });
};


/*
 * =========================================================
 * CREATE OFFER
 * =========================================================
 */
export const createOffer =
  async (peerConnection) => {
    if (!peerConnection) {
      throw new Error(
        "Peer connection does not exist."
      );
    }

    console.log(
      "CREATING WEBRTC OFFER"
    );

    const offer =
      await peerConnection.createOffer();

    await peerConnection.setLocalDescription(
      offer
    );

    console.log(
      "LOCAL OFFER CREATED"
    );

    return offer;
  };


/*
 * =========================================================
 * CREATE ANSWER
 * =========================================================
 */
export const createAnswer =
  async (peerConnection) => {
    if (!peerConnection) {
      throw new Error(
        "Peer connection does not exist."
      );
    }

    console.log(
      "CREATING WEBRTC ANSWER"
    );

    const answer =
      await peerConnection.createAnswer();

    await peerConnection.setLocalDescription(
      answer
    );

    console.log(
      "LOCAL ANSWER CREATED"
    );

    return answer;
  };


/*
 * =========================================================
 * SET REMOTE DESCRIPTION
 * =========================================================
 */
export const setRemoteDescription =
  async (
    peerConnection,
    description
  ) => {
    if (!peerConnection) {
      throw new Error(
        "Peer connection does not exist."
      );
    }

    if (!description) {
      throw new Error(
        "Remote description is missing."
      );
    }

    console.log(
      "SETTING REMOTE DESCRIPTION:",
      description.type
    );

    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(
        description
      )
    );

    console.log(
      "REMOTE DESCRIPTION SET"
    );
  };


/*
 * =========================================================
 * ADD ICE CANDIDATE
 * =========================================================
 */
export const addIceCandidate =
  async (
    peerConnection,
    candidate
  ) => {
    if (!peerConnection) {
      throw new Error(
        "Peer connection does not exist."
      );
    }

    if (!candidate) {
      return;
    }

    await peerConnection.addIceCandidate(
      new RTCIceCandidate(
        candidate
      )
    );
  };


/*
 * =========================================================
 * STOP LOCAL STREAM
 * =========================================================
 */
export const stopLocalStream =
  (stream) => {
    if (!stream) {
      return;
    }

    stream
      .getTracks()
      .forEach((track) => {
        track.stop();
      });
  };


/*
 * =========================================================
 * CLOSE PEER CONNECTION
 * =========================================================
 */
export const closePeerConnection =
  (peerConnection) => {
    if (!peerConnection) {
      return;
    }

    try {
      peerConnection
        .getSenders()
        .forEach((sender) => {
          try {
            sender.track?.stop();
          } catch (error) {
            console.warn(
              "Unable to stop sender track:",
              error
            );
          }
        });

      peerConnection.close();
    } catch (error) {
      console.error(
        "ERROR CLOSING PEER CONNECTION:",
        error
      );
    }
  };