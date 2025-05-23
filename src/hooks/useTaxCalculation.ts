
import { useState, useEffect } from "react";
import { TaxCalculation, calculateIndianIncomeTax } from "@/utils/taxCalculator";
import { toast } from "sonner";

interface UseTaxCalculationProps {
  totalIncome: number;
  autoUpdateEnabled: boolean;
}

interface UseTaxCalculationResult {
  taxCalculation: TaxCalculation | null;
  setTaxCalculation: React.Dispatch<React.SetStateAction<TaxCalculation | null>>;
  calculateTaxForIncome: (income: number) => void;
  deleteTaxCalculation: () => void;
}

export const useTaxCalculation = ({ 
  totalIncome, 
  autoUpdateEnabled 
}: UseTaxCalculationProps): UseTaxCalculationResult => {
  const [taxCalculation, setTaxCalculation] = useState<TaxCalculation | null>(null);

  // Calculate tax based on monthly income
  useEffect(() => {
    if (totalIncome > 0 && autoUpdateEnabled) {
      // Convert monthly income to annual for tax calculation
      const annualIncome = totalIncome * 12;
      const taxInfo = calculateIndianIncomeTax(annualIncome);
      setTaxCalculation(taxInfo);
    }
  }, [totalIncome, autoUpdateEnabled]);

  // Function to calculate tax for a manually entered income
  const calculateTaxForIncome = (income: number) => {
    if (income > 0) {
      // Ensure we're calculating with the full annual amount
      const taxInfo = calculateIndianIncomeTax(income);
      setTaxCalculation(taxInfo);
      toast.success("Tax calculated successfully");
    } else {
      toast.error("Please enter a valid income amount");
    }
  };
  
  // Function to delete the tax calculation
  const deleteTaxCalculation = () => {
    setTaxCalculation(null);
    toast.success("Tax calculation deleted");
  };

  return {
    taxCalculation,
    setTaxCalculation,
    calculateTaxForIncome,
    deleteTaxCalculation
  };
};
