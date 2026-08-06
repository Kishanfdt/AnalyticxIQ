import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImportService } from '../services/import.service.js';
import { prisma } from '../prisma/index.js';

// Define hoisted mocks (must be prefixed with "mock")
const mockTxCategoryFindFirst = vi.fn();
const mockTxCategoryCreate = vi.fn();
const mockTxProductCreate = vi.fn();
const mockTxProductUpdate = vi.fn();
const mockTxSaleCreate = vi.fn();

const mockTx = {
  category: {
    findFirst: mockTxCategoryFindFirst,
    create: mockTxCategoryCreate,
  },
  product: {
    create: mockTxProductCreate,
    update: mockTxProductUpdate,
  },
  sale: {
    create: mockTxSaleCreate,
  },
};

vi.mock('../prisma/index.js', () => {
  return {
    prisma: {
      product: {
        findMany: vi.fn(),
      },
      customer: {
        findMany: vi.fn(),
      },
      $transaction: vi.fn(async (callback) => callback(mockTx)),
    },
  };
});

describe('ImportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  describe('importSales', () => {
    it('should successfully import sales and decrement stock if stock is sufficient', async () => {
      // Mock db customers and products
      vi.mocked(prisma.customer.findMany).mockResolvedValue([
        { id: 'cust-1', name: 'John Doe', email: 'john@example.com', businessId: 'biz-1' },
      ] as any);

      vi.mocked(prisma.product.findMany).mockResolvedValue([
        { id: 'prod-1', sku: 'SKU-1', name: 'Product A', price: 10, stock: 10, businessId: 'biz-1' },
      ] as any);

      const mockRows = [
        {
          customerEmail: 'john@example.com',
          customerName: 'John Doe',
          productSku: 'SKU-1',
          quantity: '3',
          discount: '0',
          saleDate: '2026-08-06',
        },
      ];

      const result = await ImportService.importSales('biz-1', mockRows);

      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(1);
      expect(mockTxProductUpdate).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { stock: { decrement: 3 } },
      });
      expect(mockTxSaleCreate).toHaveBeenCalled();
    });

    it('should fail import if stock is insufficient', async () => {
      vi.mocked(prisma.customer.findMany).mockResolvedValue([
        { id: 'cust-1', name: 'John Doe', email: 'john@example.com', businessId: 'biz-1' },
      ] as any);

      vi.mocked(prisma.product.findMany).mockResolvedValue([
        { id: 'prod-1', sku: 'SKU-1', name: 'Product A', price: 10, stock: 2, businessId: 'biz-1' },
      ] as any);

      const mockRows = [
        {
          customerEmail: 'john@example.com',
          customerName: 'John Doe',
          productSku: 'SKU-1',
          quantity: '3', // requested 3, stock is 2
          discount: '0',
          saleDate: '2026-08-06',
        },
      ];

      const result = await ImportService.importSales('biz-1', mockRows);

      expect(result.success).toBe(false);
      expect(result.importedCount).toBe(0);
      expect(result.invalidRows).toHaveLength(1);
      expect(result.invalidRows[0].reason).toContain('Insufficient stock');
      expect(mockTxProductUpdate).not.toHaveBeenCalled();
      expect(mockTxSaleCreate).not.toHaveBeenCalled();
    });

    it('should validate cumulative quantity of the same product in a single CSV file', async () => {
      vi.mocked(prisma.customer.findMany).mockResolvedValue([
        { id: 'cust-1', name: 'John Doe', email: 'john@example.com', businessId: 'biz-1' },
      ] as any);

      vi.mocked(prisma.product.findMany).mockResolvedValue([
        { id: 'prod-1', sku: 'SKU-1', name: 'Product A', price: 10, stock: 5, businessId: 'biz-1' },
      ] as any);

      const mockRows = [
        {
          customerEmail: 'john@example.com',
          customerName: 'John Doe',
          productSku: 'SKU-1',
          quantity: '3',
          discount: '0',
          saleDate: '2026-08-06',
        },
        {
          customerEmail: 'john@example.com',
          customerName: 'John Doe',
          productSku: 'SKU-1',
          quantity: '3', // Total: 6, but stock is 5
          discount: '0',
          saleDate: '2026-08-06',
        },
      ];

      const result = await ImportService.importSales('biz-1', mockRows);

      expect(result.success).toBe(false);
      expect(result.importedCount).toBe(0);
      expect(result.invalidRows).toHaveLength(1);
      expect(result.invalidRows[0].reason).toContain('Insufficient stock');
      expect(mockTxProductUpdate).not.toHaveBeenCalled();
    });
  });
});
