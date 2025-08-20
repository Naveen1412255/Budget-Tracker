import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCategorySchema } from "@shared/schema";
import { useCreateCategory, useUpdateCategory } from "@/hooks/use-budget-data";
import { useToast } from "@/hooks/use-toast";
import type { Category, InsertCategory } from "@shared/schema";
import { z } from "zod";

const categoryFormSchema = insertCategorySchema;
type CategoryFormData = z.infer<typeof categoryFormSchema>;

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}

const CATEGORY_ICONS = [
  "🛒", "🍕", "🚗", "🎬", "💡", "🏠", "👕", "📱", "✈️", "🏥",
  "📚", "🎮", "🏋️", "💄", "🎵", "🐕", "🎁", "☕", "🍺", "🚌",
  "💰", "💼", "📈", "🏆", "💎", "🎯", "🔧", "🌟", "❤️", "🎨"
];

const CATEGORY_COLORS = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899",
  "#06B6D4", "#84CC16", "#F97316", "#6366F1", "#14B8A6", "#F43F5E",
  "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#EC4899"
];

export default function CategoryModal({ open, onOpenChange, category }: CategoryModalProps) {
  const [selectedIcon, setSelectedIcon] = useState(CATEGORY_ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0]);
  
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const { toast } = useToast();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      icon: CATEGORY_ICONS[0],
      color: CATEGORY_COLORS[0],
      type: "expense",
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        icon: category.icon,
        color: category.color,
        type: category.type,
      });
      setSelectedIcon(category.icon);
      setSelectedColor(category.color);
    } else {
      form.reset({
        name: "",
        icon: CATEGORY_ICONS[0],
        color: CATEGORY_COLORS[0],
        type: "expense",
      });
      setSelectedIcon(CATEGORY_ICONS[0]);
      setSelectedColor(CATEGORY_COLORS[0]);
    }
  }, [category, form]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const categoryData: InsertCategory = {
        name: data.name,
        icon: selectedIcon,
        color: selectedColor,
        type: data.type,
      };

      if (category) {
        await updateCategory.mutateAsync({
          id: category.id,
          updates: categoryData,
        });
        toast({
          title: "Category updated",
          description: "The category has been successfully updated.",
        });
      } else {
        await createCategory.mutateAsync(categoryData);
        toast({
          title: "Category added",
          description: "The category has been successfully added.",
        });
      }

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${category ? 'update' : 'add'} category. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Category" : "Add Category"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Icon</FormLabel>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {CATEGORY_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`w-10 h-10 border rounded-lg flex items-center justify-center text-lg hover:bg-accent transition-colors ${
                      selectedIcon === icon ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <FormLabel>Color</FormLabel>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {CATEGORY_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor === color ? 'border-foreground scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCategory.isPending || updateCategory.isPending}
              >
                {category ? "Update" : "Add"} Category
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
