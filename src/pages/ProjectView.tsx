
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getProjectById, getProjectFinancials, getProjectTransactions } from '@/lib/mockData';
import ProjectDetail from '@/components/ProjectDetail';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ProjectView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const project = id ? getProjectById(id) : undefined;
  const transactions = id ? getProjectTransactions(id) : [];
  const financials = id ? getProjectFinancials(id) : undefined;
  
  useEffect(() => {
    if (!project || !financials) {
      console.error("Project or financial data not found");
      // Navigate back to projects after a short delay
      const timer = setTimeout(() => {
        navigate('/projects');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [project, financials, navigate]);
  
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
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4"
          onClick={() => navigate('/projects')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
        
        <ProjectDetail 
          project={project} 
          transactions={transactions} 
          financials={financials} 
        />
      </main>
    </div>
  );
};

export default ProjectView;
