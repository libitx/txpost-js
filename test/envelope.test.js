import { assert } from 'chai'
import { KeyPair, PrivKey } from 'bsv'
import { Envelope } from '../src/index'

const rawtx = new Uint8Array([1, 0, 0, 0, 0, 0, 0, 0, 0, 0])
const payload = new Uint8Array([
  161, 100, 100, 97, 116, 97, 161, 101, 114, 97, 119, 116, 120, 74, 1, 0, 0, 0,
  0, 0, 0, 0, 0, 0
])
const cborEnvelope = new Uint8Array([
  162, 103, 112, 97, 121, 108, 111, 97, 100, 88, 24, 161, 100, 100, 97, 116, 97,
  161, 101, 114, 97, 119, 116, 120, 74, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 102, 112,
  117, 98, 107, 101, 121, 67, 97, 98, 99
])

const privKey = PrivKey.fromWif('L14RBs8jLFiMz8gRbnnVirCuqU9hAXKdpBTsmfpCjku5w5JcXvKJ')
const keyPair = KeyPair.fromPrivKey(privKey)


describe('Envelope.build()', () => {
  it('builds envelope from given params', () => {
    const pubkey = new Uint8Array([97, 98, 99])
    const env = Envelope.build({ payload, pubkey })
    assert.equal(env.payload, payload)
    assert.equal(env.pubkey, pubkey)
  })

  it('ignores other keys', () => {
    const env = Envelope.build({ payload, foo: 'bar' })
    assert.isUndefined(env.foo)
  })

  it('validates params', () => {
    assert.throws(_ => Envelope.build({}), 'Invalid param: payload')
    assert.throws(_ => Envelope.build({ payload, pubkey: 1 }), 'Invalid param: pubkey')
    assert.throws(_ => Envelope.build({ payload, signature: 1 }), 'Invalid param: signature')
  })
})


describe('Envelope.decode()', () => {
  it('decodes valid CBOR buffer into envelope', () => {
    const env = Envelope.decode(cborEnvelope)
    assert.deepEqual(env.payload, payload)
  })

  it('throws error with invalid cbor envelope', () => {
    assert.throws(_ => Envelope.decode(new Uint8Array([0, 1, 2, 3])), 'Remaining bytes')
  })
})


describe('Envelope.decodePayload()', () => {
  it('decodes valid CBOR buffer into envelope', () => {
    const env = Envelope.decode(cborEnvelope)
    const payload = env.decodePayload()
    assert.deepEqual(payload.data.rawtx, rawtx)
  })
})


describe('Envelope#encode()', () => {
  it('encodes envelope into CBOR buffer', () => {
    const pubkey = new Uint8Array([97, 98, 99])
    const env = Envelope.build({ payload, pubkey })
    const buf = env.encode()
    assert.deepEqual(new Uint8Array(buf), cborEnvelope)
  })
})


describe('Envelope#toJSON()', () => {
  it('returns instance as plain oblect', () => {
    const pubkey = new Uint8Array([97, 98, 99])
    const env = Envelope.build({ payload, pubkey })
    const json = env.toJSON()
    assert.instanceOf(env, Envelope)
    assert.instanceOf(json, Object)
    assert.deepEqual(json, { payload, pubkey })
  })
})


describe('Envelope#sign()', () => {
  it('signs payload and adds signature and pubkey to envelope', () => {
    const env = Envelope.build({ payload })
    env.sign(keyPair)
    assert.isDefined(env.pubkey)
    assert.isDefined(env.signature)
    assert.isTrue(env.verify())
  })
})

describe('Envelope#verify()', () => {
  const pubkey = new Uint8Array([
    3, 53, 230, 236, 108, 23, 137, 176, 135, 106, 12, 1, 117, 89, 207, 16, 73,
    77, 112, 189, 84, 33, 217, 82, 243, 239, 127, 158, 114, 186, 157, 47, 237
  ])
  const pk2 = new Uint8Array([
    2, 191, 198, 200, 103, 32, 252, 60, 22, 157, 186, 109, 178, 126, 223, 217,
    233, 196, 171, 116, 165, 101, 14, 35, 161, 247, 225, 153, 162, 245, 6, 190,
    194
  ])
  const signature = new Uint8Array([
    48, 68, 2, 32, 2, 214, 219, 161, 103, 184, 136, 185, 39, 226, 77, 25, 37,
    119, 139, 238, 192, 5, 21, 223, 144, 36, 213, 75, 70, 250, 56, 5, 117, 57,
    241, 167, 2, 32, 59, 99, 134, 117, 177, 215, 159, 163, 16, 46, 58, 115, 160,
    74, 140, 86, 134, 241, 163, 252, 99, 86, 152, 24, 148, 162, 129, 108, 219,
    42, 7, 57
  ])

  it('returns true when valid signature present', () => {
    const env = Envelope.build({ payload, pubkey, signature })
    assert.isTrue(env.verify())
  })

  it('returns false when invalid signature present', () => {
    const env = Envelope.build({ payload, pubkey, signature: new Uint8Array([1, 2, 3, 4]) })
    assert.isFalse(env.verify())
  })

  it('returns false when wrong pubkey present', () => {
    const env = Envelope.build({ payload, pubkey: pk2, signature })
    assert.isFalse(env.verify())
  })

  it('returns false when no sig or pubkey present', () => {
    const env = Envelope.build({ payload })
    assert.isFalse(env.verify())
  })
})