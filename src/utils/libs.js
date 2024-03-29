// this file containers all exteral libraries
// to compare and contract the different
// pack alagorithims.

function reduce(desc) {
  var sdp = desc.sdp;
  var lines = sdp.split("\r\n");
  lines = lines.filter(function (line) {
    return (
      (line.indexOf("a=candidate:") === 0 &&
        line.indexOf("typ relay") !== -1 &&
        line.charAt(14) === "1") ||
      line.indexOf("a=ice-ufrag:") === 0 ||
      line.indexOf("a=ice-pwd:") === 0 ||
      line.indexOf("a=fingerprint:") === 0
    );
  });
  lines = lines.sort().reverse();
  // why is chrome reporting more than one candidate?
  // pick last candidate
  //lines = lines.slice(0, 3).concat(lines[4]);

  var firstcand = true;
  var comp = lines.map(function (line) {
    switch (line.split(":")[0]) {
      case "a=fingerprint":
        var hex = line
          .substr(22)
          .split(":")
          .map(function (h) {
            return parseInt(h, 16);
          });
        // b64 is slightly more concise than colon-hex
        return btoa(String.fromCharCode.apply(String, hex));
      case "a=ice-pwd":
        return line.substr(10); // already b64
      case "a=ice-ufrag":
        return line.substr(12); // already b64
      case "a=candidate":
        var parts = line.substr(12).split(" ");
        var ip = parts[4].split(".").reduce(function (prev, cur) {
          return (prev << 8) + parseInt(cur, 10);
        });
        // take ip/port from candidate, encode
        // foundation and priority are not required
        // can I have sprintf("%4c%4c%4c%2c") please? pike rocks
        // since chrome (for whatever reason) generates two candidates with the same foundation, ip and different port
        // (possibly the reason for this is multiple local interfaces but still...)
        if (firstcand) {
          firstcand = false;
          return [ip, parseInt(parts[5])]
            .map(function (a) {
              return a.toString(32);
            })
            .join(",");
        } else {
          return [parseInt(parts[5])]
            .map(function (a) {
              return a.toString(32);
            })
            .join(",");
        }
    }
  });
  return [desc.type === "offer" ? "O" : "A"].concat(comp).join(",");
}

function expand(str) {
  var comp = str.split(",");
  var sdp = [
    "v=0",
    "o=- 5498186869896684180 2 IN IP4 127.0.0.1",
    "s=-",
    "t=0 0",
    "a=msid-semantic: WMS",
    "m=application 9 DTLS/SCTP 5000",
    "c=IN IP4 0.0.0.0",
    "a=mid:data",
    "a=sctpmap:5000 webrtc-datachannel 1024",
  ];
  if (comp[0] === "A") {
    sdp.push("a=setup:active");
  } else {
    sdp.push("a=setup:actpass");
  }
  sdp.push("a=ice-ufrag:" + comp[1]);
  sdp.push("a=ice-pwd:" + comp[2]);
  sdp.push(
    "a=fingerprint:sha-256 " +
      atob(comp[3])
        .split("")
        .map(function (c) {
          var d = c.charCodeAt(0);
          var e = c.charCodeAt(0).toString(16).toUpperCase();
          if (d < 16) e = "0" + e;
          return e;
        })
        .join(":")
  );
  var candparts;
  candparts = comp.splice(4, 2).map(function (c) {
    return parseInt(c, 32);
  });
  var ip = [
    (candparts[0] >> 24) & 0xff,
    (candparts[0] >> 16) & 0xff,
    (candparts[0] >> 8) & 0xff,
    candparts[0] & 0xff,
  ].join(".");
  var cand = [
    "a=candidate:0", // foundation 0
    "1",
    "udp",
    "1", // priority 1
    ip,
    candparts[1],
    "typ host", // well, not a host cand but...
  ];
  sdp.push(cand.join(" "));
  // parse subsequent candidates
  var prio = 2;
  for (var i = 4; i < comp.length; i++) {
    cand = [
      "a=candidate:0",
      "1",
      "udp",
      prio++, // increase priority
      ip, // ip stays the same
      parseInt(comp[i], 32), // port changes
      "typ host", // well, not a host cand but...
    ];
    sdp.push(cand.join(" "));
  }
  return {
    type: comp[0] === "O" ? "offer" : "answer",
    sdp: sdp.join("\r\n") + "\r\n",
  };
}

/// -----

export const delimiter = "-";
/**
 * Moves the range of 0x00 to 0xFF to the following chars:
 * ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒ
 * ēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤť
 * ŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽžſƀƁƂƃƄƅƆƇƈƉƊƋƌƍƎƏƐƑƒƓƔƕƖƗƘƙƚƛƜƝƞƟƠơƢƣƤƥƦƧƨƩƪƫƬƭƮƯưƱƲƳƴƵƶƷƸƹƺƻƼƽƾƿ
 */
const charOffset = 192;
/** Converts an array of bytes to a 'human friendly' string. */
export const bytesToStr = (bytes) =>
  typeof bytes == "number"
    ? bytesToStr([bytes])
    : String.fromCharCode(...bytes.map((byte) => byte + charOffset));
/** Convert a 'human friendly' string to an array of bytes. */
export const strToBytes = (str) =>
  str.split("").map((char) => char.charCodeAt(0) - charOffset);
export const strToByte = (char) => strToBytes(char.substr(0, 1))[0];

const pack = ({ type, sdp }) => {
  let ufrag,
    pwd,
    fingerprint,
    candidates = [];
  for (const line of sdp.split("\n")) {
    const splitter = line.indexOf(":");
    if (splitter <= 0)
      // must have a attribute and value pair
      continue;
    const [attribute, value] = [
      line.slice(0, splitter),
      line.slice(splitter + 1).trim(),
    ];
    switch (attribute) {
      case "a=ice-ufrag":
        ufrag = value;
        break;
      case "a=ice-pwd":
        pwd = value;
        break;
      case "a=fingerprint":
        fingerprint = bytesToStr(
          value
            .substr("sha-256".length)
            .trim()
            .split(":")
            .map((byte) => parseInt(byte, 16))
        );
        break;
      case "a=candidate":
        const [
          foundation,
          componentId,
          transport,
          priority,
          connectionAddress,
          port,
        ] = line.split(" ");
        const ipBytes = connectionAddress
          .split(".")
          .map((byte) => parseInt(byte));
        if (ipBytes.length == 4)
          candidates.push(
            bytesToStr([
              ...ipBytes,
              parseInt(port) >> 8,
              parseInt(port) & 0x00ff,
            ])
          );
        break;
      default:
        break;
    }
  }
  return (
    type.charAt(0) +
    fingerprint +
    candidates.length.toString(36) + // easier than the byte conversion
    candidates +
    ufrag +
    delimiter +
    pwd
  );
};

function sdpType(char) {
  switch (char) {
    case "o":
      return "offer";
    case "a":
      return "answer";
    case "r":
      return "rollback";
    case "p":
      return "pranswer";
    default:
      break;
  }
  throw Error(`'${char}' doesn't map to a RTC SDP type.`);
}

const unpack = (packed) => {
  const type = sdpType(packed.substr(0, 1)),
    /** Get 32 bytes for the fingerprint */
    fingerprint = strToBytes(packed.slice(1, 1 + 32)).map((byte) =>
      ("0" + byte.toString(16)).slice(-2)
    ),
    /** 1 byte for the candidate count */
    candidateCount = parseInt(packed.substr(1 + 32, 1), 36),
    /** the candidates are 6 bytes each (4 byte IP + 2 byte port) */
    candidates = [...Array(candidateCount)].map((_, i) => ({
      ip: strToBytes(packed.substr(1 + 32 + 1 + i * 6, 4)).join("."),
      port:
        (strToByte(packed.substr(1 + 32 + 1 + i * 6 + 4)) << 8) +
        strToByte(packed.substr(1 + 32 + 1 + i * 6 + 4 + 1)),
    })),
    /** ufrag and password are split with a delimiter */
    [ufrag, password] = packed
      .substr(1 + 32 + 1 + candidateCount * 6)
      .split(delimiter);
  const sdpParts = [
    "v=0",
    "o=- 5498186869896684180 2 IN IP4 127.0.0.1",
    "s=-",
    "t=0 0",
    "a=msid-semantic: WMS",
    "m=application 9 DTLS/SCTP 5000",
    "c=IN IP4 0.0.0.0",
    "a=mid:data",
    "a=sctpmap:5000 webrtc-datachannel 1024",
    `a=setup:${type === "answer" ? "active" : "actpass"}`,
    `a=ice-ufrag:${ufrag}`,
    `a=ice-pwd:${password}`,
    `a=fingerprint:sha-256 ${fingerprint.join(":").toUpperCase()}`,
  ];
  let priority = 1;
  for (const { ip, port } of candidates)
    sdpParts.push(
      `a=candidate:${[0, 1, "udp", priority++, ip, port, "typ", "host"].join(
        " "
      )}`
    );
  return {
    type,
    sdp: sdpParts.join("\r\n") + "\r\n",
  };
};

// ------------

function get_reduced_sdp(desc) {
  var sdp = desc.sdp;
  var lines = sdp.split("\r\n");
  var ice_pwd = "";
  var ice_ufrag = "";
  var ip_s = new Array();
  var finger;
  var type = desc.type === "offer" ? "O" : "A";
  //console.log(type);
  for (var i = 0; i < lines.length; i++) {
    var temp = lines[i].split(":");
    if (temp[0] == "a=ice-pwd") {
      ice_pwd = temp[1];
      //console.log('ice_pwd '+ice_pwd);
    } else if (temp[0] == "a=ice-ufrag") {
      ice_ufrag = temp[1];
      //console.log('ice_ufrag: '+ice_ufrag);
    } else if (temp[0] == "a=candidate") {
      if (temp[1].indexOf("raddr") !== -1) {
        var temp_split = temp[1].split(" ");
        for (var j = 0; j < temp_split.length; j++) {
          if (temp_split[j].indexOf(".") !== -1) {
            if (temp_split[j + 1] == "rport") {
              //console.log(temp_split[j] + " " + temp_split[j+2]);
              var t_arr = new Array([
                encode_ip(temp_split[j]),
                base32encode(temp_split[j + 2]),
              ]);
              ip_s.push(
                encode_ip(temp_split[j]) + ":" + base32encode(temp_split[j + 2])
              );
            } else {
              var t_arr = new Array([
                encode_ip(temp_split[j]),
                base32encode(temp_split[j + 1]),
              ]);
              ip_s.push(
                encode_ip(temp_split[j]) + ":" + base32encode(temp_split[j + 1])
              );
              //console.log(temp_split[j] + " " + temp_split[j+1]);
            }
          }
        }
      }
      // ice_ufrag = temp[1];
      // console.log('ice_ufrag: '+ice_ufrag);
    } else if (temp[0] == "a=fingerprint") {
      var f = lines[i].split(" ")[1].split(":");
      var hex = f.map(function (h) {
        return parseInt(h, 16);
      });
      //console.log('hex: '+hex);
      finger = btoa(String.fromCharCode.apply(String, hex));
      console.log(finger);

      // var new_finger = atob(finger).split('').map(function (c) { var d = c.charCodeAt(0); var e = c.charCodeAt(0).toString(16).toUpperCase(); if (d < 16) e = '0' + e; return e; }).join(':');
      // console.log("new_finger " + new_finger);
      //console.log(f);
    }
  }
  var resp = type + "," + ice_ufrag + "," + ice_pwd + "," + finger;
  for (var k = 0; k < ip_s.length; k++) {
    resp += "," + ip_s[k];
  }
  //console.log("length: "+ resp.length);

  console.log(resp);
  console.log("Length: " + resp.length);
  //console.log(lines);
  //console.log(ip_s);
  return resp;
}

function get_expanded_sdp(red) {
  var things = red.split(",");
  console.log("things", things);
  var type = things[0] === "O" ? "offer" : "answer";
  var ice_ufrag = things[1];
  var ice_pwd = things[2];
  var finger = atob(things[3])
    .split("")
    .map(function (c) {
      var d = c.charCodeAt(0);
      var e = c.charCodeAt(0).toString(16).toUpperCase();
      if (d < 16) e = "0" + e;
      return e;
    })
    .join(":");
  console.log("type: " + type);
  console.log("ice_ufrag: " + ice_ufrag);
  console.log("ice_pwd: " + ice_pwd);
  console.log("fingerprint: " + finger);
  var ip1 = (things[4] || "0.0.0.0:0").split(":");
  var glob_ip = decode_ip(ip1[0]);
  var glob_port = base32decode(ip1[1]);

  console.log("glob_ip: " + glob_ip);
  console.log("glob_port: " + glob_port);

  var ip2 = (things[5] || "0.0.0.0:0").split(":");
  var loc_ip = decode_ip(ip2[0]);
  var loc_port = base32decode(ip2[1]);

  console.log("loc_ip: " + loc_ip);
  console.log("loc_port: " + loc_port);

  var sdp = [
    "v=0",
    "o=- 5498186869896684180 2 IN IP4 127.0.0.1",
    "s=-",
    "t=0 0",
    "a=msid-semantic: WMS",
    "m=application 9 DTLS/SCTP 5000",
    "c=IN IP4 " + glob_ip,
    "a=mid:data",
    "a=sctpmap:5000 webrtc-datachannel 1024",
  ];

  if (type === "answer") {
    sdp.push("a=setup:active");
  } else {
    sdp.push("a=setup:actpass");
  }

  sdp.push("a=ice-ufrag:" + ice_ufrag);
  sdp.push("a=ice-pwd:" + ice_pwd);
  sdp.push("a=fingerprint:sha-256 " + finger);

  sdp.push(
    "a=candidate:328666875 1 udp 2122260223 " +
      loc_ip +
      " " +
      loc_port +
      " typ host generation 0"
  );
  sdp.push(
    "a=candidate:1561653771 1 tcp 1518280447 " +
      loc_ip +
      " 0 typ host tcptype active generation 0"
  );
  sdp.push(
    "a=candidate:3133702446 1 udp 1686052607 " +
      glob_ip +
      " " +
      glob_port +
      " typ srflx raddr " +
      loc_ip +
      " rport " +
      loc_port +
      " generation 0"
  );
  //console.log(sdp);
  return { type: type, sdp: sdp.join("\r\n") + "\r\n" };
}
function d2h(d) {
  var temp = d.toString(16);
  if (d < 16) {
    return "0" + temp;
  } else {
    return temp;
  }
}
function encode_ip(ip) {
  var temp = ip.split(".");
  var ans = "";
  for (var i = 0; i < temp.length; i++) {
    ans = ans + d2h(parseInt(temp[i]));
  }
  return ans;
}
function decode_ip(ip) {
  var ret = new Array();
  for (var i = 0; i < ip.length / 2; i++) {
    var temp = ip.substring(i * 2, (i + 1) * 2);
    ret.push(parseInt(temp, 16));
  }
  return ret.join(".");
}
function base32encode(num) {
  return parseInt(num).toString(32);
}
function base32decode(num) {
  return parseInt(num, 32);
}

export { reduce, expand, pack, unpack, get_reduced_sdp, get_expanded_sdp };
