
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";

// Custom hooks
import { useTransactionData } from "@/hooks/useTransactionData";
import { useTaxCalculation } from "@/hooks/useTaxCalculation";
import { useBalanceManagement } from "@/hooks/useBalanceManagement";

// Imported components
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SummaryCards from "@/components/dashboard/SummaryCards";
import TaxSummary from "@/components/dashboard/TaxSummary";
import IncomeExpenseChart from "@/components/dashboard/IncomeExpenseChart";
import ExpenseBreakdownChart from "@/components/dashboard/ExpenseBreakdownChart";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import TaxCalculatorModal from "@/components/dashboard/TaxCalculatorModal";

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [taxModalOpen, setTaxModalOpen] = useState(false);

  // Use our custom hooks
  const {
    transactions,
    totalIncome,
    totalExpenses,
    netProfit,
    profitPercentage,
    isProfit,
    recentTransactions,
    monthlyData,
    expenseCategories
  } = useTransactionData(user?.id);

  const {
    taxCalculation,
    setTaxCalculation,
    calculateTaxForIncome
  } = useTaxCalculation({
    totalIncome,
    autoUpdateEnabled
  });

  const {
    currentBalance,
    isUpdatingBalance,
    updateBalanceWithProfit
  } = useBalanceManagement({
    userId: user?.id,
    netProfit,
    transactions,
    autoUpdateEnabled
  });

  const toggleAutoUpdate = () => {
    setAutoUpdateEnabled(!autoUpdateEnabled);
    toast.success(autoUpdateEnabled 
      ? "Auto-update disabled. You can manually update the balance." 
      : "Auto-update enabled. Balance will update automatically."
    );
  };

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
