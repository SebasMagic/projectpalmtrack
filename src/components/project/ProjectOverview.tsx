
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PlusCircle, Coins, BarChart3, Percent, CheckCircle } from "lucide-react";
import { Project, Transaction, ProjectFinancials } from '@/lib/types';
import TransactionTable from '@/components/TransactionTable';
import StatCard from './StatCard';
import PLTracker from '@/components/PLTracker';

interface ProjectOverviewProps {
  project: Project;
  transactions: Transaction[];
  financials: ProjectFinancials;
  onAddTransactionClick: () => void;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  project,
  transactions,
  financials,
  onAddTransactionClick
}) => {
  console.log("ProjectOverview received transactions:", transactions?.length || 0); // Debug logging
  
  return <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Budget" value={formatCurrency(financials.totalBudget)} icon={<Coins className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Current P&L" value={formatCurrency(financials.currentProfit)} valueColor={financials.currentProfit >= 0 ? 'text-green-600' : 'text-red-600'} icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Profit Margin" value={`${financials.profitMargin.toFixed(1)}%`} valueColor={financials.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'} icon={<Percent className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Completion" value={`${project.completion}%`} icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />} progress={project.completion} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
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
        
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <PLTracker transactions={transactions} financials={financials} />
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Transactions</CardTitle>
          <Button variant="outline" size="sm" onClick={onAddTransactionClick}>
            <PlusCircle className="mr-1 h-4 w-4" />
            Add Transaction
          </Button>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <TransactionTable transactions={transactions} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found. Click 'Add Transaction' to create one.
            </div>
          )}
        </CardContent>
      </Card>
    </div>;
};

export default ProjectOverview;
