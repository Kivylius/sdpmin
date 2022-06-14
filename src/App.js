import "./App.css";
import { useState } from "react";
import { reduce, expand, pack, unpack } from "./lib";
// import { pack, unpack } from "sdp-minify";
import * as sdpTransform from "sdp-transform";

// unify all the version
// zip(RTCobj) => sdpZipString string
// unzip(sdpZipString: string) => RTCobj
const getVerson = (version) => {
  switch (version) {
    case "sdpm":
      return {
        zip: (RTCobj) => reduce(RTCobj),
        unzip: (sdpZipString) => expand(sdpZipString),
      };
    case "sdp-minify":
      return {
        zip: (RTCobj) => pack(RTCobj, "UTF16"),
        unzip: (sdpZipString) => unpack(sdpZipString, "UTF16"),
      };
    default:
      return {};
  }
};

var configuration = {
  iceServers: [{ urls: "stun:stun.1.google.com:19302" }],
};

const App = () => {
  const [version, setVersion] = useState("sdpm");
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
    setUnzipValue(value);
  };

  const onChangeVersion = (e) => {
    const { value } = e.target;
    setVersion(value);
    setZipValue({ sdp: "" });
    setUnzipValue("");
  };

  const onClickGen = async (e) => {
    e.preventDefault();
    const configuration = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };
    const peerConnection = new RTCPeerConnection(configuration);
    const iceCandidates = [];
    peerConnection.onicecandidate = (e) => {
      console.log({ onicecandidate: true, e });
      if (e.candidate) {
        iceCandidates.push(e.candidate);
      }
    };

    peerConnection.ontrack = (e) => {
      console.log({ ontrack: true, e });
    };
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    console.log({ offer });

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
    setZipValue(offer);
  };

  return (
    <div>
      <h1>SDPM</h1>
      <div>
        Version:{" "}
        <select onChange={onChangeVersion}>
          <option value="sdpm">sdpm</option>
          <option value="sdp-minify">sdp-minify</option>
        </select>
        <br />
        <br />
      </div>
      <div className="container">
        <div className="zip">
          <h2>Zip</h2>
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
          <br />
          <br />
          <label>WebRTC String Output</label>
          <br />
          <input disabled value={zipValue.sdp ? zip(zipValue) : ""}></input>
          <small>Length: {zipValue.sdp.length} chars</small>
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
          <h2>UNZip</h2>
          <label>WebRTC String</label>
          <br />
          <input onChange={onChangeUnzip}></input>
          <small>Length: {unzipValue.length} chars.</small>
          <br />
          <br />
          <label>WebRTC JSON</label>
          <textarea
            disabled
            value={unzipValue ? JSON.stringify(unzip(unzipValue)) : undefined}
          ></textarea>
          <hr />
          <h4>Debugger:</h4>
          <pre>
            {JSON.stringify(
              unzipValue
                ? sdpTransform.parse(unzip(unzipValue).sdp)
                : undefined,
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
