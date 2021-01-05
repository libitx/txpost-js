# Txpost.js

![npm](https://img.shields.io/npm/v/txpost?color=informational)
![License](https://img.shields.io/github/license/libitx/txpost-js?color=informational)
![Build Status](https://img.shields.io/github/workflow/status/libitx/txpost-js/Node.js%20CI)

Encode Bitcoin transactions and data in a concise and efficient binary serialisation format.

Use Txpost.js on the front end to encode Bitcoin transactions and other data in a concise binary format using [CBOR](https://cbor.io). *Server-side Txpost.js offers Express and Koa.js middlewares for parsing and decoding CBOR payloads for use in your application [coming soon&hellip;]*

### BRFC specifications

Txpost is an implementation of the following BRFC specifications. They describe a standard for serialising Bitcoin transactions and associated parameters, along with arbitrary meta data, in a concise binary format using CBOR:

* BRFC `c9a2975b3d19` - [CBOR Tx Payload specification](https://github.com/libitx/txpost/blob/master/brfc-specs/cbor-tx-payload.md)
* BRFC `5b82a2ed7b16` - [CBOR Tx Envelope specification](https://github.com/libitx/txpost/blob/master/brfc-specs/cbor-tx-envelope.md)

### Work in progress

* [x] Implement BRFC `c9a2975b3d19` - CBOR Tx Payload specification
* [x] Implement BRFC `5b82a2ed7b16` - CBOR Tx Envelope specification
* [x] Sign and verify CBOR Tx Envelope payloads
* [ ] Express middleware
* [ ] Koa.js middleware

## Getting started

Install Txpost with `npm` or `yarn`:

```shell
npm install txpost
# or
yarn add txpost
```

Alternatively use in a browser via CDN:

```html
<script src="//unpkg.com/txpost/dist/txpost.min.js"></script>
```

TxForge has a peer dependency on **version 2** the `bsv` library which must also be installed in your project.

## Usage

A TX Payload is an object consisting of the following properties:

* `data` - is either an object containing a single raw transaction alongside any other attributes, or alternatively it can be an array of objects containing multiple sets of raw transactions with additional attributes. This allows multiple transactions to be encoded in a single payload.
* `meta` - is an object which can contain any other arbitrary infomation which can be used to help handle the request.

```javascript
import { Payload } from 'txpost'

// Example payload containing a single transaction
const payload = Payload.build({
  data: {
    rawtx: new Uint8Array([1, 0 ,0 ,0, ...]),
    type: 'article'
  },
  meta: {
    path: '/posts'
  }
})

// Example payload containing multiple transactions
const multiPayload = Payload.build({
  data: [{
    rawtx: new Uint8Array([1, 0 ,0 ,0, ...]),
    type: 'article'
  }, {
    rawtx: new Uint8Array([1, 0 ,0 ,0, ...]),
    type: 'article'
  }]
  meta: {
    path: '/posts'
  }
})
```

A Payload instance can then be CBOR encoded.

```javascript
const payloadCbor = payload.encode() // => ArrayBuffer
```

A TX Envelope is an object consisting of the following properties:

* `payload` - CBOR encoded TX Payload
* `pubkey` - Optional 33-byte ECDSA public key
* `signature` - Optional raw ECDSA signature

```javascript
import { Envelope } from 'txpost'

const env = Envelope.build({ payload: payloadCbor })

// Sign the payload with a bsv KeyPair
env.sign(keyPair)

// Signed payloads can be verified
env.verify() // => true

// CBOR encode the envelope for sending to other parties
const envCbor = env.encode() // => ArrayBuffer
```

## License

Txpost is open source and released under the [Apache-2 License](https://github.com/libitx/txpost-js/blob/master/LICENSE).

© Copyright 2021 Chronos Labs Ltd.