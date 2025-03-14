
import { supabase } from "@/integrations/supabase/client";
import { MOCK_PROJECTS, MOCK_TRANSACTIONS } from "./mockData";
import { Project, Transaction } from "./types";
import { toast } from "sonner";

/**
 * Migrates mock data to Supabase database
 */
export const migrateDataToSupabase = async () => {
  try {
    // Start by checking if we have data in the tables
    const { data: existingProjects } = await supabase
      .from('projects')
      .select('id')
      .limit(1);
    
    // If we already have data, don't migrate
    if (existingProjects && existingProjects.length > 0) {
      console.log('Data already exists in Supabase, skipping migration');
      return { success: true, message: 'Data already exists in Supabase' };
    }

    // Prepare projects for insertion
    const projectsToInsert = MOCK_PROJECTS.map(project => ({
      ...project,
      start_date: project.startDate,
      end_date: project.endDate,
      // Remove the fields that don't match the database schema
      startDate: undefined,
      endDate: undefined
    }));

    // Insert projects
    const { error: projectsError } = await supabase
      .from('projects')
      .insert(projectsToInsert);

    if (projectsError) {
      console.error('Error inserting projects:', projectsError);
      return { success: false, message: `Error inserting projects: ${projectsError.message}` };
    }

    // Prepare transactions for insertion
    const transactionsToInsert = MOCK_TRANSACTIONS.map(transaction => ({
      ...transaction,
      date: transaction.date,
    }));

    // Insert transactions
    const { error: transactionsError } = await supabase
      .from('transactions')
      .insert(transactionsToInsert);

    if (transactionsError) {
      console.error('Error inserting transactions:', transactionsError);
      return { success: false, message: `Error inserting transactions: ${transactionsError.message}` };
    }

    console.log('Successfully migrated data to Supabase');
    return { success: true, message: 'Successfully migrated data to Supabase' };
  } catch (error) {
    console.error('Error in data migration:', error);
    return { success: false, message: `Error in data migration: ${error}` };
  }
};

// Utility functions to fetch data from Supabase

/**
 * Fetches all projects from Supabase
 */
export const fetchProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*');
  
  if (error) {
    console.error('Error fetching projects:', error);
    toast.error('Failed to load projects');
    return [];
  }
  
  // Transform the data to match our frontend model
  return data.map(project => ({
    id: project.id,
    name: project.name,
    client: project.client,
    location: project.location,
    startDate: project.start_date,
    endDate: project.end_date,
    budget: project.budget,
    status: project.status as 'planning' | 'active' | 'completed' | 'on-hold',
    completion: project.completion,
    description: project.description
  }));
};

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
    .rpc('get_project_financials', { project_id: projectId });
  
  if (error) {
    console.error('Error fetching project financials:', error);
    toast.error('Failed to load project financials');
    return null;
  }
  
  if (data && data.length > 0) {
    // Convert the RPC result to our ProjectFinancials type
    return {
      projectId,
      totalBudget: data[0].total_budget,
      totalIncome: data[0].total_income,
      totalExpenses: data[0].total_expenses,
      currentProfit: data[0].current_profit,
      profitMargin: data[0].profit_margin
    };
  }
  
  return null;
};

/**
 * Fetches dashboard statistics
 */
export const fetchDashboardStats = async () => {
  // Fetch all projects to calculate stats
  const projects = await fetchProjects();
  
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  
  // Get upcoming deadlines
  const upcomingDeadlines = projects
    .filter(p => p.endDate && new Date(p.endDate) > new Date())
    .sort((a, b) => {
      if (!a.endDate || !b.endDate) return 0;
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    })
    .slice(0, 5)
    .map(p => ({
      projectId: p.id,
      projectName: p.name,
      dueDate: p.endDate as string
    }));
  
  // Calculate total revenue and profit
  // This would ideally come from an RPC but for now we'll calculate it
  let totalRevenue = 0;
  let totalProfit = 0;
  
  for (const project of projects) {
    const financials = await fetchProjectFinancials(project.id);
    if (financials) {
      totalRevenue += financials.totalIncome;
      totalProfit += financials.currentProfit;
    }
  }
  
  return {
    activeProjects,
    completedProjects,
    totalRevenue,
    totalProfit,
    upcomingDeadlines
  };
};
