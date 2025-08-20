import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import Dashboard from "@/components/budget/dashboard";
import Transactions from "@/components/budget/transactions";
import Categories from "@/components/budget/categories";
import Analytics from "@/components/budget/analytics";
import Goals from "@/components/budget/goals";
import Recurring from "@/components/budget/recurring";
import Settings from "@/components/budget/settings";
import TransactionModal from "@/components/budget/modals/transaction-modal";
import { Plus, Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "@/components/ui/theme-provider";

export default function BudgetTracker() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [forceRefresh, setForceRefresh] = useState(0);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Force refresh components when tab changes to prevent stale data
  useEffect(() => {
    setForceRefresh(prev => prev + 1);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="budget-header">
        <div className="flex justify-between items-center h-full px-4 max-w-7xl mx-auto">
          <h1 className="text-xl font-semibold text-primary flex items-center gap-2">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.12 0-1.9.56-1.9 1.3 0 .69.44 1.27 2.67 1.79 2.48.59 4.18 1.61 4.18 3.7 0 1.82-1.39 2.94-3.11 3.31z"/>
            </svg>
            Budget Tracker
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-full lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`budget-nav ${isMobile && !isMobileMenuOpen ? 'hidden' : ''}`}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex h-full bg-transparent border-0 gap-0 rounded-none">
            <TabsTrigger value="dashboard" className="nav-btn">Dashboard</TabsTrigger>
            <TabsTrigger value="transactions" className="nav-btn">Transactions</TabsTrigger>
            <TabsTrigger value="categories" className="nav-btn">Categories</TabsTrigger>
            <TabsTrigger value="analytics" className="nav-btn">Analytics</TabsTrigger>
            <TabsTrigger value="goals" className="nav-btn">Goals</TabsTrigger>
            <TabsTrigger value="recurring" className="nav-btn">Recurring</TabsTrigger>
            <TabsTrigger value="settings" className="nav-btn">Settings</TabsTrigger>
          </TabsList>
        </Tabs>
      </nav>

      {/* Main Content */}
      <main className="budget-main">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="dashboard" className="mt-0">
            <Dashboard key={`dashboard-${forceRefresh}`} />
          </TabsContent>
          <TabsContent value="transactions" className="mt-0">
            <Transactions key={`transactions-${forceRefresh}`} />
          </TabsContent>
          <TabsContent value="categories" className="mt-0">
            <Categories key={`categories-${forceRefresh}`} />
          </TabsContent>
          <TabsContent value="analytics" className="mt-0">
            <Analytics key={`analytics-${forceRefresh}`} />
          </TabsContent>
          <TabsContent value="goals" className="mt-0">
            <Goals key={`goals-${forceRefresh}`} />
          </TabsContent>
          <TabsContent value="recurring" className="mt-0">
            <Recurring key={`recurring-${forceRefresh}`} />
          </TabsContent>
          <TabsContent value="settings" className="mt-0">
            <Settings key={`settings-${forceRefresh}`} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating Action Button */}
      <Button
        onClick={() => setIsTransactionModalOpen(true)}
        className="fab"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Transaction Modal */}
      <TransactionModal
        open={isTransactionModalOpen}
        onOpenChange={setIsTransactionModalOpen}
      />
    </div>
  );
}
