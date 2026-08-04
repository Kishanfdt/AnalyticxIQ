import { AnalyticsRepository } from '../repositories/analytics.repository.js';
import { AppError } from '../utils/errors.js';
import { ERROR_CODES } from '@analyticiq/shared';

export class AnalyticsService {
  /**
   * Helper utility to safely parse and validate date range strings.
   */
  private static parseDate(dateStr?: string): Date | undefined {
    if (!dateStr) return undefined;
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) {
      throw new AppError(
        `Invalid date format: "${dateStr}". Must be a valid ISO-8601 date string.`,
        400,
        ERROR_CODES.BAD_REQUEST,
      );
    }
    return parsed;
  }

  /**
   * Retrieves high-level business revenue and order KPIs.
   */
  public static async getOverview(businessId: string, startDate?: string, endDate?: string) {
    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);
    return AnalyticsRepository.getOverview(businessId, start, end);
  }

  /**
   * Retrieves top selling products.
   */
  public static async getBestSellingProducts(
    businessId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);
    return AnalyticsRepository.getBestSellingProducts(businessId, start, end);
  }

  /**
   * Retrieves top spent customers.
   */
  public static async getTopCustomers(businessId: string, startDate?: string, endDate?: string) {
    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);
    return AnalyticsRepository.getTopCustomers(businessId, start, end);
  }

  /**
   * Retrieves revenue share details grouped by categories.
   */
  public static async getRevenueByCategory(
    businessId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);
    return AnalyticsRepository.getRevenueByCategory(businessId, start, end);
  }

  /**
   * Retrieves chronological monthly trends.
   */
  public static async getMonthlyTrends(businessId: string, startDate?: string, endDate?: string) {
    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);
    return AnalyticsRepository.getMonthlyTrends(businessId, start, end);
  }

  /**
   * Retrieves advanced business intelligence calculations and metrics.
   */
  public static async getAdvancedAnalytics(businessId: string, filters: any) {
    const startDate = filters.startDate ? this.parseDate(filters.startDate) : undefined;
    const endDate = filters.endDate ? this.parseDate(filters.endDate) : undefined;

    const parsedFilters = {
      ...filters,
      startDate,
      endDate,
    };

    return AnalyticsRepository.getAdvancedAnalytics(businessId, parsedFilters);
  }
}
