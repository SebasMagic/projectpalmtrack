
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Project, Task } from '@/lib/types';
import { format, parseISO, differenceInDays, addDays, isBefore, isAfter } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarCheck, AlertTriangle, Check, Clock, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { fetchProjectTasks } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GanttChartProps {
  projects: Project[];
}

const GanttChart: React.FC<GanttChartProps> = ({ projects }) => {
  const today = new Date();
  const [projectTasks, setProjectTasks] = useState<{[key: string]: Task[]}>({});
  const [activeTab, setActiveTab] = useState<'projects' | 'tasks'>('projects');
  const [loading, setLoading] = useState(false);
  
  // Sort projects by startDate
  const sortedProjects = [...projects].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
  
  // Find earliest start date and latest end/due date to determine chart range
  const earliestDate = sortedProjects.length > 0 
    ? new Date(Math.min(...sortedProjects.map(p => new Date(p.startDate).getTime())))
    : today;
  
  const latestDate = sortedProjects.length > 0 
    ? new Date(Math.max(...sortedProjects.map(p => {
        const endDate = p.endDate ? new Date(p.endDate) : null;
        const dueDate = p.dueDate ? new Date(p.dueDate) : null;
        const dates = [endDate, dueDate].filter(Boolean) as Date[];
        return dates.length > 0 ? Math.max(...dates.map(d => d.getTime())) : new Date(p.startDate).getTime();
      })))
    : addDays(today, 30);
  
  // Add buffer days to make the chart look better
  const chartStartDate = addDays(earliestDate, -7);
  const chartEndDate = addDays(latestDate, 7);
  
  const totalDays = differenceInDays(chartEndDate, chartStartDate);
  const chartDays = Array.from({ length: totalDays + 1 }, (_, i) => addDays(chartStartDate, i));
  
  // Load tasks for all projects
  useEffect(() => {
    const loadAllProjectTasks = async () => {
      if (activeTab === 'tasks') {
        setLoading(true);
        try {
          const tasksMap: {[key: string]: Task[]} = {};
          
          for (const project of projects) {
            const tasks = await fetchProjectTasks(project.id);
            tasksMap[project.id] = tasks;
          }
          
          setProjectTasks(tasksMap);
        } catch (error) {
          console.error('Error loading tasks for Gantt chart:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadAllProjectTasks();
  }, [projects, activeTab]);
  
  // Generate month labels for the top of the chart
  const months: { [key: string]: { start: number, width: number } } = {};
  chartDays.forEach((date, index) => {
    const monthKey = format(date, 'MMM yyyy');
    if (!months[monthKey]) {
      months[monthKey] = {
        start: index,
        width: 1
      };
    } else {
      months[monthKey].width++;
    }
  });

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'planning': return 'bg-blue-500';
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-purple-500';
      case 'on-hold': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getTaskStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-amber-500';
      case 'todo': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateBarPosition = (project: Project) => {
    const startDate = parseISO(project.startDate);
    const startPosition = differenceInDays(startDate, chartStartDate);
    const startPercent = (startPosition / totalDays) * 100;
    
    // Calculate end position
    let endDate = today;
    if (project.endDate) {
      endDate = parseISO(project.endDate);
    } else if (project.dueDate) {
      endDate = parseISO(project.dueDate);
    } else {
      // If no end or due date, make the bar a fixed width
      endDate = addDays(startDate, 14);
    }
    
    const duration = differenceInDays(endDate, startDate) || 1; // Minimum 1 day
    const widthPercent = (duration / totalDays) * 100;
    
    return {
      left: `${startPercent}%`,
      width: `${widthPercent}%`,
    };
  };
  
  const calculateTaskBarPosition = (task: Task, projectStartDate: string) => {
    // For tasks without due dates, use a fixed duration from project start
    if (!task.dueDate) {
      const startDate = parseISO(projectStartDate);
      const startPosition = differenceInDays(startDate, chartStartDate);
      const startPercent = (startPosition / totalDays) * 100;
      
      // Fixed 7-day duration for tasks without due dates
      const widthPercent = (7 / totalDays) * 100;
      
      return {
        left: `${startPercent}%`,
        width: `${widthPercent}%`,
      };
    }
    
    // For tasks with due dates, span from project start to task due date
    const startDate = parseISO(projectStartDate);
    const endDate = parseISO(task.dueDate);
    
    const startPosition = differenceInDays(startDate, chartStartDate);
    const startPercent = (startPosition / totalDays) * 100;
    
    const duration = differenceInDays(endDate, startDate) || 1; // Minimum 1 day
    const widthPercent = (duration / totalDays) * 100;
    
    return {
      left: `${startPercent}%`,
      width: `${widthPercent}%`,
    };
  };

  const isOverdue = (project: Project) => {
    if (project.status === 'completed' || !project.dueDate) return false;
    return isBefore(new Date(project.dueDate), today) && project.completion < 100;
  };

  const isDueSoon = (project: Project) => {
    if (project.status === 'completed' || !project.dueDate) return false;
    const dueDate = parseISO(project.dueDate);
    return differenceInDays(dueDate, today) <= 7 && differenceInDays(dueDate, today) >= 0;
  };
  
  const isTaskOverdue = (task: Task) => {
    if (task.status === 'completed' || !task.dueDate) return false;
    return isBefore(new Date(task.dueDate), today);
  };

  const isTaskDueSoon = (task: Task) => {
    if (task.status === 'completed' || !task.dueDate) return false;
    const dueDate = parseISO(task.dueDate);
    return differenceInDays(dueDate, today) <= 7 && differenceInDays(dueDate, today) >= 0;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return format(parseISO(dateString), 'MMM d, yyyy');
  };
  
  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-white" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-white" />;
      case 'todo':
      default:
        return <FileText className="h-4 w-4 text-white" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Project Timeline</CardTitle>
          
          <Tabs defaultValue="projects" className="w-full sm:w-auto" onValueChange={(value) => setActiveTab(value as 'projects' | 'tasks')}>
            <TabsList className="grid w-full sm:w-[300px] grid-cols-2">
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex items-center gap-4 text-sm font-normal mt-2 flex-wrap">
          {activeTab === 'projects' ? (
            <>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 bg-green-500 rounded-sm"></div>
                <span>Active</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 bg-blue-500 rounded-sm"></div>
                <span>Planning</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 bg-purple-500 rounded-sm"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 bg-amber-500 rounded-sm"></div>
                <span>On Hold</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 bg-green-500 rounded-sm"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 bg-amber-500 rounded-sm"></div>
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 bg-blue-500 rounded-sm"></div>
                <span>To Do</span>
              </div>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Month headers */}
            <div className="flex border-b h-8">
              <div className="w-1/4 shrink-0 pr-4 font-medium">{activeTab === 'projects' ? 'Project' : 'Task'}</div>
              <div className="w-3/4 relative">
                {Object.entries(months).map(([month, { start, width }]) => (
                  <div
                    key={month}
                    className="absolute top-0 text-xs font-medium px-2 flex items-center border-r h-full"
                    style={{
                      left: `${(start / totalDays) * 100}%`,
                      width: `${(width / totalDays) * 100}%`
                    }}
                  >
                    {month}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Today marker */}
            <div className="relative">
              <div
                className="absolute top-0 bottom-0 w-px bg-red-500 z-10"
                style={{
                  left: `${(differenceInDays(today, chartStartDate) / totalDays) * 100 * 0.75 + 25}%`,
                }}
              >
                <div className="absolute -top-2 -left-[9px] text-xs font-medium bg-red-500 text-white px-1 rounded">
                  Today
                </div>
              </div>
            </div>
            
            {/* Project or Task rows */}
            <div className="relative">
              {activeTab === 'projects' ? (
                // Projects View
                sortedProjects.map((project, index) => {
                  const barStyle = calculateBarPosition(project);
                  return (
                    <div key={project.id} className={cn("flex h-14 items-center", index !== sortedProjects.length - 1 && "border-b")}>
                      <div className="w-1/4 shrink-0 pr-4">
                        <div className="flex items-center">
                          <span className="font-medium truncate">{project.name}</span>
                          {isOverdue(project) && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <AlertTriangle className="h-4 w-4 ml-2 text-red-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Overdue: Due on {formatDate(project.dueDate)}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {isDueSoon(project) && !isOverdue(project) && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <CalendarCheck className="h-4 w-4 ml-2 text-amber-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Due soon: {formatDate(project.dueDate)}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {project.completion}% complete
                        </div>
                      </div>
                      <div className="w-3/4 relative h-6">
                        {/* Progress bar */}
                        <div
                          className={cn("absolute h-6 rounded-sm flex items-center justify-between px-2", getStatusColor(project.status))}
                          style={barStyle}
                        >
                          <span className="text-xs font-medium text-white truncate">
                            {format(parseISO(project.startDate), 'MMM d')}
                            {project.endDate && ` - ${format(parseISO(project.endDate), 'MMM d')}`}
                          </span>
                        </div>
                        
                        {/* Due date marker */}
                        {project.dueDate && (
                          <div
                            className="absolute h-6 w-px bg-red-600 z-20"
                            style={{
                              left: `${(differenceInDays(parseISO(project.dueDate), chartStartDate) / totalDays) * 100}%`,
                            }}
                          >
                            <Badge
                              variant="outline"
                              className={cn(
                                "absolute -top-5 -translate-x-1/2 text-xs border border-red-600 text-red-600 whitespace-nowrap",
                                isOverdue(project) && "bg-red-100"
                              )}
                            >
                              Due: {format(parseISO(project.dueDate), 'MMM d')}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : loading ? (
                // Loading state for tasks
                <div className="flex justify-center items-center h-40">
                  <p className="text-muted-foreground">Loading tasks...</p>
                </div>
              ) : (
                // Tasks View - Flatten all project tasks into a single array
                Object.entries(projectTasks).flatMap(([projectId, tasks], projectIndex) => {
                  const project = projects.find(p => p.id === projectId);
                  if (!project || !tasks.length) return [];
                  
                  return tasks.map((task, taskIndex) => {
                    const isFirstTaskInProject = taskIndex === 0;
                    const barStyle = calculateTaskBarPosition(task, project.startDate);
                    
                    return (
                      <div 
                        key={task.id} 
                        className={cn(
                          "flex h-14 items-center", 
                          !(projectIndex === Object.keys(projectTasks).length - 1 && 
                            taskIndex === projectTasks[projectId].length - 1) && "border-b"
                        )}
                      >
                        <div className="w-1/4 shrink-0 pr-4">
                          {isFirstTaskInProject && (
                            <div className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              {project.name}
                            </div>
                          )}
                          <div className="flex items-center">
                            <span className={cn("truncate", task.status === 'completed' && "line-through text-muted-foreground")}>
                              {task.title}
                            </span>
                            {isTaskOverdue(task) && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <AlertTriangle className="h-4 w-4 ml-2 text-red-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Overdue: Due on {formatDate(task.dueDate)}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {isTaskDueSoon(task) && !isTaskOverdue(task) && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <CalendarCheck className="h-4 w-4 ml-2 text-amber-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Due soon: {formatDate(task.dueDate)}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </div>
                        <div className="w-3/4 relative h-5">
                          {/* Task bar */}
                          <div
                            className={cn(
                              "absolute h-5 rounded-sm flex items-center px-2",
                              getTaskStatusColor(task.status)
                            )}
                            style={barStyle}
                          >
                            <div className="flex items-center text-xs font-medium text-white">
                              {getStatusIcon(task.status)}
                              <span className="ml-1 truncate">
                                {task.status}
                              </span>
                            </div>
                          </div>
                          
                          {/* Task due date marker */}
                          {task.dueDate && (
                            <div
                              className="absolute h-5 w-px bg-red-600 z-20"
                              style={{
                                left: `${(differenceInDays(parseISO(task.dueDate), chartStartDate) / totalDays) * 100}%`,
                              }}
                            >
                              <Badge
                                variant="outline"
                                className={cn(
                                  "absolute -top-5 -translate-x-1/2 text-xs border border-red-600 text-red-600 whitespace-nowrap",
                                  isTaskOverdue(task) && "bg-red-100"
                                )}
                              >
                                Due: {format(parseISO(task.dueDate), 'MMM d')}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GanttChart;
