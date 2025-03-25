
import { Receipt } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaxCalculation } from "@/utils/taxCalculator";

interface TaxSummaryProps {
  taxCalculation: TaxCalculation | null;
  totalIncome: number;
  openTaxModal: () => void;
}

const TaxSummary = ({ 
  taxCalculation, 
  totalIncome, 
  openTaxModal 
}: TaxSummaryProps) => {
  if (!taxCalculation) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
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
            <p className="text-2xl font-semibold text-red-500">
              ₹{Math.round(taxCalculation.tax).toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Monthly Tax Provision</p>
            <p className="text-2xl font-semibold text-amber-500">
              ₹{Math.round(taxCalculation.tax / 12).toLocaleString('en-IN')}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={openTaxModal}
          >
            View Detailed Breakdown
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaxSummary;
