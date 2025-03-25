
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseBalanceManagementProps {
  userId: string | undefined;
  netProfit: number;
  transactions: any[];
  autoUpdateEnabled: boolean;
}

interface UseBalanceManagementResult {
  currentBalance: number;
  isUpdatingBalance: boolean;
  updateBalanceWithProfit: () => Promise<void>;
}

export const useBalanceManagement = ({
  userId,
  netProfit,
  transactions,
  autoUpdateEnabled
}: UseBalanceManagementProps): UseBalanceManagementResult => {
  const [currentBalance, setCurrentBalance] = useState(0);
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false);

  // Fetch the initial balance
  useEffect(() => {
    const fetchCurrentBalance = async () => {
      if (!userId) return;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("current_balance")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setCurrentBalance(data.current_balance || 0);
      }
    };

    fetchCurrentBalance();
  }, [userId]);

  // Update balance with net profit if auto-update is enabled
  useEffect(() => {
    if (autoUpdateEnabled && userId && transactions.length > 0) {
      updateBalanceWithProfit();
    }
  }, [transactions, autoUpdateEnabled, userId]);

  // Function to update the balance
  const updateBalanceWithProfit = async () => {
    if (!userId || isUpdatingBalance) return;
    
    setIsUpdatingBalance(true);
    
    const newBalance = netProfit;
    
    const { error } = await supabase
      .from("profiles")
      .update({ current_balance: newBalance })
      .eq("id", userId);
      
    if (error) {
      toast.error("Failed to update balance");
      console.error("Error updating balance:", error);
    } else {
      setCurrentBalance(newBalance);
      toast.success("Balance updated with net profit");
    }
    
    setIsUpdatingBalance(false);
  };

  return {
    currentBalance,
    isUpdatingBalance,
    updateBalanceWithProfit
  };
};
