import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRecurringTransactionSchema } from "@shared/schema";
import { useCategories, useCreateRecurringTransaction, useUpdateRecurringTransaction } from "@/hooks/use-budget-data";
import { useToast } from "@/hooks/use-toast";
import type { RecurringTransaction, InsertRecurringTransaction } from "@shared/schema";
import { z } from "zod";

const recurringFormSchema = insertRecurringTransactionSchema.extend({
  amount: z.string().min(1, "Amount is required"),
  nextDate: z.string().min(1, "Next date is required"),
});

type RecurringFormData = z.infer<typeof recurringFormSchema>;

interface RecurringModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recurring?: RecurringTransaction | null;
}

export default function RecurringModal({ open, onOpenChange, recurring }: RecurringModalProps) {
  const { data: categories } = useCategories();
  const createRecurring = useCreateRecurringTransaction();
  const updateRecurring = useUpdateRecurringTransaction();
  const { toast } = useToast();

  const form = useForm<RecurringFormData>({
    resolver: zodResolver(recurringFormSchema),
    defaultValues: {
      description: "",
      amount: "",
      categoryId: "",
      type: "expense",
      frequency: "monthly",
      nextDate: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (recurring) {
      form.reset({
        description: recurring.description,
        amount: recurring.amount,
        categoryId: recurring.categoryId,
        type: recurring.type,
        frequency: recurring.frequency,
        nextDate: new Date(recurring.nextDate).toISOString().split('T')[0],
      });
    } else {
      form.reset({
        description: "",
        amount: "",
        categoryId: "",
        type: "expense",
        frequency: "monthly",
        nextDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [recurring, form]);

  const onSubmit = async (data: RecurringFormData) => {
    try {
      const recurringData: InsertRecurringTransaction = {
        description: data.description,
        amount: data.amount,
        categoryId: data.categoryId,
        type: data.type,
        frequency: data.frequency,
        nextDate: new Date(data.nextDate),
      };

      if (recurring) {
        await updateRecurring.mutateAsync({
          id: recurring.id,
          updates: recurringData,
        });
        toast({
          title: "Recurring transaction updated",
          description: "The recurring transaction has been successfully updated.",
        });
      } else {
        await createRecurring.mutateAsync(recurringData);
        toast({
          title: "Recurring transaction added",
          description: "The recurring transaction has been successfully added.",
        });
      }

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${recurring ? 'update' : 'add'} recurring transaction. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const filteredCategories = categories?.filter(cat => cat.type === form.watch("type")) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {recurring ? "Edit Recurring Transaction" : "Add Recurring Transaction"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter transaction description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
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
            </div>

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nextDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                disabled={createRecurring.isPending || updateRecurring.isPending}
              >
                {recurring ? "Update" : "Add"} Recurring Transaction
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
