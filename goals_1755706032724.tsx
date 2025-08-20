import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useGoals, useDeleteGoal } from "@/hooks/use-budget-data";
import { formatCurrency, formatDate } from "@/lib/budget-utils";
import { Plus, Edit, Trash2, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import GoalModal from "./modals/goal-modal";
import type { Goal } from "@shared/schema";

export default function Goals() {
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const { data: goals, isLoading: goalsLoading } = useGoals();
  const deleteGoal = useDeleteGoal();
  const { toast } = useToast();

  const handleDeleteGoal = async (id: string) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      try {
        await deleteGoal.mutateAsync(id);
        toast({
          title: "Goal deleted",
          description: "The goal has been successfully deleted.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete goal. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleAddGoal = () => {
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  };

  if (goalsLoading) {
    return <GoalsSkeleton />;
  }

  const allGoals = goals || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Savings Goals</h2>
        <Button onClick={handleAddGoal} className="btn-icon">
          <Plus className="w-5 h-5" />
          Add Goal
        </Button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mobile-single-column">
        {allGoals.length === 0 ? (
          <Card className="md:col-span-2">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 opacity-50">
                <Target className="w-full h-full" />
              </div>
              <p className="text-muted-foreground">
                No savings goals yet. Create your first goal to start tracking your progress!
              </p>
              <Button onClick={handleAddGoal} className="mt-4">
                Add Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          allGoals.map((goal) => {
            const currentAmount = parseFloat(goal.currentAmount);
            const targetAmount = parseFloat(goal.targetAmount);
            const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
            const isOverdue = goal.targetDate && new Date(goal.targetDate) < new Date();
            const monthlyTarget = goal.targetDate 
              ? Math.max(0, (targetAmount - currentAmount) / Math.max(1, Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30))))
              : 0;

            return (
              <Card key={goal.id} className="hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{goal.name}</h3>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditGoal(goal)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteGoal(goal.id)}
                        disabled={deleteGoal.isPending}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>{formatCurrency(currentAmount)} / {formatCurrency(targetAmount)}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress 
                      value={Math.min(progress, 100)} 
                      className="h-3"
                    />
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    {goal.targetDate && (
                      <p className={isOverdue ? "text-destructive font-medium" : ""}>
                        Target Date: {formatDate(goal.targetDate)}
                        {isOverdue && " (Overdue)"}
                      </p>
                    )}
                    {monthlyTarget > 0 && (
                      <p>Monthly Target: {formatCurrency(monthlyTarget)}</p>
                    )}
                    {goal.isCompleted && (
                      <p className="text-green-600 dark:text-green-400 font-medium">
                        ✅ Goal Completed!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Goal Modal */}
      <GoalModal
        open={isGoalModalOpen}
        onOpenChange={(open: boolean) => {
          setIsGoalModalOpen(open);
          if (!open) {
            setEditingGoal(null);
          }
        }}
        goal={editingGoal}
      />
    </div>
  );
}

function GoalsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-24" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <Skeleton className="h-3 w-full" />
              </div>
              
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-36" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
