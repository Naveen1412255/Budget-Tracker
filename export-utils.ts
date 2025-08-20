import { jsPDF } from "jspdf";
import { format } from "date-fns";
import type { Transaction, Category } from "@shared/schema";
import { 
  groupTransactionsByCategory, 
  getTransactionSummary, 
  formatCurrency,
  formatDate
} from "./budget-utils";

// CSV Export
export function exportToCSV(transactions: Transaction[], categories: Category[]): void {
  const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));
  
  const headers = [
    "Date",
    "Description", 
    "Category",
    "Type",
    "Amount",
    "Notes",
    "Location"
  ];

  const csvData = transactions.map(transaction => [
    formatDate(transaction.date),
    transaction.description,
    categoryMap.get(transaction.categoryId) || "Unknown",
    transaction.type,
    transaction.amount,
    transaction.notes || "",
    transaction.location || ""
  ]);

  const csvContent = [headers, ...csvData]
    .map(row => row.map(field => `"${field}"`).join(","))
    .join("\n");

  downloadFile(csvContent, "budget-transactions.csv", "text/csv");
}

// Enhanced PDF Export with category grouping
export async function exportToPDF(transactions: Transaction[], categories: Category[]): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Budget Tracker Report", pageWidth / 2, y, { align: "center" });
  y += 15;

  // Date range
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const today = format(new Date(), "MMMM d, yyyy");
  doc.text(`Generated on ${today}`, pageWidth / 2, y, { align: "center" });
  y += 20;

  // Summary section
  const summary = getTransactionSummary(transactions);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", margin, y);
  y += 10;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Income: ${formatCurrency(summary.totalIncome)}`, margin, y);
  y += 7;
  doc.text(`Total Expenses: ${formatCurrency(summary.totalExpenses)}`, margin, y);
  y += 7;
  doc.text(`Balance: ${formatCurrency(summary.balance)}`, margin, y);
  y += 7;
  doc.text(`Total Transactions: ${summary.transactionCount}`, margin, y);
  y += 20;

  // Category breakdown section
  const categoryGroups = groupTransactionsByCategory(transactions, categories);
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Category Breakdown", margin, y);
  y += 15;

  for (const group of categoryGroups) {
    // Check if we need a new page
    if (y > 250) {
      doc.addPage();
      y = margin;
    }

    // Category header
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`${group.category.icon} ${group.category.name}`, margin, y);
    doc.text(`Total: ${formatCurrency(group.total)}`, pageWidth - margin - 50, y);
    y += 10;

    // Category transactions
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    for (const transaction of group.transactions) {
      if (y > 270) {
        doc.addPage();
        y = margin;
      }

      const date = formatDate(transaction.date);
      const amount = formatCurrency(parseFloat(transaction.amount));
      
      doc.text(`• ${date} - ${transaction.description}`, margin + 10, y);
      doc.text(amount, pageWidth - margin - 30, y);
      y += 6;
    }
    
    y += 5; // Space between categories
  }

  // Save the PDF
  doc.save(`budget-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}

// Excel-compatible CSV export with enhanced formatting
export function exportToExcel(transactions: Transaction[], categories: Category[]): void {
  const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
  const categoryGroups = groupTransactionsByCategory(transactions, categories);
  
  const csvRows: string[] = [];
  
  // Header
  csvRows.push("Budget Tracker Report");
  csvRows.push(`Generated on ${format(new Date(), "MMMM d, yyyy")}`);
  csvRows.push(""); // Empty row
  
  // Summary
  const summary = getTransactionSummary(transactions);
  csvRows.push("Summary");
  csvRows.push(`Total Income,${summary.totalIncome}`);
  csvRows.push(`Total Expenses,${summary.totalExpenses}`);
  csvRows.push(`Balance,${summary.balance}`);
  csvRows.push(`Total Transactions,${summary.transactionCount}`);
  csvRows.push(""); // Empty row
  
  // Category breakdown
  csvRows.push("Category Breakdown");
  csvRows.push(""); // Empty row
  
  for (const group of categoryGroups) {
    csvRows.push(`${group.category.name}`);
    csvRows.push(`Total,${group.total}`);
    csvRows.push("Date,Description,Amount,Notes");
    
    for (const transaction of group.transactions) {
      csvRows.push(`${formatDate(transaction.date)},"${transaction.description}",${transaction.amount},"${transaction.notes || ""}"`);
    }
    
    csvRows.push(""); // Empty row between categories
  }
  
  const csvContent = csvRows.join("\n");
  downloadFile(csvContent, `budget-report-${format(new Date(), "yyyy-MM-dd")}.csv`, "text/csv");
}

// JSON export for backup/import
export function exportData(transactions: Transaction[], categories: Category[]): void {
  const data = {
    exportDate: new Date().toISOString(),
    version: "1.0",
    transactions,
    categories,
  };

  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `budget-backup-${format(new Date(), "yyyy-MM-dd")}.json`, "application/json");
}

// Import data from JSON
export async function importData(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        resolve(data);
      } catch (error) {
        reject(new Error("Invalid JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

// Helper function to download files
function downloadFile(content: string, filename: string, contentType: string): void {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}