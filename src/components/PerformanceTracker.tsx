
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Project, Transaction, ProjectFinancials } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Clock, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';

interface PerformanceTrackerProps {
  project: Project;
  transactions: Transaction[];
  financials: ProjectFinancials;
}

interface ProgressPoint {
  date: string;
  completion: number;
}

interface ExpenseBreakdown {
  name: string;
  value: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

const PerformanceTracker = ({ project, transactions, financials }: PerformanceTrackerProps) => {
  const [progressData, setProgressData] = useState<ProgressPoint[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<ExpenseBreakdown[]>([]);
  
  useEffect(() => {
    // Generate sample progress data (this would normally come from a database)
    const startDate = new Date(project.startDate);
    const today = new Date();
    const points: ProgressPoint[] = [];
    
    // Add starting point
    points.push({
      date: startDate.toISOString().split('T')[0],
      completion: 0
    });
    
    // Add current point
    points.push({
      date: today.toISOString().split('T')[0],
      completion: project.completion
    });
    
    // If we have an end date, add it
    if (project.endDate) {
      const endDate = new Date(project.endDate);
      if (endDate > today) {
        points.push({
          date: project.endDate,
          completion: 100
        });
      }
    }
    
    setProgressData(points);
    
    // Calculate expense breakdown by category
    const expensesByCategory: {[key: string]: number} = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        if (!expensesByCategory[transaction.category]) {
          expensesByCategory[transaction.category] = 0;
        }
        expensesByCategory[transaction.category] += transaction.amount;
      });
    
    const breakdownData = Object.entries(expensesByCategory).map(([name, value]) => ({
      name,
      value
    }));
    
    setExpenseBreakdown(breakdownData);
  }, [project, transactions]);
  
  // Calculate days left
  const daysLeft = project.endDate 
    ? Math.round((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;
  
  // Calculate if project is on budget
  const budgetUsedPercentage = (financials.totalExpenses / project.budget) * 100;
  const isOnBudget = budgetUsedPercentage <= project.completion + 10; // Allow 10% buffer
  
  // Calculate if project is on schedule
  const isOnSchedule = project.endDate
    ? daysLeft && daysLeft > 0 && project.completion >= 5 // At least some progress
    : project.completion > 0; // No end date but has progress
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Construction Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.completion}%</div>
            <Progress value={project.completion} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Target: 100% by {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Budget Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(financials.totalExpenses)} / {formatCurrency(project.budget)}
            </div>
            <Progress 
              value={(financials.totalExpenses / project.budget) * 100} 
              className={`h-2 mt-2 ${budgetUsedPercentage > 100 ? 'bg-red-500' : ''}`} 
            />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round(budgetUsedPercentage)}% of total budget used
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Timeline Status</CardTitle>
          </CardHeader>
          <CardContent>
            {daysLeft !== null ? (
              <>
                <div className="text-2xl font-bold flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
                  {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  End date: {new Date(project.endDate as string).toLocaleDateString()}
                </p>
              </>
            ) : (
              <div className="text-xl font-bold">No end date set</div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Construction Progress Tracking</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={progressData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Completion']} />
                <Line type="monotone" dataKey="completion" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={expenseBreakdown}
                margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70} 
                  tick={{ fontSize: 12 }} 
                />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(value as number), 'Amount']} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="budget">Budget</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Alert className={isOnBudget ? "border-green-500" : "border-red-500"}>
                    <TrendingUp className={`h-4 w-4 ${isOnBudget ? "text-green-500" : "text-red-500"}`} />
                    <AlertTitle>Budget Status</AlertTitle>
                    <AlertDescription>
                      {isOnBudget 
                        ? "Project is currently within budget parameters." 
                        : "Project is exceeding budget expectations."}
                    </AlertDescription>
                  </Alert>
                  
                  <Alert className={isOnSchedule ? "border-green-500" : "border-red-500"}>
                    <Calendar className={`h-4 w-4 ${isOnSchedule ? "text-green-500" : "text-red-500"}`} />
                    <AlertTitle>Schedule Status</AlertTitle>
                    <AlertDescription>
                      {isOnSchedule 
                        ? "Construction is progressing according to timeline." 
                        : "Project may need schedule adjustments."}
                    </AlertDescription>
                  </Alert>
                  
                  <Alert className={project.status === "on-hold" ? "border-amber-500" : "border-green-500"}>
                    <AlertTriangle className={`h-4 w-4 ${project.status === "on-hold" ? "text-amber-500" : "text-green-500"}`} />
                    <AlertTitle>Current Status</AlertTitle>
                    <AlertDescription>
                      Project is currently <span className="font-semibold capitalize">{project.status}</span>
                    </AlertDescription>
                  </Alert>
                </div>
              </TabsContent>
              
              <TabsContent value="schedule">
                <div className="space-y-4 mt-4">
                  <p className="text-muted-foreground">
                    Project began on {new Date(project.startDate).toLocaleDateString()} and 
                    {project.endDate 
                      ? ` is scheduled to complete by ${new Date(project.endDate).toLocaleDateString()}.`
                      : ' has no set completion date.'}
                  </p>
                  
                  {project.endDate && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Start date</span>
                        <span>End date</span>
                      </div>
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="absolute h-full bg-primary" 
                          style={{ 
                            width: `${Math.min(100, project.completion)}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{new Date(project.startDate).toLocaleDateString()}</span>
                        <span>Today</span>
                        <span>{new Date(project.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="budget">
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-base font-medium mb-2">Budget Summary</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Budget</span>
                          <span className="font-medium">{formatCurrency(project.budget)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Expenses</span>
                          <span className="font-medium">{formatCurrency(financials.totalExpenses)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Income</span>
                          <span className="font-medium">{formatCurrency(financials.totalIncome)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-medium">Current Profit/Loss</span>
                          <span className={`font-medium ${financials.currentProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(financials.currentProfit)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium mb-2">Profit Margin</h3>
                      <div className="text-3xl font-bold mb-2">
                        {financials.profitMargin.toFixed(1)}%
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {financials.profitMargin >= 15 
                          ? 'Healthy profit margin exceeding industry standards.' 
                          : financials.profitMargin >= 5
                            ? 'Acceptable profit margin within industry standards.'
                            : 'Below target profit margin - requires attention.'}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceTracker;
