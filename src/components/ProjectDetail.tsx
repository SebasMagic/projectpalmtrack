import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PlusCircle, Coins, BarChart3, Percent, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Project, Transaction, ProjectFinancials } from '@/lib/types';
import TransactionTable from '@/components/TransactionTable';
import AddTransactionForm from '@/components/AddTransactionForm';
import PLTracker from '@/components/PLTracker';
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PerformanceTracker from "@/components/PerformanceTracker";
import TaskManager from '@/components/TaskManager';

interface ProjectDetailProps {
  project: Project;
  transactions: Transaction[];
  financials: ProjectFinancials;
  onTransactionAdded?: () => void;
}

interface StatCardProps {
  title: string;
  value: string;
  valueColor?: string;
  icon: React.ReactNode;
  progress?: number;
}

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

const getStatusText = (status: Project['status']) => {
  switch (status) {
    case 'planning':
      return 'Planning';
    case 'active':
      return 'Active';
    case 'completed':
      return 'Completed';
    case 'on-hold':
      return 'On Hold';
    default:
      return 'Unknown';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

const StatCard: React.FC<StatCardProps> = ({ title, value, valueColor, icon, progress }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold" style={{ color: valueColor }}>{value}</div>
      {progress !== undefined && (
        <>
          <Progress value={progress} className="h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-2">{progress}%</p>
        </>
      )}
    </CardContent>
  </Card>
);

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, transactions, financials, onTransactionAdded }) => {
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);

  const onTransactionAddedHandler = () => {
    setIsAddTransactionOpen(false);
    onTransactionAdded?.();
  };

  const handleCancel = () => {
    setIsAddTransactionOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">
            {project.client} • {project.location}
          </p>
        </div>
        <Badge 
          className={`mt-2 md:mt-0 self-start md:self-auto ${getStatusColor(project.status)}`} 
          variant="outline"
        >
          {getStatusText(project.status)}
        </Badge>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Budget"
              value={formatCurrency(financials.totalBudget)}
              icon={<Coins className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
              title="Current P&L"
              value={formatCurrency(financials.currentProfit)}
              valueColor={financials.currentProfit >= 0 ? 'text-green-600' : 'text-red-600'}
              icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
              title="Profit Margin"
              value={`${financials.profitMargin.toFixed(1)}%`}
              valueColor={financials.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}
              icon={<Percent className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
              title="Completion"
              value={`${project.completion}%`}
              icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
              progress={project.completion}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Timeline</h3>
                    <p className="font-medium">
                      {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                    <p>{project.description}</p>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Progress</h3>
                    <div className="flex items-center gap-2">
                      <Progress value={project.completion} className="h-2 flex-1" />
                      <span className="text-xs font-medium">{project.completion}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Financial Summary</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setIsAddTransactionOpen(true)}>
                  <PlusCircle className="mr-1 h-4 w-4" />
                  Add Transaction
                </Button>
              </CardHeader>
              <CardContent>
                <PLTracker 
                  transactions={transactions} 
                  financials={financials}
                />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Transactions</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setIsAddTransactionOpen(true)}>
                <PlusCircle className="mr-1 h-4 w-4" />
                Add Transaction
              </Button>
            </CardHeader>
            <CardContent>
              <TransactionTable transactions={transactions} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tasks">
          <TaskManager projectId={project.id} />
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
          <AddTransactionForm 
            projectId={project.id} 
            onSuccess={onTransactionAddedHandler} 
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectDetail;
