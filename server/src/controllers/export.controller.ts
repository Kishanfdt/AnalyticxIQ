import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/index.js';
import { AnalyticsService } from '../services/analytics.service.js';
import { AppError } from '../utils/errors.js';
import { ERROR_CODES } from '@analyticiq/shared';
import * as XLSX from 'xlsx';

export class ExportController {
  /**
   * Helper utility to build query filters for data fetching
   */
  private static buildBaseFilters(businessId: string, query: any) {
    const { startDate, endDate, search, categoryId, region, status } = query;
    const where: any = { businessId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [{ name: { contains: search, mode: 'insensitive' } }];
    }

    return { where, categoryId, region, status, search };
  }

  /**
   * Main export handler: GET /export/:resource?format=csv|excel|pdf
   */
  public static async exportData(req: Request, res: Response, next: NextFunction) {
    try {
      const { resource } = req.params;
      const format = String(req.query.format || 'csv').toLowerCase();

      if (!req.user || !req.user.businessId) {
        throw new AppError('Unauthorized access.', 401, ERROR_CODES.UNAUTHORIZED);
      }
      const businessId = req.user.businessId;
      const { search, categoryId, region, status } = ExportController.buildBaseFilters(
        businessId,
        req.query,
      );

      let data: any[] = [];
      const workbook = XLSX.utils.book_new();

      // 1. Fetch data based on resource type
      if (resource === 'products') {
        const prodWhere: any = { businessId };
        if (categoryId) prodWhere.categoryId = categoryId;
        if (search) {
          prodWhere.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
          ];
        }

        const products = await prisma.product.findMany({
          where: prodWhere,
          include: { category: true },
          orderBy: { name: 'asc' },
        });

        data = products.map((p) => ({
          ID: p.id,
          Name: p.name,
          SKU: p.sku,
          Price: Number(p.price),
          CostPrice: p.costPrice ? Number(p.costPrice) : 0,
          Stock: p.stock,
          Category: p.category?.name || 'Uncategorized',
          Description: p.description || '',
          CreatedAt: p.createdAt.toISOString(),
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, ws, 'Products');
      } else if (resource === 'customers') {
        const custWhere: any = { businessId };
        if (region) custWhere.region = region;
        if (search) {
          custWhere.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } },
          ];
        }

        const customers = await prisma.customer.findMany({
          where: custWhere,
          orderBy: { name: 'asc' },
        });

        data = customers.map((c) => ({
          ID: c.id,
          Name: c.name,
          Email: c.email || '',
          Phone: c.phone || '',
          Company: c.company || '',
          Region: c.region || 'Unknown',
          Address: c.address || '',
          Notes: c.notes || '',
          CreatedAt: c.createdAt.toISOString(),
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, ws, 'Customers');
      } else if (resource === 'sales') {
        const saleWhere: any = { businessId };
        if (status) saleWhere.status = status;
        if (req.query.startDate || req.query.endDate) {
          saleWhere.saleDate = {};
          if (req.query.startDate) saleWhere.saleDate.gte = new Date(req.query.startDate as string);
          if (req.query.endDate) saleWhere.saleDate.lte = new Date(req.query.endDate as string);
        }

        const sales = await prisma.sale.findMany({
          where: saleWhere,
          include: { customer: true, items: { include: { product: true } } },
          orderBy: { saleDate: 'desc' },
        });

        // Flatten sales and sale items for flat tables
        data = sales.flatMap((s) => {
          return s.items.map((item) => ({
            SaleID: s.id,
            SaleDate: s.saleDate.toISOString().split('T')[0],
            CustomerName: s.customer?.name || 'Private Buyer',
            CustomerEmail: s.customer?.email || '',
            Status: s.status,
            ProductName: item.product.name,
            ProductSKU: item.product.sku,
            Quantity: item.quantity,
            UnitPrice: Number(item.unitPrice),
            DiscountPercent: Number(item.discount),
            Subtotal: item.quantity * Number(item.unitPrice),
            SaleTotalAmount: Number(s.totalAmount),
          }));
        });

        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, ws, 'Sales Ledger');
      } else if (resource === 'analytics') {
        // Query Advanced Analytics
        const filters = {
          startDate: req.query.startDate as string,
          endDate: req.query.endDate as string,
          productId: req.query.productId as string,
          customerId: req.query.customerId as string,
          categoryId: req.query.categoryId as string,
          region: req.query.region as string,
          salespersonId: req.query.salespersonId as string,
          status: req.query.status as string,
          search: req.query.search as string,
        };

        const result = await AnalyticsService.getAdvancedAnalytics(businessId, filters);

        // Bundle into multi-sheet Excel file
        const summary = [
          { Metric: 'Gross Revenue', Value: result.grossRevenue },
          { Metric: 'Net Revenue', Value: result.netRevenue },
          { Metric: 'Total Profit', Value: result.profit },
          { Metric: 'Profit Margin (%)', Value: result.profitMargin },
          { Metric: 'Total Orders', Value: result.totalOrders },
          { Metric: 'Average Order Value', Value: result.averageOrderValue },
          { Metric: 'Customer Purchase Frequency', Value: result.customerPurchaseFrequency },
          { Metric: 'MoM Growth (%)', Value: result.revenueGrowth },
        ];

        const sWS = XLSX.utils.json_to_sheet(summary);
        XLSX.utils.book_append_sheet(workbook, sWS, 'Summary KPIs');

        const pWS = XLSX.utils.json_to_sheet(result.topPerformingProducts);
        XLSX.utils.book_append_sheet(workbook, pWS, 'Top Products');

        const cWS = XLSX.utils.json_to_sheet(result.topCustomers);
        XLSX.utils.book_append_sheet(workbook, cWS, 'Top Customers');

        const tWS = XLSX.utils.json_to_sheet(result.salesTrend);
        XLSX.utils.book_append_sheet(workbook, tWS, 'Monthly Trends');

        // Set flat data for CSV output format (uses Summary sheet)
        data = summary;
      } else {
        throw new AppError('Invalid export resource parameter.', 400, ERROR_CODES.BAD_REQUEST);
      }

      // 2. Format Response based on requested format
      if (format === 'csv') {
        const sheetName = workbook.SheetNames[0];
        const ws = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(ws);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${resource}_export_${Date.now()}.csv`,
        );
        return res.status(200).send(csv);
      } else if (format === 'excel') {
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${resource}_export_${Date.now()}.xlsx`,
        );
        return res.status(200).send(buffer);
      } else if (format === 'pdf') {
        // Output print-friendly HTML view. Browser handles saving as PDF.
        const title = `${resource.toUpperCase()} REPORT`;
        const dateRangeStr = `${req.query.startDate || 'All Time'} to ${req.query.endDate || 'Present'}`;

        let rowsHtml = '';
        if (data.length > 0) {
          const headers = Object.keys(data[0]);
          rowsHtml += `
            <table class="report-table">
              <thead>
                <tr>
                  ${headers.map((h) => `<th>${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${data
                  .map(
                    (row) => `
                  <tr>
                    ${headers.map((h) => `<td>${row[h]}</td>`).join('')}
                  </tr>
                `,
                  )
                  .join('')}
              </tbody>
            </table>
          `;
        } else {
          rowsHtml = '<p class="empty-state">No matching records found.</p>';
        }

        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title}</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                  color: #333;
                  padding: 40px;
                  line-height: 1.5;
                }
                .header {
                  border-bottom: 2px solid #3b82f6;
                  padding-bottom: 20px;
                  margin-bottom: 30px;
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-end;
                }
                .header h1 {
                  margin: 0;
                  font-size: 24px;
                  color: #1e3a8a;
                }
                .header p {
                  margin: 4px 0 0 0;
                  font-size: 12px;
                  color: #666;
                }
                .report-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 20px;
                  font-size: 11px;
                }
                .report-table th, .report-table td {
                  border: 1px solid #e5e7eb;
                  padding: 8px 10px;
                  text-align: left;
                }
                .report-table th {
                  background-color: #f3f4f6;
                  font-weight: bold;
                  color: #111827;
                }
                .report-table tr:nth-child(even) {
                  background-color: #f9fafb;
                }
                .empty-state {
                  text-align: center;
                  padding: 40px;
                  color: #9ca3af;
                }
                @media print {
                  body {
                    padding: 0;
                  }
                  .no-print {
                    display: none;
                  }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <div>
                  <h1>${title}</h1>
                  <p>Date Range: ${dateRangeStr}</p>
                </div>
                <div>
                  <p>Generated At: ${new Date().toLocaleString()}</p>
                </div>
              </div>
              
              ${rowsHtml}
              
              <script>
                window.onload = function() {
                  window.print();
                }
              </script>
            </body>
          </html>
        `;

        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(html);
      } else {
        throw new AppError(
          'Invalid format parameter. Supported: csv, excel, pdf.',
          400,
          ERROR_CODES.BAD_REQUEST,
        );
      }
    } catch (error) {
      next(error);
    }
  }
}
