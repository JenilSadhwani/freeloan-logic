
import { useState } from "react";
import { Receipt } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TaxCalculation, calculateIndianIncomeTax } from "@/utils/taxCalculator";

interface TaxCalculatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taxCalculation: TaxCalculation | null;
  setTaxCalculation: (calc: TaxCalculation | null) => void;
}

const TaxCalculatorModal = ({ 
  open, 
  onOpenChange, 
  taxCalculation, 
  setTaxCalculation 
}: TaxCalculatorModalProps) => {
  const [manualIncome, setManualIncome] = useState("");

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" /> 
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
                <span className="font-bold text-red-500">
                  ₹{Math.round(taxCalculation.tax).toLocaleString('en-IN')}
                </span>
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
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaxCalculatorModal;
