import { prisma } from '../prisma/index.js';

export class AnalyticsRepository {
  /**
   * Calculates high-level KPIs: Total Revenue, Total Orders, and Average Order Value.
   */
  public static async getOverview(businessId: string, startDate?: Date, endDate?: Date) {
    const where: any = {
      businessId,
    };

    if (startDate || endDate) {
      where.saleDate = {};
      if (startDate) where.saleDate.gte = startDate;
      if (endDate) where.saleDate.lte = endDate;
    }

    const aggregate = await prisma.sale.aggregate({
      where,
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
    });

    const totalRevenue = Number(aggregate._sum.totalAmount) || 0;
    const totalOrders = aggregate._count.id || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
    };
  }

  /**
   * Fetches top 5 best selling products by total quantity sold and revenue.
   */
  public static async getBestSellingProducts(businessId: string, startDate?: Date, endDate?: Date) {
    const start = startDate ? startDate : null;
    const end = endDate ? endDate : null;

    return prisma.$queryRaw<any[]>`
      SELECT 
        p.id AS "productId",
        p.name AS "name",
        p.sku AS "sku",
        SUM(si.quantity)::INTEGER AS "quantitySold",
        SUM(si.quantity * si.unitPrice)::DOUBLE PRECISION AS "revenue"
      FROM "SaleItem" si
      JOIN "Product" p ON si."productId" = p.id
      JOIN "Sale" s ON si."saleId" = s.id
      WHERE s."businessId" = ${businessId}
        AND (${start}::TIMESTAMP IS NULL OR s."saleDate" >= ${start}::TIMESTAMP)
        AND (${end}::TIMESTAMP IS NULL OR s."saleDate" <= ${end}::TIMESTAMP)
      GROUP BY p.id, p.name, p.sku
      ORDER BY "quantitySold" DESC
      LIMIT 5
    `;
  }

  /**
   * Fetches top 5 customers by total spent.
   */
  public static async getTopCustomers(businessId: string, startDate?: Date, endDate?: Date) {
    const start = startDate ? startDate : null;
    const end = endDate ? endDate : null;

    return prisma.$queryRaw<any[]>`
      SELECT 
        c.id AS "customerId",
        c.name AS "name",
        c.email AS "email",
        c.company AS "company",
        COUNT(s.id)::INTEGER AS "ordersCount",
        SUM(s."totalAmount")::DOUBLE PRECISION AS "totalSpent"
      FROM "Sale" s
      JOIN "Customer" c ON s."customerId" = c.id
      WHERE s."businessId" = ${businessId}
        AND (${start}::TIMESTAMP IS NULL OR s."saleDate" >= ${start}::TIMESTAMP)
        AND (${end}::TIMESTAMP IS NULL OR s."saleDate" <= ${end}::TIMESTAMP)
      GROUP BY c.id, c.name, c.email, c.company
      ORDER BY "totalSpent" DESC
      LIMIT 5
    `;
  }

  /**
   * Fetches revenue broken down by Category.
   */
  public static async getRevenueByCategory(businessId: string, startDate?: Date, endDate?: Date) {
    const start = startDate ? startDate : null;
    const end = endDate ? endDate : null;

    return prisma.$queryRaw<any[]>`
      SELECT 
        cat.id AS "categoryId",
        cat.name AS "name",
        SUM(si.quantity * si.unitPrice)::DOUBLE PRECISION AS "revenue"
      FROM "SaleItem" si
      JOIN "Product" p ON si."productId" = p.id
      JOIN "Category" cat ON p."categoryId" = cat.id
      JOIN "Sale" s ON si."saleId" = s.id
      WHERE s."businessId" = ${businessId}
        AND (${start}::TIMESTAMP IS NULL OR s."saleDate" >= ${start}::TIMESTAMP)
        AND (${end}::TIMESTAMP IS NULL OR s."saleDate" <= ${end}::TIMESTAMP)
      GROUP BY cat.id, cat.name
      ORDER BY "revenue" DESC
    `;
  }

  /**
   * Fetches monthly trends for chronological revenue analysis.
   */
  public static async getMonthlyTrends(businessId: string, startDate?: Date, endDate?: Date) {
    const start = startDate ? startDate : null;
    const end = endDate ? endDate : null;

    return prisma.$queryRaw<any[]>`
      SELECT 
        TO_CHAR(s."saleDate", 'YYYY-MM') AS "month",
        SUM(s."totalAmount")::DOUBLE PRECISION AS "revenue",
        COUNT(s.id)::INTEGER AS "ordersCount"
      FROM "Sale" s
      WHERE s."businessId" = ${businessId}
        AND (${start}::TIMESTAMP IS NULL OR s."saleDate" >= ${start}::TIMESTAMP)
        AND (${end}::TIMESTAMP IS NULL OR s."saleDate" <= ${end}::TIMESTAMP)
      GROUP BY TO_CHAR(s."saleDate", 'YYYY-MM')
      ORDER BY "month" ASC
    `;
  }
}
