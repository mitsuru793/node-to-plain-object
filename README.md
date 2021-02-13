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
toPlainObject(user)
// {_id: 1, 'mike'}
```
