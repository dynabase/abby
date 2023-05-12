// @ts-check
import { z } from "zod";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
export const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXTAUTH_SECRET:
    process.env.NODE_ENV === "production"
      ? z.string().min(1)
      : z.string().min(1).optional(),
  NEXTAUTH_URL: z.preprocess(
    // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
    // Since NextAuth.js automatically uses the VERCEL_URL if present.
    (str) => process.env.VERCEL_URL ?? str,
    // VERCEL_URL doesn't include `https` so it cant be validated as a URL
    process.env.VERCEL ? z.string() : z.string().url()
  ),
  GITHUB_ID: z.string().min(1),
  GITHUB_SECRET: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  EMAIL_SERVER: z.string().url(),
  LOGSNAG_API_KEY: z.string().min(1),
  REDIS_URL: z.string().url(),
});

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
export const clientSchema = z.object({
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  // NEXT_PUBLIC_CLIENTVAR: z.string(),
  NEXT_PUBLIC_DISABLE_ANALYTICS: z.boolean(),
  NEXT_PUBLIC_STRIPE_STARTER_PLAN_PRICE_ID: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PRO_PLAN_PRICE_ID: z.string().min(1),
});

/**
 * You can't destruct `process.env` as a regular object, so you have to do
 * it manually here. This is because Next.js evaluates this at build time,
 * and only used environment variables are included in the build.
 * @type {{ [k in keyof z.infer<typeof clientSchema>]: z.infer<typeof clientSchema>[k] | undefined }}
 */
export const clientEnv = {
  // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_STRIPE_STARTER_PLAN_PRICE_ID:
    process.env.NEXT_PUBLIC_STRIPE_STARTER_PLAN_PRICE_ID,
  NEXT_PUBLIC_STRIPE_PRO_PLAN_PRICE_ID:
    process.env.NEXT_PUBLIC_STRIPE_PRO_PLAN_PRICE_ID,
  NEXT_PUBLIC_DISABLE_ANALYTICS: Boolean(
    process.env.NEXT_PUBLIC_DISABLE_ANALYTICS
  ),
};