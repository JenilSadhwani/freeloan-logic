import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: string;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
  type: string;
  color: string;
  icon: string;
}

interface CategorySummary {
  name: string;
  value: number;
  color: string;
}

interface MonthData {
  name: string;
  income: number;
  expenses: number;
}

const Reports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("month");
  const [currentBalance, setCurrentBalance] = useState(0);

  const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);
  const netFlow = totalIncome - totalExpenses;

  useEffect(() => {
    if (!user) return;
    
    const fetchTransactions = async () => {
      try {
        let query = supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id);
        
        const now = new Date();
        if (timeframe === "month") {
          const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          query = query.gte('date', firstDayOfMonth);
        } else if (timeframe === "year") {
          const firstDayOfYear = new Date(now.getFullYear(), 0, 1).toISOString();
          query = query.gte('date', firstDayOfYear);
        }
        
        const { data, error } = await query.order('date', { ascending: false });
        
        if (error) throw error;
        
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast({
          title: "Error",
          description: "Failed to load transactions",
          variant: "destructive",
        });
      }
    };

    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('current_balance')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        setCurrentBalance(Number(data.current_balance) || 0);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
    fetchCategories();
    fetchProfile();
  }, [user, timeframe]);

  const prepareExpensesChartData = (): CategorySummary[] => {
    const expensesByCategory: Record<string, number> = {};
    
    transactions.filter(t => t.type === "expense").forEach(transaction => {
      const categoryId = transaction.category_id || "uncategorized";
      if (!expensesByCategory[categoryId]) {
        expensesByCategory[categoryId] = 0;
      }
      expensesByCategory[categoryId] += Number(transaction.amount);
    });
    
    return Object.entries(expensesByCategory).map(([categoryId, value]) => {
      const category = categories.find(c => c.id === categoryId) || { name: "Uncategorized", color: "#999999" };
      return {
        name: category.name,
        value,
        color: category.color
      };
    }).sort((a, b) => b.value - a.value);
  };

  const prepareIncomeChartData = (): CategorySummary[] => {
    const incomeByCategory: Record<string, number> = {};
    
    transactions.filter(t => t.type === "income").forEach(transaction => {
      const categoryId = transaction.category_id || "uncategorized";
      if (!incomeByCategory[categoryId]) {
        incomeByCategory[categoryId] = 0;
      }
      incomeByCategory[categoryId] += Number(transaction.amount);
    });
    
    return Object.entries(incomeByCategory).map(([categoryId, value]) => {
      const category = categories.find(c => c.id === categoryId) || { name: "Uncategorized", color: "#999999" };
      return {
        name: category.name,
        value,
        color: category.color
      };
    }).sort((a, b) => b.value - a.value);
  };

  const prepareMonthlyData = (): MonthData[] => {
    const months: Record<string, MonthData> = {};
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = format(month, 'MMM yy');
      months[monthKey] = {
        name: monthKey,
        income: 0,
        expenses: 0
      };
    }
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = format(date, 'MMM yy');
      
      if (months[monthKey]) {
        if (transaction.type === "income") {
          months[monthKey].income += Number(transaction.amount);
        } else if (transaction.type === "expense") {
          months[monthKey].expenses += Number(transaction.amount);
        }
      }
    });
    
    return Object.values(months);
  };

  const expensesChartData = prepareExpensesChartData();
  const incomeChartData = prepareIncomeChartData();
  const monthlyData = prepareMonthlyData();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

  const formatTooltipValue = (value: any) => {
    if (typeof value === 'number') {
      return [`$${value.toFixed(2)}`, undefined];
    }
    return [`$${value}`, undefined];
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-28 sm:pt-32 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground mt-1">Analyze your financial activity and trends</p>
        </div>
        
        <div className="mb-6">
          <Tabs defaultValue="month" onValueChange={setTimeframe}>
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="month">This Month</TabsTrigger>
                <TabsTrigger value="year">This Year</TabsTrigger>
                <TabsTrigger value="all">All Time</TabsTrigger>
              </TabsList>
              
              <Button variant="outline" onClick={() => window.print()}>
                Print Report
              </Button>
            </div>
          </Tabs>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="ml-4 text-muted-foreground">Loading reports...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Current Balance</CardDescription>
                  <CardTitle className="text-2xl flex items-center">
                    <Wallet className="mr-2 h-5 w-5 text-primary" />
                    ${currentBalance.toFixed(2)}
                  </CardTitle>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Income</CardDescription>
                  <CardTitle className="text-2xl flex items-center text-green-600">
                    <ArrowUpRight className="mr-2 h-5 w-5" />
                    ${totalIncome.toFixed(2)}
                  </CardTitle>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Expenses</CardDescription>
                  <CardTitle className="text-2xl flex items-center text-red-600">
                    <ArrowDownLeft className="mr-2 h-5 w-5" />
                    ${totalExpenses.toFixed(2)}
                  </CardTitle>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Net Flow</CardDescription>
                  <CardTitle className={`text-2xl flex items-center ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {netFlow >= 0 ? (
                      <TrendingUp className="mr-2 h-5 w-5" />
                    ) : (
                      <TrendingDown className="mr-2 h-5 w-5" />
                    )}
                    ${Math.abs(netFlow).toFixed(2)}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Income vs Expenses</CardTitle>
                  <CardDescription>Monthly comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthlyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatTooltipValue(value)} />
                        <Legend />
                        <Bar dataKey="income" name="Income" fill="#4ade80" />
                        <Bar dataKey="expenses" name="Expenses" fill="#f87171" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Savings Rate</CardTitle>
                  <CardDescription>Income saved after expenses</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="mb-4 text-center">
                    <PiggyBank className="h-12 w-12 text-primary mx-auto mb-2" />
                    <h3 className="text-4xl font-bold">
                      {totalIncome > 0 
                        ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) 
                        : 0}%
                    </h3>
                    <p className="text-muted-foreground">of income saved</p>
                  </div>
                  
                  <div className="w-full h-8 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ 
                        width: `${totalIncome > 0 
                          ? Math.min(((totalIncome - totalExpenses) / totalIncome) * 100, 100) 
                          : 0}%` 
                      }}
                    />
                  </div>
                  
                  <div className="mt-6 text-center">
                    <h4 className="font-medium">Saved this {timeframe}</h4>
                    <p className={`text-2xl font-semibold ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${netFlow.toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Expense Breakdown</CardTitle>
                  <CardDescription>
                    Top expense categories for the selected period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {expensesChartData.length > 0 ? (
                    <div className="flex flex-col md:flex-row items-center">
                      <div className="w-full md:w-1/2 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={expensesChartData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={false}
                            >
                              {expensesChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatTooltipValue(value)} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="w-full md:w-1/2 mt-4 md:mt-0">
                        <ul className="space-y-2">
                          {expensesChartData.slice(0, 5).map((category, index) => (
                            <li key={index} className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2" 
                                  style={{ backgroundColor: category.color || COLORS[index % COLORS.length] }}
                                />
                                <span>{category.name}</span>
                              </div>
                              <span className="font-medium">${category.value.toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      No expense data available for this time period
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Income Sources</CardTitle>
                  <CardDescription>
                    Top income sources for the selected period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {incomeChartData.length > 0 ? (
                    <div className="flex flex-col md:flex-row items-center">
                      <div className="w-full md:w-1/2 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={incomeChartData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={false}
                            >
                              {incomeChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatTooltipValue(value)} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="w-full md:w-1/2 mt-4 md:mt-0">
                        <ul className="space-y-2">
                          {incomeChartData.slice(0, 5).map((category, index) => (
                            <li key={index} className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2" 
                                  style={{ backgroundColor: category.color || COLORS[index % COLORS.length] }}
                                />
                                <span>{category.name}</span>
                              </div>
                              <span className="font-medium">${category.value.toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      No income data available for this time period
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Reports;
