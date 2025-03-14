
export interface Project {
  id: string;
  name: string;
  client: string;
  location: string;
  startDate: string;
  endDate: string | null;
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
