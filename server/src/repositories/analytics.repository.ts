import { prisma } from '../prisma/index.js';

export class AnalyticsRepository {
  /**
   * Helper utility to dynamically construct PostgreSQL where clauses
   */
  private static buildWhereClause(businessId: string, filters: any) {
    const conditions: string[] = [`s."businessId" = $1`];
    const params: any[] = [businessId];
    let index = 2;

    if (filters.startDate) {
      conditions.push(`s."saleDate" >= $${index++}`);
      params.push(new Date(filters.startDate));
    }
    if (filters.endDate) {
      conditions.push(`s."saleDate" <= $${index++}`);
      params.push(new Date(filters.endDate));
    }
    if (filters.productId) {
      conditions.push(`si."productId" = $${index++}`);
      params.push(filters.productId);
    }
    if (filters.customerId) {
      conditions.push(`s."customerId" = $${index++}`);
      params.push(filters.customerId);
    }
    if (filters.categoryId) {
      conditions.push(`p."categoryId" = $${index++}`);
      params.push(filters.categoryId);
    }
    if (filters.region) {
      conditions.push(`c."region" = $${index++}`);
      params.push(filters.region);
    }
    if (filters.salespersonId) {
      conditions.push(`s."salespersonId" = $${index++}`);
      params.push(filters.salespersonId);
    }
    if (filters.status) {
      conditions.push(`s."status" = $${index++}`);
      params.push(filters.status);
    }
    if (filters.search) {
      conditions.push(`(p.name ILIKE $${index} OR c.name ILIKE $${index} OR c.company ILIKE $${index})`);
      params.push(`%${filters.search}%`);
      index++;
    }

    return {
      whereClause: conditions.join(' AND '),
      params,
    };
  }

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

  /**
   * Calculates comprehensive Advanced Business Intelligence KPIs & Aggregations
   */
  public static async getAdvancedAnalytics(businessId: string, filters: any) {
    const { whereClause, params } = this.buildWhereClause(businessId, filters);

    // 1. Overview KPIs: Gross, Net, Profit, Profit Margin, Orders Count
    const overviewQuery = `
      SELECT 
        COALESCE(SUM(si.quantity * p.price), 0)::DOUBLE PRECISION AS "grossRevenue",
        COALESCE(SUM(si.quantity * si.unitPrice), 0)::DOUBLE PRECISION AS "netRevenue",
        COALESCE(SUM(si.quantity * (si.unitPrice - COALESCE(p."costPrice", 0))), 0)::DOUBLE PRECISION AS "profit",
        COUNT(DISTINCT s.id)::INTEGER AS "totalOrders",
        COUNT(DISTINCT s."customerId")::INTEGER AS "uniqueCustomers"
      FROM "SaleItem" si
      JOIN "Sale" s ON si."saleId" = s.id
      JOIN "Product" p ON si."productId" = p.id
      LEFT JOIN "Customer" c ON s."customerId" = c.id
      WHERE ${whereClause}
    `;

    // 2. Top Performing Products
    const topProductsQuery = `
      SELECT 
        p.id AS "productId",
        p.name AS "name",
        p.sku AS "sku",
        SUM(si.quantity)::INTEGER AS "quantitySold",
        SUM(si.quantity * si.unitPrice)::DOUBLE PRECISION AS "revenue"
      FROM "SaleItem" si
      JOIN "Product" p ON si."productId" = p.id
      JOIN "Sale" s ON si."saleId" = s.id
      LEFT JOIN "Customer" c ON s."customerId" = c.id
      WHERE ${whereClause}
      GROUP BY p.id, p.name, p.sku
      ORDER BY "quantitySold" DESC
      LIMIT 5
    `;

    // 3. Low Selling Products
    const lowProductsQuery = `
      SELECT 
        p.id AS "productId",
        p.name AS "name",
        p.sku AS "sku",
        SUM(si.quantity)::INTEGER AS "quantitySold",
        SUM(si.quantity * si.unitPrice)::DOUBLE PRECISION AS "revenue"
      FROM "SaleItem" si
      JOIN "Product" p ON si."productId" = p.id
      JOIN "Sale" s ON si."saleId" = s.id
      LEFT JOIN "Customer" c ON s."customerId" = c.id
      WHERE ${whereClause}
      GROUP BY p.id, p.name, p.sku
      ORDER BY "quantitySold" ASC
      LIMIT 5
    `;

    // 4. Top Customers
    const topCustomersQuery = `
      SELECT 
        c.id AS "customerId",
        c.name AS "name",
        c.company AS "company",
        COUNT(DISTINCT s.id)::INTEGER AS "ordersCount",
        SUM(si.quantity * si.unitPrice)::DOUBLE PRECISION AS "totalSpent"
      FROM "SaleItem" si
      JOIN "Sale" s ON si."saleId" = s.id
      JOIN "Customer" c ON s."customerId" = c.id
      JOIN "Product" p ON si."productId" = p.id
      WHERE ${whereClause}
      GROUP BY c.id, c.name, c.company
      ORDER BY "totalSpent" DESC
      LIMIT 5
    `;

    // 5. Sales & Revenue By Category
    const categoriesQuery = `
      SELECT 
        cat.id AS "categoryId",
        cat.name AS "name",
        SUM(si.quantity * si.unitPrice)::DOUBLE PRECISION AS "revenue"
      FROM "SaleItem" si
      JOIN "Product" p ON si."productId" = p.id
      JOIN "Category" cat ON p."categoryId" = cat.id
      JOIN "Sale" s ON si."saleId" = s.id
      LEFT JOIN "Customer" c ON s."customerId" = c.id
      WHERE ${whereClause}
      GROUP BY cat.id, cat.name
      ORDER BY "revenue" DESC
    `;

    // 6. Sales By Region
    const regionsQuery = `
      SELECT 
        COALESCE(c.region, 'Unknown') AS "region",
        SUM(si.quantity * si.unitPrice)::DOUBLE PRECISION AS "revenue",
        COUNT(DISTINCT s.id)::INTEGER AS "ordersCount"
      FROM "SaleItem" si
      JOIN "Sale" s ON si."saleId" = s.id
      LEFT JOIN "Customer" c ON s."customerId" = c.id
      JOIN "Product" p ON si."productId" = p.id
      WHERE ${whereClause}
      GROUP BY c.region
      ORDER BY "revenue" DESC
    `;

    // 7. Chronological Monthly Trends
    const trendsQuery = `
      SELECT 
        TO_CHAR(s."saleDate", 'YYYY-MM') AS "month",
        SUM(si.quantity * si.unitPrice)::DOUBLE PRECISION AS "revenue",
        COUNT(DISTINCT s.id)::INTEGER AS "ordersCount"
      FROM "SaleItem" si
      JOIN "Sale" s ON si."saleId" = s.id
      JOIN "Product" p ON si."productId" = p.id
      LEFT JOIN "Customer" c ON s."customerId" = c.id
      WHERE ${whereClause}
      GROUP BY TO_CHAR(s."saleDate", 'YYYY-MM')
      ORDER BY "month" ASC
    `;

    // Execute queries in parallel using parameterized unsafe wrappers
    const [
      overviewResult,
      topProducts,
      lowProducts,
      topCustomers,
      categories,
      regions,
      trends,
    ] = await Promise.all([
      prisma.$queryRawUnsafe<any[]>(overviewQuery, ...params),
      prisma.$queryRawUnsafe<any[]>(topProductsQuery, ...params),
      prisma.$queryRawUnsafe<any[]>(lowProductsQuery, ...params),
      prisma.$queryRawUnsafe<any[]>(topCustomersQuery, ...params),
      prisma.$queryRawUnsafe<any[]>(categoriesQuery, ...params),
      prisma.$queryRawUnsafe<any[]>(regionsQuery, ...params),
      prisma.$queryRawUnsafe<any[]>(trendsQuery, ...params),
    ]);

    const ov = overviewResult[0] || {
      grossRevenue: 0,
      netRevenue: 0,
      profit: 0,
      totalOrders: 0,
      uniqueCustomers: 0,
    };

    const grossRevenue = ov.grossRevenue || 0;
    const netRevenue = ov.netRevenue || 0;
    const profit = ov.profit || 0;
    const totalOrders = ov.totalOrders || 0;
    const uniqueCustomers = ov.uniqueCustomers || 0;

    const profitMargin = netRevenue > 0 ? (profit / netRevenue) * 100 : 0;
    const averageOrderValue = totalOrders > 0 ? netRevenue / totalOrders : 0;
    const customerPurchaseFrequency = uniqueCustomers > 0 ? totalOrders / uniqueCustomers : 0;

    // Calculate revenue growth comparing the last two months of data
    let revenueGrowth = 0;
    let monthlyGrowth: any[] = [];

    if (trends.length >= 2) {
      const prev = trends[trends.length - 2].revenue || 0;
      const curr = trends[trends.length - 1].revenue || 0;
      revenueGrowth = prev > 0 ? ((curr - prev) / prev) * 100 : curr > 0 ? 100 : 0;
    }

    // Map month-over-month growth data points
    for (let i = 0; i < trends.length; i++) {
      const month = trends[i].month;
      const currentRev = trends[i].revenue || 0;
      let growthRate = 0;

      if (i > 0) {
        const prevRev = trends[i - 1].revenue || 0;
        growthRate = prevRev > 0 ? ((currentRev - prevRev) / prevRev) * 100 : currentRev > 0 ? 100 : 0;
      }

      monthlyGrowth.push({
        month,
        revenue: currentRev,
        growthRate,
      });
    }

    return {
      grossRevenue,
      netRevenue,
      profit,
      profitMargin,
      totalOrders,
      averageOrderValue,
      customerPurchaseFrequency,
      revenueGrowth,
      monthlyGrowth,
      topCategories: categories,
      topPerformingProducts: topProducts,
      lowSellingProducts: lowProducts,
      topCustomers,
      salesByRegion: regions,
      salesByCategory: categories,
      salesTrend: trends,
    };
  }
}
