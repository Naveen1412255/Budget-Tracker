import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { setupRoutes } from "./routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
setupRoutes(app);

// Serve static files from client directory in development
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
  console.log(`Server running at http://0.0.0.0:${port}`);
  console.log(`API available at http://0.0.0.0:${port}/api`);
  console.log(`Frontend available at http://0.0.0.0:${port}`);
});