/**
 * Form Types and Schemas
 * Includes types and zod schemas for form validation
 */
import { z } from 'zod';

// User Registration Schema
export const userRegistrationSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type UserRegistrationFormValues = z.infer<typeof userRegistrationSchema>;

// Login Schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// Trade Order Schema
export const tradeOrderSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  orderType: z.enum(['market', 'limit', 'stop', 'stop_limit']),
  direction: z.enum(['buy', 'sell']),
  quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Quantity must be a positive number',
  }),
  price: z.string().optional(),
  stopLoss: z.string().optional(),
  takeProfit: z.string().optional(),
  leverage: z.number().min(1).max(100).optional(),
});

export type TradeOrderFormValues = z.infer<typeof tradeOrderSchema>;

// Deposit Form Schema
export const depositSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  method: z.enum(['credit_card', 'bank_transfer', 'crypto']),
});

export type DepositFormValues = z.infer<typeof depositSchema>;

// Withdrawal Form Schema
export const withdrawalSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  address: z.string().min(1, 'Address is required'),
  withdrawalMethod: z.enum(['bank_transfer', 'crypto']),
});

export type WithdrawalFormValues = z.infer<typeof withdrawalSchema>;

// Profile Update Schema
export const profileUpdateSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  city: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
});

export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;

// Financial Profile Schema
export const financialProfileSchema = z.object({
  incomeRange: z.enum(['under_25k', '25k_50k', '50k_100k', '100k_250k', '250k_500k', 'over_500k']),
  netWorth: z.enum(['under_50k', '50k_100k', '100k_250k', '250k_500k', '500k_1m', 'over_1m']),
  riskTolerance: z.enum(['low', 'medium', 'high']),
  investmentExperience: z.enum(['none', 'beginner', 'intermediate', 'advanced', 'expert']),
  taxResidency: z.string().min(1, 'Tax residency is required'),
  sourceOfFunds: z.enum([
    'employment',
    'investments',
    'inheritance',
    'business',
    'savings',
    'other',
  ]),
});

export type FinancialProfileFormValues = z.infer<typeof financialProfileSchema>;
