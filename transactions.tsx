import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactions, useCategories, useDeleteTransaction } from "@/hooks/use-budget-data";
import { groupTransactionsByCategory, formatCurrency, formatDate, filterTransactions } from "@/lib/budget-utils";
import { exportToCSV, exportToPDF, exportToExcel } from "@/lib/export-utils";
import { Search, Filter, Download, Edit, Trash2, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TransactionModal from "./modals/transaction-modal";
import type { Transaction } from "@shared/schema";

function TransactionsSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-6 w-48 mb-2" />
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  const { data: transactions, isLoading: transactionsLoading } = useTransactions();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const deleteTransaction = useDeleteTransaction();
  const { toast } = useToast();

  const handleDeleteTransaction = async (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      try {
        await deleteTransaction.mutateAsync(id);
        toast({
          title: "Transaction deleted",
          description: "The transaction has been successfully deleted.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete transaction. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleExportCSV = () => {
    if (transactions && categories) {
      exportToCSV(filteredTransactions, categories);
      toast({
        title: "Export successful",
        description: "CSV file has been downloaded.",
      });
    }
  };

  const handleExportExcel = () => {
    if (transactions && categories) {
      exportToExcel(filteredTransactions, categories);
      toast({
        title: "Export successful",
        description: "Excel file has been downloaded.",
      });
    }
  };

  const handleExportPDF = async () => {
    if (transactions && categories) {
      try {
        await exportToPDF(filteredTransactions, categories);
        toast({
          title: "Export successful",
          description: "PDF report has been downloaded.",
        });
      } catch (error) {
        toast({
          title: "Export failed",
          description: "Failed to generate PDF report.",
          variant: "destructive",
        });
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setDateFrom("");
    setDateTo("");
    setIsFilterOpen(false);
  };

  if (transactionsLoading || categoriesLoading) {
    return <TransactionsSkeleton />;
  }

  const allTransactions = transactions || [];
  const allCategories = categories || [];

  const filteredTransactions = filterTransactions(allTransactions, {
    search: searchTerm,
    categoryId: selectedCategory === "all" ? "" : selectedCategory,
    dateFrom,
    dateTo,
  });

  const categoryGroups = groupTransactionsByCategory(filteredTransactions, allCategories);

  const hasActiveFilters = searchTerm || selectedCategory || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Transactions</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} className="btn-icon" data-testid="button-export-csv">
            <Download className="w-4 h-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={handleExportExcel} className="btn-icon" data-testid="button-export-excel">
            <FileText className="w-4 h-4" />
            Excel
          </Button>
          <Button variant="outline" onClick={handleExportPDF} className="btn-icon" data-testid="button-export-pdf">
            <FileText className="w-4 h-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-transactions"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`btn-icon ${isFilterOpen ? 'bg-accent' : ''}`}
                data-testid="button-toggle-filter"
              >
                <Filter className="w-5 h-5" />
                Filter
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="btn-icon"
                  data-testid="button-clear-filters"
                >
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          {isFilterOpen && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger data-testid="select-category-filter">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {allCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">From Date</label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    data-testid="input-date-from"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">To Date</label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    data-testid="input-date-to"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      {hasActiveFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Showing {filteredTransactions.length} of {allTransactions.length} transactions
              </span>
              {selectedCategory && (
                <span className="text-sm font-medium">
                  Total for selected category: {formatCurrency(
                    categoryGroups
                      .find(group => group.category.id === selectedCategory)
                      ?.total || 0
                  )}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions by Category */}
      <div className="space-y-6">
        {categoryGroups.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">
                {hasActiveFilters ? "No transactions match your filters." : "No transactions found. Add your first transaction!"}
              </div>
            </CardContent>
          </Card>
        ) : (
          categoryGroups.map((group) => (
            <Card key={group.category.id} className="category-group">
              <CardHeader className="category-group-header">
                <div className="category-group-title">
                  <span className="text-2xl">{group.category.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{group.category.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {group.transactions.length} transaction{group.transactions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="category-group-total">
                  <span className={`text-lg font-bold ${
                    group.category.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {group.category.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(group.total))}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="category-transactions">
                {group.transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    data-testid={`transaction-item-${transaction.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <h4 className="font-medium truncate">{transaction.description}</h4>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                            <span data-testid={`text-date-${transaction.id}`}>
                              {formatDate(transaction.date)}
                            </span>
                            {transaction.location && (
                              <>
                                <span>•</span>
                                <span>{transaction.location}</span>
                              </>
                            )}
                          </div>
                          {transaction.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{transaction.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 sm:mt-0">
                      <span 
                        className={`font-semibold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}
                        data-testid={`text-amount-${transaction.id}`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(transaction.amount))}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditTransaction(transaction)}
                        className="h-8 w-8"
                        data-testid={`button-edit-${transaction.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        data-testid={`button-delete-${transaction.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        open={isTransactionModalOpen}
        onOpenChange={(open) => {
          setIsTransactionModalOpen(open);
          if (!open) {
            setEditingTransaction(null);
          }
        }}
        transaction={editingTransaction}
      />
    </div>
  );
}