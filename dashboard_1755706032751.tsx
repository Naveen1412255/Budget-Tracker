import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactions, useCategories } from "@/hooks/use-budget-data";
import { 
  calculateTotalIncome, 
  calculateTotalExpenses, 
  calculateCurrentBalance,
  getThisMonthTransactions,
  calculateDailyAverage,
  getTopCategory,
  formatCurrency,
  formatDate
} from "@/lib/budget-utils";
import { TrendingUp, TrendingDown, Wallet, Target, BarChart3, Calculator } from "lucide-react";

export default function Dashboard() {
  const { data: transactions, isLoading: transactionsLoading } = useTransactions();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  if (transactionsLoading || categoriesLoading) {
    return <DashboardSkeleton />;
  }

  const allTransactions = transactions || [];
  const allCategories = categories || [];
  
  const totalIncome = calculateTotalIncome(allTransactions);
  const totalExpenses = calculateTotalExpenses(allTransactions);
  const currentBalance = calculateCurrentBalance(allTransactions);
  const thisMonthTransactions = getThisMonthTransactions(allTransactions);
  const thisMonthExpenses = calculateTotalExpenses(thisMonthTransactions);
  const dailyAverage = calculateDailyAverage(allTransactions);
  const topCategory = getTopCategory(allTransactions, allCategories);

  return (
    <div className="space-y-8">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mobile-single-column">
        <Card className="balance-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-muted-foreground">Total Income</h3>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="balance-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-muted-foreground">Total Expenses</h3>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="balance-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-muted-foreground">Current Balance</h3>
                <p className={`text-2xl font-bold ${currentBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(currentBalance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mobile-single-column">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">📈</div>
              <div>
                <h4 className="text-xs font-medium text-muted-foreground">This Month</h4>
                <p className="text-lg font-semibold">{formatCurrency(thisMonthExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🎯</div>
              <div>
                <h4 className="text-xs font-medium text-muted-foreground">Daily Average</h4>
                <p className="text-lg font-semibold">{formatCurrency(dailyAverage)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">📊</div>
              <div>
                <h4 className="text-xs font-medium text-muted-foreground">Top Category</h4>
                <p className="text-lg font-semibold">{topCategory}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">💰</div>
              <div>
                <h4 className="text-xs font-medium text-muted-foreground">Transactions</h4>
                <p className="text-lg font-semibold">{allTransactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {allTransactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-4 opacity-50">
                <BarChart3 className="w-full h-full" />
              </div>
              <p>No transactions yet. Add your first transaction!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allTransactions.slice(0, 5).map((transaction) => {
                const category = allCategories.find(cat => cat.id === transaction.categoryId);
                return (
                  <div key={transaction.id} className="transaction-item">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                             style={{ backgroundColor: `${category?.color}20`, color: category?.color }}>
                          {category?.icon || '💰'}
                        </div>
                        <div>
                          <h4 className="font-medium">{transaction.description}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(transaction.date)} • {category?.name || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-semibold ${
                          transaction.type === 'income' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(transaction.amount))}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
