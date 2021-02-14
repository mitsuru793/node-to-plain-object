import { toPlainObject as to } from '../toPlainObject'
import { filterProperty } from './filterProperty'

it('remove properties matched pattern', () => {
  const user = {
    _id: 1,
    _cache: 'cache',
    name: 'mike',
    age: 20,
  }
  const plain = to(user, {
    middlewares: [filterProperty(/^_/)],
  })
  expect(plain).toStrictEqual({ name: 'mike', age: 20 })
})
