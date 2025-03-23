
// Updated Dashboard with Supabase Integration
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

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [currentBalance, setCurrentBalance] = useState(0);
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false);

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

  const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const profitPercentage = totalIncome ? ((netProfit / totalIncome) * 100).toFixed(1) : "0";
  const isProfit = netProfit >= 0;

  const updateBalanceWithProfit = async () => {
    if (!user || isUpdatingBalance) return;
    
    setIsUpdatingBalance(true);
    
    const newBalance = currentBalance + netProfit;
    
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

  return (
    <Layout>
      <div className="min-h-screen pt-24 pb-10">
        <div className="container px-4 sm:px-6 mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">Your financial overview at a glance.</p>
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
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-2 h-6 text-xs" 
                        onClick={updateBalanceWithProfit}
                        disabled={isUpdatingBalance}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Profit
                      </Button>
                    </CardTitle>
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

              {/* Chart */}
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

              {/* Recent Transactions */}
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
    </Layout>
  );
};

export default Dashboard;
