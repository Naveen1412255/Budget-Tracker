import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useCreateCategory, useUpdateCategory } from "@/hooks/use-budget-data";
import { useToast } from "@/hooks/use-toast";
import type { Category } from "@shared/schema";

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}

const CATEGORY_ICONS = [
  "🍔", "🏠", "🚗", "⛽", "🛒", "💊", "🎬", "📱", "👕", "✈️",
  "💼", "🎓", "🏥", "🔧", "🎮", "📚", "☕", "🍕", "🎵", "🏋️",
  "💰", "💵", "📈", "🎁", "💳", "🏆", "⭐", "💎", "🔥", "✨"
];

const CATEGORY_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e",
  "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#6b7280"
];

export default function CategoryModal({ open, onOpenChange, category }: CategoryModalProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📊");
  const [color, setColor] = useState("#6b7280");
  const [isIncome, setIsIncome] = useState(false);

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const { toast } = useToast();

  const isEditing = !!category;

  // Reset form when modal opens/closes or category changes
  useEffect(() => {
    if (open) {
      if (category) {
        setName(category.name);
        setIcon(category.icon);
        setColor(category.color);
        setIsIncome(category.type === "income");
      } else {
        // Reset for new category
        setName("");
        setIcon("📊");
        setColor("#6b7280");
        setIsIncome(false);
      }
    }
  }, [open, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please enter a category name.",
        variant: "destructive",
      });
      return;
    }

    const categoryData = {
      name: name.trim(),
      icon,
      color,
      type: isIncome ? "income" : "expense",
    };

    try {
      if (isEditing && category) {
        await updateCategory.mutateAsync({
          id: category.id,
          updates: categoryData,
        });
        toast({
          title: "Category updated",
          description: "Your category has been successfully updated.",
        });
      } else {
        await createCategory.mutateAsync(categoryData);
        toast({
          title: "Category added",
          description: "Your category has been successfully added.",
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "add"} category. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Category" : "Add New Category"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Food & Dining"
              required
              data-testid="input-category-name"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium">Category Type</label>
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${!isIncome ? 'font-medium' : 'text-muted-foreground'}`}>
                  Expense
                </span>
                <Switch
                  checked={isIncome}
                  onCheckedChange={setIsIncome}
                  data-testid="switch-category-type"
                />
                <span className={`text-sm ${isIncome ? 'font-medium' : 'text-muted-foreground'}`}>
                  Income
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Choose Icon</label>
            <div className="grid grid-cols-10 gap-2 max-h-32 overflow-y-auto border rounded p-2">
              {CATEGORY_ICONS.map((iconOption) => (
                <button
                  key={iconOption}
                  type="button"
                  className={`text-2xl p-2 rounded hover:bg-muted transition-colors ${
                    icon === iconOption ? 'bg-primary text-primary-foreground' : ''
                  }`}
                  onClick={() => setIcon(iconOption)}
                  data-testid={`icon-option-${iconOption}`}
                >
                  {iconOption}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Choose Color</label>
            <div className="grid grid-cols-9 gap-2">
              {CATEGORY_COLORS.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === colorOption ? 'border-primary scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: colorOption }}
                  onClick={() => setColor(colorOption)}
                  data-testid={`color-option-${colorOption}`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-category"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createCategory.isPending || updateCategory.isPending}
              data-testid="button-save-category"
            >
              {createCategory.isPending || updateCategory.isPending
                ? "Saving..."
                : isEditing
                ? "Update Category"
                : "Add Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}