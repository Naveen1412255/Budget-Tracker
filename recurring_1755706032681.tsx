import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecurringTransactions, useCategories, useDeleteRecurringTransaction, useUpdateRecurringTransaction } from "@/hooks/use-budget-data";
import { formatCurrency, formatDate } from "@/lib/budget-utils";
import { Plus, Edit, Trash2, Clock, Play, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RecurringModal from "./modals/recurring-modal";
import type { RecurringTransaction } from "@shared/schema";

export default function Recurring() {
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);

  const { data: recurringTransactions, isLoading: recurringLoading } = useRecurringTransactions();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const deleteRecurring = useDeleteRecurringTransaction();
  const updateRecurring = useUpdateRecurringTransaction();
  const { toast } = useToast();

  const handleDeleteRecurring = async (id: string) => {
    if (confirm("Are you sure you want to delete this recurring transaction?")) {
      try {
        await deleteRecurring.mutateAsync(id);
        toast({
          title: "Recurring transaction deleted",
          description: "The recurring transaction has been successfully deleted.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete recurring transaction. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleActive = async (recurring: RecurringTransaction) => {
    try {
      await updateRecurring.mutateAsync({
        id: recurring.id,
        updates: { isActive: !recurring.isActive }
      });
      toast({
        title: `Recurring transaction ${recurring.isActive ? 'paused' : 'activated'}`,
        description: `The recurring transaction is now ${recurring.isActive ? 'inactive' : 'active'}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update recurring transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditRecurring = (recurring: RecurringTransaction) => {
    setEditingRecurring(recurring);
    setIsRecurringModalOpen(true);
  };

  const handleAddRecurring = () => {
    setEditingRecurring(null);
    setIsRecurringModalOpen(true);
  };

  if (recurringLoading || categoriesLoading) {
    return <RecurringSkeleton />;
  }

  const allRecurring = recurringTransactions || [];
  const allCategories = categories || [];
  const categoryMap = new Map(allCategories.map(cat => [cat.id, cat]));

  const getFrequencyBadgeColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'weekly': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'monthly': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'yearly': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recurring Transactions</h2>
        <Button onClick={handleAddRecurring} className="btn-icon">
          <Plus className="w-5 h-5" />
          Add Recurring
        </Button>
      </div>

      {/* Recurring Transactions List */}
      <div className="space-y-4">
        {allRecurring.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 opacity-50">
                <Clock className="w-full h-full" />
              </div>
              <p className="text-muted-foreground">
                No recurring transactions yet. Create your first recurring transaction to automate your budget!
              </p>
              <Button onClick={handleAddRecurring} className="mt-4">
                Add Recurring Transaction
              </Button>
            </CardContent>
          </Card>
        ) : (
          allRecurring.map((recurring) => {
            const category = categoryMap.get(recurring.categoryId);
            const nextDate = new Date(recurring.nextDate);
            const isOverdue = nextDate < new Date();

            return (
              <Card key={recurring.id} className={`transition-all ${!recurring.isActive ? 'opacity-60' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ 
                          backgroundColor: category ? `${category.color}20` : '#f3f4f6',
                          color: category?.color || '#6b7280'
                        }}
                      >
                        {category?.icon || '📄'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{recurring.description}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getFrequencyBadgeColor(recurring.frequency)}>
                            {recurring.frequency.charAt(0).toUpperCase() + recurring.frequency.slice(1)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Next: {formatDate(nextDate)}
                            {isOverdue && <span className="text-destructive font-medium"> (Overdue)</span>}
                          </span>
                        </div>
                        {category && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {category.name}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${
                        recurring.type === 'income' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {recurring.type === 'income' ? '+' : '-'}
                        {formatCurrency(parseFloat(recurring.amount))}
                      </p>
                      <div className="flex gap-1 mt-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(recurring)}
                          disabled={updateRecurring.isPending}
                          className="h-8 w-8"
                          title={recurring.isActive ? "Pause" : "Activate"}
                        >
                          {recurring.isActive ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditRecurring(recurring)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRecurring(recurring.id)}
                          disabled={deleteRecurring.isPending}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Recurring Modal */}
      <RecurringModal
        open={isRecurringModalOpen}
        onOpenChange={(open: boolean) => {
          setIsRecurringModalOpen(open);
          if (!open) {
            setEditingRecurring(null);
          }
        }}
        recurring={editingRecurring}
      />
    </div>
  );
}

function RecurringSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-10 w-36" />
      </div>
      
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-6 w-20" />
                  <div className="flex gap-1">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
