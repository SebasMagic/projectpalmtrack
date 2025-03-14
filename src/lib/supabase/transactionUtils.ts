
import { supabase } from "@/integrations/supabase/client";
import { Transaction, TransactionCategory } from "../types";
import { toast } from "sonner";

/**
 * Fetches transactions for a specific project
 */
export const fetchProjectTransactions = async (projectId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('project_id', projectId);
  
  if (error) {
    console.error('Error fetching transactions:', error);
    toast.error('Failed to load transactions');
    return [];
  }
  
  return data.map(transaction => ({
    id: transaction.id,
    projectId: transaction.project_id,
    date: transaction.date,
    amount: transaction.amount,
    type: transaction.type as 'income' | 'expense',
    category: transaction.category,
    description: transaction.description || ''
  }));
};

/**
 * Fetches financial data for a specific project
 */
export const fetchProjectFinancials = async (projectId: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('type, amount')
    .eq('project_id', projectId);
  
  if (error) {
    console.error('Error fetching project financials:', error);
    toast.error('Failed to load project financials');
    return null;
  }
  
  const { data: projectData, error: projectError } = await supabase
    .from('projects')
    .select('budget')
    .eq('id', projectId)
    .single();
  
  if (projectError) {
    console.error('Error fetching project details:', projectError);
    toast.error('Failed to load project details');
    return null;
  }
  
  const totalBudget = projectData?.budget || 0;
  let totalIncome = 0;
  let totalExpenses = 0;
  
  if (data) {
    data.forEach(transaction => {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount;
      } else if (transaction.type === 'expense') {
        totalExpenses += transaction.amount;
      }
    });
  }
  
  const currentProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? (currentProfit / totalIncome) * 100 : 0;
  
  return {
    projectId,
    totalBudget,
    totalIncome,
    totalExpenses,
    currentProfit,
    profitMargin
  };
};

/**
 * Fetches transaction categories from database
 */
export const fetchTransactionCategories = async (): Promise<TransactionCategory[]> => {
  const { data, error } = await supabase
    .from('transaction_categories')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching transaction categories:', error);
    toast.error('Failed to load transaction categories');
    return [];
  }
  
  return data.map(category => ({
    id: category.id,
    name: category.name,
    type: category.type as 'income' | 'expense'
  }));
};
