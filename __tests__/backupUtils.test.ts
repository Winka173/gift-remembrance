import { validateManifest } from '@/utils/backupUtils';

describe('validateManifest', () => {
  it('accepts a valid v2 manifest', () => {
    const manifest = {
      version: 2,
      createdAt: 1700000000000,
      appVersion: '1.0.0',
      deviceOs: 'ios',
      data: { people: [], gifts: [], occasions: [], settings: {} },
    };
    expect(validateManifest(manifest)).toBe(true);
  });

  it('rejects a v1 manifest (only v2 is currently valid)', () => {
    const manifest = {
      version: 1,
      createdAt: 1700000000000,
      data: { people: [], gifts: [], occasions: [], settings: {} },
    };
    expect(validateManifest(manifest)).toBe(false);
  });

  it('rejects null', () => {
    expect(validateManifest(null)).toBe(false);
  });

  it('rejects a manifest with a non-numeric createdAt', () => {
    const manifest = {
      version: 2,
      createdAt: 'not-a-number',
      data: {},
    };
    expect(validateManifest(manifest)).toBe(false);
  });

  it('rejects a manifest missing the data field', () => {
    const manifest = {
      version: 2,
      createdAt: 1700000000000,
    };
    expect(validateManifest(manifest)).toBe(false);
  });

  it('rejects a primitive (non-object) input', () => {
    expect(validateManifest('backup')).toBe(false);
    expect(validateManifest(42)).toBe(false);
    expect(validateManifest(undefined)).toBe(false);
  });
});
