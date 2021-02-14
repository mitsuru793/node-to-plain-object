# to-pain-object

Convert value to plain object. It's useful in snapshot testing or creating json object.

You can filter out it with specified properties.

```typescript
class User {
  _id: number
  name: string

  constructor(id: number, name: string) {
    this._id = id
    this.name = name
  }
}

const user = new User(1, 'mike')
const plain = toPlainObject(user)
expect(plain).toStrictEqual({_id: 1, name: 'mike'})
```

## Options

### Middlewares

Hook both of before and after. 

You can call original process as exported functions in the followings.

* arrayLikeToPlain (from: ArrayLike<unknown>) => Plain[]
* setToPlain(from: Set<unknown>) => Plain[]
* mapToPlainObject(from: Map<unknown, unknown>, callback: ToPlainObjectCallback = toPlainObjectCallback) => PlainObject
* objectToPlainObject(from: ObjectRecord, callback: ToPlainObjectCallback = toPlainObjectCallback) => PlainObject

```typescript
class User {
  _id: number
  name: string

  constructor(id: number, name: string) {
    this._id = id
    this.name = name
  }
}

const user = new MySimpleUser(1, 'mike')

const callback: ToPlainObjectCallback = (plain: PlainObject, key: string, val: unknown) => {
  if (key.match(/^_/)) {
    return plain
  }
  plain[key] = val
  return plain
}

const filterUnderscoreProperty: Middleware = (value: unknown, next: NextChain) => {
  if (!is.object(value)) {
    return next(value)
  }
  return objectToPlainObject(value, callback)
}

const plain = toPlainObject(user, {middlewares: [filterUnderscoreProperty]})
expect(plain).toStrictEqual({name: 'mike'})
```

A Order of Middlewares is the following.

```typescript
const middleware1: Middleware = (value: unknown, next: NextChain) => {
  value += '1'
  return next(value)
}
const middleware2: Middleware = (value: unknown, next: NextChain) => {
  value += '2'
  return next(value)
}

const plain = to('0', {
  middlewares: [
    middleware1, // run at first
    middleware2, // run at second
  ]
})
expect(plain).toStrictEqual('012')
```

### Defined Middleware 

I provide some middlewares.

#### `filterProperty: (regex: RegExp) => Middleware`

If key matched regex, remove key and value from returned plain object.

#### `expandProperty: (regex: RegExp) => Middleware`

If property matches regex, move values of the property up to one.

```typescript
const user = {
  props: {
    name: 'mike',
    age: 20,
  }
}
const plain = to(user, {
 middlewares: [expandProperty(/^props$/)],
})
expect(plain).toStrictEqual({ name: 'mike', age: 20 })
```
