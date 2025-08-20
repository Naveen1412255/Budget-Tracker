import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactions, useCategories } from "@/hooks/use-budget-data";
import { getTransactionSummary, formatCurrency } from "@/lib/budget-utils";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function Analytics() {
  const { data: transactions, isLoading: transactionsLoading } = useTransactions();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  if (transactionsLoading || categoriesLoading) {
    return <AnalyticsSkeleton />;
  }

  const allTransactions = transactions || [];
  const allCategories = categories || [];
  const summary = getTransactionSummary(allTransactions);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.totalIncome)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingDown className="h-4 w-4 text-red-600 mr-2" />
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.totalExpenses)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-muted-foreground">Net Balance</p>
                <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.balance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <PieChart className="h-4 w-4 text-purple-600 mr-2" />
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{summary.transactionCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Card>
        <CardHeader>
          <CardTitle>Spending Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <PieChart className="h-12 w-12 mx-auto mb-4" />
              <p>Chart visualization coming soon</p>
              <p className="text-sm">Advanced analytics and charts will be available in the next update</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Category Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allCategories.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No categories available. Create categories to see analytics.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allCategories.map((category) => {
                  const categoryTransactions = allTransactions.filter(t => t.categoryId === category.id);
                  const categoryTotal = categoryTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
                  
                  return (
                    <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{category.icon}</span>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {categoryTransactions.length} transactions
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          category.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(categoryTotal)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {category.type}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}