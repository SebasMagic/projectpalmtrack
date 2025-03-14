
import { DashboardStats, Project, ProjectFinancials } from "./types";

export const MOCK_PROJECTS: Project[] = [
  {
    id: "p1",
    name: "Coastal Heights Apartment",
    client: "Oceanview Properties",
    location: "Malibu, CA",
    startDate: "2023-10-15",
    endDate: null,
    dueDate: "2024-06-15",
    budget: 2500000,
    status: "active",
    completion: 45,
    description: "Luxury 12-unit apartment complex with ocean views and premium amenities."
  },
  {
    id: "p2",
    name: "Downtown Office Renovation",
    client: "Tech Innovators Inc.",
    location: "San Francisco, CA",
    startDate: "2023-08-01",
    endDate: "2023-12-15",
    dueDate: "2023-12-15",
    budget: 1200000,
    status: "completed",
    completion: 100,
    description: "Complete renovation of a 5-floor office building with modernized workspaces."
  },
  {
    id: "p3",
    name: "Riverside Community Center",
    client: "Riverside City Council",
    location: "Riverside, CA",
    startDate: "2024-01-10",
    endDate: null,
    dueDate: "2024-08-30",
    budget: 3800000,
    status: "active",
    completion: 28,
    description: "Multi-purpose community center with sports facilities, auditorium, and meeting rooms."
  },
  {
    id: "p4",
    name: "Heritage Hills Shopping Mall",
    client: "Capital Retail Group",
    location: "Austin, TX",
    startDate: "2023-11-05",
    endDate: null,
    dueDate: "2024-06-30",
    budget: 5500000,
    status: "active",
    completion: 15,
    description: "Modern shopping mall with 85 retail spaces, food court, and entertainment area."
  },
  {
    id: "p5",
    name: "Silver Creek Hospital Wing",
    client: "Silver Creek Healthcare",
    location: "Denver, CO",
    startDate: "2023-09-20",
    endDate: null,
    dueDate: "2024-07-15",
    budget: 7200000,
    status: "on-hold",
    completion: 32,
    description: "New wing addition to existing hospital with 50 patient rooms and specialized treatment centers."
  },
  {
    id: "p6",
    name: "Greenfield Elementary School",
    client: "Greenfield School District",
    location: "Portland, OR",
    startDate: "2024-04-01",
    endDate: null,
    dueDate: "2025-02-28",
    budget: 4100000,
    status: "planning",
    completion: 0,
    description: "New elementary school with 30 classrooms, gymnasium, and modern educational facilities."
  }
];

export const MOCK_PROJECT_FINANCIALS: ProjectFinancials[] = [
  {
    projectId: "p1",
    totalBudget: 2500000,
    totalIncome: 1250000,
    totalExpenses: 435000,
    currentProfit: 815000,
    profitMargin: 32.6
  },
  {
    projectId: "p2",
    totalBudget: 1200000,
    totalIncome: 1200000,
    totalExpenses: 535000,
    currentProfit: 665000,
    profitMargin: 55.4
  },
  {
    projectId: "p3",
    totalBudget: 3800000,
    totalIncome: 950000,
    totalExpenses: 510000,
    currentProfit: 440000,
    profitMargin: 11.6
  },
  {
    projectId: "p4",
    totalBudget: 5500000,
    totalIncome: 1100000,
    totalExpenses: 480000,
    currentProfit: 620000,
    profitMargin: 11.3
  },
  {
    projectId: "p5",
    totalBudget: 7200000,
    totalIncome: 2160000,
    totalExpenses: 1350000,
    currentProfit: 810000,
    profitMargin: 11.3
  },
  {
    projectId: "p6",
    totalBudget: 4100000,
    totalIncome: 0,
    totalExpenses: 0,
    currentProfit: 0,
    profitMargin: 0
  }
];

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  activeProjects: 3,
  completedProjects: 1,
  totalRevenue: 5560000,
  totalProfit: 3350000,
  upcomingDeadlines: [
    {
      projectId: "p4",
      projectName: "Heritage Hills Shopping Mall",
      dueDate: "2024-06-30"
    },
    {
      projectId: "p5",
      projectName: "Silver Creek Hospital Wing",
      dueDate: "2024-07-15"
    }
  ]
};

// Helper function to get project details by ID
export const getProjectById = (projectId: string): Project | undefined => {
  return MOCK_PROJECTS.find(project => project.id === projectId);
};

// Helper function to get project financials by ID
export const getProjectFinancials = (projectId: string): ProjectFinancials | undefined => {
  return MOCK_PROJECT_FINANCIALS.find(financials => financials.projectId === projectId);
};
