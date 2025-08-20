import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGoals } from "@/hooks/use-budget-data";
import { formatCurrency } from "@/lib/budget-utils";
import { Plus, Target, Calendar } from "lucide-react";

function GoalsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-2 w-full mb-2" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function Goals() {
  const { data: goals, isLoading } = useGoals();

  if (isLoading) {
    return <GoalsSkeleton />;
  }

  const allGoals = goals || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Financial Goals</h2>
        <Button className="btn-icon" data-testid="button-add-goal">
          <Plus className="w-4 h-4" />
          Add Goal
        </Button>
      </div>

      {allGoals.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Goals Yet</h3>
            <p className="text-muted-foreground mb-4">
              Set financial goals to track your progress and stay motivated.
            </p>
            <Button className="btn-icon">
              <Plus className="w-4 h-4" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allGoals.map((goal) => {
            const progress = (parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100;
            const isCompleted = goal.isCompleted || progress >= 100;
            
            return (
              <Card key={goal.id} className={`${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{goal.name}</span>
                    {isCompleted && <Target className="h-5 w-5 text-green-600" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{Math.min(progress, 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isCompleted ? 'bg-green-600' : 'bg-blue-600'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Current</span>
                        <span className="font-medium">{formatCurrency(parseFloat(goal.currentAmount))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Target</span>
                        <span className="font-medium">{formatCurrency(parseFloat(goal.targetAmount))}</span>
                      </div>
                      {goal.deadline && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Deadline</span>
                          <span className="text-sm">{new Date(goal.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    {goal.description && (
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}