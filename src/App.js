import "./App.css";
import { useState } from "react";
import * as sdpTransform from "sdp-transform";
import { Toaster, toast } from "react-hot-toast";

import { getVerson } from "./utils/getVersion.js";
import { genWebRTC } from "./utils/genWebRTC.js";

const App = () => {
  const [version, setVersion] = useState("sdpm");
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const { zip, unzip } = getVerson(version);

  const [zipValue, setZipValue] = useState({ sdp: "" });
  const onChangeZip = (e) => {
    const { value } = e.target;
    try {
      value === "" && setZipValue({ sdp: "" });
      const parsed = JSON.parse(value);
      setZipValue(parsed);
    } catch (e) {
      toast.error(e.toString());
      console.error(e);
    }
  };

  const [unzipValue, setUnzipValue] = useState("");
  const onChangeUnzip = (e) => {
    const { value } = e.target;
    try {
      value === "" && setUnzipValue("");
      unzip(value);
      setUnzipValue(value);
    } catch (e) {
      toast.error(e.toString());
      console.error(e);
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
    setLoading(true);
    const { offer } = await genWebRTC();
    setLoading(false);
    console.log({ offer });
    setZipValue(offer);
  };

  const onClickGenString = async (e) => {
    e.preventDefault();
    setLoading2(true);
    const { offer } = await genWebRTC();
    setLoading2(false);
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
      <Toaster position="top-right" />
      <h1>🗜️ SDPM{"  "}</h1>
      <p>
        In the demo bellow you can pack (compress) and unpack sdp connection
        strings. You can also generate them if you dont already have one. <br />
        <a href="https://github.com/Kivylius/sdpmin">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>{" "}
          GitHub
        </a>
      </p>
      <div>
        Version:{" "}
        <select onChange={onChangeVersion}>
          <option value="sdpm">[wip] sdpm v0</option>
          <option disabled value="sdpmv1">
            [todo] sdpm v1
          </option>
          <option disabled>--</option>
          <option value="minimal-webrtc">(old) minimal-webrtc</option>
          <option value="sdp-minify">(old) sdp-minify</option>
          <option value="minisdp">(old) minisdp</option>
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
            placeholder={
              loading
                ? "generating..."
                : "paste sdp json here (must be valid) or generate above"
            }
            onChange={onChangeZip}
            value={zipValue.sdp ? JSON.stringify(zipValue) : ""}
            className={loading ? "loading" : ""}
            disabled={loading}
          ></textarea>
          <small>
            Length: {(zipValue.sdp ? JSON.stringify(zipValue) : "").length}
          </small>
          <br />
          <br />
          <label>WebRTC String Output</label>
          <input disabled value={zipValue.sdp ? zip(zipValue) : ""}></input>
          <small>
            Length: {(zipValue.sdp ? zip(zipValue) : "").length} (
            {outputCompresion}% compresion)
          </small>
          <br />
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
          <input
            className={loading2 ? "loading" : ""}
            disabled={loading2}
            placeholder={
              loading2
                ? "generating..."
                : "paste webrtc string here (must be valid) or generate above"
            }
            onChange={onChangeUnzip}
            value={unzipValue}
          ></input>
          <small>Length: {unzipValue.length}</small>
          <br />
          <br />
          <label>WebRTC JSON</label>
          <textarea
            disabled
            value={unzipValue ? JSON.stringify(jsonOutput) : undefined}
          ></textarea>
          <small>Length: {jsonOutput ? jsonOutput.sdp.length : "0"}</small>
          <br />
          <h4>Debugger:</h4>
          <pre>
            {unzipValue
              ? JSON.stringify(sdpTransform.parse(jsonOutput.sdp), null, 4)
              : "// debug output"}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default App;
