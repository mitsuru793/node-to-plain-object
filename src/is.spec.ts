import is from '@sindresorhus/is'

describe('ensure @sindresorhus/is', () => {
  it('is.object', () => {
    expect(is.object([])).toBeTruthy()
    expect(is.object(new Map())).toBeTruthy()
  })

  it('is.primitive', () => {
    expect(is.primitive([])).toBeFalsy()
  })

  it('is.iterable', () => {
    expect(is.iterable({ name: 'mike' })).toBeFalsy()
    expect(is.iterable(new Set())).toBeTruthy()
  })

  it('is.arrayLike', () => {
    expect(is.arrayLike([])).toBeTruthy()
    expect(is.arrayLike(new Set())).toBeFalsy()
    expect(is.arrayLike(new Map())).toBeFalsy()
  })
})
