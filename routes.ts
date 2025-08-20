import type { Application } from "express";
import { storage } from "./storage.js";
import { 
  insertCategorySchema, 
  insertTransactionSchema, 
  insertGoalSchema, 
  insertRecurringTransactionSchema 
} from "@shared/schema";

export function setupRoutes(app: Application) {
  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const data = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(data);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ error: "Invalid category data" });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, data);
      res.json(category);
    } catch (error) {
      res.status(400).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCategory(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: "Failed to delete category" });
    }
  });

  // Transactions routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const data = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(data);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ error: "Invalid transaction data" });
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(id, data);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ error: "Failed to update transaction" });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTransaction(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: "Failed to delete transaction" });
    }
  });

  // Goals routes
  app.get("/api/goals", async (req, res) => {
    try {
      const goals = await storage.getGoals();
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const data = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(data);
      res.status(201).json(goal);
    } catch (error) {
      res.status(400).json({ error: "Invalid goal data" });
    }
  });

  app.put("/api/goals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertGoalSchema.partial().parse(req.body);
      const goal = await storage.updateGoal(id, data);
      res.json(goal);
    } catch (error) {
      res.status(400).json({ error: "Failed to update goal" });
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteGoal(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: "Failed to delete goal" });
    }
  });

  // Recurring transactions routes
  app.get("/api/recurring", async (req, res) => {
    try {
      const recurring = await storage.getRecurringTransactions();
      res.json(recurring);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recurring transactions" });
    }
  });

  app.post("/api/recurring", async (req, res) => {
    try {
      const data = insertRecurringTransactionSchema.parse(req.body);
      const recurring = await storage.createRecurringTransaction(data);
      res.status(201).json(recurring);
    } catch (error) {
      res.status(400).json({ error: "Invalid recurring transaction data" });
    }
  });

  app.put("/api/recurring/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertRecurringTransactionSchema.partial().parse(req.body);
      const recurring = await storage.updateRecurringTransaction(id, data);
      res.json(recurring);
    } catch (error) {
      res.status(400).json({ error: "Failed to update recurring transaction" });
    }
  });

  app.delete("/api/recurring/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteRecurringTransaction(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: "Failed to delete recurring transaction" });
    }
  });
}