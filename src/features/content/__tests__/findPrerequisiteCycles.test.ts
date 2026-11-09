import { findPrerequisiteCycles } from '../services/catalog/findPrerequisiteCycles';

const graph = (edges: Record<string, string[]>) => new Map(Object.entries(edges));

describe('findPrerequisiteCycles', () => {
  it('finds nothing in an acyclic graph', () => {
    expect(findPrerequisiteCycles(graph({ a: ['b'], b: ['c'], c: [] }))).toEqual([]);
  });

  it('finds a self-reference', () => {
    expect(findPrerequisiteCycles(graph({ a: ['a'] }))).toEqual([['a']]);
  });

  it('finds a longer cycle once', () => {
    expect(findPrerequisiteCycles(graph({ a: ['b'], b: ['c'], c: ['a'] }))).toEqual([
      ['a', 'b', 'c'],
    ]);
  });

  it('finds separate cycles', () => {
    const cycles = findPrerequisiteCycles(graph({ a: ['b'], b: ['a'], x: ['y'], y: ['x'] }));
    expect(cycles).toHaveLength(2);
  });

  it('ignores edges to nodes that are not in the graph', () => {
    expect(findPrerequisiteCycles(graph({ a: ['missing'] }))).toEqual([]);
  });
});
