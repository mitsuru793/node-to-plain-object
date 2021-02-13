import is, { Primitive } from '@sindresorhus/is'

type PlainObject = Record<string, unknown>
type Plain = Primitive | Plain[] | PlainObject

type ObjectRecord = Record<string, unknown>

type ToPlainObjectCallback = (
  plain: PlainObject,
  key: string,
  val: unknown
) => PlainObject

const toPlainObjectCallback: ToPlainObjectCallback = (
  plain: PlainObject,
  key: string,
  val: unknown
) => {
  plain[key] = toPlainObject(val)
  return plain
}

function arrayLikeToPlain(from: ArrayLike<unknown>): Plain[] {
  // Set/Map is not array like
  return Array.from(from).map((v) => toPlainObject(v))
}

function objectToPlainObject(
  from: ObjectRecord,
  callback: ToPlainObjectCallback = toPlainObjectCallback
): PlainObject {
  return Object.entries(from).reduce((plain: PlainObject, [key, val]) => {
    return callback(plain, key, val)
  }, {})
}

function mapToPlainObject(
  from: Map<unknown, unknown>,
  callback: ToPlainObjectCallback = toPlainObjectCallback
): PlainObject {
  let plain: PlainObject = {}
  from.forEach((val, key) => {
    if (!is.string(key)) {
      throw new Error(`Map key must be string, but ${key}`)
    }
    plain = callback(plain, key, val)
  })
  return plain
}

function setToPlain(from: Set<unknown>): Plain[] {
  return Array.from(from.values()).map((v) => toPlainObject(v))
}

export function toPlainObject(from: unknown): Plain {
  if (is.primitive(from)) {
    return from
  }

  if (is.arrayLike(from)) {
    // Set/Map is not array like
    return arrayLikeToPlain(from)
  }

  if (is.map(from)) {
    return mapToPlainObject(from)
  }

  if (is.set(from)) {
    return setToPlain(from)
  }

  if (is.object(from)) {
    return objectToPlainObject(from as ObjectRecord)
  }

  throw new Error(`Unknown type. Add if statement. typeof: ${typeof from}`)
}
