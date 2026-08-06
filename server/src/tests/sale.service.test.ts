import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SaleService } from '../services/sale.service.js';
import { prisma } from '../prisma/index.js';
import { AppError } from '../utils/errors.js';

// Define hoisted mocks (must be prefixed with "mock")
const mockProductFindUnique = vi.fn();
const mockProductUpdate = vi.fn();
const mockSaleCreate = vi.fn();
const mockSaleFindUnique = vi.fn();
const mockSaleFindFirst = vi.fn();
const mockSaleUpdate = vi.fn();
const mockSaleDelete = vi.fn();
const mockSaleItemDeleteMany = vi.fn();

vi.mock('../prisma/index.js', () => {
  return {
    prisma: {
      customer: {
        findFirst: vi.fn(),
      },
      product: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      sale: {
        findFirst: vi.fn(),
      },
      $transaction: vi.fn(async (callback) => {
        const tx = {
          product: {
            findUnique: mockProductFindUnique,
            update: mockProductUpdate,
          },
          sale: {
            create: mockSaleCreate,
            findUnique: mockSaleFindUnique,
            findFirst: mockSaleFindFirst,
            update: mockSaleUpdate,
            delete: mockSaleDelete,
          },
          saleItem: {
            deleteMany: mockSaleItemDeleteMany,
          },
        };
        return callback(tx);
      }),
    },
  };
});

describe('SaleService - Stock Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSale', () => {
    it('should successfully create sale and decrement stock if stock is sufficient', async () => {
      // Mock Customer validation
      vi.mocked(prisma.customer.findFirst).mockResolvedValue({
        id: 'cust-1',
        name: 'John Doe',
        businessId: 'biz-1',
      } as any);

      // Mock Product service existence validation
      vi.mocked(prisma.product.findMany).mockResolvedValue([
        { id: 'prod-1', name: 'Product A', price: '10.00', stock: 10, businessId: 'biz-1' },
      ] as any);

      // Mock Product repository database fetch inside transaction
      mockProductFindUnique.mockResolvedValue({
        id: 'prod-1',
        name: 'Product A',
        price: '10.00',
        stock: 10,
        businessId: 'biz-1',
      });

      // Mock Sale creation return
      mockSaleCreate.mockResolvedValue({
        id: 'sale-1',
        customerId: 'cust-1',
        totalAmount: 20,
        items: [
          { productId: 'prod-1', quantity: 2, unitPrice: 10, discount: 0 },
        ],
      });

      const input = {
        customerId: 'cust-1',
        saleDate: new Date(),
        items: [
          { productId: 'prod-1', quantity: 2, discount: 0 },
        ],
      };

      const result = await SaleService.createSale('biz-1', input);

      expect(result.id).toBe('sale-1');
      expect(mockProductFindUnique).toHaveBeenCalledWith({ where: { id: 'prod-1' } });
      expect(mockProductUpdate).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { stock: { decrement: 2 } },
      });
      expect(mockSaleCreate).toHaveBeenCalled();
    });

    it('should throw AppError if stock is insufficient', async () => {
      // Mock Customer validation
      vi.mocked(prisma.customer.findFirst).mockResolvedValue({
        id: 'cust-1',
        name: 'John Doe',
        businessId: 'biz-1',
      } as any);

      // Mock Product service validation
      vi.mocked(prisma.product.findMany).mockResolvedValue([
        { id: 'prod-1', name: 'Product A', price: '10.00', stock: 1, businessId: 'biz-1' },
      ] as any);

      // Mock Product repository db fetch inside transaction
      mockProductFindUnique.mockResolvedValue({
        id: 'prod-1',
        name: 'Product A',
        price: '10.00',
        stock: 1,
        businessId: 'biz-1',
      });

      const input = {
        customerId: 'cust-1',
        saleDate: new Date(),
        items: [
          { productId: 'prod-1', quantity: 2, discount: 0 },
        ],
      };

      await expect(SaleService.createSale('biz-1', input)).rejects.toThrow(AppError);
      expect(mockProductUpdate).not.toHaveBeenCalled();
      expect(mockSaleCreate).not.toHaveBeenCalled();
    });
  });

  describe('updateSale', () => {
    it('should restore old stock first, then validate and deduct new stock during update', async () => {
      // Mock sale query inside SaleService.updateSale
      vi.mocked(prisma.sale.findFirst).mockResolvedValue({
        id: 'sale-1',
        customerId: 'cust-1',
        totalAmount: 10,
        items: [
          { productId: 'prod-1', quantity: 1, unitPrice: 10, discount: 0 },
        ],
      } as any);

      // Mock Customer check
      vi.mocked(prisma.customer.findFirst).mockResolvedValue({
        id: 'cust-1',
        name: 'John Doe',
        businessId: 'biz-1',
      } as any);

      // Mock Product check
      vi.mocked(prisma.product.findMany).mockResolvedValue([
        { id: 'prod-1', name: 'Product A', price: '10.00', stock: 5, businessId: 'biz-1' },
      ] as any);

      // Transaction operations mock:
      // 1. Get original sale in transaction
      mockSaleFindUnique.mockResolvedValue({
        id: 'sale-1',
        items: [
          { productId: 'prod-1', quantity: 1 },
        ],
      });

      // 2. Fetch product stock when validating new quantity of 3 (current stock is 5, but we revert 1 first, so stock will be updated)
      mockProductFindUnique.mockResolvedValue({
        id: 'prod-1',
        name: 'Product A',
        stock: 6, // 5 + 1 restored
      });

      mockSaleUpdate.mockResolvedValue({
        id: 'sale-1',
        customerId: 'cust-1',
        totalAmount: 30,
        items: [
          { productId: 'prod-1', quantity: 3, unitPrice: 10, discount: 0 },
        ],
      });

      const input = {
        customerId: 'cust-1',
        saleDate: new Date(),
        items: [
          { productId: 'prod-1', quantity: 3, discount: 0 },
        ],
      };

      const result = await SaleService.updateSale('sale-1', 'biz-1', input);

      expect(result.id).toBe('sale-1');
      // Revert old item: increment by 1
      expect(mockProductUpdate).toHaveBeenNthCalledWith(1, {
        where: { id: 'prod-1' },
        data: { stock: { increment: 1 } },
      });
      // Deduct new item: decrement by 3
      expect(mockProductUpdate).toHaveBeenNthCalledWith(2, {
        where: { id: 'prod-1' },
        data: { stock: { decrement: 3 } },
      });
      expect(mockSaleItemDeleteMany).toHaveBeenCalledWith({ where: { saleId: 'sale-1' } });
      expect(mockSaleUpdate).toHaveBeenCalled();
    });
  });

  describe('deleteSale', () => {
    it('should restore product stock when deleting a sale', async () => {
      // Mock existing sale fetch inside SaleService.deleteSale
      vi.mocked(prisma.sale.findFirst).mockResolvedValue({
        id: 'sale-1',
        customerId: 'cust-1',
        totalAmount: 20,
        items: [
          { productId: 'prod-1', quantity: 2, unitPrice: 10, discount: 0 },
        ],
      } as any);

      // Mock transaction findFirst
      mockSaleFindFirst.mockResolvedValue({
        id: 'sale-1',
        items: [
          { productId: 'prod-1', quantity: 2 },
        ],
      });

      mockSaleDelete.mockResolvedValue({ id: 'sale-1' });

      await SaleService.deleteSale('sale-1', 'biz-1');

      // Revert/restore stock: increment by 2
      expect(mockProductUpdate).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { stock: { increment: 2 } },
      });
      expect(mockSaleDelete).toHaveBeenCalledWith({
        where: { id: 'sale-1', businessId: 'biz-1' },
      });
    });
  });
});
