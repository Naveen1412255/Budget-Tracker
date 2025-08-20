import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base Types
export const TransactionType = z.enum(["income", "expense"]);
export const CategoryType = z.enum(["income", "expense"]);
export const FrequencyType = z.enum(["daily", "weekly", "monthly", "yearly"]);

// Schema Definitions (simulating Drizzle table structures)
export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  type: CategoryType,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const TransactionSchema = z.object({
  id: z.string(),
  description: z.string(),
  amount: z.string(), // Using string for precise decimal handling
  type: TransactionType,
  categoryId: z.string(),
  date: z.date(),
  location: z.string().nullable(),
  notes: z.string().nullable(),
  tags: z.array(z.string()).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GoalSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  targetAmount: z.string(),
  currentAmount: z.string(),
  deadline: z.date().nullable(),
  color: z.string(),
  isCompleted: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const RecurringTransactionSchema = z.object({
  id: z.string(),
  description: z.string(),
  amount: z.string(),
  type: TransactionType,
  categoryId: z.string(),
  frequency: FrequencyType,
  nextDue: z.date(),
  lastExecuted: z.date().nullable(),
  isActive: z.boolean(),
  endDate: z.date().nullable(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Insert schemas (for form validation and API requests)
export const insertCategorySchema = CategorySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = TransactionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGoalSchema = GoalSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  currentAmount: z.string().optional().default("0"),
  isCompleted: z.boolean().optional().default(false),
});

export const insertRecurringTransactionSchema = RecurringTransactionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  isActive: z.boolean().optional().default(true),
  lastExecuted: z.date().nullable().optional(),
});

// Type exports
export type Category = z.infer<typeof CategorySchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type Goal = z.infer<typeof GoalSchema>;
export type RecurringTransaction = z.infer<typeof RecurringTransactionSchema>;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type InsertRecurringTransaction = z.infer<typeof insertRecurringTransactionSchema>;

// Utility types
export type TransactionWithCategory = Transaction & {
  category: Category;
};

export type GoalWithProgress = Goal & {
  progress: number;
  remainingAmount: string;
};

// Constants
export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: "Food & Dining",
    icon: "🍔",
    color: "#ef4444",
    type: "expense",
  },
  {
    name: "Transportation",
    icon: "🚗",
    color: "#3b82f6",
    type: "expense",
  },
  {
    name: "Shopping",
    icon: "🛒",
    color: "#8b5cf6",
    type: "expense",
  },
  {
    name: "Entertainment",
    icon: "🎬",
    color: "#f59e0b",
    type: "expense",
  },
  {
    name: "Healthcare",
    icon: "🏥",
    color: "#06b6d4",
    type: "expense",
  },
  {
    name: "Salary",
    icon: "💰",
    color: "#22c55e",
    type: "income",
  },
  {
    name: "Freelance",
    icon: "💼",
    color: "#10b981",
    type: "income",
  },
  {
    name: "Investment",
    icon: "📈",
    color: "#8b5cf6",
    type: "income",
  },
];

export const FREQUENCY_LABELS: Record<z.infer<typeof FrequencyType>, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

export const TRANSACTION_TYPE_LABELS: Record<z.infer<typeof TransactionType>, string> = {
  income: "Income",
  expense: "Expense",
};