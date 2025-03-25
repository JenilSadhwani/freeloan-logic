
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface SummaryCardsProps {
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitPercentage: string;
  isProfit: boolean;
  autoUpdateEnabled: boolean;
  isUpdatingBalance: boolean;
  updateBalanceWithProfit: () => void;
}

const SummaryCards = ({
  currentBalance,
  totalIncome,
  totalExpenses,
  netProfit,
  profitPercentage,
  isProfit,
  autoUpdateEnabled,
  isUpdatingBalance,
  updateBalanceWithProfit
}: SummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardDescription>Current Balance</CardDescription>
          <CardTitle className="text-2xl font-bold flex items-center">
            ₹{currentBalance.toLocaleString('en-IN')}
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
            ₹{totalIncome.toLocaleString('en-IN')}
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
            ₹{totalExpenses.toLocaleString('en-IN')}
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
            ₹{netProfit.toLocaleString('en-IN')}
            <span className={`ml-2 flex items-center text-sm font-normal ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
              {isProfit ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {profitPercentage}%
            </span>
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
};

export default SummaryCards;
