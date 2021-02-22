import is, { Primitive } from '@sindresorhus/is'

export type PlainObject = Record<string, unknown>
export type Plain = Primitive | Plain[] | PlainObject

function isRecord(value: unknown): value is Record<string, unknown> {
  return is.object(value)
}

function objectToPlainObject(from: PlainObject, options: Options): PlainObject {
  return Object.entries(from).reduce(
    (plain: PlainObject, [key, val]: [string, unknown]) => {
      if (options.filterProperty && key.match(options.filterProperty)) {
        return plain
      }

      const got = toPlainObject(val, options)
      if (!isRecord(got)) {
        plain[key] = got
        return plain
      }

      if (options.expandProperty && key.match(options.expandProperty)) {
        plain = { ...plain, ...got }
        return plain
      }

      plain[key] = got
      return plain
    },
    {}
  )
}

export type NextChain = (from: unknown) => Plain
export type Middleware = (from: unknown, next: NextChain) => Plain

export interface Options {
  middlewares?: Middleware[]
  expandProperty?: string
  filterProperty?: string | RegExp
  formatDate?: (date: Date) => string
}

function runMiddleware(
  firstArg: unknown,
  middlewares: Middleware[],
  options: Options
): unknown {
  middlewares.push((from: unknown, next: NextChain) =>
    next(_toPlainObject(from, options))
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
    middlewares = options.middlewares.slice()
  } else {
    throw new Error('Middlewares must be Middleware[].')
  }
  return runMiddleware(from, middlewares, options) as Plain
}

function _toPlainObject(from: unknown, options: Options): Plain {
  if (is.primitive(from)) {
    return from
  }

  if (is.arrayLike(from)) {
    // Set/Map is not array like
    return Array.from(from).map((v) => toPlainObject(v, options))
  }

  if (is.map(from)) {
    return objectToPlainObject(Object.fromEntries(from), options)
  }

  if (is.set(from)) {
    return Array.from(from.values()).map((v) => toPlainObject(v, options))
  }

  if (is.date(from)) {
    if (!options.formatDate) {
      return from.toISOString()
    }
    return options.formatDate(from)
  }

  if (is.object(from)) {
    return objectToPlainObject(from as PlainObject, options)
  }

  throw new Error(`Unknown type. Add if statement. typeof: ${typeof from}`)
}
