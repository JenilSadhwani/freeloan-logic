
import { Receipt, Trash2 } from "lucide-react";
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
  deleteTaxCalculation: () => void;
}

const TaxSummary = ({ 
  taxCalculation, 
  totalIncome, 
  openTaxModal,
  deleteTaxCalculation
}: TaxSummaryProps) => {
  if (!taxCalculation) return null;

  // Calculate monthly tax from annual tax
  const monthlyTax = taxCalculation.tax / 12;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Monthly Income Tax Estimate
        </CardTitle>
        <CardDescription>Based on the Indian Tax Regime (FY 2023-24)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Estimated Monthly Income</p>
            <p className="text-2xl font-semibold">₹{(totalIncome).toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Estimated Monthly Tax</p>
            <p className="text-2xl font-semibold text-red-500">
              ₹{Math.round(monthlyTax).toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Monthly Tax Provision</p>
            <p className="text-2xl font-semibold text-amber-500">
              ₹{Math.round(monthlyTax).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={openTaxModal}
            >
              View Detailed Breakdown
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={deleteTaxCalculation}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaxSummary;
