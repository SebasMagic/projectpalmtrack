
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { MOCK_PROJECTS } from '@/lib/mockData';
import ProjectTable from '@/components/ProjectTable';
import Navbar from '@/components/Navbar';
import { Project } from '@/lib/types';
import { fetchProjects, migrateDataToSupabase } from '@/lib/supabaseUtils';
import { toast } from 'sonner';

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await fetchProjects();
      setProjects(data.length > 0 ? data : MOCK_PROJECTS);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects(MOCK_PROJECTS);
      toast.error('Failed to load projects. Using mock data instead.');
    } finally {
      setLoading(false);
    }
  };

  const handleMigrateData = async () => {
    setMigrating(true);
    try {
      const result = await migrateDataToSupabase();
      if (result.success) {
        toast.success(result.message);
        // Reload projects after migration
        await loadProjects();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error during migration:', error);
      toast.error('An unexpected error occurred during data migration');
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Projects</h1>
          <Button 
            onClick={handleMigrateData} 
            disabled={migrating}
            className="ml-auto"
          >
            {migrating ? 'Migrating...' : 'Migrate Data to Supabase'}
          </Button>
        </div>
        <ProjectTable projects={projects} />
      </main>
    </div>
  );
};

export default Projects;
