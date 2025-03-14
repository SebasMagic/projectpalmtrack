
import React, { useState, useEffect } from 'react';
import { PlusCircle, Check, Clock, AlertCircle, Calendar, CalendarClock, CalendarDays } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { fetchProjectTasks, addProjectTask, updateTaskStatus } from "@/lib/supabaseUtils";
import { format, parseISO, isAfter, isBefore, differenceInDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in-progress' | 'completed';
  dueDate: string | null;
  createdAt: string;
}

interface TaskManagerProps {
  projectId: string;
}

const TaskManager: React.FC<TaskManagerProps> = ({ projectId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>(undefined);
  const [newTaskStatus, setNewTaskStatus] = useState<'todo' | 'in-progress' | 'completed'>('todo');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
  
  // Load tasks for this project
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

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
      toast.error('Task title cannot be empty');
      return;
    }

    try {
      await addProjectTask({
        projectId,
        title: newTaskTitle.trim(),
        status: newTaskStatus,
        dueDate: newTaskDueDate ? format(newTaskDueDate, 'yyyy-MM-dd') : undefined
      });
      
      setNewTaskTitle('');
      setNewTaskDueDate(undefined);
      setNewTaskStatus('todo');
      setIsAddingTask(false);
      toast.success('Task added successfully');
      loadTasks(); // Refresh tasks list
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    }
  };

  const handleTaskStatusChange = async (taskId: string, completed: boolean) => {
    try {
      const newStatus = completed ? 'completed' : 'todo';
      await updateTaskStatus(taskId, newStatus);
      
      // Update local state
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
      case 'todo':
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">In Progress</Badge>;
      case 'todo':
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">To Do</Badge>;
    }
  };

  const getDueDateStatus = (dueDate: string | null) => {
    if (!dueDate) return null;
    
    const today = new Date();
    const due = parseISO(dueDate);
    
    if (isAfter(today, due)) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (differenceInDays(due, today) <= 7) {
      return <Badge variant="outline" className="bg-amber-100 text-amber-800">Due Soon</Badge>;
    }
    return null;
  };

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return 'No due date';
    return format(parseISO(dueDate), 'MMM d, yyyy');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Project Tasks</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Today: {format(new Date(), 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={viewMode}
            onValueChange={(value) => setViewMode(value as 'list' | 'table')}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="list">List View</SelectItem>
              <SelectItem value="table">Table View</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setIsAddingTask(!isAddingTask)}
          >
            <PlusCircle className="mr-1.5 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isAddingTask && (
          <div className="mb-6 space-y-3 p-3 border rounded-md bg-gray-50">
            <div className="flex space-x-2">
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title..."
                className="flex-1"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="w-10">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={newTaskDueDate}
                    onSelect={setNewTaskDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Select
                  value={newTaskStatus}
                  onValueChange={(value) => setNewTaskStatus(value as 'todo' | 'in-progress' | 'completed')}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">
                  {newTaskDueDate ? `Due: ${format(newTaskDueDate, 'MMM d, yyyy')}` : 'No due date set'}
                </span>
              </div>
              <Button 
                onClick={handleAddTask}
                variant="default"
                size="sm"
              >
                Add Task
              </Button>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="py-4 text-center text-muted-foreground">
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground">
            No tasks added yet. Click 'Add Task' to create your first task.
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-3">
            {tasks.map((task) => (
              <Collapsible key={task.id} className="border rounded-md p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={task.status === 'completed'}
                      onCheckedChange={(checked) => 
                        handleTaskStatusChange(task.id, checked as boolean)
                      }
                    />
                    <span className={task.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(task.status)}
                    {task.dueDate && getDueDateStatus(task.dueDate)}
                    <CollapsibleTrigger className="hover:bg-gray-100 p-1 rounded">
                      {getStatusIcon(task.status)}
                    </CollapsibleTrigger>
                  </div>
                </div>
                <CollapsibleContent className="pt-2 pl-6">
                  {task.description ? (
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No description provided</p>
                  )}
                  {task.dueDate && (
                    <div className="flex items-center mt-2 gap-1.5">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs">
                        Due: {formatDueDate(task.dueDate)}
                      </p>
                    </div>
                  )}
                  <p className="text-xs mt-1.5 text-muted-foreground">
                    Created: {format(parseISO(task.createdAt), 'MMM d, yyyy')}
                  </p>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">Status</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
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
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusBadge(task.status)}
                      </div>
                    </TableCell>
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
                    <TableCell className="text-right">
                      {task.dueDate && isBefore(parseISO(task.dueDate), new Date()) 
                        ? <Badge variant="destructive">High</Badge>
                        : task.status === 'in-progress' 
                          ? <Badge variant="outline" className="bg-amber-100 text-amber-800">Medium</Badge>
                          : <Badge variant="outline" className="bg-blue-100 text-blue-800">Normal</Badge>
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskManager;
