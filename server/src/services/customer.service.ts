import { CustomerRepository } from '../repositories/customer.repository.js';
import { AppError } from '../utils/errors.js';
import { ERROR_CODES } from '@analyticiq/shared';
import { CreateCustomerInput, UpdateCustomerInput } from '@analyticiq/shared';

export class CustomerService {
  /**
   * Creates a new customer for the authenticated business.
   */
  public static async createCustomer(businessId: string, input: CreateCustomerInput) {
    const { name, email, phone, company, address, notes } = input;

    // Enforce email uniqueness per business (if email is provided)
    if (email) {
      const existingCustomer = await CustomerRepository.findByEmail(email, businessId);
      if (existingCustomer) {
        throw new AppError(
          `Customer with email "${email}" already exists.`,
          409,
          ERROR_CODES.CONFLICT,
        );
      }
    }

    return CustomerRepository.create({
      name,
      email: email || null,
      phone: phone || null,
      company: company || null,
      address: address || null,
      notes: notes || null,
      businessId,
    });
  }

  /**
   * Lists customers with pagination and search.
   */
  public static async getCustomers(
    businessId: string,
    query: { search?: string; page?: string | number; limit?: string | number },
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));

    const [customers, total] = await Promise.all([
      CustomerRepository.findAll(businessId, { search: query.search, page, limit }),
      CustomerRepository.count(businessId, query.search),
    ]);

    return {
      customers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Fetches a single customer by ID.
   */
  public static async getCustomerById(id: string, businessId: string) {
    const customer = await CustomerRepository.findById(id, businessId);
    if (!customer) {
      throw new AppError('Customer not found.', 404, ERROR_CODES.NOT_FOUND);
    }
    return customer;
  }

  /**
   * Updates an existing customer.
   */
  public static async updateCustomer(id: string, businessId: string, input: UpdateCustomerInput) {
    // 1. Verify existence and business ownership
    const customer = await CustomerRepository.findById(id, businessId);
    if (!customer) {
      throw new AppError('Customer not found.', 404, ERROR_CODES.NOT_FOUND);
    }

    const { name, email, phone, company, address, notes } = input;

    // 2. Enforce email uniqueness if changing
    if (email && email !== customer.email) {
      const existingCustomer = await CustomerRepository.findByEmail(email, businessId);
      if (existingCustomer) {
        throw new AppError(
          `Customer with email "${email}" already exists.`,
          409,
          ERROR_CODES.CONFLICT,
        );
      }
    }

    // 3. Perform update
    return CustomerRepository.update(id, businessId, {
      name,
      email: email || null,
      phone: phone || null,
      company: company || null,
      address: address || null,
      notes: notes || null,
    });
  }

  /**
   * Deletes a customer.
   */
  public static async deleteCustomer(id: string, businessId: string) {
    // 1. Verify existence and ownership
    const customer = await CustomerRepository.findById(id, businessId);
    if (!customer) {
      throw new AppError('Customer not found.', 404, ERROR_CODES.NOT_FOUND);
    }

    // 2. Delete the customer
    return CustomerRepository.delete(id, businessId);
  }
}
