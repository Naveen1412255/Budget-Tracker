import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactions, useCategories } from "@/hooks/use-budget-data";
import { groupTransactionsByCategory, formatCurrency } from "@/lib/budget-utils";
import { exportToPDF } from "@/lib/export-utils";
import { BarChart3, Download, PieChart, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("30");
  
  const { data: transactions, isLoading: transactionsLoading } = useTransactions();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { toast } = useToast();

  const handleExportReport = async () => {
    if (transactions && categories) {
      try {
        await exportToPDF(filteredTransactions, categories);
        toast({
          title: "Export successful",
          description: "Analytics report has been downloaded.",
        });
      } catch (error) {
        toast({
          title: "Export failed",
          description: "Failed to generate analytics report.",
          variant: "destructive",
        });
      }
    }
  };

  if (transactionsLoading || categoriesLoading) {
    return <AnalyticsSkeleton />;
  }

  const allTransactions = transactions || [];
  const allCategories = categories || [];

  // Filter transactions based on time range
  const now = new Date();
  const daysAgo = new Date(now.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000);
  const filteredTransactions = allTransactions.filter(transaction => 
    new Date(transaction.date) >= daysAgo
  );

  const categoryGroups = groupTransactionsByCategory(filteredTransactions, allCategories);
  const expenseGroups = categoryGroups.filter(group => group.category.type === 'expense');
  const incomeGroups = categoryGroups.filter(group => group.category.type === 'income');

  const totalExpenses = expenseGroups.reduce((sum, group) => sum + group.total, 0);
  const totalIncome = incomeGroups.reduce((sum, group) => sum + Math.abs(group.total), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Analytics & Reports</h2>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 3 Months</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportReport} className="btn-icon">
            <Download className="w-5 h-5" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mobile-single-column">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Total Income</h3>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400 rotate-180" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Total Expenses</h3>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Net Balance</h3>
                <p className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(totalIncome - totalExpenses)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="chart-container flex items-center justify-center">
              {expenseGroups.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  <PieChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No expense data available</p>
                </div>
              ) : (
                <div className="w-full space-y-4">
                  {expenseGroups.map((group) => (
                    <div key={group.categoryId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: group.category.color }}
                        />
                        <span className="text-sm font-medium">
                          {group.category.icon} {group.category.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(group.total)}</p>
                        <p className="text-xs text-muted-foreground">
                          {totalExpenses > 0 ? Math.round((group.total / totalExpenses) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Category Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="chart-container">
              {categoryGroups.length === 0 ? (
                <div className="text-center text-muted-foreground flex items-center justify-center h-full">
                  <div>
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No transaction data available</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {categoryGroups.slice(0, 8).map((group) => {
                    const maxAmount = Math.max(...categoryGroups.map(g => Math.abs(g.total)));
                    const percentage = maxAmount > 0 ? (Math.abs(group.total) / maxAmount) * 100 : 0;
                    
                    return (
                      <div key={group.categoryId} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            {group.category.icon} {group.category.name}
                          </span>
                          <span className="text-sm font-semibold">
                            {formatCurrency(Math.abs(group.total))}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: group.category.color
                            }}
                          />
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

      {/* Transaction Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No transactions found for the selected time period.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{filteredTransactions.length}</p>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{categoryGroups.length}</p>
                  <p className="text-sm text-muted-foreground">Active Categories</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {formatCurrency(filteredTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0) / Math.max(parseInt(timeRange), 1))}
                  </p>
                  <p className="text-sm text-muted-foreground">Daily Average</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-4 h-4 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="text-right space-y-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-8 w-16 mx-auto" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
