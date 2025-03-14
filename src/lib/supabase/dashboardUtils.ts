
import { DashboardStats } from "../types";
import { fetchProjects } from "./projectUtils";
import { fetchProjectFinancials } from "./transactionUtils";

/**
 * Fetches dashboard statistics
 */
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
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
