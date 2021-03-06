import { Middleware, NextChain, toPlainObject as to } from './toPlainObject'

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

  describe('Date', () => {
    it('default', () => {
      const date = new Date('2020/12/20')
      expect(to(date)).toStrictEqual('2020-12-19T15:00:00.000Z')
    })

    it('change format with options', () => {
      const date = new Date('2020/12/20')
      const options = {
        formatDate: (d: Date) =>
          `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
      }
      expect(to(date, options)).toStrictEqual('2020-12-20')
    })
  })
})

describe('expand property', () => {
  it('expand only matched', () => {
    const name = {
      id: 1,
      props: {
        name: 'mike',
      },
    }
    const ops = { expandProperty: 'props' }
    expect(to(name, ops)).toStrictEqual({ id: 1, name: 'mike' })
  })

  it('expand deeply', () => {
    const name = {
      props: {
        props: {
          name: 'mike',
        },
      },
    }
    const ops = { expandProperty: 'props' }
    expect(to(name, ops)).toStrictEqual({ name: 'mike' })
  })

  it('expand in array', () => {
    const user = {
      posts: [
        {
          props: {
            title: 'hello',
          },
        },
      ],
    }
    const ops = { expandProperty: 'props' }
    expect(to(user, ops)).toStrictEqual({
      posts: [{ title: 'hello' }],
    })
  })
})

describe('filter property', () => {
  it('match string exactly', () => {
    const user = {
      _id: 1,
      name: 'mike',
    }
    const ops = { filterProperty: '_id' }
    expect(to(user, ops)).toStrictEqual({ name: 'mike' })
  })

  it('match regexp', () => {
    const user = {
      _id: 1,
      _age: 19,
      name: 'mike',
    }
    const ops = { filterProperty: /^_.+/ }
    expect(to(user, ops)).toStrictEqual({ name: 'mike' })
  })
})

describe('callback', () => {
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

  it('middlewares are empty', () => {
    // check that middlewares are clone when it's passed deeply
    const plain = to({ name: 'mike' }, { middlewares: [] })
    expect(plain).toStrictEqual({ name: 'mike' })
  })
})
