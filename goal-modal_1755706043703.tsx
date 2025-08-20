import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGoalSchema } from "@shared/schema";
import { useCreateGoal, useUpdateGoal } from "@/hooks/use-budget-data";
import { useToast } from "@/hooks/use-toast";
import type { Goal, InsertGoal } from "@shared/schema";
import { z } from "zod";

const goalFormSchema = insertGoalSchema.extend({
  targetAmount: z.string().min(1, "Target amount is required"),
  currentAmount: z.string().optional(),
  targetDate: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalFormSchema>;

interface GoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal | null;
}

export default function GoalModal({ open, onOpenChange, goal }: GoalModalProps) {
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const { toast } = useToast();

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      name: "",
      description: "",
      targetAmount: "",
      currentAmount: "0",
      targetDate: "",
    },
  });

  useEffect(() => {
    if (goal) {
      form.reset({
        name: goal.name,
        description: goal.description || "",
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : "",
      });
    } else {
      form.reset({
        name: "",
        description: "",
        targetAmount: "",
        currentAmount: "0",
        targetDate: "",
      });
    }
  }, [goal, form]);

  const onSubmit = async (data: GoalFormData) => {
    try {
      const goalData: InsertGoal = {
        name: data.name,
        description: data.description || undefined,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount || "0",
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
      };

      if (goal) {
        await updateGoal.mutateAsync({
          id: goal.id,
          updates: goalData,
        });
        toast({
          title: "Goal updated",
          description: "The goal has been successfully updated.",
        });
      } else {
        await createGoal.mutateAsync(goalData);
        toast({
          title: "Goal added",
          description: "The goal has been successfully added.",
        });
      }

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${goal ? 'update' : 'add'} goal. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {goal ? "Edit Goal" : "Add Goal"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter goal name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter goal description"
                      rows={3}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Amount</FormLabel>
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
                name="currentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Amount</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="targetDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                disabled={createGoal.isPending || updateGoal.isPending}
              >
                {goal ? "Update" : "Add"} Goal
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
