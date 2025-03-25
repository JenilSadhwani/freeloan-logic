
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface MonthlyData {
  name: string;
  income: number;
  expenses: number;
}

interface IncomeExpenseChartProps {
  monthlyData: MonthlyData[];
}

const IncomeExpenseChart = ({ monthlyData }: IncomeExpenseChartProps) => {
  return (
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
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke="#4f46e5" 
                fill="#4f46e5" 
                fillOpacity={0.2} 
              />
              <Area 
                type="monotone" 
                dataKey="expenses" 
                stroke="#f43f5e" 
                fill="#f43f5e" 
                fillOpacity={0.2} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncomeExpenseChart;
