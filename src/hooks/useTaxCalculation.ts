
import { useState, useEffect } from "react";
import { TaxCalculation, calculateIndianIncomeTax } from "@/utils/taxCalculator";

interface UseTaxCalculationProps {
  totalIncome: number;
  autoUpdateEnabled: boolean;
}

interface UseTaxCalculationResult {
  taxCalculation: TaxCalculation | null;
  setTaxCalculation: React.Dispatch<React.SetStateAction<TaxCalculation | null>>;
  calculateTaxForIncome: (income: number) => void;
}

export const useTaxCalculation = ({ 
  totalIncome, 
  autoUpdateEnabled 
}: UseTaxCalculationProps): UseTaxCalculationResult => {
  const [taxCalculation, setTaxCalculation] = useState<TaxCalculation | null>(null);

  // Calculate tax based on annual income
  useEffect(() => {
    if (totalIncome > 0 && autoUpdateEnabled) {
      const annualIncome = totalIncome * 12;
      const taxInfo = calculateIndianIncomeTax(annualIncome);
      setTaxCalculation(taxInfo);
    }
  }, [totalIncome, autoUpdateEnabled]);

  // Function to calculate tax for a manually entered income
  const calculateTaxForIncome = (income: number) => {
    if (income > 0) {
      const taxInfo = calculateIndianIncomeTax(income);
      setTaxCalculation(taxInfo);
    }
  };

  return {
    taxCalculation,
    setTaxCalculation,
    calculateTaxForIncome
  };
};
