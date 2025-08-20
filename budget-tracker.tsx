import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Category, Transaction } from "@shared/schema";

// Simple components for the budget tracker
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, className = "" }: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  className?: string 
}) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${className}`}
  >
    {children}
  </button>
);

export function BudgetTracker() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "transactions" | "categories">("dashboard");

  // Fetch data from API
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: () => fetch("/api/categories").then(res => res.json()),
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    queryFn: () => fetch("/api/transactions").then(res => res.json()),
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(amount));
  };

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  const renderDashboard = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Budget Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-green-50 border-green-200">
          <h3 className="text-lg font-semibold text-green-800">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome.toString())}</p>
        </Card>
        
        <Card className="bg-red-50 border-red-200">
          <h3 className="text-lg font-semibold text-red-800">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses.toString())}</p>
        </Card>
        
        <Card className={`${balance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
          <h3 className={`text-lg font-semibold ${balance >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
            Balance
          </h3>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(balance.toString())}
          </p>
        </Card>
      </div>

      <Card>
        <h3 className="text-xl font-semibold mb-4">Recent Transactions</h3>
        {transactionsLoading ? (
          <p>Loading transactions...</p>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => {
              const category = categories.find(c => c.id === transaction.categoryId);
              return (
                <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{category?.icon || "💰"}</span>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{category?.name}</p>
                    </div>
                  </div>
                  <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <Button>Add Transaction</Button>
      </div>
      
      <Card>
        {transactionsLoading ? (
          <p>Loading transactions...</p>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const category = categories.find(c => c.id === transaction.categoryId);
              return (
                <div key={transaction.id} className="flex justify-between items-center p-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">{category?.icon || "💰"}</span>
                    <div>
                      <p className="font-semibold">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {category?.name} • {new Date(transaction.date).toLocaleDateString()}
                      </p>
                      {transaction.notes && (
                        <p className="text-sm text-gray-400">{transaction.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    {transaction.location && (
                      <p className="text-sm text-gray-400">{transaction.location}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        <Button>Add Category</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoriesLoading ? (
          <p>Loading categories...</p>
        ) : (
          categories.map((category) => {
            const categoryTransactions = transactions.filter(t => t.categoryId === category.id);
            const categoryTotal = categoryTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
            
            return (
              <Card key={category.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-3xl">{category.icon}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{category.type}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <p className={`font-semibold ${category.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(categoryTotal.toString())}
                  </p>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {categoryTransactions.length} transaction{categoryTransactions.length !== 1 ? 's' : ''}
                </p>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Budget Tracker</h1>
            </div>
            <div className="flex space-x-8">
              {(["dashboard", "transactions", "categories"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "transactions" && renderTransactions()}
        {activeTab === "categories" && renderCategories()}
      </main>
    </div>
  );
}