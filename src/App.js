import "./App.css";
import { useState } from "react";
import {
  reduce,
  expand,
  pack,
  unpack,
  get_reduced_sdp,
  get_expanded_sdp,
} from "./lib";
// import { pack, unpack } from "sdp-minify";
import * as sdpTransform from "sdp-transform";

// unify all the version
// zip(RTCobj) => sdpZipString string
// unzip(sdpZipString: string) => RTCobj
const getVerson = (version) => {
  switch (version) {
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
};

const genWebRTC = async () => {
  const configuration = {
    iceServers: [{ urls: "stun:stun.1.google.com:19302" }],
  };
  const peerConnection = new RTCPeerConnection(configuration);
  const sendChannel = peerConnection.createDataChannel("sendChannel");
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  return { offer, sendChannel };
};

const App = () => {
  const [version, setVersion] = useState("minimal-webrtc");
  const { zip, unzip } = getVerson(version);

  const [zipValue, setZipValue] = useState({ sdp: "" });
  const onChangeZip = (e) => {
    const { value } = e.target;
    try {
      const parsed = JSON.parse(value);
      setZipValue(parsed);
    } catch (e) {
      console.error(e);
    }
  };

  const [unzipValue, setUnzipValue] = useState("");
  const onChangeUnzip = (e) => {
    const { value } = e.target;
    try {
      unzip(value);
      setUnzipValue(value);
    } catch (e) {
      console.log(e);
    }
  };

  const onChangeVersion = (e) => {
    const { value } = e.target;
    setVersion(value);
    setZipValue({ sdp: "" });
    setUnzipValue("");
  };

  const onClickGen = async (e) => {
    e.preventDefault();
    const { offer } = await genWebRTC();
    console.log({ offer });
    setZipValue(offer);
  };

  const onClickGenString = async (e) => {
    e.preventDefault();
    const { offer } = await genWebRTC();
    console.log({ offer });
    setUnzipValue(zip(offer));
  };

  const outputString = zipValue.sdp ? zip(zipValue) : "";
  const outputCompresion = zipValue.sdp
    ? (100 - (outputString.length / zipValue.sdp.length) * 100).toFixed(1)
    : "--";
  const jsonOutput = unzipValue ? unzip(unzipValue) : undefined;

  return (
    <div>
      <h1>SDPM</h1>
      <p>
        In the demo bellow you can pack (compress) and unpack sdp connection
        strings. You can also generate them if you dont already have one.
      </p>
      <div>
        Version:{" "}
        <select onChange={onChangeVersion}>
          <option disabled value="sdpm">
            sdpm (TODO) ⭐
          </option>
          <option value="minimal-webrtc">minimal-webrtc</option>
          <option value="sdp-minify">sdp-minify</option>
          <option value="minisdp">minisdp</option>
        </select>
        <br />
        <br />
      </div>
      <div className="container">
        <div className="zip">
          <h2>Pack</h2>
          <label>
            WebRTC JSON (
            <a href="#gen1" onClick={onClickGen}>
              generate
            </a>
            )
          </label>
          <textarea
            onChange={onChangeZip}
            value={zipValue.sdp ? JSON.stringify(zipValue) : ""}
          ></textarea>
          <small>
            Length: {(zipValue.sdp ? JSON.stringify(zipValue) : "").length}
          </small>
          <br />
          <br />
          <label>WebRTC String Output</label>
          <br />
          <input disabled value={zipValue.sdp ? zip(zipValue) : ""}></input>
          <small>
            Length: {(zipValue.sdp ? zip(zipValue) : "").length} (
            {outputCompresion}% compresion)
          </small>
          <hr />
          <h4>Debugger:</h4>
          <pre>
            {JSON.stringify(
              zipValue.sdp ? sdpTransform.parse(zipValue.sdp) : undefined,
              null,
              4
            )}
          </pre>
        </div>

        <div className="unzip">
          <h2>Unpack</h2>
          <label>
            WebRTC String (
            <a href="#gen2" onClick={onClickGenString}>
              generate
            </a>
            )
          </label>
          <br />
          <input onChange={onChangeUnzip} value={unzipValue}></input>
          <small>Length: {unzipValue.length}</small>
          <br />
          <br />
          <label>WebRTC JSON</label>
          <textarea
            disabled
            value={unzipValue ? JSON.stringify(jsonOutput) : undefined}
          ></textarea>
          <small>Length: {jsonOutput ? jsonOutput.sdp.length : "0"}</small>
          <hr />
          <h4>Debugger:</h4>
          <pre>
            {JSON.stringify(
              unzipValue ? sdpTransform.parse(jsonOutput.sdp) : undefined,
              null,
              4
            )}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default App;

// const configuration = {
//   iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
// };
// const peerConnection = new RTCPeerConnection();
// const sendChannel = peerConnection.createDataChannel("sendChannel");
// const offer = await peerConnection.createOffer();
// await peerConnection.setLocalDescription(offer);
// console.log({ offer, sendChannel });
// setZipValue(offer);
// const iceCandidates = [];

// const onicecandidate = (e) => {
//   console.log({ onicecandidate: true, e });
//   // if (e.candidate) {
//   //   iceCandidates.push(e.candidate);
//   // }
//   if (!e.candidate) {
//     console.log(
//       "onicecandidate.offer",
//       peerConnection.localDescription.sdp
//     );
//   } else {
//     var cand = e.candidate.candidate.split(" ");
//     console.log(cand[0]);
//   }
// };
// peerConnection.onicecandidate = onicecandidate;

// const ontrack = (e) => {
//   console.log({ ontrack: true, e });
// };
// peerConnection.ontrack = ontrack;

// const sendChannel = peerConnection.createDataChannel("sendDataChannel");
// const onSendChannelStateChange = () => {
//   var readyState = sendChannel.readyState;
//   console.log("ready stat", readyState, sendChannel);
// };
// sendChannel.onopen = onSendChannelStateChange;
// sendChannel.onclose = onSendChannelStateChange;

// const offer = await peerConnection.createOffer();
// await peerConnection.setLocalDescription(offer);
// console.log("--" + offer.sdp);

// const peerConnection2 = new RTCPeerConnection(configuration);
// peerConnection2.setRemoteDescription(new RTCSessionDescription(offer));
// const answer = await peerConnection2.createAnswer();
// await peerConnection2.setLocalDescription(answer);
// console.log({ answer: answer });
// const pc = new RTCPeerConnection(configuration);
// const offer = await pc.createOffer();
// pc.setLocalDescription(offer);
// const channel = pc.createDataChannel("sendChannel");
// channel.onopen = (...params) => console.log({ open: 1, params });
// channel.onclose = (...params) => console.log({ close: 1, params });
// // const offer = await pc.createOffer();
// // pc.setLocalDescription(offer);
// // console.log({ offer });
// setZipValue(offer);
