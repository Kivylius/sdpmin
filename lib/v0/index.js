"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.unpackV0 = exports.packV0 = void 0;

var _sdpTransform = require("sdp-transform");

var devider = "*";

var packV0 = function packV0(webRTCObj) {
  // console.log("webRTCObj", webRTCObj);
  var type = webRTCObj.type,
      sdp = webRTCObj.sdp;
  var wrop = (0, _sdpTransform.parse)(sdp); // console.log("wrop", wrop);

  if (wrop.version != 0) {
    alert("sdp version has changed and maybe not supported");
  }

  var str = [wrop.version, wrop.origin.sessionVersion, // add ip info
  wrop.media[0].candidates.map(function (candiate) {
    return candiate.ip + ":" + candiate.port;
  }).join(","), // fingerprint
  wrop.media[0].fingerprint.hash, wrop.media[0].icePwd, wrop.media[0].iceUfrag, wrop.media[0].mid, type];
  console.log("packv0", {
    type: type,
    devider: devider,
    str: str,
    strPacked: str.join(devider)
  });
  return str.join(devider);
};

exports.packV0 = packV0;

var unpackV0 = function unpackV0(webRTCString) {
  var wrsp = webRTCString.split(devider);
  console.log("unpackV0.WRSP", wrsp);
  var verson = wrsp[0],
      sessionVersion = wrsp[1],
      candiates = wrsp[2],
      hash = wrsp[3],
      icePwd = wrsp[4],
      ufrag = wrsp[5],
      mid = wrsp[6],
      type = wrsp[7];
  var ips = candiates.split(",");
  console.log("unpackV0.ips", ips);

  var _ips$0$split = ips[0].split(":"),
      globalip = _ips$0$split[0],
      globalport = _ips$0$split[1];

  var _ips$1$split = ips[1].split(":"),
      localip = _ips$1$split[0],
      localport = _ips$1$split[1];

  var sdp = {
    version: verson,
    // not usure
    origin: {
      username: "-",
      // not needed
      sessionId: "0",
      // not neded
      sessionVersion: sessionVersion,
      netType: "IN",
      // ??
      ipVer: 4,
      // ??
      address: "127.0.0.1" // ??

    },
    name: "-",
    // not needed
    timing: {
      start: 0,
      // not needed
      stop: 0 // not needed

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
      semantic: "",
      // not needed
      token: "WMS" // not needed

    },
    media: [{
      rtp: [],
      // not needed
      fmtp: [],
      // not needed
      type: "application",
      // not needed
      port: 60392,
      protocol: "UDP/DTLS/SCTP",
      // not needed
      payloads: "webrtc-datachannel",
      // not needed
      // not needed
      // "connection": {
      //     "version": 4,
      //     "ip": "79.97.169.126"
      // },
      candidates: [{
        foundation: 0,
        // not needed
        component: 1,
        // not needed
        transport: "udp",
        // not needed
        priority: 1,
        // not needed
        ip: globalip,
        port: globalport,
        type: "host" // not needed
        // generation: 0, // not needed
        // "network-cost": 999, // not needed

      }, {
        foundation: 0,
        // not needed
        component: 1,
        // not needed
        transport: "udp",
        // not needed (hardcoded)
        priority: 1,
        // not needed
        ip: localip,
        port: localport,
        type: "srflx",
        // not needed
        raddr: "0.0.0.0",
        // not needed
        rport: 0 // not needed
        // generation: 0, // not needed
        // "network-cost": 999, // not needed

      }],
      iceUfrag: ufrag,
      icePwd: icePwd,
      iceOptions: "trickle",
      // not needed
      fingerprint: {
        type: "sha-256",
        // not needed
        hash: hash
      },
      setup: "actpass",
      // not needed (hardcoded)
      mid: mid,
      sctpPort: 5000,
      // not needed
      maxMessageSize: 262144 // not needed

    }]
  };
  console.log("unpackV0", {
    type: type,
    sdp: sdp,
    sdpStr: (0, _sdpTransform.write)(sdp)
  });
  return {
    type: type,
    sdp: (0, _sdpTransform.write)(sdp)
  };
};

exports.unpackV0 = unpackV0;