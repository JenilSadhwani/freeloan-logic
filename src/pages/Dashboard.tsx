import { useState, useEffect } from "react";
import {
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  PieChart,
  Wallet,
  CreditCard,
  Plus,
  TrendingUp,
  Users,
  RefreshCw,
  FileText,
  Calculator,
  ReceiptIndian,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const calculateIndianIncomeTax = (income: number): { tax: number; breakdown: { slab: string; amount: number }[] } => {
  let tax = 0;
  const breakdown: { slab: string; amount: number }[] = [];

  if (income <= 300000) {
    tax = 0;
    breakdown.push({ slab: "Up to ₹3,00,000", amount: 0 });
  } else if (income <= 600000) {
    const taxableAmount = income - 300000;
    const slabTax = taxableAmount * 0.05;
    tax = slabTax;
    breakdown.push({ slab: "Up to ₹3,00,000", amount: 0 });
    breakdown.push({ slab: "₹3,00,001 to ₹6,00,000 (5%)", amount: slabTax });
  } else if (income <= 900000) {
    const slabTax1 = 300000 * 0.05;
    const slabTax2 = (income - 600000) * 0.1;
    tax = slabTax1 + slabTax2;
    breakdown.push({ slab: "Up to ₹3,00,000", amount: 0 });
    breakdown.push({ slab: "₹3,00,001 to ₹6,00,000 (5%)", amount: slabTax1 });
    breakdown.push({ slab: "₹6,00,001 to ₹9,00,000 (10%)", amount: slabTax2 });
  } else if (income <= 1200000) {
    const slabTax1 = 300000 * 0.05;
    const slabTax2 = 300000 * 0.1;
    const slabTax3 = (income - 900000) * 0.15;
    tax = slabTax1 + slabTax2 + slabTax3;
    breakdown.push({ slab: "Up to ₹3,00,000", amount: 0 });
    breakdown.push({ slab: "₹3,00,001 to ₹6,00,000 (5%)", amount: slabTax1 });
    breakdown.push({ slab: "₹6,00,001 to ₹9,00,000 (10%)", amount: slabTax2 });
    breakdown.push({ slab: "₹9,00,001 to ₹12,00,000 (15%)", amount: slabTax3 });
  } else if (income <= 1500000) {
    const slabTax1 = 300000 * 0.05;
    const slabTax2 = 300000 * 0.1;
    const slabTax3 = 300000 * 0.15;
    const slabTax4 = (income - 1200000) * 0.2;
    tax = slabTax1 + slabTax2 + slabTax3 + slabTax4;
    breakdown.push({ slab: "Up to ₹3,00,000", amount: 0 });
    breakdown.push({ slab: "₹3,00,001 to ₹6,00,000 (5%)", amount: slabTax1 });
    breakdown.push({ slab: "₹6,00,001 to ₹9,00,000 (10%)", amount: slabTax2 });
    breakdown.push({ slab: "₹9,00,001 to ₹12,00,000 (15%)", amount: slabTax3 });
    breakdown.push({ slab: "₹12,00,001 to ₹15,00,000 (20%)", amount: slabTax4 });
  } else {
    const slabTax1 = 300000 * 0.05;
    const slabTax2 = 300000 * 0.1;
    const slabTax3 = 300000 * 0.15;
    const slabTax4 = 300000 * 0.2;
    const slabTax5 = (income - 1500000) * 0.3;
    tax = slabTax1 + slabTax2 + slabTax3 + slabTax4 + slabTax5;
    breakdown.push({ slab: "Up to ₹3,00,000", amount: 0 });
    breakdown.push({ slab: "₹3,00,001 to ₹6,00,000 (5%)", amount: slabTax1 });
    breakdown.push({ slab: "₹6,00,001 to ₹9,00,000 (10%)", amount: slabTax2 });
    breakdown.push({ slab: "₹9,00,001 to ₹12,00,000 (15%)", amount: slabTax3 });
    breakdown.push({ slab: "₹12,00,001 to ₹15,00,000 (20%)", amount: slabTax4 });
    breakdown.push({ slab: "Above ₹15,00,000 (30%)", amount: slabTax5 });
  }

  const cess = tax * 0.04;
  tax += cess;
  breakdown.push({ slab: "Health and Education Cess (4%)", amount: cess });

  return { tax, breakdown };
};

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [currentBalance, setCurrentBalance] = useState(0);
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [taxModalOpen, setTaxModalOpen] = useState(false);
  const [manualIncome, setManualIncome] = useState("");
  const [taxCalculation, setTaxCalculation] = useState<{ 
    tax: number; 
    breakdown: { slab: string; amount: number }[] 
  } | null>(null);

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

  const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const profitPercentage = totalIncome ? ((netProfit / totalIncome) * 100).toFixed(1) : "0";
  const isProfit = netProfit >= 0;

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

  const recentTransactions = transactions.slice(0, 5);

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const month = format(date, "MMM");

    const income = transactions.filter(t => t.type === "income" && format(new Date(t.date), "MMM") === month).reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === "expense" && format(new Date(t.date), "MMM") === month).reduce((sum, t) => sum + t.amount, 0);

    return { name: month, income, expenses };
  });

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

  const calculateManualTax = () => {
    if (!manualIncome || isNaN(Number(manualIncome))) {
      toast.error("Please enter a valid income amount");
      return;
    }
    
    const income = Number(manualIncome);
    const taxInfo = calculateIndianIncomeTax(income);
    setTaxCalculation(taxInfo);
    toast.success("Tax calculated successfully");
  };

  return (
    <Layout>
      <div className="min-h-screen pt-24 pb-10">
        <div className="container px-4 sm:px-6 mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">Your financial overview at a glance.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={toggleAutoUpdate}
              >
                <RefreshCw className="h-4 w-4" />
                {autoUpdateEnabled ? "Auto-update On" : "Auto-update Off"}
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                asChild
              >
                <Link to="/reports">
                  <FileText className="h-4 w-4" />
                  View Reports
                </Link>
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setTaxModalOpen(true)}
              >
                <ReceiptIndian className="h-4 w-4" />
                Tax Calculator
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-grid sm:grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader>
                    <CardDescription>Current Balance</CardDescription>
                    <CardTitle className="text-2xl font-bold flex items-center">
                      ${currentBalance.toLocaleString()}
                      {!autoUpdateEnabled && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="ml-2 h-6 text-xs" 
                          onClick={updateBalanceWithProfit}
                          disabled={isUpdatingBalance}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" /> Update
                        </Button>
                      )}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {autoUpdateEnabled 
                        ? "Balance updates automatically" 
                        : "Manual balance updates enabled"}
                    </p>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardDescription>Total Income</CardDescription>
                    <CardTitle className="text-2xl font-bold flex items-center">
                      ${totalIncome.toLocaleString()}
                      <span className="ml-2 text-green-500 flex items-center text-sm font-normal">
                        <ArrowUpRight className="h-4 w-4" />
                        {/* example stat */}
                        12.5%
                      </span>
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardDescription>Total Expenses</CardDescription>
                    <CardTitle className="text-2xl font-bold flex items-center">
                      ${totalExpenses.toLocaleString()}
                      <span className="ml-2 text-red-500 flex items-center text-sm font-normal">
                        <ArrowUpRight className="h-4 w-4" />
                        8.2%
                      </span>
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardDescription>Net Profit</CardDescription>
                    <CardTitle className="text-2xl font-bold flex items-center">
                      ${netProfit.toLocaleString()}
                      <span className={`ml-2 flex items-center text-sm font-normal ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                        {isProfit ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        {profitPercentage}%
                      </span>
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {taxCalculation && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ReceiptIndian className="h-5 w-5 text-primary" />
                      Annual Income Tax Estimate
                    </CardTitle>
                    <CardDescription>Based on the Indian Tax Regime (FY 2023-24)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Estimated Annual Income</p>
                        <p className="text-2xl font-semibold">₹{(totalIncome * 12).toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Estimated Annual Tax</p>
                        <p className="text-2xl font-semibold text-red-500">₹{Math.round(taxCalculation.tax).toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Monthly Tax Provision</p>
                        <p className="text-2xl font-semibold text-amber-500">₹{Math.round(taxCalculation.tax / 12).toLocaleString('en-IN')}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setTaxModalOpen(true)}
                      >
                        View Detailed Breakdown
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                <Card className="lg:col-span-4">
                  <CardHeader>
                    <CardTitle>Income vs. Expenses</CardTitle>
                    <CardDescription>Monthly trend</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(val) => `$${val}`} />
                          <Tooltip formatter={(val) => [`$${val}`, undefined]} />
                          <Legend />
                          <Area type="monotone" dataKey="income" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} />
                          <Area type="monotone" dataKey="expenses" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Expense Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={expenseCategories}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            innerRadius={40}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {expenseCategories.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(val) => [`$${val}`, undefined]} />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTransactions.map((t) => (
                      <div key={t.id} className="flex justify-between items-center p-3 bg-muted/40 rounded-md">
                        <div>
                          <div className="font-medium">{t.description}</div>
                          <div className="text-sm text-muted-foreground">{format(new Date(t.date), 'MMM dd, yyyy')}</div>
                        </div>
                        <div className={`font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={taxModalOpen} onOpenChange={setTaxModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ReceiptIndian className="h-5 w-5" /> 
              Indian Income Tax Calculator
            </DialogTitle>
            <DialogDescription>
              Calculate your income tax based on the new tax regime for FY 2023-24
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="income">Annual Income (₹)</Label>
              <div className="flex gap-2">
                <Input
                  id="income"
                  placeholder="Enter your annual income"
                  value={manualIncome}
                  onChange={(e) => setManualIncome(e.target.value)}
                />
                <Button onClick={calculateManualTax}>Calculate</Button>
              </div>
            </div>
            
            {taxCalculation && (
              <div className="space-y-3 border rounded-md p-3 bg-muted/40">
                <div className="flex justify-between pb-2 border-b">
                  <span className="font-semibold">Total Tax</span>
                  <span className="font-bold text-red-500">₹{Math.round(taxCalculation.tax).toLocaleString('en-IN')}</span>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Tax Breakdown:</p>
                  {taxCalculation.breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.slab}</span>
                      <span>₹{Math.round(item.amount).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-2 border-t text-sm text-muted-foreground">
                  <p>Note: This is an estimate based on the new tax regime without considering deductions or exemptions.</p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="sm:justify-start">
            <Button variant="secondary" onClick={() => setTaxModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Dashboard;
