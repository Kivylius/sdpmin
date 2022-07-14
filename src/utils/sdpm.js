// what is sdpm? sdpm is sdp minifier
// it takes the sdp code and pack it to a small string
// that can be shared via a message.
// contains all data to replicate on other side

import * as sdpTransform from "sdp-transform";
const devider = "*";
export const sdpm = {
  pack: (webRTCObj) => {
    console.log("webRTCObj", webRTCObj);
    const { type, sdp } = webRTCObj;
    const wrop = sdpTransform.parse(sdp);
    console.log("wrop", wrop);
    if (wrop.version != 0) {
      alert("sdp version has changed and maybe not supported");
    }
    const str = [
      wrop.version,
      wrop.origin.sessionVersion,
      // add ip info
      wrop.media[0].candidates
        .map((candiate) => `${candiate.ip}:${candiate.port}`)
        .join(","),
      // fingerprint
      wrop.media[0].fingerprint.hash,
      wrop.media[0].icePwd,
      wrop.media[0].iceUfrag,
      wrop.media[0].mid,
    ];
    return str.join(devider);
  },
  unpack: (webRTCString) => {
    const wrsp = webRTCString.split(devider);
    console.log("WRSP", wrsp);
    const [verson, sessionVersion, candiates, hash, icePwd, ufrag, mid] = wrsp;
    const ips = candiates.split(",");
    console.log("ips", ips);
    const [globalip, globalport] = ips[0].split(":");
    const [localip, localport] = ips[1].split(":");

    const sdp = {
      version: verson, // not usure
      origin: {
        username: "-", // not needed
        sessionId: "0", // not neded
        sessionVersion: sessionVersion,
        netType: "IN", // ??
        ipVer: 4, // ??
        address: "127.0.0.1", // ??
      },
      name: "-", // not needed
      timing: {
        start: 0, // not needed
        stop: 0, // not needed
      },
      // not needed ??
      // "groups": [
      //     {
      //         "type": "BUNDLE",
      //         "mids": 0
      //     }
      // ],
      // "extmapAllowMixed": "extmap-allow-mixed",
      msidSemantic: {
        semantic: "", // not needed
        token: "WMS", // not needed
      },
      media: [
        {
          rtp: [], // not needed
          fmtp: [], // not needed
          type: "application", // not needed
          port: 60392,
          protocol: "UDP/DTLS/SCTP", // not needed
          payloads: "webrtc-datachannel", // not needed
          // not needed
          // "connection": {
          //     "version": 4,
          //     "ip": "79.97.169.126"
          // },
          candidates: [
            {
              foundation: 0, // not needed
              component: 1, // not needed
              transport: "udp", // not needed
              priority: 1, // not needed
              ip: globalip,
              port: globalport,
              type: "host", // not needed
              // generation: 0, // not needed
              // "network-cost": 999, // not needed
            },
            {
              foundation: 0, // not needed
              component: 1, // not needed
              transport: "udp", // not needed (hardcoded)
              priority: 1, // not needed
              ip: localip,
              port: localport,
              type: "srflx", // not needed
              raddr: "0.0.0.0", // not needed
              rport: 0, // not needed
              // generation: 0, // not needed
              // "network-cost": 999, // not needed
            },
          ],
          iceUfrag: ufrag,
          icePwd: icePwd,
          iceOptions: "trickle", // not needed
          fingerprint: {
            type: "sha-256", // not needed
            hash: hash,
          },
          setup: "actpass", // not needed (hardcoded)
          mid: mid,
          sctpPort: 5000, // not needed
          maxMessageSize: 262144, // not needed
        },
      ],
    };
    console.log("SDP", sdpTransform.write(sdp));
    return { sdp: sdpTransform.write(sdp) };
  },
};
