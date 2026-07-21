// @ts-nocheck
/**
 * Contoh: Jest Elite Pattern (Unit Test murni tanpa koneksi database asli)
 * TDD Cycle: RED -> GREEN -> REFACTOR
 */

import { calculateDiscount } from '../services/discount.service';

describe('Discount Service', () => {

  // Skenario 1: Diskon normal
  it('seharusnya memberikan diskon 10% untuk pelanggan reguler', () => {
    // 1. ARRANGE (Siapkan data)
    const user = { role: 'REGULAR', points: 50 };
    const cartTotal = 100000;

    // 2. ACT (Jalankan fungsi)
    const finalPrice = calculateDiscount(user, cartTotal);

    // 3. ASSERT (Validasi ekspektasi)
    expect(finalPrice).toBe(90000);
  });

  // Skenario 2: Diskon khusus VIP
  it('seharusnya memberikan diskon 50% untuk VIP dengan poin > 100', () => {
    const user = { role: 'VIP', points: 150 };
    const cartTotal = 100000;

    const finalPrice = calculateDiscount(user, cartTotal);

    expect(finalPrice).toBe(50000);
  });

  // Skenario 3: Uji Batas Bawah (Edge Case)
  it('tidak boleh menghasilkan harga negatif meskipun diskon meluap', () => {
    const user = { role: 'GOD_MODE', points: 99999 };
    const cartTotal = 10000;

    const finalPrice = calculateDiscount(user, cartTotal);

    // Harga final tidak boleh lebih kecil dari 0
    expect(finalPrice).toBeGreaterThanOrEqual(0);
  });

});
