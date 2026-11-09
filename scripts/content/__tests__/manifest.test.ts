import { renderManifest, toIdentifier } from '../manifest';

describe('toIdentifier', () => {
  it.each([
    ['logic-core.json', 'logicCore'],
    ['fullstack-backend-node.json', 'fullstackBackendNode'],
    ['react_extra.v2.json', 'reactExtraV2'],
    ['2026-pack.json', 'pack2026Pack'],
  ])('%s → %s', (file, identifier) => {
    expect(toIdentifier(file)).toBe(identifier);
  });
});

describe('renderManifest', () => {
  it('renders an empty list', () => {
    expect(renderManifest([])).toContain('export const bundledPacks: readonly unknown[] = [];');
  });

  it('imports every pack in sorted order', () => {
    const manifest = renderManifest(['logic-core.json', 'fullstack-go.json']);
    expect(manifest).toContain("import fullstackGo from './fullstack-go.json';");
    expect(manifest.indexOf('fullstackGo,')).toBeLessThan(manifest.indexOf('logicCore,'));
  });

  it('is stable, so --check can compare it byte for byte', () => {
    expect(renderManifest(['b.json', 'a.json'])).toBe(renderManifest(['a.json', 'b.json']));
  });
});
