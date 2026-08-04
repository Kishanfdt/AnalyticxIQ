import { prisma } from '../prisma/index.js';
import { AppError } from '../utils/errors.js';
import { ERROR_CODES } from '@analyticiq/shared';

export class ImportService {
  /**
   * Imports products from JSON row array. Runs inside a database transaction.
   * If any row is invalid, transaction is rolled back and an error list is returned.
   */
  public static async importProducts(businessId: string, rows: any[]) {
    const invalidRows: { rowNumber: number; sku: string; reason: string }[] = [];
    const duplicates: { rowNumber: number; sku: string; reason: string }[] = [];
    const validProducts: any[] = [];
    
    // 1. Get existing SKUs to detect duplicates
    const existing = await prisma.product.findMany({
      where: { businessId },
      select: { sku: true },
    });
    const skuSet = new Set(existing.map((p) => p.sku.toLowerCase()));

    // 2. Iterate and validate rows
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // header is row 1
      const sku = String(row.sku || '').trim();
      const name = String(row.name || '').trim();
      const price = Number(row.price);
      const costPrice = row.costPrice ? Number(row.costPrice) : null;
      const stock = row.stock ? Math.max(0, parseInt(row.stock, 10)) : 0;
      const description = row.description ? String(row.description).trim() : null;
      const categoryName = row.categoryName ? String(row.categoryName).trim() : null;

      if (!sku) {
        invalidRows.push({ rowNumber, sku: '', reason: 'SKU is required' });
        continue;
      }
      if (!name) {
        invalidRows.push({ rowNumber, sku, reason: 'Product name is required' });
        continue;
      }
      if (isNaN(price) || price < 0) {
        invalidRows.push({ rowNumber, sku, reason: 'Price must be a positive number' });
        continue;
      }
      if (costPrice !== null && (isNaN(costPrice) || costPrice < 0)) {
        invalidRows.push({ rowNumber, sku, reason: 'Cost price must be a positive number' });
        continue;
      }

      // Check duplicates
      if (skuSet.has(sku.toLowerCase())) {
        duplicates.push({ rowNumber, sku, reason: 'SKU already exists in inventory' });
        continue;
      }

      validProducts.push({
        name,
        sku,
        price,
        costPrice,
        stock,
        description,
        categoryName,
      });
    }

    // 3. Rollback if any invalid row exists
    if (invalidRows.length > 0) {
      return {
        success: false,
        invalidRows,
        duplicatesCount: duplicates.length,
        importedCount: 0,
      };
    }

    // 4. Perform imports within transaction
    let importedCount = 0;
    await prisma.$transaction(async (tx) => {
      for (const prod of validProducts) {
        let categoryId: string | null = null;

        if (prod.categoryName) {
          // Lookup or create Category
          let category = await tx.category.findFirst({
            where: {
              name: { equals: prod.categoryName, mode: 'insensitive' },
              businessId,
            },
          });

          if (!category) {
            category = await tx.category.create({
              data: {
                name: prod.categoryName,
                businessId,
              },
            });
          }
          categoryId = category.id;
        }

        await tx.product.create({
          data: {
            name: prod.name,
            sku: prod.sku,
            price: prod.price,
            costPrice: prod.costPrice,
            stock: prod.stock,
            description: prod.description,
            categoryId,
            businessId,
          },
        });
        importedCount++;
      }
    });

    return {
      success: true,
      invalidRows: [],
      duplicatesCount: duplicates.length,
      importedCount,
    };
  }

  /**
   * Imports customers from JSON row array.
   */
  public static async importCustomers(businessId: string, rows: any[]) {
    const invalidRows: { rowNumber: number; email: string; reason: string }[] = [];
    const duplicates: { rowNumber: number; email: string; reason: string }[] = [];
    const validCustomers: any[] = [];

    // Get existing emails to detect duplicates
    const existing = await prisma.customer.findMany({
      where: { businessId },
      select: { email: true },
    });
    const emailSet = new Set(existing.map((c) => (c.email || '').toLowerCase()).filter(Boolean));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2;
      const name = String(row.name || '').trim();
      const email = String(row.email || '').trim();
      const phone = row.phone ? String(row.phone).trim() : null;
      const company = row.company ? String(row.company).trim() : null;
      const address = row.address ? String(row.address).trim() : null;
      const notes = row.notes ? String(row.notes).trim() : null;
      const region = row.region ? String(row.region).trim() : null;

      if (!name) {
        invalidRows.push({ rowNumber, email, reason: 'Customer name is required' });
        continue;
      }

      if (email && emailSet.has(email.toLowerCase())) {
        duplicates.push({ rowNumber, email, reason: 'Email already registered' });
        continue;
      }

      validCustomers.push({
        name,
        email: email || null,
        phone,
        company,
        address,
        notes,
        region,
      });
    }

    if (invalidRows.length > 0) {
      return {
        success: false,
        invalidRows,
        duplicatesCount: duplicates.length,
        importedCount: 0,
      };
    }

    let importedCount = 0;
    await prisma.$transaction(async (tx) => {
      for (const cust of validCustomers) {
        await tx.customer.create({
          data: {
            ...cust,
            businessId,
          },
        });
        importedCount++;
      }
    });

    return {
      success: true,
      invalidRows: [],
      duplicatesCount: duplicates.length,
      importedCount,
    };
  }

  /**
   * Imports sales from JSON row array.
   */
  public static async importSales(businessId: string, rows: any[]) {
    const invalidRows: { rowNumber: number; reason: string }[] = [];
    const validSalesList: any[] = [];

    // Pre-load all products and customers for speed and validation checks
    const dbProducts = await prisma.product.findMany({ where: { businessId } });
    const dbCustomers = await prisma.customer.findMany({ where: { businessId } });

    const productMap = new Map(dbProducts.map((p) => [p.sku.toLowerCase(), p]));
    const customerMapByEmail = new Map(dbCustomers.map((c) => [(c.email || '').toLowerCase(), c]));
    const customerMapByName = new Map(dbCustomers.map((c) => [c.name.toLowerCase(), c]));

    // Group items by unique sale key: customerEmail + saleDate + salespersonId + status
    const groupedSales = new Map<string, any>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2;

      const customerEmail = String(row.customerEmail || '').trim();
      const customerName = String(row.customerName || '').trim();
      const saleDateStr = String(row.saleDate || '').trim();
      const productSku = String(row.productSku || '').trim();
      const quantity = parseInt(row.quantity, 10);
      const discount = row.discount ? Number(row.discount) : 0;
      const salespersonId = row.salespersonId ? String(row.salespersonId).trim() : null;
      const status = row.status ? String(row.status).trim() : 'COMPLETED';

      // 1. Validate customer
      let customer = customerEmail 
        ? customerMapByEmail.get(customerEmail.toLowerCase()) 
        : customerName 
          ? customerMapByName.get(customerName.toLowerCase()) 
          : null;

      if (!customer) {
        invalidRows.push({ 
          rowNumber, 
          reason: `Customer not found for email "${customerEmail}" or name "${customerName}"` 
        });
        continue;
      }

      // 2. Validate product SKU
      const product = productMap.get(productSku.toLowerCase());
      if (!product) {
        invalidRows.push({ rowNumber, reason: `Product SKU "${productSku}" not found` });
        continue;
      }

      // 3. Validate quantity and discount
      if (isNaN(quantity) || quantity <= 0) {
        invalidRows.push({ rowNumber, reason: 'Quantity must be a positive integer' });
        continue;
      }
      if (isNaN(discount) || discount < 0 || discount > 100) {
        invalidRows.push({ rowNumber, reason: 'Discount must be between 0 and 100' });
        continue;
      }

      const saleDate = saleDateStr ? new Date(saleDateStr) : new Date();
      if (isNaN(saleDate.getTime())) {
        invalidRows.push({ rowNumber, reason: `Invalid date format: "${saleDateStr}"` });
        continue;
      }

      // Build group key
      const key = `${customer.id}_${saleDate.toISOString().split('T')[0]}_${salespersonId || ''}_${status}`;
      
      if (!groupedSales.has(key)) {
        groupedSales.set(key, {
          customerId: customer.id,
          saleDate,
          status,
          salespersonId,
          items: [],
        });
      }

      groupedSales.get(key).items.push({
        productId: product.id,
        quantity,
        discount,
        dbPrice: Number(product.price),
      });
    }

    if (invalidRows.length > 0) {
      return {
        success: false,
        invalidRows,
        importedCount: 0,
      };
    }

    // Process and insert inside transaction (atomic rollback)
    let importedCount = 0;
    await prisma.$transaction(async (tx) => {
      for (const saleGroup of groupedSales.values()) {
        // Calculate backend total amount from DB price list
        let totalAmount = 0;
        const lineItems = saleGroup.items.map((item: any) => {
          const discountMultiplier = 1 - item.discount / 100;
          const discountedPrice = Math.round(item.dbPrice * discountMultiplier * 100) / 100;
          const subtotal = item.quantity * discountedPrice;
          totalAmount += subtotal;

          return {
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: discountedPrice,
            discount: item.discount,
          };
        });

        await tx.sale.create({
          data: {
            customerId: saleGroup.customerId,
            saleDate: saleGroup.saleDate,
            status: saleGroup.status,
            salespersonId: saleGroup.salespersonId,
            businessId,
            totalAmount,
            items: {
              create: lineItems,
            },
          },
        });
        importedCount++;
      }
    });

    return {
      success: true,
      invalidRows: [],
      importedCount,
    };
  }
}
