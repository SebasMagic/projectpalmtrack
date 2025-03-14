
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Project, ProjectFinancials } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PerformanceTracker from "@/components/PerformanceTracker";
import ProjectHeader from './project/ProjectHeader';
import ProjectOverview from './project/ProjectOverview';
import ProjectTasksView from './project/ProjectTasksView';

interface ProjectDetailProps {
  project: Project;
  financials: ProjectFinancials;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, financials }) => {
  console.log("Rendering ProjectDetail with project ID:", project.id);

  return (
    <div className="space-y-6">
      <ProjectHeader project={project} />
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <ProjectOverview 
            project={project} 
            financials={financials} 
          />
        </TabsContent>
        
        <TabsContent value="tasks">
          <ProjectTasksView projectId={project.id} />
        </TabsContent>
        
        <TabsContent value="performance">
          <PerformanceTracker 
            project={project} 
            financials={financials} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetail;
