# 🗜️ SDPMIN

[![Build Status](https://travis-ci.org/gregnb/sdpmin.svg?branch=master)](https://travis-ci.org/gregnb/sdpmin)
[![NPM Downloads](https://img.shields.io/npm/dt/sdpmin.svg?style=flat)](https://npmcharts.com/compare/sdpmin?minimal=true)
[![Coverage Status](https://coveralls.io/repos/github/gregnb/sdpmin/badge.svg?branch=master)](https://coveralls.io/github/gregnb/sdpmin?branch=master)
[![npm version](https://badge.fury.io/js/sdpmin.svg)](https://badge.fury.io/js/sdpmin)

_SDPMIN_ or session description protocol minifier is a tool that compresses the [SDP](https://developer.mozilla.org/en-US/docs/Web/API/RTCSessionDescription/sdp) [WebRTC offer]https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createOffer() to a tiny string that can be stored in a signaling server or even shared over any messaging platform for a server-less approach.

## Demo

The demo includes a simple playground to showcase the compressing and uncompressing of the SDP offer object.

- [Demo Playground](https://kivylius.github.io/sdpmin/)

## Quick Start

Just install the sdpmin like this:

```sh
npm i sdpmin -D
```

```js
import { pack, unpack } from "sdpmin";

const packedStr = pack(SDP_STRING); // output: SKk12k3kdDk2Dj21jk31jk23j....
const sdp = unpack(SDP_COMPRESSED_STRING); // output: -o:123123123....
```

## Versions

The default version that is exported is `v1`. This outputs a safe lossless compression, other version are available can can be imported with `VX` prefix e.g:

```js
import { packV0, unpackV0 } from 'sdpmin';

const packedStr = packV0(...);
const sdp = unpakcV0(...)
```

- **v0** - full output without compression.
- **v1** - default lossless compression.
- **v2\*** - (todo: soon) Smaller bundle size & lossless compression.
- **v3\*** - (todo: soon) Aggressive compression that is lossy.

Check the Demo above for examples outputs.

## Starting playground

To start the playground locally install dependencies and run start.

`npm ci && npm run start`

## Contributing

If you have a suggestion that would make this better, please create an issues first. Upon discussed you can fork the repo and create a pull request. Don't forget to give the project a star! Thanks again!

## Support

- NodeJS 12+

```js
const sdpmin = require('sdpmin');
const str = sdpmin.pack(...);
```

- React / Angular / Vue / etc.

## Inspirations

- [minimal-webrtc](https://git.aweirdimagination.net/perelman/minimal-webrtc)
- [sdp-minify](https://github.com/mothepro/sdp-minify)
- [minisdp](https://github.com/WesselWessels/minisdp)

## License

The MIT License (MIT)

Copyright (c) 2014 Shane Tully

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
