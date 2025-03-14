
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Project } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { fetchProjectFinancials } from '@/lib/supabaseUtils';

interface ProjectTableProps {
  projects: Project[];
  onRefresh?: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getStatusColor = (status: Project['status']) => {
  switch (status) {
    case 'planning':
      return 'bg-blue-100 text-blue-800';
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-purple-100 text-purple-800';
    case 'on-hold':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const ProjectTable = ({ projects, onRefresh }: ProjectTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [projectProfits, setProjectProfits] = useState<{[key: string]: string}>({});
  const navigate = useNavigate();

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProjectProfit = async (projectId: string): Promise<string> => {
    if (projectProfits[projectId]) {
      return projectProfits[projectId];
    }

    try {
      const financials = await fetchProjectFinancials(projectId);
      if (!financials) return '-';
      
      const profitText = `${formatCurrency(financials.currentProfit)} (${financials.profitMargin.toFixed(1)}%)`;
      setProjectProfits(prev => ({...prev, [projectId]: profitText}));
      return profitText;
    } catch (error) {
      console.error(`Error fetching profit for project ${projectId}:`, error);
      return '-';
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    if (onRefresh) {
      await onRefresh();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Projects</h2>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-1"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
          <div className="w-full max-w-sm">
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Current P&L</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No projects found
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => (
                <TableRow 
                  key={project.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.client}</TableCell>
                  <TableCell>{project.location}</TableCell>
                  <TableCell>
                    {formatDate(project.startDate)} - {formatDate(project.endDate)}
                  </TableCell>
                  <TableCell>{formatCurrency(project.budget)}</TableCell>
                  <TableCell>
                    {projectProfits[project.id] || 
                      <span className="text-muted-foreground">Loading...</span>}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={cn(
                        "font-medium capitalize", 
                        getStatusColor(project.status)
                      )}
                      variant="outline"
                    >
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress value={project.completion} className="h-2 w-24" />
                      <span className="text-xs font-medium">{project.completion}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProjectTable;
