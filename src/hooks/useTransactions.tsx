import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Transaction {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string | null;
  created_at: string;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions((data || []).map(t => ({
        ...t,
        type: t.type as "income" | "expense"
      })));
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const addTransaction = async (
    title: string,
    amount: number,
    type: "income" | "expense",
    category?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          title,
          amount,
          type,
          category: category || null,
        })
        .select()
        .single();

      if (error) throw error;

      const typedData = { ...data, type: data.type as "income" | "expense" };
      setTransactions((prev) => [typedData, ...prev]);
      toast({
        title: type === "income" ? "💰 Income Added!" : "💸 Expense Recorded",
        description: `${title}: $${amount.toFixed(2)}`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast({
        title: "Transaction Deleted",
        description: "Transaction has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getBalance = () => {
    return transactions.reduce((acc, t) => {
      return t.type === "income" ? acc + Number(t.amount) : acc - Number(t.amount);
    }, 0);
  };

  const getTotalIncome = () => {
    return transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + Number(t.amount), 0);
  };

  const getTotalExpenses = () => {
    return transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + Number(t.amount), 0);
  };

  return {
    transactions,
    loading,
    addTransaction,
    deleteTransaction,
    getBalance,
    getTotalIncome,
    getTotalExpenses,
    refetch: fetchTransactions,
  };
};
