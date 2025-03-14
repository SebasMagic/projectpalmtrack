
import { useState } from 'react';
import { Building2, CalendarIcon, Clock, MapPin, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Project, Transaction, ProjectFinancials } from '@/lib/types';
import { cn } from '@/lib/utils';
import PLTracker from './PLTracker';

interface ProjectDetailProps {
  project: Project;
  transactions: Transaction[];
  financials: ProjectFinancials;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Ongoing';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
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

const ProjectDetail = ({ project, transactions, financials }: ProjectDetailProps) => {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge 
              className={cn(
                "font-medium capitalize", 
                getStatusColor(project.status)
              )}
              variant="outline"
            >
              {project.status}
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          </div>
          <div className="flex items-center text-muted-foreground gap-4 mt-2">
            <div className="flex items-center gap-1 text-sm">
              <User className="h-4 w-4" />
              <span>{project.client}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <MapPin className="h-4 w-4" />
              <span>{project.location}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Card className="bg-muted">
            <CardContent className="p-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3" />
                <span>Budget</span>
              </div>
              <div className="text-lg font-semibold mt-1">
                {formatCurrency(project.budget)}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted">
            <CardContent className="p-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarIcon className="h-3 w-3" />
                <span>Timeline</span>
              </div>
              <div className="text-lg font-semibold mt-1">
                {formatDate(project.startDate).split(' ')[0]} - {project.endDate ? formatDate(project.endDate).split(' ')[0] : 'Present'}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted">
            <CardContent className="p-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Progress</span>
              </div>
              <div className="text-lg font-semibold mt-1">
                {project.completion}%
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Project Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="mt-1 text-muted-foreground">{project.description}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Timeline</h3>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Start Date</div>
                    <div className="font-medium">{formatDate(project.startDate)}</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">End Date</div>
                    <div className="font-medium">{formatDate(project.endDate)}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Progress</h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Completion</span>
                    <span className="font-medium">{project.completion}%</span>
                  </div>
                  <Progress value={project.completion} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Budget</div>
                <div className="text-xl font-bold">{formatCurrency(financials.totalBudget)}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total Income</div>
                  <div className="text-lg font-semibold text-teal-600">{formatCurrency(financials.totalIncome)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Expenses</div>
                  <div className="text-lg font-semibold text-red-500">{formatCurrency(financials.totalExpenses)}</div>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="text-sm text-muted-foreground">Current Profit</div>
                <div className="text-xl font-bold">{formatCurrency(financials.currentProfit)}</div>
                <div className="text-sm font-medium mt-1">
                  {financials.profitMargin.toFixed(1)}% profit margin
                </div>
                
                <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full",
                      financials.profitMargin > 20 ? "bg-teal-500" : financials.profitMargin > 10 ? "bg-amber-500" : "bg-red-500"
                    )}
                    style={{ width: `${Math.min(financials.profitMargin * 2, 100)}%` }} 
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="finances" className="space-y-4">
        <TabsList>
          <TabsTrigger value="finances">Finances</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="finances">
          <PLTracker transactions={transactions} financials={financials} />
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Document Management</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  Upload and manage project documents, contracts, permits, and other files.
                </p>
                <div className="mt-6">
                  <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground shadow hover:bg-primary/90">
                    Coming Soon
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notes">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Project Notes</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  Add and manage notes, meeting minutes, and other project documentation.
                </p>
                <div className="mt-6">
                  <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground shadow hover:bg-primary/90">
                    Coming Soon
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetail;
