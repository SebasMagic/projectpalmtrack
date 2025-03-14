
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Project, Transaction, ProjectFinancials } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PerformanceTracker from "@/components/PerformanceTracker";
import ProjectHeader from './project/ProjectHeader';
import ProjectOverview from './project/ProjectOverview';
import ProjectTasksView from './project/ProjectTasksView';
import TransactionForm from './TransactionForm';

interface ProjectDetailProps {
  project: Project;
  transactions: Transaction[];
  financials: ProjectFinancials;
  onTransactionAdded?: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, transactions, financials, onTransactionAdded }) => {
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);

  const handleAddTransactionClick = () => {
    setIsAddTransactionOpen(true);
  };

  const handleTransactionSuccess = () => {
    setIsAddTransactionOpen(false);
    onTransactionAdded?.();
  };

  const handleTransactionCancel = () => {
    setIsAddTransactionOpen(false);
  };

  console.log("Rendering ProjectDetail with project ID:", project.id);
  console.log("Transactions data:", transactions); // Add logging to check transactions data

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
            transactions={transactions} 
            financials={financials} 
            onAddTransactionClick={handleAddTransactionClick}
          />
        </TabsContent>
        
        <TabsContent value="tasks">
          <ProjectTasksView projectId={project.id} />
        </TabsContent>
        
        <TabsContent value="performance">
          <PerformanceTracker project={project} transactions={transactions} financials={financials} />
        </TabsContent>
      </Tabs>
      
      <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <TransactionForm 
            projectId={project.id} 
            onSuccess={handleTransactionSuccess} 
            onCancel={handleTransactionCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectDetail;
