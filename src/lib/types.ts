
export interface Project {
  id: string;
  name: string;
  client: string;
  location: string;
  cityId?: string; // Added cityId field to reference the cities table
  startDate: string;
  endDate: string | null;
  dueDate: string | null;
  budget: number;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  completion: number; // percentage
  description: string;
}

export interface Transaction {
  id: string;
  projectId: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
}

export interface TransactionCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
}

export interface ProjectFinancials {
  projectId: string;
  totalBudget: number;
  totalIncome: number;
  totalExpenses: number;
  currentProfit: number;
  profitMargin: number;
}

export interface DashboardStats {
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  totalProfit: number;
  upcomingDeadlines: Array<{
    projectId: string;
    projectName: string;
    dueDate: string;
  }>;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in-progress' | 'completed' | 'blocked' | 'review';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string | null;
  startDate: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  assignedTo: string | null;
  category: string | null;
  tags: string[];
  dependencies: string[] | null; // IDs of tasks this task depends on
  attachments: string[] | null; // URLs to attachments
  comments: TaskComment[] | null;
  createdAt: string;
  updatedAt: string | null;
  completedAt: string | null;
}

export interface TaskComment {
  id: string;
  taskId: string;
  content: string;
  author: string;
  createdAt: string;
}
