import { createRegistry, RegistryError } from '..';

type Item = { kind: string; label: string };

const make = () => createRegistry<Item>('TestRegistry', item => item.kind);

describe('createRegistry', () => {
  it('starts empty', () => {
    const registry = make();
    expect(registry.keys()).toEqual([]);
    expect(registry.list()).toEqual([]);
    expect(registry.has('logic')).toBe(false);
    expect(registry.get('logic')).toBeUndefined();
  });

  it('registers and returns items by key, in registration order', () => {
    const registry = make();
    registry.register({ kind: 'logic', label: 'Logic' });
    registry.register({ kind: 'knowledge', label: 'Knowledge' });
    expect(registry.keys()).toEqual(['logic', 'knowledge']);
    expect(registry.require('knowledge').label).toBe('Knowledge');
  });

  it('rejects a duplicate key', () => {
    const registry = make();
    registry.register({ kind: 'logic', label: 'Logic' });
    expect(() => registry.register({ kind: 'logic', label: 'Again' })).toThrow(RegistryError);
    expect(() => registry.register({ kind: 'logic', label: 'Again' })).toThrow(
      'TestRegistry: "logic" is already registered',
    );
  });

  it('throws on require for an unknown key', () => {
    expect(() => make().require('weekly')).toThrow('TestRegistry: "weekly" is not registered');
  });

  it('returns copies, so callers cannot mutate the registry', () => {
    const registry = make();
    registry.register({ kind: 'logic', label: 'Logic' });
    registry.list().pop();
    registry.keys().pop();
    expect(registry.keys()).toEqual(['logic']);
  });
});
