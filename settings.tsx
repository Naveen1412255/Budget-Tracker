import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/ui/theme-provider";
import { Download, Upload, Trash2, Moon, Sun, Settings as SettingsIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportData } from "@/lib/export-utils";
import { useTransactions, useCategories } from "@/hooks/use-budget-data";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { data: transactions } = useTransactions();
  const { data: categories } = useCategories();

  const handleExportData = () => {
    if (transactions && categories) {
      exportData(transactions, categories);
      toast({
        title: "Data exported",
        description: "Your budget data has been exported as JSON backup.",
      });
    }
  };

  const handleImportData = () => {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Handle file import (placeholder for now)
        toast({
          title: "Import feature",
          description: "Data import functionality coming soon.",
        });
      }
    };
    input.click();
  };

  const handleClearAllData = () => {
    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      toast({
        title: "Clear data feature",
        description: "This feature will be implemented in a future update.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              data-testid="switch-dark-mode"
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={handleExportData}
              className="w-full btn-icon"
              data-testid="button-export-data"
            >
              <Download className="w-4 h-4" />
              Export Data
            </Button>
            <Button
              variant="outline"
              onClick={handleImportData}
              className="w-full btn-icon"
              data-testid="button-import-data"
            >
              <Upload className="w-4 h-4" />
              Import Data
            </Button>
          </div>
          <div className="pt-2 border-t">
            <Button
              variant="destructive"
              onClick={handleClearAllData}
              className="w-full btn-icon"
              data-testid="button-clear-data"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              This will permanently delete all transactions, categories, goals, and recurring transactions.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Data Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">{transactions?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Transactions</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">{categories?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Goals</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Recurring</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About Budget Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                A comprehensive personal finance management application built with React and TypeScript.
                Track your expenses, manage categories, set goals, and analyze your spending patterns.
              </p>
            </div>
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Version 1.0.0 • Built with React, TypeScript, and Tailwind CSS
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}