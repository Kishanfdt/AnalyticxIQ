import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImportService } from '../services/import.service.js';
import { prisma } from '../prisma/index.js';

vi.mock('../prisma/index.js', () => {
  const mockTx = {
    category: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    product: {
      create: vi.fn(),
    },
  };

  return {
    prisma: {
      product: {
        findMany: vi.fn(),
      },
      $transaction: vi.fn((callback) => callback(mockTx)),
    },
  };
});

describe('ImportService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('importProducts', () => {
    it('should report invalid rows for products with missing sku or name', async () => {
      vi.mocked(prisma.product.findMany).mockResolvedValue([]);

      const mockRows = [
        { sku: '', name: 'Test Product 1', price: '10.99' }, // missing SKU
        { sku: 'SKU-001', name: '', price: '15.50' }, // missing name
        { sku: 'SKU-002', name: 'Product 2', price: '-5.00' }, // negative price
      ];

      const result = await ImportService.importProducts('business-123', mockRows);

      expect(result.success).toBe(false);
      expect(result.invalidRows).toHaveLength(3);
      expect(result.invalidRows[0].reason).toContain('SKU');
      expect(result.invalidRows[1].reason).toContain('name');
      expect(result.invalidRows[2].reason).toContain('Price');
    });

    it('should successfully parse and insert valid product rows', async () => {
      vi.mocked(prisma.product.findMany).mockResolvedValue([]);

      const mockRows = [{ sku: 'SKU-OK-1', name: 'Perfect Product', price: '12.00' }];

      const result = await ImportService.importProducts('business-123', mockRows);

      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(1);
    });
  });
});
