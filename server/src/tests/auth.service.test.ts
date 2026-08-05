import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../services/auth.service.js';
import { prisma } from '../prisma/index.js';
import { AppError } from '../utils/errors.js';

// Mock bcrypt and prisma client singleton
vi.mock('../prisma/index.js', () => {
  const mockTx = {
    business: {
      create: vi
        .fn()
        .mockResolvedValue({ id: 'business-123', name: 'Acme Corp', slug: 'acme-corp' }),
    },
    user: {
      create: vi.fn().mockResolvedValue({
        id: 'user-456',
        email: 'test@example.com',
        name: 'Test Admin',
        role: 'OWNER',
        businessId: 'business-123',
      }),
    },
  };

  return {
    prisma: {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      $transaction: vi.fn((callback) => callback(mockTx)),
    },
  };
});

describe('AuthService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('register', () => {
    it('should throw an error if user email already exists', async () => {
      // Mock existing user
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-789',
        email: 'test@example.com',
        passwordHash: 'hashed',
        name: 'Existing User',
        role: 'MEMBER',
        businessId: 'business-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const registerInput = {
        name: 'Test Admin',
        email: 'test@example.com',
        password: 'securePassword123',
        businessName: 'Acme Corp',
      };

      await expect(AuthService.register(registerInput)).rejects.toThrow(AppError);
    });

    it('should successfully register business and owner user', async () => {
      // Mock no user exists
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const registerInput = {
        name: 'Test Admin',
        email: 'test@example.com',
        password: 'securePassword123',
        businessName: 'Acme Corp',
      };

      const result = await AuthService.register(registerInput);
      expect(result.business.id).toBe('business-123');
      expect(result.user.role).toBe('OWNER');
    });
  });
});
