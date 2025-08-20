import { format } from "date-fns";
import type { Transaction, Category } from "@shared/schema";

export interface FilterOptions {
  search?: string;
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CategoryGroup {
  category: Category;
  transactions: Transaction[];
  total: number;
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MMM d, yyyy");
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MMM d, yyyy 'at' h:mm a");
}

export function filterTransactions(
  transactions: Transaction[],
  filters: FilterOptions
): Transaction[] {
  return transactions.filter((transaction) => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matches = 
        transaction.description.toLowerCase().includes(searchTerm) ||
        transaction.notes?.toLowerCase().includes(searchTerm) ||
        transaction.amount.toString().includes(searchTerm);
      if (!matches) return false;
    }

    // Category filter
    if (filters.categoryId && transaction.categoryId !== filters.categoryId) {
      return false;
    }

    // Date range filter
    if (filters.dateFrom) {
      const transactionDate = new Date(transaction.date);
      const fromDate = new Date(filters.dateFrom);
      if (transactionDate < fromDate) return false;
    }

    if (filters.dateTo) {
      const transactionDate = new Date(transaction.date);
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      if (transactionDate > toDate) return false;
    }

    return true;
  });
}

export function groupTransactionsByCategory(
  transactions: Transaction[],
  categories: Category[]
): CategoryGroup[] {
  const groupMap = new Map<string, CategoryGroup>();

  // Initialize groups for each category
  categories.forEach((category) => {
    groupMap.set(category.id, {
      category,
      transactions: [],
      total: 0,
    });
  });

  // Group transactions by category
  transactions.forEach((transaction) => {
    const group = groupMap.get(transaction.categoryId);
    if (group) {
      group.transactions.push(transaction);
      const amount = parseFloat(transaction.amount);
      group.total += transaction.type === "expense" ? amount : -amount;
    }
  });

  // Filter out empty groups and sort by total (highest first)
  return Array.from(groupMap.values())
    .filter((group) => group.transactions.length > 0)
    .sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
}

export function calculateMonthlyTotals(
  transactions: Transaction[],
  categories: Category[]
): { [month: string]: { [categoryId: string]: number } } {
  const monthlyTotals: { [month: string]: { [categoryId: string]: number } } = {};

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const monthKey = format(date, "yyyy-MM");
    const amount = parseFloat(transaction.amount);

    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = {};
    }

    if (!monthlyTotals[monthKey][transaction.categoryId]) {
      monthlyTotals[monthKey][transaction.categoryId] = 0;
    }

    monthlyTotals[monthKey][transaction.categoryId] += amount;
  });

  return monthlyTotals;
}

export function getTransactionSummary(transactions: Transaction[]): {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
} {
  const summary = transactions.reduce(
    (acc, transaction) => {
      const amount = parseFloat(transaction.amount);
      if (transaction.type === "income") {
        acc.totalIncome += amount;
      } else {
        acc.totalExpenses += amount;
      }
      acc.transactionCount += 1;
      return acc;
    },
    { totalIncome: 0, totalExpenses: 0, transactionCount: 0 }
  );

  return {
    ...summary,
    balance: summary.totalIncome - summary.totalExpenses,
  };
}

export function getCategoryColor(category: Category): string {
  return category.color || "#6B7280";
}

export function getCategoryIcon(category: Category): string {
  return category.icon || "📊";
}

export function sortTransactionsByDate(
  transactions: Transaction[],
  direction: "asc" | "desc" = "desc"
): Transaction[] {
  return [...transactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return direction === "desc" ? dateB - dateA : dateA - dateB;
  });
}

export function getRecentTransactions(
  transactions: Transaction[],
  limit: number = 5
): Transaction[] {
  return sortTransactionsByDate(transactions, "desc").slice(0, limit);
}

export function getTopCategories(
  transactions: Transaction[],
  categories: Category[],
  limit: number = 5
): CategoryGroup[] {
  const groups = groupTransactionsByCategory(transactions, categories);
  return groups
    .filter((group) => group.category.type === "expense")
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}