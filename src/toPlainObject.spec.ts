import {
  Middleware,
  NextChain,
  objectToPlainObject,
  PlainObject,
  toPlainObject as to,
  ToPlainObjectCallback,
} from './toPlainObject'
import is from '@sindresorhus/is'

class MyPost {
  title: string

  constructor(title: string) {
    this.title = title
  }
}

class MyUserHasPost {
  _id: number
  name: string
  comments: string[]
  posts: MyPost[]

  constructor(id: number, name: string, comments: string[], posts: MyPost[]) {
    this._id = id
    this.name = name
    this.comments = comments
    this.posts = posts
  }
}

class MySimpleUser {
  _id: number
  name: string

  constructor(id: number, name: string) {
    this._id = id
    this.name = name
  }
}

describe('not change value', () => {
  test.each([
    [null, null],
    [undefined, undefined],
    [0, 0],
    [-1, -1],
    [1, 1],
    [1.1, 1.1],
    ['mike', 'mike'],
    [true, true],
  ])('primitive', (input, expected) => {
    const result = to(input)
    expect(result).toStrictEqual(expected)
  })

  test.each([[[]], [[1]], [['a', 'b']]])('array', (input) => {
    expect(to(input)).toStrictEqual(input)
  })

  test.each([[{}], [{ 0: 'v' }], [{ name: 'mike', age: 19 }]])(
    'plain object',
    (input) => {
      const result = to(input)
      expect(result).toStrictEqual(input)
    }
  )

  it('class', () => {
    const user = new MyUserHasPost(
      1,
      'mike',
      ['c1', 'c2'],
      [new MyPost('p1'), new MyPost('p2')]
    )
    expect(to(user)).toStrictEqual({
      _id: 1,
      name: 'mike',
      comments: ['c1', 'c2'],
      posts: [{ title: 'p1' }, { title: 'p2' }],
    })
  })
})

describe('serializing builtin object', () => {
  it('Map', () => {
    // Use set method because get warning when type of arguments are not same.
    let map = new Map()
    map.set('name', 'mike')
    map.set('age', 10)
    expect(to(map)).toStrictEqual({ name: 'mike', age: 10 })

    map = new Map()
    map.set('k', 'v')
    map.set('k', 'v')
    expect(to(map)).toStrictEqual({ k: 'v' })
  })

  it('Set', () => {
    let set = new Set<string | number>([])
    expect(to(set)).toStrictEqual([])

    set = new Set([1, 'v'])
    expect(to(set)).toStrictEqual([1, 'v'])

    set = new Set([1, 'v', 1])
    expect(to(set)).toStrictEqual([1, 'v'])
  })
})

describe('callback', () => {
  it('objectToPlainObject', () => {
    const user = new MySimpleUser(1, 'mike')

    const callback: ToPlainObjectCallback = (
      plain: PlainObject,
      key: string,
      val: unknown
    ) => {
      if (key.match(/^_/)) {
        return plain
      }
      plain[key] = val
      return plain
    }

    const filterUnderscoreProperty: Middleware = (
      value: unknown,
      next: NextChain
    ) => {
      if (!is.object(value)) {
        return next(value)
      }
      return objectToPlainObject(value, callback)
    }

    const plain = to(user, { middlewares: [filterUnderscoreProperty] })
    expect(plain).toStrictEqual({ name: 'mike' })
  })

  it('middleware order', () => {
    const middleware1: Middleware = (value: unknown, next: NextChain) => {
      value += '1'
      return next(value)
    }
    const middleware2: Middleware = (value: unknown, next: NextChain) => {
      value += '2'
      return next(value)
    }

    const plain = to('0', { middlewares: [middleware1, middleware2] })
    expect(plain).toStrictEqual('012')
  })
})
