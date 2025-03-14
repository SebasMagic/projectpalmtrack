
import { supabase } from "@/integrations/supabase/client";
import { MOCK_PROJECTS, MOCK_TRANSACTIONS } from "./mockData";
import { Project, Transaction, Task, TaskComment } from "./types";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

/**
 * Migrates mock data to Supabase database
 */
export const migrateDataToSupabase = async () => {
  try {
    // Start by checking if we have data in the projects table
    const { data: existingProjects } = await supabase
      .from('projects')
      .select('id')
      .limit(1);
    
    // If we already have data, don't migrate
    if (existingProjects && existingProjects.length > 0) {
      console.log('Data already exists in Supabase, skipping migration');
      return { success: true, message: 'Data already exists in Supabase' };
    }

    // Create a mapping of old project IDs to new UUIDs
    const projectIdMap = new Map();
    
    // Prepare projects for insertion with proper UUIDs
    const projectsToInsert = MOCK_PROJECTS.map(project => {
      const newId = uuidv4();
      projectIdMap.set(project.id, newId);
      
      return {
        id: newId,
        name: project.name,
        client: project.client,
        location: project.location,
        start_date: project.startDate,
        end_date: project.endDate,
        due_date: project.dueDate,
        budget: project.budget,
        status: project.status,
        completion: project.completion,
        description: project.description
      };
    });

    console.log('Inserting projects:', projectsToInsert);

    // Insert projects
    const { error: projectsError } = await supabase
      .from('projects')
      .insert(projectsToInsert);

    if (projectsError) {
      console.error('Error inserting projects:', projectsError);
      return { success: false, message: `Error inserting projects: ${projectsError.message}` };
    }

    // Prepare transactions for insertion with proper UUIDs and updated project references
    const transactionsToInsert = MOCK_TRANSACTIONS.map(transaction => ({
      id: uuidv4(),
      project_id: projectIdMap.get(transaction.projectId), // Use the new UUID for the project
      date: transaction.date,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      description: transaction.description
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
    dueDate: null, // Since due_date doesn't exist in the database, set it to null
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
  // Using a custom query to prevent the "ambiguous column" error
  // The issue was that both the function parameter and a table column were named "project_id"
  const { data, error } = await supabase
    .from('transactions')
    .select('type, amount')
    .eq('project_id', projectId);
  
  if (error) {
    console.error('Error fetching project financials:', error);
    toast.error('Failed to load project financials');
    return null;
  }
  
  // Get the project details for budget information
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
  
  // Calculate financials based on transactions
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
 * Fetches dashboard statistics
 */
export const fetchDashboardStats = async () => {
  // Fetch all projects to calculate stats
  const projects = await fetchProjects();
  
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  
  // Get upcoming deadlines - use endDate since dueDate doesn't exist in our schema
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
    upcomingDeadlines: upcomingDeadlines || [] // Ensure we always return an array, even if empty
  };
};

/**
 * Fetches tasks for a specific project
 */
export const fetchProjectTasks = async (projectId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching tasks:', error);
    toast.error('Failed to load tasks');
    return [];
  }
  
  return data.map(task => {
    // Parse comments to ensure they are properly cast to TaskComment[]
    let parsedComments: TaskComment[] = [];
    
    if (task.comments) {
      try {
        // If comments is already an array, map it to TaskComment structure
        if (Array.isArray(task.comments)) {
          parsedComments = task.comments.map((comment: any) => ({
            id: comment.id || uuidv4(),
            taskId: comment.taskId || task.id,
            content: comment.content || '',
            author: comment.author || 'Unknown',
            createdAt: comment.createdAt || new Date().toISOString()
          }));
        } else {
          // If it's not an array, use empty array
          console.warn('Task comments not in expected format:', task.comments);
        }
      } catch (e) {
        console.error('Error parsing task comments:', e);
      }
    }
    
    return {
      id: task.id,
      projectId: task.project_id,
      title: task.title,
      description: task.description,
      status: task.status as 'todo' | 'in-progress' | 'completed' | 'blocked' | 'review',
      priority: task.priority as 'low' | 'medium' | 'high' | 'urgent' || 'medium',
      dueDate: task.due_date,
      startDate: task.start_date || null,
      estimatedHours: task.estimated_hours || null,
      actualHours: task.actual_hours || null,
      assignedTo: task.assigned_to || null,
      category: task.category || null,
      tags: task.tags || [],
      dependencies: task.dependencies || [],
      attachments: task.attachments || [],
      comments: parsedComments,
      createdAt: task.created_at,
      updatedAt: task.updated_at || null,
      completedAt: task.completed_at || null
    };
  });
};

/**
 * Adds a new task to a project
 */
export const addProjectTask = async (taskData: { 
  projectId: string, 
  title: string, 
  description?: string,
  status: 'todo' | 'in-progress' | 'completed' | 'blocked' | 'review',
  priority?: 'low' | 'medium' | 'high' | 'urgent',
  category?: string,
  dueDate?: string | null,
  startDate?: string | null,
  estimatedHours?: number | null,
  actualHours?: number | null,
  assignedTo?: string | null,
  tags?: string[],
  dependencies?: string[],
}): Promise<Task | null> => {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      project_id: taskData.projectId,
      title: taskData.title,
      description: taskData.description || null,
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      due_date: taskData.dueDate || null,
      start_date: taskData.startDate || null,
      estimated_hours: taskData.estimatedHours || null,
      actual_hours: taskData.actualHours || null,
      assigned_to: taskData.assignedTo || null,
      category: taskData.category || null,
      tags: taskData.tags || [],
      dependencies: taskData.dependencies || []
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding task:', error);
    throw error;
  }
  
  return data ? {
    id: data.id,
    projectId: data.project_id,
    title: data.title,
    description: data.description,
    status: data.status as 'todo' | 'in-progress' | 'completed' | 'blocked' | 'review',
    priority: data.priority as 'low' | 'medium' | 'high' | 'urgent',
    dueDate: data.due_date,
    startDate: data.start_date,
    estimatedHours: data.estimated_hours,
    actualHours: data.actual_hours,
    assignedTo: data.assigned_to,
    category: data.category,
    tags: data.tags || [],
    dependencies: data.dependencies || [],
    attachments: [],
    comments: [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    completedAt: data.completed_at
  } : null;
};

/**
 * Updates a task's status
 */
export const updateTaskStatus = async (taskId: string, status: 'todo' | 'in-progress' | 'completed' | 'blocked' | 'review'): Promise<void> => {
  const updateData: any = { status };
  
  // If marking as completed, set completed_at timestamp
  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString();
  } else {
    // If changing from completed to something else, clear the completed_at field
    updateData.completed_at = null;
  }
  
  const { error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId);
  
  if (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

/**
 * Fetches all cities from Supabase
 */
export const fetchCities = async () => {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error fetching cities:', error);
    toast.error('Failed to load cities');
    return [];
  }
  
  return data;
};
