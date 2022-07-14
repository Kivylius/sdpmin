export const genWebRTC = async () =>
  // eslint-disable-next-line no-async-promise-executor
  new Promise(async (r) => {
    const configuration = {
      iceServers: [{ urls: "stun:stun.stunprotocol.org" }],
    };
    const pc = new RTCPeerConnection(configuration);
    const dataChannel = pc.createDataChannel("dataChannel");
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    pc.onicecandidate = (event) => {
      // console.log("a", event);
      event.candidate === null &&
        r({ dataChannel, offer: pc.localDescription });
    };
    pc.onconnectionstatechange = () => {
      // console.log("b", pc.iceConnectionState);
    };
  });
