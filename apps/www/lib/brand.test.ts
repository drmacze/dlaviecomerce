import { brandName, brandTagline } from './brand';

describe('Dlavie brand constants', () => {
  it('keeps the parent brand identity stable', () => {
    expect(brandName).toBe('Dlavie');
    expect(brandTagline).toBe('Digital life, simplified.');
  });
});
