import is, { Primitive } from '@sindresorhus/is'

type PlainObject = Record<string, unknown>
type Plain = Primitive | Plain[] | PlainObject

export function toPlainObject(from: unknown): Plain {
  if (is.primitive(from)) {
    return from
  }

  if (is.arrayLike(from)) {
    // Set/Map is not array like
    return Array.from(from).map((v) => toPlainObject(v))
  }

  if (is.map(from)) {
    const plain: PlainObject = {}
    from.forEach((val, key) => {
      if (!is.string(key)) {
        throw new Error(`Map key must be string, but ${key}`)
      }
      plain[key] = val
    })
    return plain
  }

  if (is.set(from)) {
    return Array.from(from.values()).map((v) => toPlainObject(v))
  }

  if (is.object(from)) {
    return Object.entries(from).reduce((plain: PlainObject, [key, val]) => {
      plain[key] = toPlainObject(val)
      return plain
    }, {})
  }

  throw new Error(`Unknown type. Add if statement. typeof: ${typeof from}`)
}
