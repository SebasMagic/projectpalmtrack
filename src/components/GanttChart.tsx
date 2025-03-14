
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Project } from '@/lib/types';
import { format, parseISO, differenceInDays, addDays, isBefore, isAfter } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarCheck, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface GanttChartProps {
  projects: Project[];
}

const GanttChart: React.FC<GanttChartProps> = ({ projects }) => {
  const today = new Date();
  
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

  const isOverdue = (project: Project) => {
    if (project.status === 'completed' || !project.dueDate) return false;
    return isBefore(new Date(project.dueDate), today) && project.completion < 100;
  };

  const isDueSoon = (project: Project) => {
    if (project.status === 'completed' || !project.dueDate) return false;
    const dueDate = parseISO(project.dueDate);
    return differenceInDays(dueDate, today) <= 7 && differenceInDays(dueDate, today) >= 0;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return format(parseISO(dateString), 'MMM d, yyyy');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Project Timeline</span>
          <div className="flex items-center gap-4 text-sm font-normal">
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
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Month headers */}
            <div className="flex border-b h-8">
              <div className="w-1/4 shrink-0 pr-4 font-medium">Project</div>
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
            
            {/* Project rows */}
            <div className="relative">
              {sortedProjects.map((project, index) => {
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
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GanttChart;
