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

// In-memory storage interface
export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, updates: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  // Transactions
  getTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;

  // Goals
  getGoals(): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, updates: Partial<InsertGoal>): Promise<Goal>;
  deleteGoal(id: string): Promise<void>;

  // Recurring Transactions
  getRecurringTransactions(): Promise<RecurringTransaction[]>;
  createRecurringTransaction(recurring: InsertRecurringTransaction): Promise<RecurringTransaction>;
  updateRecurringTransaction(id: string, updates: Partial<InsertRecurringTransaction>): Promise<RecurringTransaction>;
  deleteRecurringTransaction(id: string): Promise<void>;
}

// In-memory implementation
export class MemStorage implements IStorage {
  private categories: Category[] = [];
  private transactions: Transaction[] = [];
  private goals: Goal[] = [];
  private recurringTransactions: RecurringTransaction[] = [];

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Default categories
    const defaultCategories: Category[] = [
      {
        id: "cat-1",
        name: "Food & Dining",
        icon: "🍔",
        color: "#ef4444",
        type: "expense" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "cat-2",
        name: "Transportation",
        icon: "🚗",
        color: "#3b82f6",
        type: "expense" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "cat-3",
        name: "Shopping",
        icon: "🛒",
        color: "#8b5cf6",
        type: "expense" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "cat-4",
        name: "Salary",
        icon: "💰",
        color: "#22c55e",
        type: "income" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "cat-5",
        name: "Freelance",
        icon: "💼",
        color: "#10b981",
        type: "income" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    this.categories = defaultCategories;

    // Sample transactions
    const sampleTransactions: Transaction[] = [
      {
        id: "tx-1",
        description: "Grocery shopping",
        amount: "85.50",
        categoryId: "cat-1",
        type: "expense" as const,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        location: "Whole Foods",
        notes: "Weekly groceries",
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "tx-2",
        description: "Gas station",
        amount: "45.00",
        categoryId: "cat-2",
        type: "expense" as const,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        location: "Shell",
        notes: null,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "tx-3",
        description: "Monthly salary",
        amount: "3500.00",
        categoryId: "cat-4",
        type: "income" as const,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        location: null,
        notes: "Regular monthly salary",
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    this.transactions = sampleTransactions;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return [...this.categories];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const newCategory: Category = {
      id: this.generateId(),
      ...category,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.categories.push(newCategory);
    return newCategory;
  }

  async updateCategory(id: string, updates: Partial<InsertCategory>): Promise<Category> {
    const index = this.categories.findIndex(cat => cat.id === id);
    if (index === -1) {
      throw new Error("Category not found");
    }
    
    this.categories[index] = {
      ...this.categories[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    return this.categories[index];
  }

  async deleteCategory(id: string): Promise<void> {
    const index = this.categories.findIndex(cat => cat.id === id);
    if (index === -1) {
      throw new Error("Category not found");
    }
    this.categories.splice(index, 1);
  }

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    return [...this.transactions];
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const newTransaction: Transaction = {
      id: this.generateId(),
      ...transaction,
      location: transaction.location ?? null,
      notes: transaction.notes ?? null,
      tags: transaction.tags ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.transactions.push(newTransaction);
    return newTransaction;
  }

  async updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction> {
    const index = this.transactions.findIndex(tx => tx.id === id);
    if (index === -1) {
      throw new Error("Transaction not found");
    }
    
    this.transactions[index] = {
      ...this.transactions[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    return this.transactions[index];
  }

  async deleteTransaction(id: string): Promise<void> {
    const index = this.transactions.findIndex(tx => tx.id === id);
    if (index === -1) {
      throw new Error("Transaction not found");
    }
    this.transactions.splice(index, 1);
  }

  // Goals
  async getGoals(): Promise<Goal[]> {
    return [...this.goals];
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const newGoal: Goal = {
      id: this.generateId(),
      ...goal,
      description: goal.description ?? null,
      currentAmount: goal.currentAmount ?? "0",
      deadline: goal.deadline ?? null,
      isCompleted: goal.isCompleted ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.goals.push(newGoal);
    return newGoal;
  }

  async updateGoal(id: string, updates: Partial<InsertGoal>): Promise<Goal> {
    const index = this.goals.findIndex(goal => goal.id === id);
    if (index === -1) {
      throw new Error("Goal not found");
    }
    
    this.goals[index] = {
      ...this.goals[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    return this.goals[index];
  }

  async deleteGoal(id: string): Promise<void> {
    const index = this.goals.findIndex(goal => goal.id === id);
    if (index === -1) {
      throw new Error("Goal not found");
    }
    this.goals.splice(index, 1);
  }

  // Recurring Transactions
  async getRecurringTransactions(): Promise<RecurringTransaction[]> {
    return [...this.recurringTransactions];
  }

  async createRecurringTransaction(recurring: InsertRecurringTransaction): Promise<RecurringTransaction> {
    const newRecurring: RecurringTransaction = {
      id: this.generateId(),
      ...recurring,
      notes: recurring.notes ?? null,
      lastExecuted: recurring.lastExecuted ?? null,
      isActive: recurring.isActive ?? true,
      endDate: recurring.endDate ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.recurringTransactions.push(newRecurring);
    return newRecurring;
  }

  async updateRecurringTransaction(id: string, updates: Partial<InsertRecurringTransaction>): Promise<RecurringTransaction> {
    const index = this.recurringTransactions.findIndex(recurring => recurring.id === id);
    if (index === -1) {
      throw new Error("Recurring transaction not found");
    }
    
    this.recurringTransactions[index] = {
      ...this.recurringTransactions[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    return this.recurringTransactions[index];
  }

  async deleteRecurringTransaction(id: string): Promise<void> {
    const index = this.recurringTransactions.findIndex(recurring => recurring.id === id);
    if (index === -1) {
      throw new Error("Recurring transaction not found");
    }
    this.recurringTransactions.splice(index, 1);
  }
}

// Global storage instance
export const storage = new MemStorage();