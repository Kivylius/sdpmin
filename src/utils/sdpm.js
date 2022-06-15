// what is sdpm? sdpm is sdp minifier
// it takes the sdp code and pack it to a small string
// that can be shared via a message.
// contains all data to replicate on other side

import * as sdpTransform from "sdp-transform";
const devider = ".";
export const sdpm = {
  pack: (webRTCObj) => {
    console.log("webRTCObj", webRTCObj);
    const { type, sdp } = webRTCObj;
    const wrop = sdpTransform.parse(sdp);
    console.log("wrop", wrop);
    if (wrop.version != 0) {
      alert("sdp version has changed and maybe not supported");
    }
    // return "xxxxxxxx";
    const str = [
      wrop.version,
      wrop.origin.sessionVersion,
      // add ip info
      wrop.media[0].candidates.map(
        (candiate) => `${candiate.ip}:${candiate.port}`
      ),
      // fingerprint
      wrop.media[0].fingerprint.hash,
      wrop.media[0].icePwd,
      wrop.media[0].iceUfrag,
      wrop.media[0].mid,
    ];
    return str.join(".");
    // return `
    // ${wrop.version}.
    // ${wrop.origin.sessionId}
    // ${}
    // `;
  },
  unpack: (webRTCString) => {
    return {
      type: "offer",
      sdp: "-o",
    };
  },
};
