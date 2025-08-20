import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { 
  Category, 
  Transaction, 
  Goal, 
  RecurringTransaction,
  InsertCategory,
  InsertTransaction,
  InsertGoal,
  InsertRecurringTransaction
} from "@shared/schema";

// Categories
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: InsertCategory) => {
      const response = await apiRequest("POST", "/api/categories", category);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InsertCategory> }) => {
      const response = await apiRequest("PUT", `/api/categories/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/categories/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
  });
}

// Transactions
export function useTransactions() {
  return useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transaction: InsertTransaction) => {
      const response = await apiRequest("POST", "/api/transactions", transaction);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InsertTransaction> }) => {
      const response = await apiRequest("PUT", `/api/transactions/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/transactions/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
  });
}

// Goals
export function useGoals() {
  return useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (goal: InsertGoal) => {
      const response = await apiRequest("POST", "/api/goals", goal);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InsertGoal> }) => {
      const response = await apiRequest("PUT", `/api/goals/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/goals/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });
}

// Recurring Transactions
export function useRecurringTransactions() {
  return useQuery<RecurringTransaction[]>({
    queryKey: ["/api/recurring"],
  });
}

export function useCreateRecurringTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (recurring: InsertRecurringTransaction) => {
      const response = await apiRequest("POST", "/api/recurring", recurring);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recurring"] });
    },
  });
}

export function useUpdateRecurringTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InsertRecurringTransaction> }) => {
      const response = await apiRequest("PUT", `/api/recurring/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recurring"] });
    },
  });
}

export function useDeleteRecurringTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/recurring/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recurring"] });
    },
  });
}