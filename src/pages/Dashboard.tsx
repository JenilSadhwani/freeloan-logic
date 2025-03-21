
import { useState } from "react";
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
  Users
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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
import { toast } from "sonner";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Financial data
  const totalIncome = 4850;
  const totalExpenses = 2450;
  const netProfit = totalIncome - totalExpenses;
  const profitPercentage = ((netProfit / totalIncome) * 100).toFixed(1);
  const isProfit = netProfit > 0;

  // Chart data
  const monthlyData = [
    { name: "Jan", income: 3200, expenses: 1800 },
    { name: "Feb", income: 3800, expenses: 2100 },
    { name: "Mar", income: 2800, expenses: 1900 },
    { name: "Apr", income: 3600, expenses: 2200 },
    { name: "May", income: 4200, expenses: 2300 },
    { name: "Jun", income: 4850, expenses: 2450 },
  ];

  const expenseCategories = [
    { name: "Office", value: 850, color: "#4f46e5" },
    { name: "Software", value: 650, color: "#8b5cf6" },
    { name: "Marketing", value: 450, color: "#a855f7" },
    { name: "Travel", value: 300, color: "#d946ef" },
    { name: "Other", value: 200, color: "#ec4899" },
  ];

  const recentTransactions = [
    {
      id: 1,
      description: "Client Invoice #1082",
      amount: 1200,
      date: "Jun 12, 2023",
      type: "income",
    },
    {
      id: 2,
      description: "Adobe Creative Cloud",
      amount: 52.99,
      date: "Jun 10, 2023",
      type: "expense",
    },
    {
      id: 3,
      description: "Web Hosting",
      amount: 29.99,
      date: "Jun 8, 2023",
      type: "expense",
    },
    {
      id: 4,
      description: "Client Invoice #1081",
      amount: 1600,
      date: "Jun 5, 2023",
      type: "income",
    },
    {
      id: 5,
      description: "Office Supplies",
      amount: 125.42,
      date: "Jun 3, 2023",
      type: "expense",
    },
  ];

  const upcomingPayments = [
    {
      id: 1,
      description: "Client Payment #203",
      amount: 2400,
      dueDate: "Jun 25, 2023",
    },
    {
      id: 2,
      description: "Client Payment #204",
      amount: 1800,
      dueDate: "Jun 28, 2023",
    },
  ];

  const handleAddTransaction = () => {
    toast.success("Transaction form will be implemented in the Finances page");
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
            <div className="flex items-center space-x-2">
              <Button onClick={handleAddTransaction} size="sm" className="h-10">
                <Plus className="mr-1 h-4 w-4" /> Add Transaction
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-grid sm:grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Financial summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover-lift">
                  <CardHeader className="pb-2">
                    <CardDescription>Total Income</CardDescription>
                    <CardTitle className="text-2xl font-bold flex items-center">
                      ${totalIncome.toLocaleString()}
                      <span className="ml-2 text-green-500 flex items-center text-sm font-normal">
                        <ArrowUpRight className="h-4 w-4" />
                        12.5%
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full rounded-full" style={{ width: '75%' }} />
                    </div>
                  </CardContent>
                  <CardFooter className="text-xs text-muted-foreground">
                    vs. last month
                  </CardFooter>
                </Card>

                <Card className="hover-lift">
                  <CardHeader className="pb-2">
                    <CardDescription>Total Expenses</CardDescription>
                    <CardTitle className="text-2xl font-bold flex items-center">
                      ${totalExpenses.toLocaleString()}
                      <span className="ml-2 text-red-500 flex items-center text-sm font-normal">
                        <ArrowUpRight className="h-4 w-4" />
                        8.2%
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full rounded-full" style={{ width: '65%' }} />
                    </div>
                  </CardContent>
                  <CardFooter className="text-xs text-muted-foreground">
                    vs. last month
                  </CardFooter>
                </Card>

                <Card className="hover-lift">
                  <CardHeader className="pb-2">
                    <CardDescription>Net Profit</CardDescription>
                    <CardTitle className="text-2xl font-bold flex items-center">
                      ${netProfit.toLocaleString()}
                      <span className={`ml-2 flex items-center text-sm font-normal ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                        {isProfit ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                        {profitPercentage}%
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                      <div className={isProfit ? 'bg-green-500' : 'bg-red-500'} style={{ width: `${Math.min(100, Math.abs(Number(profitPercentage)))}%`, height: '100%' }} />
                    </div>
                  </CardContent>
                  <CardFooter className="text-xs text-muted-foreground">
                    of total income
                  </CardFooter>
                </Card>

                <Card className="hover-lift">
                  <CardHeader className="pb-2">
                    <CardDescription>Upcoming Income</CardDescription>
                    <CardTitle className="text-2xl font-bold">
                      $4,200
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      Next 30 days
                    </div>
                  </CardContent>
                  <CardFooter className="text-xs text-muted-foreground">
                    2 invoices pending
                  </CardFooter>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                <Card className="lg:col-span-4 hover-lift">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Income vs. Expenses</CardTitle>
                        <CardDescription>Monthly comparison for the last 6 months</CardDescription>
                      </div>
                      <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={monthlyData}
                          margin={{
                            top: 5,
                            right: 20,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                          <XAxis dataKey="name" tickLine={false} axisLine={false} />
                          <YAxis 
                            tickFormatter={(value) => `$${value}`}
                            tickLine={false}
                            axisLine={false}
                            tickCount={6}
                          />
                          <Tooltip 
                            formatter={(value) => [`$${value}`, undefined]}
                            contentStyle={{
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                              border: '1px solid #f3f4f6',
                            }}
                          />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="income"
                            stackId="1"
                            stroke="#4f46e5"
                            fill="#4f46e5"
                            fillOpacity={0.2}
                            activeDot={{ r: 6 }}
                            isAnimationActive={true}
                            animationDuration={1000}
                            animationEasing="ease-out"
                          />
                          <Area
                            type="monotone"
                            dataKey="expenses"
                            stackId="2"
                            stroke="#f43f5e"
                            fill="#f43f5e"
                            fillOpacity={0.2}
                            activeDot={{ r: 6 }}
                            isAnimationActive={true}
                            animationDuration={1000}
                            animationEasing="ease-out"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-3 hover-lift">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Expense Breakdown</CardTitle>
                        <CardDescription>By category</CardDescription>
                      </div>
                      <PieChart className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={expenseCategories}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={90}
                            innerRadius={40}
                            fill="#8884d8"
                            paddingAngle={2}
                            dataKey="value"
                            isAnimationActive={true}
                            animationDuration={1000}
                            animationEasing="ease-out"
                          >
                            {expenseCategories.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [`$${value}`, undefined]}
                            contentStyle={{
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                              border: '1px solid #f3f4f6',
                            }}
                          />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Financial Accounts and Upcoming Payments */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="hover-lift">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Financial Accounts</CardTitle>
                      <Wallet className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 rounded-md p-2">
                            <Wallet className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">Business Checking</div>
                            <div className="text-sm text-muted-foreground">Bank of America</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">$12,580.25</div>
                          <div className="text-xs text-muted-foreground">Available</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-100 rounded-md p-2">
                            <CreditCard className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium">Business Credit Card</div>
                            <div className="text-sm text-muted-foreground">Chase Ink</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">$2,355.00</div>
                          <div className="text-xs text-muted-foreground">Current balance</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 rounded-md p-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium">Investments</div>
                            <div className="text-sm text-muted-foreground">Vanguard</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">$34,250.50</div>
                          <div className="text-xs text-text-muted-foreground">Current value</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" /> Add Account
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="hover-lift">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Upcoming Payments</CardTitle>
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingPayments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                          <div>
                            <div className="font-medium">{payment.description}</div>
                            <div className="text-sm text-muted-foreground">Due: {payment.dueDate}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-green-600">${payment.amount.toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex items-center p-3 bg-muted/20 rounded-lg border border-dashed border-muted">
                        <div className="w-full text-center text-muted-foreground">
                          <Users className="h-5 w-5 mx-auto mb-1" />
                          <span className="text-sm">No more upcoming payments</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" /> Add Payment
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Transactions</CardTitle>
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div 
                            className={`rounded-md p-2 ${
                              transaction.type === 'income' 
                                ? 'bg-green-100' 
                                : 'bg-red-100'
                            }`}
                          >
                            {transaction.type === 'income' ? (
                              <ArrowUpRight className={`h-5 w-5 text-green-600`} />
                            ) : (
                              <ArrowDownRight className={`h-5 w-5 text-red-600`} />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{transaction.description}</div>
                            <div className="text-sm text-muted-foreground">{transaction.date}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${
                            transaction.type === 'income' 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View All Transactions
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
