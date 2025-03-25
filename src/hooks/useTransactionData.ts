
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Transaction {
  id: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
  amount: number;
  category_name?: string;
  categories?: { name: string };
}

interface TransactionData {
  transactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitPercentage: string;
  isProfit: boolean;
  recentTransactions: Transaction[];
  monthlyData: Array<{
    name: string;
    income: number;
    expenses: number;
  }>;
  expenseCategories: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export const useTransactionData = (userId: string | undefined): TransactionData => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userId) return;
      
      const { data, error } = await supabase
        .from("transactions")
        .select("*, categories(name)")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (!error && data) {
        const formatted = data.map((t) => ({
          ...t,
          category_name: t.categories?.name || "Other",
        }));
        setTransactions(formatted);
      }
    };

    fetchTransactions();
  }, [userId]);

  // Calculate totals
  const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const profitPercentage = totalIncome ? ((netProfit / totalIncome) * 100).toFixed(1) : "0";
  const isProfit = netProfit >= 0;
  
  // Get recent transactions
  const recentTransactions = transactions.slice(0, 5);
  
  // Prepare monthly data for charts
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const month = format(date, "MMM");

    const income = transactions.filter(t => 
      t.type === "income" && format(new Date(t.date), "MMM") === month
    ).reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions.filter(t => 
      t.type === "expense" && format(new Date(t.date), "MMM") === month
    ).reduce((sum, t) => sum + t.amount, 0);

    return { name: month, income, expenses };
  });

  // Prepare expense breakdown data for pie chart
  const categoryMap: Record<string, number> = {};
  transactions.forEach(t => {
    if (t.type === "expense") {
      const key = t.category_name || "Other";
      categoryMap[key] = (categoryMap[key] || 0) + t.amount;
    }
  });

  const colors = ["#4f46e5", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"];
  const expenseCategories = Object.entries(categoryMap).map(([name, value], index) => ({
    name,
    value: value as number,
    color: colors[index % colors.length],
  }));

  return {
    transactions,
    totalIncome,
    totalExpenses,
    netProfit,
    profitPercentage,
    isProfit,
    recentTransactions,
    monthlyData,
    expenseCategories
  };
};
