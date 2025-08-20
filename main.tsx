import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BudgetTracker } from "./pages/budget-tracker";
import "./app.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

const root = createRoot(container);

root.render(
  <QueryClientProvider client={queryClient}>
    <BudgetTracker />
  </QueryClientProvider>
);