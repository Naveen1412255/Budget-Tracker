import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCategories, useCreateTransaction, useUpdateTransaction } from "@/hooks/use-budget-data";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Transaction } from "@shared/schema";

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction | null;
}

export default function TransactionModal({ open, onOpenChange, transaction }: TransactionModalProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isIncome, setIsIncome] = useState(false);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const { data: categories } = useCategories();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const { toast } = useToast();

  const isEditing = !!transaction;

  // Reset form when modal opens/closes or transaction changes
  useEffect(() => {
    if (open) {
      if (transaction) {
        setDescription(transaction.description);
        setAmount(transaction.amount);
        setCategoryId(transaction.categoryId);
        setIsIncome(transaction.type === "income");
        setDate(format(new Date(transaction.date), "yyyy-MM-dd"));
        setLocation(transaction.location || "");
        setNotes(transaction.notes || "");
      } else {
        // Reset for new transaction
        setDescription("");
        setAmount("");
        setCategoryId("");
        setIsIncome(false);
        setDate(format(new Date(), "yyyy-MM-dd"));
        setLocation("");
        setNotes("");
      }
    }
  }, [open, transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim() || !amount || !categoryId) {
      toast({
        title: "Missing required fields",
        description: "Please fill in description, amount, and category.",
        variant: "destructive",
      });
      return;
    }

    const transactionData = {
      description: description.trim(),
      amount: parseFloat(amount).toFixed(2),
      categoryId,
      type: isIncome ? "income" : "expense",
      date: new Date(date + "T12:00:00"),
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      tags: [],
    };

    try {
      if (isEditing && transaction) {
        await updateTransaction.mutateAsync({
          id: transaction.id,
          updates: transactionData,
        });
        toast({
          title: "Transaction updated",
          description: "Your transaction has been successfully updated.",
        });
      } else {
        await createTransaction.mutateAsync(transactionData);
        toast({
          title: "Transaction added",
          description: "Your transaction has been successfully added.",
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "add"} transaction. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const availableCategories = categories?.filter(cat => 
    cat.type === (isIncome ? "income" : "expense")
  ) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Transaction" : "Add New Transaction"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Grocery shopping"
                required
                data-testid="input-transaction-description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Amount <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                data-testid="input-transaction-amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                data-testid="input-transaction-date"
              />
            </div>

            <div className="col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Transaction Type</label>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${!isIncome ? 'font-medium' : 'text-muted-foreground'}`}>
                    Expense
                  </span>
                  <Switch
                    checked={isIncome}
                    onCheckedChange={setIsIncome}
                    data-testid="switch-transaction-type"
                  />
                  <span className={`text-sm ${isIncome ? 'font-medium' : 'text-muted-foreground'}`}>
                    Income
                  </span>
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger data-testid="select-transaction-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableCategories.length === 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  No {isIncome ? "income" : "expense"} categories available. Create one first.
                </p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Location (Optional)</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Walmart, Downtown"
                data-testid="input-transaction-location"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional details..."
                data-testid="input-transaction-notes"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-transaction"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTransaction.isPending || updateTransaction.isPending}
              data-testid="button-save-transaction"
            >
              {createTransaction.isPending || updateTransaction.isPending
                ? "Saving..."
                : isEditing
                ? "Update Transaction"
                : "Add Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}