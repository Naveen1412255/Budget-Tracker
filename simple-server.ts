import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { storage } from "./storage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// API Routes with simple path handling
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await storage.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

app.get("/api/transactions", async (req, res) => {
  try {
    const transactions = await storage.getTransactions();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

app.get("/api/goals", async (req, res) => {
  try {
    const goals = await storage.getGoals();
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch goals" });
  }
});

app.get("/api/recurring", async (req, res) => {
  try {
    const recurring = await storage.getRecurringTransactions();
    res.json(recurring);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch recurring transactions" });
  }
});

// Serve static files from client directory
app.use(express.static(path.join(__dirname, "../client")));

// Serve the main HTML file for all non-API routes
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    res.status(404).json({ error: "API endpoint not found" });
    return;
  }
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`✓ Budget Tracker Server running at http://0.0.0.0:${port}`);
  console.log(`✓ API endpoints available at http://0.0.0.0:${port}/api`);
  console.log(`✓ Frontend available at http://0.0.0.0:${port}`);
});