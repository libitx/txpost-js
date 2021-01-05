import { Buffer } from 'buffer'
import { CBOR } from 'cbor-redux'

/**
 * Request payload class, implements BRFC `c9a2975b3d19` ([CBOR Tx Payload](https://github.com/libitx/txpost/blob/master/brfc-specs/cbor-tx-payload.md)).
 * 
 * BRFC `c9a2975b3d19` defines a simple structure for encoding a raw Bitcoin
 * transaction alongside arbitrary data attributes and meta data in a CBOR
 * encoded binary.
 */
class Payload {
  /**
   * Instantiates a new Payload instance.
   * 
   * The accepted params are:
   * 
   * * `data` - Object containing `rawtx` buffer and any other parameters
   * * `meta` - Optional object containing any arbitrary parameters
   * 
   * @param {Object} params
   * @constructor
   */
  constructor(params = {}) {
    this.data = params.data || {}
    this.meta = params.meta || {}
    validate(this)
  }

  /**
   * Builds a new Payload instance from the given params.
   * 
   * The accepted params are:
   * 
   * * `data` - Object containing `rawtx` buffer and any other parameters
   * * `meta` - Optional object containing any arbitrary parameters
   * 
   * @param {Object} params
   * @constructor
   */
  static build(params = {}) {
    return new this(params)
  }

  /**
   * Decodes the given CBOR buffer and builds a new Payload instance.
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
   * Encodes the Payload as a CBOR buffer.
   * 
   * @return {ArrayBuffer}
   */
  encode() {
    const json = this.toJSON()
    return CBOR.encode(json)
  }

  /**
   * Encodes the Payload as a JSON object with empty attributes removed.
   * 
   * @return {Object}
   */
  toJSON() {
    return ['data', 'meta']
      .filter(key => !isEmpty(this[key]))
      .reduce((json, key) => {
        json[key] = this[key]
        return json
      }, {})
  }
}

// Validates the Payloads's parameters
function validate(payload) {
  if (
    !(payload.data.constructor === Object && isBuffer(payload.data.rawtx)) &&
    !(Array.isArray(payload.data) && payload.data.every(d => isBuffer(d.rawtx)))
  ) {
    throw 'Invalid param: data'
  }
  if (payload.meta && payload.meta.constructor !== Object) {
    throw 'Invalid param: meta'
  }
}

// Type checks the given value is a buffer
function isBuffer(val) {
  return (val instanceof Uint8Array ||
          val instanceof ArrayBuffer ||
          Buffer.isBuffer(val))
}

// Checks if the given object or array is empty
function isEmpty(val) {
  if (
    (val.constructor === Object && Object.keys(val).length === 0) ||
    (Array.isArray(val) && val.length === 0)
  ) {
    return true
  } else {
    return false
  }
}

export default Payload