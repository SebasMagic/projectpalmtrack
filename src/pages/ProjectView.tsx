
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { getProjectById, getProjectFinancials, getProjectTransactions } from '@/lib/mockData';
import { fetchProjectFinancials, fetchProjectTransactions, fetchProjects } from '@/lib/supabaseUtils';
import ProjectDetail from '@/components/ProjectDetail';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Project, ProjectFinancials, Transaction } from '@/lib/types';
import { toast } from 'sonner';

const ProjectView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | undefined>(undefined);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [financials, setFinancials] = useState<ProjectFinancials | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProjectData = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Fetch projects
      const projects = await fetchProjects();
      const foundProject = projects.find(p => p.id === id);
      
      if (foundProject) {
        setProject(foundProject);
        
        // Fetch transactions for this project
        const transactionData = await fetchProjectTransactions(id);
        setTransactions(transactionData);
        
        // Fetch financial data for this project
        const financialData = await fetchProjectFinancials(id);
        if (financialData) {
          setFinancials(financialData);
        }
      } else {
        // Fall back to mock data if project not found in database
        setProject(getProjectById(id));
        setTransactions(getProjectTransactions(id));
        setFinancials(getProjectFinancials(id));
        toast.info('Using mock data for this project.');
      }
    } catch (error) {
      console.error('Error loading project data:', error);
      // Fall back to mock data
      setProject(getProjectById(id));
      setTransactions(getProjectTransactions(id));
      setFinancials(getProjectFinancials(id));
      toast.error('Failed to load project data from database. Using mock data.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadProjectData();
      toast.success('Project data refreshed');
    } catch (error) {
      toast.error('Failed to refresh project data');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);
  
  useEffect(() => {
    if (!loading && !project) {
      console.error("Project data not found");
      // Navigate back to projects after a short delay
      const timer = setTimeout(() => {
        navigate('/projects');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [project, loading, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Loading Project...</h1>
        </div>
      </div>
    );
  }
  
  if (!project || !financials) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
          <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/projects')}>
            Go to Projects
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 pb-16">
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/projects')}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>
        
        <ProjectDetail 
          project={project} 
          transactions={transactions} 
          financials={financials} 
          onTransactionAdded={loadProjectData}
        />
      </main>
    </div>
  );
};

export default ProjectView;
