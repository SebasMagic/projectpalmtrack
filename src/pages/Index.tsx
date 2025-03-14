
import { MOCK_DASHBOARD_STATS, MOCK_PROJECTS } from '@/lib/mockData';
import Dashboard from '@/components/Dashboard';
import Navbar from '@/components/Navbar';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <Dashboard 
          stats={MOCK_DASHBOARD_STATS} 
          recentProjects={MOCK_PROJECTS} 
        />
      </main>
    </div>
  );
};

export default Index;
