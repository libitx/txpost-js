import { assert } from 'chai'
import { Payload } from '../src/index'

const rawtx = new Uint8Array([1, 0, 0, 0, 0, 0, 0, 0, 0, 0])
const cborPayload = new Uint8Array([
  161, 100, 100, 97, 116, 97, 161, 101, 114, 97, 119, 116, 120, 74, 1, 0, 0, 0,
  0, 0, 0, 0, 0, 0
])
const cborPayloadMulti = new Uint8Array([
  161, 100, 100, 97, 116, 97, 130, 161, 101, 114, 97, 119, 116, 120, 74, 1, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 161, 101, 114, 97, 119, 116, 120, 74, 1, 0, 0, 0, 0,
  0, 0, 0, 0, 0
])


describe('Payload.build()', () => {
  it('builds payload from given params', () => {
    const payload = Payload.build({ data: { rawtx, foo: 'bar' }})
    assert.equal(payload.data.foo, 'bar')
    assert.equal(payload.data.rawtx, rawtx)
  })

  it('builds payload when data param is array', () => {
    const payload = Payload.build({ data: [{ rawtx }, { rawtx }]})
    assert.isTrue(Array.isArray(payload.data))
    assert.deepEqual(payload.data[0], { rawtx })
  })

  it('ignores other keys', () => {
    const payload = Payload.build({ data: { rawtx }, foo: 'bar' })
    assert.isUndefined(payload.foo)
  })

  it('validates params', () => {
    assert.throws(_ => Payload.build({}), 'Invalid param: data')
    assert.throws(_ => Payload.build({ data: 1 }), 'Invalid param: data')
    assert.throws(_ => Payload.build({ data: { rawtx }, meta: 1 }), 'Invalid param: meta')
  })
})


describe('Payload.decode()', () => {
  it('decodes valid CBOR buffer into payload', () => {
    const payload = Payload.decode(cborPayload)
    assert.deepEqual(payload.data, { rawtx })
  })

  it('decodes valid CBOR buffer with data array into payload', () => {
    const payload = Payload.decode(cborPayloadMulti)
    assert.isTrue(Array.isArray(payload.data))
    assert.deepEqual(payload.data[0], { rawtx })
  })

  it('throws error with invalid cbor payload', () => {
    assert.throws(_ => Payload.decode(new Uint8Array([0, 1, 2, 3])), 'Remaining bytes')
  })
})


describe('Payload#encode()', () => {
  it('encodes payload into CBOR buffer', () => {
    const payload = Payload.build({ data: { rawtx }})
    const buf = payload.encode()
    assert.deepEqual(new Uint8Array(buf), cborPayload)
  })
})


describe('Payload#toJSON()', () => {
  it('returns instance as plain oblect', () => {
    const payload = Payload.build({ data: { rawtx, foo: 'bar' }, meta: { a: 1 }})
    const json = payload.toJSON()
    assert.instanceOf(payload, Payload)
    assert.instanceOf(json, Object)
    assert.deepEqual(json, {
      data: { rawtx, foo: 'bar' },
      meta: { a: 1 }
    })
  })
})