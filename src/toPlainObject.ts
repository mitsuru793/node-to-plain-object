import is, { Primitive } from '@sindresorhus/is'

export type PlainObject = Record<string, unknown>
export type Plain = Primitive | Plain[] | PlainObject

// The return type of is.object method in @sindresorhus/is is object.
// eslint-disable-next-line
export type ObjectRecord = Record<string, unknown> | object

export type ToPlainObjectCallback = (
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

export function arrayLikeToPlain(from: ArrayLike<unknown>): Plain[] {
  // Set/Map is not array like
  return Array.from(from).map((v) => toPlainObject(v))
}

export function objectToPlainObject(
  from: ObjectRecord,
  callback: ToPlainObjectCallback = toPlainObjectCallback
): PlainObject {
  return Object.entries(from).reduce((plain: PlainObject, [key, val]) => {
    return callback(plain, key, val)
  }, {})
}

export function mapToPlainObject(
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

export function setToPlain(from: Set<unknown>): Plain[] {
  return Array.from(from.values()).map((v) => toPlainObject(v))
}

export type NextChain = (from: unknown) => Plain
export type Middleware = (from: unknown, next: NextChain) => Plain

export interface Options {
  middlewares?: Middleware[]
}

function runMiddleware(firstArg: unknown, middlewares: Middleware[]): unknown {
  middlewares.push((from: unknown, next: NextChain) =>
    next(_toPlainObject(from))
  )

  const run = (current: number, from: unknown): Plain => {
    const middleware = middlewares[current]
    if (!middleware) {
      return from as Plain
    }

    const next = (from: unknown): Plain => {
      return run(current + 1, from)
    }
    return middleware(from, next)
  }
  return run(0, firstArg)
}

export function toPlainObject(from: unknown, options: Options = {}): Plain {
  let middlewares: Middleware[]
  if (is.nullOrUndefined(options.middlewares)) {
    middlewares = []
  } else if (is.array(options.middlewares)) {
    middlewares = options.middlewares
  } else {
    throw new Error('Middlewares must be Middleware[].')
  }
  return runMiddleware(from, middlewares) as Plain
}

function _toPlainObject(from: unknown): Plain {
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
