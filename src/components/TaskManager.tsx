
import React, { useState, useEffect } from 'react';
import { PlusCircle, Check, Clock, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { fetchProjectTasks, addProjectTask, updateTaskStatus } from "@/lib/supabaseUtils";

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
  const [isAddingTask, setIsAddingTask] = useState(false);
  
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
        status: 'todo'
      });
      
      setNewTaskTitle('');
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Project Tasks</CardTitle>
        <Button 
          variant="outline"
          size="sm"
          onClick={() => setIsAddingTask(!isAddingTask)}
        >
          <PlusCircle className="mr-1 h-4 w-4" />
          Add Task
        </Button>
      </CardHeader>
      <CardContent>
        {isAddingTask && (
          <div className="mb-4 flex space-x-2">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Enter task title..."
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <Button 
              onClick={handleAddTask}
              variant="default"
              size="sm"
            >
              Add
            </Button>
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
        ) : (
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
                    <p className="text-xs mt-1">
                      Due: {new Date(task.dueDate).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </p>
                  )}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskManager;
