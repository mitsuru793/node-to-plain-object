import {
  Middleware,
  NextChain,
  objectToPlainObject,
  Plain,
  PlainObject,
  ToPlainObjectCallback,
} from '../toPlainObject'
import is from '@sindresorhus/is'

export const expandProperty = (regex: RegExp): Middleware => {
  const callback: ToPlainObjectCallback = (
    plain: PlainObject,
    key: string,
    val: unknown
  ) => {
    if (!regex.exec(key) || !is.object(val)) {
      return plain
    }

    for (const [k, v] of Object.entries(val)) {
      plain[k] = v
    }
    return plain
  }

  return (value: unknown, next: NextChain): Plain => {
    if (!is.object(value)) {
      return next(value)
    }
    const plain = objectToPlainObject(value, callback)
    return next(plain)
  }
}
