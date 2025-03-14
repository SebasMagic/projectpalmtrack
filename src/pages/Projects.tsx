
import { MOCK_PROJECTS } from '@/lib/mockData';
import ProjectTable from '@/components/ProjectTable';
import Navbar from '@/components/Navbar';

const Projects = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <ProjectTable projects={MOCK_PROJECTS} />
      </main>
    </div>
  );
};

export default Projects;
