
import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, Check, Clock, AlertCircle, Calendar as CalendarIcon, 
  CalendarClock, CalendarDays, FileText, Tag, Users, MessageSquare,
  Link2, Paperclip, Flag, ListChecks, BarChart4, Construction, 
  HardHat, Hourglass, ExternalLink, ChevronDown, Edit, Trash2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { fetchProjectTasks, addProjectTask, updateTaskStatus } from "@/lib/supabaseUtils";
import { format, parseISO, isAfter, isBefore, differenceInDays, addDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Task } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Mock data for team members
const TEAM_MEMBERS = [
  { id: "1", name: "John Doe", initials: "JD", role: "Project Manager" },
  { id: "2", name: "Jane Smith", initials: "JS", role: "Engineer" },
  { id: "3", name: "Bob Johnson", initials: "BJ", role: "Foreman" },
  { id: "4", name: "Sarah Wilson", initials: "SW", role: "Architect" },
  { id: "5", name: "Mike Brown", initials: "MB", role: "Inspector" },
];

// Construction-specific task categories
const TASK_CATEGORIES = [
  "Site Preparation",
  "Foundation",
  "Framing",
  "Roofing",
  "Electrical",
  "Plumbing",
  "HVAC",
  "Insulation",
  "Drywall",
  "Flooring",
  "Painting",
  "Landscaping",
  "Inspection",
  "Documentation",
  "Permits",
  "Procurement",
  "Safety",
  "Quality Control",
  "Other"
];

const taskFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().optional(),
  status: z.enum(["todo", "in-progress", "completed", "blocked", "review"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  category: z.string().optional(),
  startDate: z.date().optional().nullable(),
  dueDate: z.date().optional().nullable(),
  estimatedHours: z.number().min(0).optional().nullable(),
  assignedTo: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

const defaultTask: Partial<Task> = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  dueDate: null,
  category: null,
  tags: [],
  dependencies: [],
  attachments: [],
  comments: [],
  assignedTo: null,
  estimatedHours: null,
  actualHours: 0,
};

interface TaskManagerProps {
  projectId: string;
}

const TaskManager: React.FC<TaskManagerProps> = ({ projectId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'table' | 'board' | 'gantt' | 'calendar'>('board');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompletedTasks, setShowCompletedTasks] = useState(true);
  
  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      startDate: null,
      dueDate: null,
      estimatedHours: null,
      assignedTo: null,
      category: undefined,
      tags: [],
    },
  });
  
  const loadTasks = async () => {
    setLoading(true);
    try {
      const projectTasks = await fetchProjectTasks(projectId);
      setTasks(projectTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  const handleAddTask = async (values: z.infer<typeof taskFormSchema>) => {
    try {
      // Convert form values to task data format
      const taskData = {
        projectId,
        title: values.title,
        description: values.description || "",
        status: values.status,
        priority: values.priority,
        dueDate: values.dueDate ? format(values.dueDate, 'yyyy-MM-dd') : null,
        category: values.category,
        assignedTo: values.assignedTo,
        estimatedHours: values.estimatedHours,
      };
      
      await addProjectTask(taskData);
      
      form.reset();
      setIsAddingTask(false);
      toast.success('Task added successfully');
      loadTasks();
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    }
  };

  const handleTaskStatusChange = async (taskId: string, completed: boolean) => {
    try {
      const newStatus = completed ? 'completed' : 'todo';
      await updateTaskStatus(taskId, newStatus);
      
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      
      toast.success('Task status updated');
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'blocked':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'review':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'todo':
      default:
        return <ListChecks className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">In Progress</Badge>;
      case 'blocked':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Blocked</Badge>;
      case 'review':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Under Review</Badge>;
      case 'todo':
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">To Do</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-red-100 text-red-800">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">Medium</Badge>;
      case 'low':
      default:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Low</Badge>;
    }
  };

  const getDueDateStatus = (dueDate: string | null) => {
    if (!dueDate) return null;
    
    const today = new Date();
    const due = parseISO(dueDate);
    
    if (isAfter(today, due)) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (differenceInDays(due, today) <= 3) {
      return <Badge variant="outline" className="bg-red-100 text-red-800">Due Soon</Badge>;
    } else if (differenceInDays(due, today) <= 7) {
      return <Badge variant="outline" className="bg-amber-100 text-amber-800">Due This Week</Badge>;
    }
    return null;
  };

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return 'No due date';
    return format(parseISO(dueDate), 'MMM d, yyyy');
  };

  const getAssigneeBadge = (assigneeId: string | null) => {
    if (!assigneeId) return <Badge variant="outline">Unassigned</Badge>;
    
    const assignee = TEAM_MEMBERS.find(m => m.id === assigneeId);
    if (!assignee) return <Badge variant="outline">Unknown</Badge>;
    
    return (
      <div className="flex items-center gap-1">
        <Avatar className="h-6 w-6">
          <AvatarFallback className="text-xs">{assignee.initials}</AvatarFallback>
        </Avatar>
        <span className="text-sm">{assignee.name}</span>
      </div>
    );
  };

  // Filter tasks based on filters
  const filteredTasks = tasks.filter(task => {
    // Filter by completion status
    if (!showCompletedTasks && task.status === 'completed') return false;
    
    // Filter by category
    if (selectedCategory && task.category !== selectedCategory) return false;
    
    // Filter by assignee
    if (selectedAssignee && task.assignedTo !== selectedAssignee) return false;
    
    // Filter by search query
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  });
  
  // Group tasks by status for board view
  const tasksByStatus = {
    todo: filteredTasks.filter(task => task.status === 'todo'),
    'in-progress': filteredTasks.filter(task => task.status === 'in-progress'),
    review: filteredTasks.filter(task => task.status === 'review'),
    blocked: filteredTasks.filter(task => task.status === 'blocked'),
    completed: filteredTasks.filter(task => task.status === 'completed'),
  };

  // Get overall progress for the project based on task completion
  const getProjectProgress = () => {
    if (tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  // Counts for task statuses
  const taskCounts = {
    total: tasks.length,
    completed: tasks.filter(task => task.status === 'completed').length,
    inProgress: tasks.filter(task => task.status === 'in-progress').length,
    todo: tasks.filter(task => task.status === 'todo').length,
    blocked: tasks.filter(task => task.status === 'blocked').length,
    review: tasks.filter(task => task.status === 'review').length,
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5 text-muted-foreground" />
            Project Tasks & Activities
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
            <CalendarClock className="h-4 w-4" />
            Today: {format(new Date(), 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs
            value={viewMode}
            onValueChange={(value) => setViewMode(value as 'list' | 'table' | 'board' | 'gantt' | 'calendar')}
            className="mr-2"
          >
            <TabsList className="grid grid-cols-5 w-[400px]">
              <TabsTrigger value="board" className="text-xs flex items-center gap-1">
                <ListChecks className="h-3.5 w-3.5" />
                Board
              </TabsTrigger>
              <TabsTrigger value="list" className="text-xs flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                List
              </TabsTrigger>
              <TabsTrigger value="table" className="text-xs flex items-center gap-1">
                <BarChart4 className="h-3.5 w-3.5" />
                Table
              </TabsTrigger>
              <TabsTrigger value="gantt" className="text-xs flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="calendar" className="text-xs flex items-center gap-1">
                <CalendarIcon className="h-3.5 w-3.5" />
                Calendar
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button 
            variant="default"
            size="sm"
            onClick={() => setIsAddingTask(!isAddingTask)}
          >
            <PlusCircle className="mr-1.5 h-4 w-4" />
            New Task
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Project Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="col-span-1 md:col-span-2">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-2">
                <HardHat className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-sm font-medium">Project Progress</h3>
              </div>
              <div className="bg-white p-3 rounded-md border flex-1 flex flex-col justify-center">
                <div className="flex justify-between text-sm mb-1">
                  <span>{getProjectProgress()}% Complete</span>
                  <span>{taskCounts.completed}/{taskCounts.total} Tasks</span>
                </div>
                <Progress value={getProjectProgress()} className="h-3 mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center text-xs">
                  <div className="border rounded-md p-2 bg-gray-50">
                    <div className="font-semibold">{taskCounts.total}</div>
                    <div className="text-muted-foreground">Total</div>
                  </div>
                  <div className="border rounded-md p-2 bg-gray-50">
                    <div className="font-semibold text-gray-600">{taskCounts.todo}</div>
                    <div className="text-muted-foreground">To Do</div>
                  </div>
                  <div className="border rounded-md p-2 bg-amber-50">
                    <div className="font-semibold text-amber-600">{taskCounts.inProgress}</div>
                    <div className="text-muted-foreground">In Progress</div>
                  </div>
                  <div className="border rounded-md p-2 bg-red-50">
                    <div className="font-semibold text-red-600">{taskCounts.blocked}</div>
                    <div className="text-muted-foreground">Blocked</div>
                  </div>
                  <div className="border rounded-md p-2 bg-green-50">
                    <div className="font-semibold text-green-600">{taskCounts.completed}</div>
                    <div className="text-muted-foreground">Done</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-3">
            <div className="mb-2 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-sm font-medium">Team & Filters</h3>
              </div>
            </div>
            <div className="bg-white p-3 rounded-md border">
              <div className="flex flex-wrap gap-3 mb-3">
                {TEAM_MEMBERS.map((member) => (
                  <div 
                    key={member.id}
                    className={`
                      flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer text-xs
                      ${selectedAssignee === member.id ? 'bg-primary/10 border-primary/30 border' : 'bg-gray-100 border'}
                    `}
                    onClick={() => setSelectedAssignee(
                      selectedAssignee === member.id ? null : member.id
                    )}
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[10px]">{member.initials}</AvatarFallback>
                    </Avatar>
                    <span>{member.name}</span>
                    {selectedAssignee === member.id && <Check className="h-3 w-3 text-primary" />}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="col-span-1 relative">
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 text-sm"
                  />
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                <div className="col-span-1">
                  <Select 
                    value={selectedCategory || ""} 
                    onValueChange={(value) => setSelectedCategory(value || null)}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {TASK_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-1 flex items-center justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedAssignee(null);
                      setSearchQuery("");
                    }}
                    className="text-xs"
                  >
                    Clear Filters
                  </Button>
                  <div className="flex items-center space-x-1.5">
                    <Checkbox 
                      id="showCompleted" 
                      checked={showCompletedTasks}
                      onCheckedChange={(checked) => setShowCompletedTasks(!!checked)}
                    />
                    <label 
                      htmlFor="showCompleted"
                      className="text-sm cursor-pointer"
                    >
                      Show Completed
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* New Task Form */}
        {isAddingTask && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddTask)} className="mb-6 space-y-4 p-4 border rounded-md bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter task title..." {...field} className="w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="review">Review</SelectItem>
                            <SelectItem value="blocked">Blocked</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TASK_CATEGORIES.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned To</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Assign to..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Unassigned</SelectItem>
                          {TEAM_MEMBERS.map(member => (
                            <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="estimatedHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Hours</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Hours to complete" 
                          {...field}
                          value={field.value || ""}
                          onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Due Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter task details..." 
                          className="resize-none" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddingTask(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Task</Button>
              </div>
            </form>
          </Form>
        )}
        
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            <Hourglass className="h-10 w-10 mx-auto mb-4 text-muted-foreground/50 animate-pulse" />
            <p>Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground border-2 border-dashed rounded-md">
            <Construction className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-1">No tasks found</h3>
            <p className="max-w-md mx-auto mb-4">
              {searchQuery || selectedCategory || selectedAssignee 
                ? "Try adjusting your filters to see more tasks."
                : "Get started by creating your first task for this project."}
            </p>
            <Button 
              onClick={() => setIsAddingTask(true)}
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              Create First Task
            </Button>
          </div>
        ) : (
          <Tabs value={viewMode} className="mt-2">
            <TabsContent value="board" className="space-y-0 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* To Do Column */}
                <div className="border rounded-md bg-gray-50">
                  <div className="p-3 border-b bg-gray-100 rounded-t-md flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ListChecks className="h-4 w-4 text-gray-500" />
                      <h3 className="font-medium text-sm">To Do</h3>
                    </div>
                    <Badge variant="outline" className="bg-white">{tasksByStatus.todo.length}</Badge>
                  </div>
                  <div className="p-2 max-h-[500px] overflow-y-auto">
                    {tasksByStatus.todo.map((task) => (
                      <div key={task.id} className="p-2 mb-2 border rounded bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-start gap-2">
                            <Checkbox 
                              checked={task.status === 'completed'}
                              onCheckedChange={(checked) => 
                                handleTaskStatusChange(task.id, !!checked)
                              }
                              className="mt-1"
                            />
                            <div>
                              <h4 className="font-medium text-sm">{task.title}</h4>
                              {task.category && (
                                <Badge variant="outline" className="mt-1 text-xs">{task.category}</Badge>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                            <CalendarIcon className="h-3 w-3" />
                            <span>{formatDueDate(task.dueDate)}</span>
                            {getDueDateStatus(task.dueDate)}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          {getPriorityBadge(task.priority || 'low')}
                          {task.assignedTo && getAssigneeBadge(task.assignedTo)}
                        </div>
                      </div>
                    ))}
                    {tasksByStatus.todo.length === 0 && (
                      <div className="text-center py-4 text-xs text-muted-foreground">
                        No tasks to do
                      </div>
                    )}
                  </div>
                </div>
                
                {/* In Progress Column */}
                <div className="border rounded-md bg-amber-50/50">
                  <div className="p-3 border-b bg-amber-100/50 rounded-t-md flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <h3 className="font-medium text-sm">In Progress</h3>
                    </div>
                    <Badge variant="outline" className="bg-white">{tasksByStatus['in-progress'].length}</Badge>
                  </div>
                  <div className="p-2 max-h-[500px] overflow-y-auto">
                    {tasksByStatus['in-progress'].map((task) => (
                      <div key={task.id} className="p-2 mb-2 border rounded bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-start gap-2">
                            <Checkbox 
                              checked={task.status === 'completed'}
                              onCheckedChange={(checked) => 
                                handleTaskStatusChange(task.id, !!checked)
                              }
                              className="mt-1"
                            />
                            <div>
                              <h4 className="font-medium text-sm">{task.title}</h4>
                              {task.category && (
                                <Badge variant="outline" className="mt-1 text-xs">{task.category}</Badge>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                            <CalendarIcon className="h-3 w-3" />
                            <span>{formatDueDate(task.dueDate)}</span>
                            {getDueDateStatus(task.dueDate)}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          {getPriorityBadge(task.priority || 'low')}
                          {task.assignedTo && getAssigneeBadge(task.assignedTo)}
                        </div>
                      </div>
                    ))}
                    {tasksByStatus['in-progress'].length === 0 && (
                      <div className="text-center py-4 text-xs text-muted-foreground">
                        No tasks in progress
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Review Column */}
                <div className="border rounded-md bg-blue-50/50">
                  <div className="p-3 border-b bg-blue-100/50 rounded-t-md flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <h3 className="font-medium text-sm">Review</h3>
                    </div>
                    <Badge variant="outline" className="bg-white">{tasksByStatus.review.length}</Badge>
                  </div>
                  <div className="p-2 max-h-[500px] overflow-y-auto">
                    {tasksByStatus.review.map((task) => (
                      <div key={task.id} className="p-2 mb-2 border rounded bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-start gap-2">
                            <Checkbox 
                              checked={task.status === 'completed'}
                              onCheckedChange={(checked) => 
                                handleTaskStatusChange(task.id, !!checked)
                              }
                              className="mt-1"
                            />
                            <div>
                              <h4 className="font-medium text-sm">{task.title}</h4>
                              {task.category && (
                                <Badge variant="outline" className="mt-1 text-xs">{task.category}</Badge>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                            <CalendarIcon className="h-3 w-3" />
                            <span>{formatDueDate(task.dueDate)}</span>
                            {getDueDateStatus(task.dueDate)}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          {getPriorityBadge(task.priority || 'low')}
                          {task.assignedTo && getAssigneeBadge(task.assignedTo)}
                        </div>
                      </div>
                    ))}
                    {tasksByStatus.review.length === 0 && (
                      <div className="text-center py-4 text-xs text-muted-foreground">
                        No tasks under review
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Blocked Column */}
                <div className="border rounded-md bg-red-50/50">
                  <div className="p-3 border-b bg-red-100/50 rounded-t-md flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <h3 className="font-medium text-sm">Blocked</h3>
                    </div>
                    <Badge variant="outline" className="bg-white">{tasksByStatus.blocked.length}</Badge>
                  </div>
                  <div className="p-2 max-h-[500px] overflow-y-auto">
                    {tasksByStatus.blocked.map((task) => (
                      <div key={task.id} className="p-2 mb-2 border rounded bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-start gap-2">
                            <Checkbox 
                              checked={task.status === 'completed'}
                              onCheckedChange={(checked) => 
                                handleTaskStatusChange(task.id, !!checked)
                              }
                              className="mt-1"
                            />
                            <div>
                              <h4 className="font-medium text-sm">{task.title}</h4>
                              {task.category && (
                                <Badge variant="outline" className="mt-1 text-xs">{task.category}</Badge>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                            <CalendarIcon className="h-3 w-3" />
                            <span>{formatDueDate(task.dueDate)}</span>
                            {getDueDateStatus(task.dueDate)}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          {getPriorityBadge(task.priority || 'low')}
                          {task.assignedTo && getAssigneeBadge(task.assignedTo)}
                        </div>
                      </div>
                    ))}
                    {tasksByStatus.blocked.length === 0 && (
                      <div className="text-center py-4 text-xs text-muted-foreground">
                        No blocked tasks
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Completed Column */}
                <div className="border rounded-md bg-green-50/50">
                  <div className="p-3 border-b bg-green-100/50 rounded-t-md flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <h3 className="font-medium text-sm">Completed</h3>
                    </div>
                    <Badge variant="outline" className="bg-white">{tasksByStatus.completed.length}</Badge>
                  </div>
                  <div className="p-2 max-h-[500px] overflow-y-auto">
                    {tasksByStatus.completed.map((task) => (
                      <div key={task.id} className="p-2 mb-2 border rounded bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-start gap-2">
                            <Checkbox 
                              checked={task.status === 'completed'}
                              onCheckedChange={(checked) => 
                                handleTaskStatusChange(task.id, !!checked)
                              }
                              className="mt-1"
                            />
                            <div>
                              <h4 className="font-medium text-sm line-through text-muted-foreground">{task.title}</h4>
                              {task.category && (
                                <Badge variant="outline" className="mt-1 text-xs bg-gray-100">{task.category}</Badge>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                            <CalendarIcon className="h-3 w-3" />
                            <span>{formatDueDate(task.dueDate)}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          {getPriorityBadge(task.priority || 'low')}
                          {task.assignedTo && getAssigneeBadge(task.assignedTo)}
                        </div>
                      </div>
                    ))}
                    {tasksByStatus.completed.length === 0 && (
                      <div className="text-center py-4 text-xs text-muted-foreground">
                        No completed tasks
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="list" className="mt-2">
              <div className="space-y-2">
                {filteredTasks.map((task) => (
                  <Collapsible key={task.id} className="border rounded-md p-2 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          checked={task.status === 'completed'}
                          onCheckedChange={(checked) => 
                            handleTaskStatusChange(task.id, checked as boolean)
                          }
                        />
                        <span className={task.status === 'completed' ? 'line-through text-muted-foreground' : 'font-medium'}>
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(task.status)}
                        {getPriorityBadge(task.priority || 'low')}
                        {task.dueDate && getDueDateStatus(task.dueDate)}
                        <CollapsibleTrigger className="hover:bg-gray-100 p-1 rounded">
                          <ChevronDown className="h-4 w-4" />
                        </CollapsibleTrigger>
                      </div>
                    </div>
                    <CollapsibleContent className="pt-2 pl-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          {task.description ? (
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">No description provided</p>
                          )}
                          
                          {task.category && (
                            <div className="flex items-center mt-2 gap-1.5">
                              <Tag className="h-4 w-4 text-muted-foreground" />
                              <p className="text-xs">
                                Category: {task.category}
                              </p>
                            </div>
                          )}
                          
                          {task.assignedTo && (
                            <div className="flex items-center mt-2 gap-1.5">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <p className="text-xs">
                                Assigned to: {TEAM_MEMBERS.find(m => m.id === task.assignedTo)?.name || 'Unknown'}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          {task.dueDate && (
                            <div className="flex items-center mt-0 gap-1.5">
                              <CalendarDays className="h-4 w-4 text-muted-foreground" />
                              <p className="text-xs">
                                Due: {formatDueDate(task.dueDate)}
                              </p>
                            </div>
                          )}
                          
                          {task.estimatedHours && (
                            <div className="flex items-center mt-2 gap-1.5">
                              <Hourglass className="h-4 w-4 text-muted-foreground" />
                              <p className="text-xs">
                                Estimated: {task.estimatedHours} hours
                              </p>
                            </div>
                          )}
                          
                          <div className="flex justify-end mt-4">
                            <Button variant="outline" size="sm" className="text-xs">
                              <Edit className="mr-1 h-3 w-3" />
                              Edit Task
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="table" className="mt-2">
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Assignee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task) => (
                      <TableRow key={task.id} className={task.status === 'completed' ? 'bg-muted/50' : ''}>
                        <TableCell>
                          <Checkbox 
                            checked={task.status === 'completed'}
                            onCheckedChange={(checked) => 
                              handleTaskStatusChange(task.id, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell className={task.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                          {task.title}
                          {task.estimatedHours && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Est: {task.estimatedHours}h
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{task.category || '-'}</TableCell>
                        <TableCell>
                          {task.assignedTo 
                            ? getAssigneeBadge(task.assignedTo)
                            : <span className="text-muted-foreground text-sm">Unassigned</span>
                          }
                        </TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                        <TableCell>
                          {task.dueDate ? (
                            <div className="flex flex-col">
                              <span>{formatDueDate(task.dueDate)}</span>
                              {getDueDateStatus(task.dueDate)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Not set</span>
                          )}
                        </TableCell>
                        <TableCell>{getPriorityBadge(task.priority || 'low')}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="gantt" className="mt-2">
              <div className="border rounded-md p-4 bg-white">
                <div className="flex justify-center items-center h-[300px]">
                  <div className="text-center text-muted-foreground">
                    <CalendarClock className="h-12 w-12 mx-auto mb-2" />
                    <h3 className="text-lg mb-2">Timeline View Coming Soon</h3>
                    <p className="max-w-md">
                      The Gantt chart view is under development. This will allow you to see task dependencies and timeline visualizations.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="calendar" className="mt-2">
              <div className="border rounded-md p-4 bg-white">
                <div className="flex justify-center items-center h-[300px]">
                  <div className="text-center text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-2" />
                    <h3 className="text-lg mb-2">Calendar View Coming Soon</h3>
                    <p className="max-w-md">
                      The Calendar view is under development. This will allow you to see tasks organized by date.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {filteredTasks.length} tasks • Last updated: {format(new Date(), 'MMM d, yyyy')}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="text-xs">Export</span>
          </Button>
          <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
            <HardHat className="h-3.5 w-3.5" />
            <span className="text-xs">Safety Check</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TaskManager;
