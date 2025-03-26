import { useState, useEffect } from "react";
import {
  Wallet,
  Plus,
  CalendarIcon,
  BadgeIndianRupee,
  Trash2,
  Save,
  ArrowRight,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format, isFuture, parseISO, addMonths } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const budgetFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  amount: z.coerce
    .number()
    .min(0.01, { message: "Amount must be greater than 0." }),
  date: z.date(),
  type: z.enum(["income", "expense"]),
  category: z.string().optional(),
  description: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.enum(["weekly", "monthly", "quarterly", "yearly"]).optional(),
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

interface BudgetItem {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  date: string;
  type: "income" | "expense";
  category?: string | null;
  description?: string | null;
  is_recurring: boolean;
  recurring_frequency?: "weekly" | "monthly" | "quarterly" | "yearly" | null;
  created_at?: string;
  updated_at?: string;
}

const Budget = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [categories, setCategories] = useState([]);
  const [isAddingBudgetItem, setIsAddingBudgetItem] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [open, setOpen] = useState(false);
  const [upcomingTotal, setUpcomingTotal] = useState({ income: 0, expense: 0 });

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      title: "",
      amount: 0,
      date: new Date(),
      type: "expense",
      description: "",
      isRecurring: false,
    },
  });

  const isRecurring = form.watch("isRecurring");
  const selectedType = form.watch("type");

  useEffect(() => {
    if (!user) return;

    const fetchBalance = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("current_balance")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setCurrentBalance(data.current_balance || 0);
      }
    };

    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*, categories(name)")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (!error && data) {
        const formattedData = data.map((t) => ({
          ...t,
          category_name: t.categories?.name || "Other",
        }));
        setTransactions(formattedData);
      }
    };

    const fetchBudgetItems = async () => {
      try {
        const { data, error } = await supabase
          .from("budget_items")
          .select("*")
          .eq("user_id", user.id);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setBudgetItems(data as BudgetItem[]);
        }
      } catch (error) {
        console.error("Error fetching budget items:", error);
        toast.error("Failed to load budget items");
      }
    };

    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true });

      if (!error && data) {
        setCategories(data);
      }
    };

    fetchBalance();
    fetchTransactions();
    fetchBudgetItems();
    fetchCategories();
  }, [user]);

  useEffect(() => {
    const now = new Date();
    const thirtyDaysFromNow = addMonths(now, 1);
    
    let upcomingIncome = 0;
    let upcomingExpense = 0;
    
    budgetItems.forEach(item => {
      const itemDate = new Date(item.date);
      
      if (isFuture(itemDate) && itemDate <= thirtyDaysFromNow) {
        if (item.type === "income") {
          upcomingIncome += Number(item.amount);
        } else {
          upcomingExpense += Number(item.amount);
        }
      }
    });
    
    setUpcomingTotal({
      income: upcomingIncome,
      expense: upcomingExpense
    });
  }, [budgetItems]);

  const plannedIncome = budgetItems
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const plannedExpenses = budgetItems
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const projectedBalance = currentBalance + upcomingTotal.income - upcomingTotal.expense;
  
  const actualIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  const actualExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const budgetByCategory = {};
  
  budgetItems
    .filter((item) => item.type === "expense")
    .forEach((item) => {
      const category = item.category || "Other";
      budgetByCategory[category] = (budgetByCategory[category] || 0) + Number(item.amount);
    });
    
  const budgetBreakdownData = Object.entries(budgetByCategory).map(
    ([name, value]) => ({
      name,
      value,
    })
  );
  
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"];

  const comparisonData = [
    {
      name: "Income",
      planned: plannedIncome,
      actual: actualIncome,
    },
    {
      name: "Expenses",
      planned: plannedExpenses,
      actual: actualExpenses,
    },
    {
      name: "Net",
      planned: plannedIncome - plannedExpenses,
      actual: actualIncome - actualExpenses,
    },
  ];

  const onSubmit = async (data: BudgetFormValues) => {
    setIsAddingBudgetItem(true);
    
    try {
      const newItem = {
        user_id: user?.id,
        title: data.title,
        amount: data.amount,
        date: data.date.toISOString().split('T')[0],
        type: data.type,
        category: data.category || null,
        description: data.description || null,
        is_recurring: data.isRecurring,
        recurring_frequency: data.isRecurring ? data.recurringFrequency : null
      };
      
      const { data: insertedData, error } = await supabase
        .from("budget_items")
        .insert(newItem)
        .select();
      
      if (error) throw error;
      
      if (insertedData && insertedData.length > 0) {
        setBudgetItems([...budgetItems, insertedData[0] as BudgetItem]);
      }
      
      form.reset({
        title: "",
        amount: 0,
        date: new Date(),
        type: "expense",
        description: "",
        isRecurring: false,
      });
      
      setOpen(false);
      toast.success("Budget item added successfully");
    } catch (error) {
      console.error("Error adding budget item:", error);
      toast.error("Failed to add budget item");
    } finally {
      setIsAddingBudgetItem(false);
    }
  };

  const removeBudgetItem = async (id) => {
    try {
      const { error } = await supabase
        .from("budget_items")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      setBudgetItems(budgetItems.filter(item => item.id !== id));
      toast.success("Budget item removed");
    } catch (error) {
      console.error("Error removing budget item:", error);
      toast.error("Failed to remove budget item");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen pt-24 pb-10">
        <div className="container px-4 sm:px-6 mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold tracking-tight">Budget</h1>
              <p className="text-muted-foreground">
                Plan your finances and track your spending
              </p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Budget Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Add Budget Item</DialogTitle>
                  <DialogDescription>
                    Add a planned income or expense to your budget
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Rent, Salary, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <BadgeIndianRupee className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="0.00"
                                type="number"
                                step="0.01"
                                min="0"
                                className="pl-8"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="income">Income</SelectItem>
                                <SelectItem value="expense">Expense</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories
                                .filter(
                                  (cat) => cat.type === selectedType
                                )
                                .map((category) => (
                                  <SelectItem
                                    key={category.id}
                                    value={category.name}
                                  >
                                    {category.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Additional details" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isRecurring"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Recurring Item</FormLabel>
                            <FormDescription>
                              This item repeats on a regular basis
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {isRecurring && (
                      <FormField
                        control={form.control}
                        name="recurringFrequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frequency</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <DialogFooter>
                      <Button
                        type="submit"
                        disabled={isAddingBudgetItem}
                      >
                        {isAddingBudgetItem ? "Adding..." : "Add to Budget"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Current Balance</CardDescription>
                <CardTitle className="text-2xl font-bold">
                  {formatCurrency(currentBalance)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Upcoming (Next 30 Days)</CardDescription>
                <CardTitle className="text-2xl font-bold">
                  <span className="text-green-500">{formatCurrency(upcomingTotal.income)}</span> / 
                  <span className="text-red-500">-{formatCurrency(upcomingTotal.expense)}</span>
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Projected Balance</CardDescription>
                <CardTitle className="text-2xl font-bold">
                  <span className={projectedBalance >= 0 ? "text-green-500" : "text-red-500"}>
                    {formatCurrency(projectedBalance)}
                  </span>
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Tabs defaultValue="planned" className="space-y-6">
            <TabsList>
              <TabsTrigger value="planned">Planned Items</TabsTrigger>
              <TabsTrigger value="analysis">Budget Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="planned">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Income & Expenses</CardTitle>
                  <CardDescription>
                    Your planned financial activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {budgetItems.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          No budget items yet. Add your first item to start planning.
                        </p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => setOpen(true)}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add Budget Item
                        </Button>
                      </div>
                    ) : (
                      budgetItems
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-4 rounded-lg border"
                          >
                            <div className="flex items-start space-x-4">
                              <div className={`p-2 rounded-full ${
                                item.type === "income" 
                                  ? "bg-green-100 text-green-600" 
                                  : "bg-red-100 text-red-600"
                              }`}>
                                {item.type === "income" ? (
                                  <TrendingUp className="h-5 w-5" />
                                ) : (
                                  <TrendingDown className="h-5 w-5" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium">{item.title}</h4>
                                <div className="text-sm text-muted-foreground">
                                  {format(new Date(item.date), "PPP")}
                                  {item.category && ` • ${item.category}`}
                                  {item.is_recurring && ` • Recurring (${item.recurring_frequency})`}
                                </div>
                                {item.description && (
                                  <p className="text-sm mt-1">{item.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className={`font-medium ${
                                item.type === "income" ? "text-green-600" : "text-red-600"
                              }`}>
                                {item.type === "income" ? "" : "-"}{formatCurrency(Number(item.amount))}
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => removeBudgetItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Budget Breakdown</CardTitle>
                    <CardDescription>
                      Your planned expenses by category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {budgetBreakdownData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={budgetBreakdownData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={90}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {budgetBreakdownData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-muted-foreground text-center">
                            Add budget items to see your expense breakdown
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Planned vs. Actual</CardTitle>
                    <CardDescription>
                      Compare your budget with actual transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comparisonData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => [formatCurrency(Number(value)), undefined]} />
                          <Legend />
                          <Bar dataKey="planned" name="Planned" fill="#8884d8" />
                          <Bar dataKey="actual" name="Actual" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Budget;
