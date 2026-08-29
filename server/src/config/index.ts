import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  // Comma-separated list of allowed frontend origins (e.g. https://your-app.vercel.app)
  CORS_ORIGIN: z.string().optional(),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Invalid environment variables:', parseResult.error.format());
  process.exit(1);
}

export const config = parseResult.data;

if (config.NODE_ENV === 'production') {
  const isWeak =
    !config.JWT_SECRET ||
    config.JWT_SECRET.length < 32 ||
    config.JWT_SECRET === 'super_secret_fallback_key_for_development';
  if (isWeak) {
    console.error('FATAL ERROR: JWT_SECRET is missing or too weak for production environment.');
    process.exit(1);
  }
}
