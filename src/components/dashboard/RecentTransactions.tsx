
import { format } from "date-fns";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

interface Transaction {
  id: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
  amount: number;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const RecentTransactions = ({ transactions }: RecentTransactionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((t) => (
            <div key={t.id} className="flex justify-between items-center p-3 bg-muted/40 rounded-md">
              <div>
                <div className="font-medium">{t.description}</div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(t.date), 'MMM dd, yyyy')}
                </div>
              </div>
              <div className={`font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
