import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('4000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('postgres://flicked_user:flicked_password@localhost:5432/flicked_db'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().default('flicked_super_secret_jwt_key_2026_production_grade'),
  YOUTUBE_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  MOCK_MODE: z.string().transform(v => v === 'true').default('true'),
});

export const env = envSchema.parse(process.env);
