import { Buffer } from 'buffer'
import { CBOR } from 'cbor-redux'
import { Ecdsa, Hash, PubKey, Sig } from 'bsv'
import Payload from './payload'

/**
 * CBOR Envelope class, implements BRFC `5b82a2ed7b16` ([CBOR Tx Envelope](https://github.com/libitx/txpost/blob/master/brfc-specs/cbor-tx-envelope.md)).
 * 
 * BRFC `5b82a2ed7b16` defines a standard for serializing a CBOR payload in
 * order to have consistnency when signing the payload with a ECDSA keypair.
 */
class Envelope {
  /**
   * Instantiates a new Envelope instance.
   * 
   * The accepted params are:
   * 
   * * `payload` - CBOR-encoded buffer
   * * `pubkey` - Bitcoin public key as a raw Buffer
   * * `signature` - ECDSA signature as a raw Buffer
   * 
   * @param {Object} params
   * @constructor
   */
  constructor(params = {}) {
    this.payload = params.payload
    this.pubkey = params.pubkey
    this.signature = params.signature
    validate(this)
  }

  /**
   * Builds a new Envelope instance from the given params.
   * 
   * The accepted params are:
   * 
   * * `payload` - CBOR-encoded buffer
   * * `pubkey` - Bitcoin public key as a raw buffer
   * * `signature` - ECDSA signature as a raw buffer
   * 
   * @param {Object} params
   * @constructor
   */
  static build(params = {}) {
    return new this(params)
  }

  /**
   * Decodes the given CBOR buffer and builds a new Envelope instance.
   * 
   * @param {ArrayBuffer | Buffer | Uint8Array} data
   * @constructor
   */
  static decode(data) {
    const buffer = data.buffer ?
      data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) :
      data;
    const params = CBOR.decode(buffer)
    return this.build(params)
  }

  /**
   * Decodes the Envelope's payload.
   * 
   * @return {Payload}
   */
  decodePayload() {
    return Payload.decode(this.payload)
  }

  /**
   * Encodes the Envelope as a CBOR buffer.
   * 
   * @return {ArrayBuffer}
   */
  encode() {
    const json = this.toJSON()
    return CBOR.encode(json)
  }

  /**
   * Encodes the Envelope as a JSON object with blank attributes removed.
   * 
   * @return {Object}
   */
  toJSON() {
    return ['payload', 'pubkey', 'signature']
      .filter(key => !!this[key])
      .reduce((json, key) => {
        json[key] = this[key]
        return json
      }, {})
  }

  /**
   * Signs the Envelope's payload with the given KeyPair.
   * 
   * @param {KeyPair} keyPair
   * @return {Envelope}
   */
  sign(keyPair) {
    const hashBuf = Hash.sha256(Buffer.from(this.payload))
    this.signature = Ecdsa.sign(hashBuf, keyPair).toBuffer()
    this.pubkey = keyPair.pubKey.toBuffer()
    return this
  }

  /**
   * Verifies the Envelope's signature against its payload and public key.
   * 
   * @return {Boolean}
   */
  verify() {
    if (!this.pubkey || !this.signature) return false;
    let pubkey, signature
    const hashBuf = Hash.sha256(Buffer.from(this.payload))

    try {
      pubkey = PubKey.fromBuffer(Buffer.from(this.pubkey))
      signature = Sig.fromBuffer(Buffer.from(this.signature))
    } catch(e) {
      return false
    }
    
    return Ecdsa.verify(hashBuf, signature, pubkey)
  }
}

// Validates the Envelope's parameters
function validate(env) {
  if (!env.payload || !isBuffer(env.payload)) throw 'Invalid param: payload';
  if (env.pubkey && !isBuffer(env.pubkey)) throw 'Invalid param: pubkey';
  if (env.signature && !isBuffer(env.signature)) throw 'Invalid param: signature';
}

// Type checks the given value is a buffer
function isBuffer(val) {
  return (val instanceof Uint8Array ||
          val instanceof ArrayBuffer ||
          Buffer.isBuffer(val))
}

export default Envelope