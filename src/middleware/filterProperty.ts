import {
  Middleware,
  NextChain,
  objectToPlainObject,
  Plain,
  PlainObject,
  ToPlainObjectCallback,
} from '../toPlainObject'
import is from '@sindresorhus/is'

export const filterProperty = (regex: RegExp): Middleware => {
  const callback: ToPlainObjectCallback = (
    plain: PlainObject,
    key: string,
    val: unknown
  ) => {
    if (regex.exec(key)) {
      return plain
    }
    plain[key] = val
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
