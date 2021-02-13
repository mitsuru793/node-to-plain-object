import { toPlainObject as to } from './toPlainObject'

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

class MyPost {
  title: string

  constructor(title: string) {
    this.title = title
  }
}

class MyUser {
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

it('class', () => {
  const user = new MyUser(
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
