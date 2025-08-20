import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories, useTransactions, useDeleteCategory } from "@/hooks/use-budget-data";
import { groupTransactionsByCategory, formatCurrency } from "@/lib/budget-utils";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CategoryModal from "./modals/category-modal";
import type { Category } from "@shared/schema";

export default function Categories() {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: transactions, isLoading: transactionsLoading } = useTransactions();
  const deleteCategory = useDeleteCategory();
  const { toast } = useToast();

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      try {
        await deleteCategory.mutateAsync(id);
        toast({
          title: "Category deleted",
          description: "The category has been successfully deleted.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete category. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  if (categoriesLoading || transactionsLoading) {
    return <CategoriesSkeleton />;
  }

  const allCategories = categories || [];
  const allTransactions = transactions || [];
  const categoryGroups = groupTransactionsByCategory(allTransactions, allCategories);

  // Create a map for quick lookup of category stats
  const categoryStatsMap = new Map(
    categoryGroups.map(group => [
      group.categoryId,
      {
        total: Math.abs(group.total),
        count: group.count
      }
    ])
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Categories</h2>
        <Button onClick={handleAddCategory} className="btn-icon">
          <Plus className="w-5 h-5" />
          Add Category
        </Button>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mobile-single-column">
        {allCategories.length === 0 ? (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 opacity-50">
                <Plus className="w-full h-full" />
              </div>
              <p className="text-muted-foreground">
                No categories yet. Create your first category to get started!
              </p>
              <Button onClick={handleAddCategory} className="mt-4">
                Add Category
              </Button>
            </CardContent>
          </Card>
        ) : (
          allCategories.map((category) => {
            const stats = categoryStatsMap.get(category.id) || { total: 0, count: 0 };
            return (
              <Card key={category.id} className="category-summary-card hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                        style={{ 
                          backgroundColor: `${category.color}20`,
                          color: category.color 
                        }}
                      >
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {stats.count} transaction{stats.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditCategory(category)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={deleteCategory.isPending}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p 
                      className="text-2xl font-bold"
                      style={{ color: category.color }}
                    >
                      {formatCurrency(stats.total)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {category.type === 'income' ? 'Total Income' : 'Total Spent'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Category Modal */}
      <CategoryModal
        open={isCategoryModalOpen}
        onOpenChange={(open: boolean) => {
          setIsCategoryModalOpen(open);
          if (!open) {
            setEditingCategory(null);
          }
        }}
        category={editingCategory}
      />
    </div>
  );
}

function CategoriesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-8 w-20 ml-auto" />
                <Skeleton className="h-4 w-16 ml-auto" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
