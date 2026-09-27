import { z } from "zod";
import {
  PAYMENT_ENVIRONMENTS,
  PAYMENT_PROVIDERS,
} from "../drizzle/payment-config-schema";

/** Secret key fields: empty keeps the saved value (they are never sent back). */
const secretKey = z.string().trim().max(500);

export const PAYMENT_KEY_SLOTS = [
  "doku.sandbox",
  "doku.production",
  "midtrans.sandbox",
  "midtrans.production",
] as const;
export type PaymentKeySlot = (typeof PAYMENT_KEY_SLOTS)[number];

/** Operator dashboard form: gateway choice plus sandbox and production keys. */
export const paymentConfigInputSchema = z.object({
  provider: z.enum(PAYMENT_PROVIDERS),
  environment: z.enum(PAYMENT_ENVIRONMENTS),
  doku: z.object({
    sandbox: z.object({
      clientId: z.string().trim().max(100),
      secretKey,
    }),
    production: z.object({
      clientId: z.string().trim().max(100),
      secretKey,
    }),
  }),
  midtrans: z.object({
    sandbox: z.object({ serverKey: secretKey }),
    production: z.object({ serverKey: secretKey }),
  }),
  /** Saved keys to delete. */
  clear: z.array(z.enum(PAYMENT_KEY_SLOTS)).max(PAYMENT_KEY_SLOTS.length),
});

export type PaymentConfigInput = z.infer<typeof paymentConfigInputSchema>;
