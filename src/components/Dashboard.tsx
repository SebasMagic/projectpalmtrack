
import { BarChart3, Building2, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats, Project } from '@/lib/types';
import ProjectCard from './ProjectCard';

interface DashboardProps {
  stats: DashboardStats;
  recentProjects: Project[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

const Dashboard = ({ stats, recentProjects }: DashboardProps) => {
  return (
    <div className="space-y-8 animate-fade-up">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.activeProjects - stats.completedProjects} from last month
            </p>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalProfit)}</div>
            <p className="text-xs text-muted-foreground">
              +8.2% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.totalProfit / stats.totalRevenue * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              -2.5% from last month
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>
              Your most recently updated projects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {recentProjects.slice(0, 3).map(project => (
              <div key={project.id} className="flex space-x-4">
                <div className="w-2 bg-primary rounded-full" />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">{project.name}</p>
                    <p className="text-sm text-muted-foreground">{project.completion}%</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{project.client}</p>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mt-2">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${project.completion}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>
              Projects with upcoming milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.upcomingDeadlines && stats.upcomingDeadlines.length > 0 ? (
              <div className="space-y-4">
                {stats.upcomingDeadlines.map(deadline => (
                  <div key={deadline.projectId} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{deadline.projectName}</p>
                      <p className="text-xs text-muted-foreground">Due {formatDate(deadline.dueDate)}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      new Date(deadline.dueDate).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {new Date(deadline.dueDate).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000
                        ? 'Urgent'
                        : 'Upcoming'
                      }
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                <p>No upcoming deadlines</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t pt-4">
            <p className="text-xs text-muted-foreground">
              Based on project timelines and milestones
            </p>
          </CardFooter>
        </Card>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Active Projects</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentProjects
            .filter(project => project.status === 'active')
            .slice(0, 3)
            .map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
