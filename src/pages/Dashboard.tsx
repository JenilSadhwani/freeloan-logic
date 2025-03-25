
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Imported components
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SummaryCards from "@/components/dashboard/SummaryCards";
import TaxSummary from "@/components/dashboard/TaxSummary";
import IncomeExpenseChart from "@/components/dashboard/IncomeExpenseChart";
import ExpenseBreakdownChart from "@/components/dashboard/ExpenseBreakdownChart";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import TaxCalculatorModal from "@/components/dashboard/TaxCalculatorModal";

// Utilities
import { TaxCalculation, calculateIndianIncomeTax } from "@/utils/taxCalculator";

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [currentBalance, setCurrentBalance] = useState(0);
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [taxModalOpen, setTaxModalOpen] = useState(false);
  const [manualIncome, setManualIncome] = useState("");
  const [taxCalculation, setTaxCalculation] = useState<TaxCalculation | null>(null);

  const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const profitPercentage = totalIncome ? ((netProfit / totalIncome) * 100).toFixed(1) : "0";
  const isProfit = netProfit >= 0;

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("transactions")
        .select("*, categories(name)")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (!error && data) {
        const formatted = data.map((t) => ({
          ...t,
          category_name: t.categories?.name || "Other",
        }));
        setTransactions(formatted);
      }
    };

    const fetchCurrentBalance = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("current_balance")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setCurrentBalance(data.current_balance || 0);
      }
    };

    fetchTransactions();
    fetchCurrentBalance();
  }, [user]);

  useEffect(() => {
    if (autoUpdateEnabled && user && transactions.length > 0) {
      updateBalanceWithProfit();
    }
  }, [transactions, autoUpdateEnabled, user]);

  useEffect(() => {
    if (transactions.length > 0 && autoUpdateEnabled) {
      const annualIncome = totalIncome * 12;
      const taxInfo = calculateIndianIncomeTax(annualIncome);
      setTaxCalculation(taxInfo);
    }
  }, [transactions, totalIncome, autoUpdateEnabled]);

  const updateBalanceWithProfit = async () => {
    if (!user || isUpdatingBalance) return;
    
    setIsUpdatingBalance(true);
    
    const newBalance = totalIncome - totalExpenses;
    
    const { error } = await supabase
      .from("profiles")
      .update({ current_balance: newBalance })
      .eq("id", user.id);
      
    if (error) {
      toast.error("Failed to update balance");
      console.error("Error updating balance:", error);
    } else {
      setCurrentBalance(newBalance);
      toast.success("Balance updated with net profit");
    }
    
    setIsUpdatingBalance(false);
  };

  const toggleAutoUpdate = () => {
    setAutoUpdateEnabled(!autoUpdateEnabled);
    toast.success(autoUpdateEnabled 
      ? "Auto-update disabled. You can manually update the balance." 
      : "Auto-update enabled. Balance will update automatically."
    );
  };

  // Prepare data for charts
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

  // Prepare data for pie chart
  const categoryMap = {};
  transactions.forEach(t => {
    if (t.type === "expense") {
      const key = t.category_name || "Other";
      categoryMap[key] = (categoryMap[key] || 0) + t.amount;
    }
  });

  const colors = ["#4f46e5", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"];
  const expenseCategories = Object.entries(categoryMap).map(([name, value], index) => ({
    name,
    value,
    color: colors[index % colors.length],
  }));

  const recentTransactions = transactions.slice(0, 5);

  return (
    <Layout>
      <div className="min-h-screen pt-24 pb-10">
        <div className="container px-4 sm:px-6 mx-auto">
          <DashboardHeader 
            toggleAutoUpdate={toggleAutoUpdate} 
            autoUpdateEnabled={autoUpdateEnabled} 
            openTaxModal={() => setTaxModalOpen(true)} 
          />

          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-grid sm:grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <SummaryCards 
                currentBalance={currentBalance}
                totalIncome={totalIncome}
                totalExpenses={totalExpenses}
                netProfit={netProfit}
                profitPercentage={profitPercentage}
                isProfit={isProfit}
                autoUpdateEnabled={autoUpdateEnabled}
                isUpdatingBalance={isUpdatingBalance}
                updateBalanceWithProfit={updateBalanceWithProfit}
              />

              {taxCalculation && (
                <TaxSummary 
                  taxCalculation={taxCalculation} 
                  totalIncome={totalIncome} 
                  openTaxModal={() => setTaxModalOpen(true)} 
                />
              )}

              <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                <IncomeExpenseChart monthlyData={monthlyData} />
                <ExpenseBreakdownChart expenseCategories={expenseCategories} />
              </div>

              <RecentTransactions transactions={recentTransactions} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <TaxCalculatorModal 
        open={taxModalOpen}
        onOpenChange={setTaxModalOpen}
        taxCalculation={taxCalculation}
        setTaxCalculation={setTaxCalculation}
      />
    </Layout>
  );
};

export default Dashboard;
