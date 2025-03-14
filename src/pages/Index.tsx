
import { useState, useEffect } from 'react';
import { MOCK_DASHBOARD_STATS, MOCK_PROJECTS } from '@/lib/mockData';
import Dashboard from '@/components/Dashboard';
import Navbar from '@/components/Navbar';
import { DashboardStats, Project } from '@/lib/types';
import { fetchDashboardStats, fetchProjects } from '@/lib/supabase';
import { toast } from 'sonner';

const Index = () => {
  const [stats, setStats] = useState<DashboardStats>({
    ...MOCK_DASHBOARD_STATS,
    upcomingDeadlines: [] // Ensure we have a default empty array
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load projects
        const projectsData = await fetchProjects();
        if (projectsData.length > 0) {
          setRecentProjects(projectsData);
          
          // Load dashboard stats
          const statsData = await fetchDashboardStats();
          setStats({
            ...statsData,
            upcomingDeadlines: statsData.upcomingDeadlines || [] // Ensure we always have an array
          });
        } else {
          // Fall back to mock data if no projects are found
          setRecentProjects(MOCK_PROJECTS);
          setStats({
            ...MOCK_DASHBOARD_STATS,
            upcomingDeadlines: MOCK_DASHBOARD_STATS.upcomingDeadlines || []
          });
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data. Using mock data instead.');
        setRecentProjects(MOCK_PROJECTS);
        setStats({
          ...MOCK_DASHBOARD_STATS,
          upcomingDeadlines: MOCK_DASHBOARD_STATS.upcomingDeadlines || []
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <Dashboard 
          stats={stats} 
          recentProjects={recentProjects} 
        />
      </main>
    </div>
  );
};

export default Index;
