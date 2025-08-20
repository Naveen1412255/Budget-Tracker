import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactions, useCategories } from "@/hooks/use-budget-data";
import { 
  getTransactionSummary, 
  getRecentTransactions, 
  getTopCategories,
  formatCurrency, 
  formatDate 
} from "@/lib/budget-utils";
import { TrendingUp, TrendingDown, DollarSign, ArrowRight, Eye } from "lucide-react";

interface DashboardProps {
  onViewAllTransactions: () => void;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard({ onViewAllTransactions }: DashboardProps) {
  const { data: transactions, isLoading: transactionsLoading } = useTransactions();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  if (transactionsLoading || categoriesLoading) {
    return <DashboardSkeleton />;
  }

  const allTransactions = transactions || [];
  const allCategories = categories || [];
  
  const summary = getTransactionSummary(allTransactions);
  const recentTransactions = getRecentTransactions(allTransactions, 5);
  const topCategories = getTopCategories(allTransactions, allCategories, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-green-600" data-testid="text-total-income">
                  {formatCurrency(summary.totalIncome)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600" data-testid="text-total-expenses">
                  {formatCurrency(summary.totalExpenses)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`} data-testid="text-balance">
                  {formatCurrency(summary.balance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions and Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onViewAllTransactions}
              className="text-blue-600 hover:text-blue-700"
              data-testid="button-view-all-transactions"
            >
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No transactions yet.</p>
                <p className="text-sm">Add your first transaction to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => {
                  const category = allCategories.find(cat => cat.id === transaction.categoryId);
                  return (
                    <div 
                      key={transaction.id} 
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      data-testid={`recent-transaction-${transaction.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{category?.icon || '📊'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(transaction.date)} • {category?.name || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <span className={`font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(transaction.amount))}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Spending Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top Spending Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {topCategories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No expense categories yet.</p>
                <p className="text-sm">Start adding transactions to see your spending patterns!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topCategories.map((group, index) => (
                  <div 
                    key={group.category.id} 
                    className="flex items-center justify-between p-3 rounded-lg border"
                    data-testid={`top-category-${group.category.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{group.category.icon}</span>
                      <div>
                        <p className="font-medium">{group.category.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {group.transactions.length} transaction{group.transactions.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">
                        {formatCurrency(group.total)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        #{index + 1}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold" data-testid="text-transaction-count">{summary.transactionCount}</p>
              <p className="text-sm text-muted-foreground">Total Transactions</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold" data-testid="text-category-count">{allCategories.length}</p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">
                {summary.totalExpenses > 0 ? formatCurrency(summary.totalExpenses / summary.transactionCount) : formatCurrency(0)}
              </p>
              <p className="text-sm text-muted-foreground">Avg per Transaction</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">
                {topCategories.length > 0 ? topCategories[0].category.name : 'None'}
              </p>
              <p className="text-sm text-muted-foreground">Top Category</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}