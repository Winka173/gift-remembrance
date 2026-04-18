import {
  addToMultiIndex,
  removeFromMultiIndex,
  updateMultiIndex,
} from '@/utils/indexUtils';

describe('addToMultiIndex', () => {
  it('adds a record id under every person id key', () => {
    const result = addToMultiIndex({}, ['a', 'b'], 'gift1');
    expect(result).toEqual({ a: ['gift1'], b: ['gift1'] });
  });

  it('appends to existing keys rather than replacing', () => {
    const initial = { a: ['gift1'] };
    const result = addToMultiIndex(initial, ['a', 'b'], 'gift2');
    expect(result).toEqual({ a: ['gift1', 'gift2'], b: ['gift2'] });
  });

  it('returns a new object reference (immutability)', () => {
    const initial = { a: ['gift1'] };
    const result = addToMultiIndex(initial, ['a'], 'gift2');
    expect(result).not.toBe(initial);
  });
});

describe('removeFromMultiIndex', () => {
  it('removes a record id from every listed key', () => {
    const initial = { a: ['g1', 'g2'], b: ['g1'] };
    const result = removeFromMultiIndex(initial, ['a', 'b'], 'g1');
    expect(result).toEqual({ a: ['g2'], b: [] });
  });

  it('is a no-op for missing keys', () => {
    const initial = { a: ['g1'] };
    const result = removeFromMultiIndex(initial, ['missing'], 'g1');
    expect(result).toEqual({ a: ['g1'] });
  });

  it('returns a new object reference (immutability)', () => {
    const initial = { a: ['g1'] };
    const result = removeFromMultiIndex(initial, ['a'], 'g1');
    expect(result).not.toBe(initial);
  });
});

describe('updateMultiIndex', () => {
  it('removes from dropped keys, keeps shared keys, and adds to new keys', () => {
    const initial = { a: ['g1'], b: ['g1'] };
    const result = updateMultiIndex(initial, ['a', 'b'], ['b', 'c'], 'g1');
    expect(result.a).toEqual([]);
    expect(result.b).toEqual(['g1']);
    expect(result.c).toEqual(['g1']);
  });

  it('returns a new object reference (immutability)', () => {
    const initial = { a: ['g1'] };
    const result = updateMultiIndex(initial, ['a'], ['b'], 'g1');
    expect(result).not.toBe(initial);
  });
});
