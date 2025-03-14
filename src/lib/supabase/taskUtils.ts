
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskComment } from "../types";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

/**
 * Fetches tasks for a specific project
 */
export const fetchProjectTasks = async (projectId: string): Promise<Task[]> => {
  console.log('Fetching tasks for project:', projectId);
  
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('No tasks found for project:', projectId);
      return [];
    }
    
    console.log(`Found ${data.length} tasks for project ${projectId}`);
    
    return data.map(task => {
      // Ensure comments is properly parsed and has the right format
      let parsedComments: TaskComment[] = [];
      
      if (task.comments) {
        try {
          // If comments is already an array, map it to TaskComment structure
          if (Array.isArray(task.comments)) {
            parsedComments = task.comments.map((comment: any) => ({
              id: comment.id || uuidv4(),
              taskId: comment.taskId || task.id,
              content: comment.content || '',
              author: comment.author || 'Unknown',
              createdAt: comment.createdAt || new Date().toISOString()
            }));
          }
        } catch (e) {
          console.error('Error parsing task comments:', e);
        }
      }
      
      return {
        id: task.id,
        projectId: task.project_id,
        title: task.title,
        description: task.description || '',
        status: task.status as 'todo' | 'in-progress' | 'completed' | 'blocked' | 'review',
        priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
        dueDate: task.due_date,
        startDate: task.start_date || null,
        estimatedHours: task.estimated_hours || null,
        actualHours: task.actual_hours || null,
        assignedTo: task.assigned_to || null,
        category: task.category || null,
        tags: Array.isArray(task.tags) ? task.tags : [],
        dependencies: Array.isArray(task.dependencies) ? task.dependencies : [],
        attachments: Array.isArray(task.attachments) ? task.attachments : [],
        comments: parsedComments,
        createdAt: task.created_at,
        updatedAt: task.updated_at || null,
        completedAt: task.completed_at || null
      };
    });
  } catch (err) {
    console.error('Unexpected error fetching tasks:', err);
    toast.error('Error al cargar tareas');
    return [];
  }
};

/**
 * Adds a new task to a project
 */
export const addProjectTask = async (taskData: { 
  projectId: string, 
  title: string, 
  description?: string,
  status: 'todo' | 'in-progress' | 'completed' | 'blocked' | 'review',
  priority?: 'low' | 'medium' | 'high' | 'urgent',
  category?: string,
  dueDate?: string | null,
  startDate?: string | null,
  estimatedHours?: number | null,
  actualHours?: number | null,
  assignedTo?: string | null,
  tags?: string[],
  dependencies?: string[],
}): Promise<Task | null> => {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      project_id: taskData.projectId,
      title: taskData.title,
      description: taskData.description || null,
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      due_date: taskData.dueDate || null,
      start_date: taskData.startDate || null,
      estimated_hours: taskData.estimatedHours || null,
      actual_hours: taskData.actualHours || null,
      assigned_to: taskData.assignedTo || null,
      category: taskData.category || null,
      tags: taskData.tags || [],
      dependencies: taskData.dependencies || []
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding task:', error);
    throw error;
  }
  
  return data ? {
    id: data.id,
    projectId: data.project_id,
    title: data.title,
    description: data.description,
    status: data.status as 'todo' | 'in-progress' | 'completed' | 'blocked' | 'review',
    priority: data.priority as 'low' | 'medium' | 'high' | 'urgent',
    dueDate: data.due_date,
    startDate: data.start_date,
    estimatedHours: data.estimated_hours,
    actualHours: data.actual_hours,
    assignedTo: data.assigned_to,
    category: data.category,
    tags: data.tags || [],
    dependencies: data.dependencies || [],
    attachments: [],
    comments: [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    completedAt: data.completed_at
  } : null;
};

/**
 * Updates a task's status
 */
export const updateTaskStatus = async (taskId: string, status: 'todo' | 'in-progress' | 'completed' | 'blocked' | 'review'): Promise<void> => {
  const updateData: any = { status };
  
  // If marking as completed, set completed_at timestamp
  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString();
  } else {
    // If changing from completed to something else, clear the completed_at field
    updateData.completed_at = null;
  }
  
  const { error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId);
  
  if (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};
