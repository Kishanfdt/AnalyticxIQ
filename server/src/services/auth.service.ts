import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/index.js';
import { config } from '../config/index.js';
import { AppError } from '../utils/errors.js';
import { ERROR_CODES } from '@analyticiq/shared';
import { RegisterInput, LoginInput } from '@analyticiq/shared';

export class AuthService {
  /**
   * Registers a new Business and an OWNER User in a transaction.
   */
  public static async register(input: RegisterInput) {
    const { name, email, password, businessName } = input;

    // 1. Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(
        'A user with this email address already exists',
        409,
        ERROR_CODES.CONFLICT,
      );
    }

    // 2. Generate slug for the business
    const slug = this.slugify(businessName) + '-' + Math.random().toString(36).substring(2, 6);

    // 3. Hash the password
    const passwordHash = await bcrypt.hash(password, 12);

    // 4. Atomic transaction to create Business and User
    const result = await prisma.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          name: businessName,
          slug,
        },
      });

      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: 'OWNER',
          businessId: business.id,
        },
      });

      return { user, business };
    });

    // 5. Generate Access Token
    const token = this.generateToken({
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
      businessId: result.business.id,
    });

    return {
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
      business: {
        id: result.business.id,
        name: result.business.name,
        slug: result.business.slug,
      },
    };
  }

  /**
   * Validates user credentials and issues a JWT token.
   */
  public static async login(input: LoginInput) {
    const { email, password } = input;

    // 1. Fetch user and their associated business details
    const user = await prisma.user.findUnique({
      where: { email },
      include: { business: true },
    });

    if (!user) {
      throw new AppError('Invalid email or password credentials', 401, ERROR_CODES.UNAUTHORIZED);
    }

    // 2. Verify hashed password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password credentials', 401, ERROR_CODES.UNAUTHORIZED);
    }

    // 3. Generate token
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      businessId: user.businessId,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      business: {
        id: user.business.id,
        name: user.business.name,
        slug: user.business.slug,
      },
    };
  }

  /**
   * Helper to sign a JWT access token.
   */
  private static generateToken(payload: {
    id: string;
    email: string;
    role: string;
    businessId: string;
  }): string {
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: '24h',
    });
  }

  /**
   * Helper to slugify string.
   */
  private static slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w-]+/g, '') // Remove all non-word chars
      .replace(/--+/g, '-'); // Replace multiple - with single -
  }
}
