import {
  reduce,
  expand,
  pack,
  unpack,
  get_reduced_sdp,
  get_expanded_sdp,
} from "./libs.js";
import { packV0, unpackV0 } from "../lib/index.js";

// unify all the version
// zip(RTCobj) => sdpZipString string
// unzip(sdpZipString: string) => RTCobj
export function getVerson(version) {
  switch (version) {
    case "sdpm":
      return {
        zip: (RTCobj) => packV0(RTCobj),
        unzip: (sdpZipString) => unpackV0(sdpZipString),
      };
    case "minimal-webrtc":
      return {
        zip: (RTCobj) => reduce(RTCobj),
        unzip: (sdpZipString) => expand(sdpZipString),
      };
    case "sdp-minify":
      return {
        zip: (RTCobj) => pack(RTCobj, "UTF16"),
        unzip: (sdpZipString) => unpack(sdpZipString, "UTF16"),
      };
    case "minisdp":
      return {
        zip: (RTCobj) => get_reduced_sdp(RTCobj),
        unzip: (sdpZipString) => get_expanded_sdp(sdpZipString),
      };

    default:
      return {};
  }
}
