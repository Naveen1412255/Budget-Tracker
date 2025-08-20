import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecurringTransactions, useCategories } from "@/hooks/use-budget-data";
import { formatCurrency, formatDate } from "@/lib/budget-utils";
import { Plus, RefreshCw, Calendar, Pause, Play } from "lucide-react";

function RecurringSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function Recurring() {
  const { data: recurringTransactions, isLoading: recurringLoading } = useRecurringTransactions();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  if (recurringLoading || categoriesLoading) {
    return <RecurringSkeleton />;
  }

  const allRecurring = recurringTransactions || [];
  const allCategories = categories || [];
  const categoryMap = new Map(allCategories.map(cat => [cat.id, cat]));

  const activeRecurring = allRecurring.filter(r => r.isActive);
  const inactiveRecurring = allRecurring.filter(r => !r.isActive);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recurring Transactions</h2>
        <Button className="btn-icon" data-testid="button-add-recurring">
          <Plus className="w-4 h-4" />
          Add Recurring
        </Button>
      </div>

      {allRecurring.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Recurring Transactions</h3>
            <p className="text-muted-foreground mb-4">
              Set up recurring transactions to automatically track regular income and expenses.
            </p>
            <Button className="btn-icon">
              <Plus className="w-4 h-4" />
              Create Your First Recurring Transaction
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Active Recurring Transactions */}
          {activeRecurring.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-600">Active</h3>
              <div className="space-y-4">
                {activeRecurring.map((recurring) => {
                  const category = categoryMap.get(recurring.categoryId);
                  return (
                    <Card key={recurring.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-2xl">{category?.icon || '📊'}</span>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{recurring.description}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Calendar className="h-3 w-3" />
                                <span>Every {recurring.frequency}</span>
                                <span>•</span>
                                <span>Next: {formatDate(recurring.nextDue)}</span>
                                <span>•</span>
                                <span>{category?.name || 'Unknown Category'}</span>
                              </div>
                              {recurring.notes && (
                                <p className="text-sm text-muted-foreground mt-1">{recurring.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`font-semibold ${
                              recurring.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {recurring.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(recurring.amount))}
                            </span>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Pause className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Inactive Recurring Transactions */}
          {inactiveRecurring.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Inactive</h3>
              <div className="space-y-4">
                {inactiveRecurring.map((recurring) => {
                  const category = categoryMap.get(recurring.categoryId);
                  return (
                    <Card key={recurring.id} className="opacity-60">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-2xl">{category?.icon || '📊'}</span>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{recurring.description}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Calendar className="h-3 w-3" />
                                <span>Every {recurring.frequency}</span>
                                <span>•</span>
                                <span>{category?.name || 'Unknown Category'}</span>
                                <span>•</span>
                                <span className="text-red-600">Paused</span>
                              </div>
                              {recurring.notes && (
                                <p className="text-sm text-muted-foreground mt-1">{recurring.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`font-semibold ${
                              recurring.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {recurring.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(recurring.amount))}
                            </span>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Play className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}