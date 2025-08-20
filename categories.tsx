import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories, useDeleteCategory } from "@/hooks/use-budget-data";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";
import CategoryModal from "./modals/category-modal";
import type { Category } from "@shared/schema";

function CategoriesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function Categories() {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { data: categories, isLoading } = useCategories();
  const deleteCategory = useDeleteCategory();
  const { toast } = useToast();

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the category "${name}"?`)) {
      try {
        await deleteCategory.mutateAsync(id);
        toast({
          title: "Category deleted",
          description: `"${name}" has been successfully deleted.`,
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

  if (isLoading) {
    return <CategoriesSkeleton />;
  }

  const allCategories = categories || [];
  const incomeCategories = allCategories.filter(cat => cat.type === "income");
  const expenseCategories = allCategories.filter(cat => cat.type === "expense");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <Button
          onClick={() => setIsCategoryModalOpen(true)}
          className="btn-icon"
          data-testid="button-add-category"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {/* Income Categories */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-green-600">Income Categories</h3>
        {incomeCategories.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No income categories yet.</p>
              <p className="text-sm text-muted-foreground">Create your first income category!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {incomeCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span 
                        className="text-2xl p-2 rounded"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        {category.icon}
                      </span>
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-sm text-green-600">Income</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditCategory(category)}
                        className="h-8 w-8"
                        data-testid={`button-edit-category-${category.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCategory(category.id, category.name)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        data-testid={`button-delete-category-${category.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Expense Categories */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-red-600">Expense Categories</h3>
        {expenseCategories.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No expense categories yet.</p>
              <p className="text-sm text-muted-foreground">Create your first expense category!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenseCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span 
                        className="text-2xl p-2 rounded"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        {category.icon}
                      </span>
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-sm text-red-600">Expense</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditCategory(category)}
                        className="h-8 w-8"
                        data-testid={`button-edit-category-${category.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCategory(category.id, category.name)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        data-testid={`button-delete-category-${category.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Category Modal */}
      <CategoryModal
        open={isCategoryModalOpen}
        onOpenChange={(open) => {
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