import {
  Middleware,
  NextChain,
  Plain,
  toPlainObject as to,
} from '../toPlainObject'
import { expandProperty } from './expandProperty'
import is from '@sindresorhus/is'

it('expand properties only matched pattern', () => {
  const user = {
    id: 1,
    props: {
      name: 'mike',
      age: 20,
    },
  }
  const plain = to(user, {
    middlewares: [expandProperty(/^props$/)],
  })
  expect(plain).toStrictEqual({ id: 1, name: 'mike', age: 20 })
})

it('process expanded value', () => {
  const user = {
    props: {
      age: 20,
    },
  }

  const hasAge = (value: any): value is { age: number } => {
    return Object.defineProperty(value, 'age', {})
  }

  const addAge: Middleware = (value: unknown, next: NextChain): Plain => {
    if (!is.object(value)) {
      return next(value)
    }
    if (!hasAge(value)) {
      return next(value)
    }
    value.age += 1
    return next(value)
  }

  const plain = to(user, {
    middlewares: [expandProperty(/^props$/), addAge],
  })
  expect(plain).toStrictEqual({ age: 21 })
})
