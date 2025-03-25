
export interface TaxBreakdown {
  slab: string;
  amount: number;
}

export interface TaxCalculation {
  tax: number;
  breakdown: TaxBreakdown[];
}

/**
 * Calculates income tax based on the Indian tax regime (FY 2023-24)
 * @param income Annual income in INR
 * @returns Tax calculation with total tax and breakdown by slabs
 */
export const calculateIndianIncomeTax = (income: number): TaxCalculation => {
  let tax = 0;
  const breakdown: TaxBreakdown[] = [];

  if (income <= 300000) {
    tax = 0;
    breakdown.push({ slab: "Up to ₹3,00,000", amount: 0 });
  } else if (income <= 600000) {
    const taxableAmount = income - 300000;
    const slabTax = taxableAmount * 0.05;
    tax = slabTax;
    breakdown.push({ slab: "Up to ₹3,00,000", amount: 0 });
    breakdown.push({ slab: "₹3,00,001 to ₹6,00,000 (5%)", amount: slabTax });
  } else if (income <= 900000) {
    const slabTax1 = 300000 * 0.05;
    const slabTax2 = (income - 600000) * 0.1;
    tax = slabTax1 + slabTax2;
    breakdown.push({ slab: "Up to ₹3,00,000", amount: 0 });
    breakdown.push({ slab: "₹3,00,001 to ₹6,00,000 (5%)", amount: slabTax1 });
    breakdown.push({ slab: "₹6,00,001 to ₹9,00,000 (10%)", amount: slabTax2 });
  } else if (income <= 1200000) {
    const slabTax1 = 300000 * 0.05;
    const slabTax2 = 300000 * 0.1;
    const slabTax3 = (income - 900000) * 0.15;
    tax = slabTax1 + slabTax2 + slabTax3;
    breakdown.push({ slab: "Up to ₹3,00,000", amount: 0 });
    breakdown.push({ slab: "₹3,00,001 to ₹6,00,000 (5%)", amount: slabTax1 });
    breakdown.push({ slab: "₹6,00,001 to ₹9,00,000 (10%)", amount: slabTax2 });
    breakdown.push({ slab: "₹9,00,001 to ₹12,00,000 (15%)", amount: slabTax3 });
  } else if (income <= 1500000) {
    const slabTax1 = 300000 * 0.05;
    const slabTax2 = 300000 * 0.1;
    const slabTax3 = 300000 * 0.15;
    const slabTax4 = (income - 1200000) * 0.2;
    tax = slabTax1 + slabTax2 + slabTax3 + slabTax4;
    breakdown.push({ slab: "Up to ₹3,00,000", amount: 0 });
    breakdown.push({ slab: "₹3,00,001 to ₹6,00,000 (5%)", amount: slabTax1 });
    breakdown.push({ slab: "₹6,00,001 to ₹9,00,000 (10%)", amount: slabTax2 });
    breakdown.push({ slab: "₹9,00,001 to ₹12,00,000 (15%)", amount: slabTax3 });
    breakdown.push({ slab: "₹12,00,001 to ₹15,00,000 (20%)", amount: slabTax4 });
  } else {
    const slabTax1 = 300000 * 0.05;
    const slabTax2 = 300000 * 0.1;
    const slabTax3 = 300000 * 0.15;
    const slabTax4 = 300000 * 0.2;
    const slabTax5 = (income - 1500000) * 0.3;
    tax = slabTax1 + slabTax2 + slabTax3 + slabTax4 + slabTax5;
    breakdown.push({ slab: "Up to ₹3,00,000", amount: 0 });
    breakdown.push({ slab: "₹3,00,001 to ₹6,00,000 (5%)", amount: slabTax1 });
    breakdown.push({ slab: "₹6,00,001 to ₹9,00,000 (10%)", amount: slabTax2 });
    breakdown.push({ slab: "₹9,00,001 to ₹12,00,000 (15%)", amount: slabTax3 });
    breakdown.push({ slab: "₹12,00,001 to ₹15,00,000 (20%)", amount: slabTax4 });
    breakdown.push({ slab: "Above ₹15,00,000 (30%)", amount: slabTax5 });
  }

  const cess = tax * 0.04;
  tax += cess;
  breakdown.push({ slab: "Health and Education Cess (4%)", amount: cess });

  return { tax, breakdown };
};
