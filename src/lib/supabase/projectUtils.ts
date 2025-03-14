
import { supabase } from "@/integrations/supabase/client";
import { Project } from "../types";
import { toast } from "sonner";

/**
 * Fetches all projects from Supabase
 */
export const fetchProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*');
  
  if (error) {
    console.error('Error fetching projects:', error);
    toast.error('Failed to load projects');
    return [];
  }
  
  // Transform the data to match our frontend model
  return data.map(project => ({
    id: project.id,
    name: project.name,
    client: project.client,
    location: project.location,
    startDate: project.start_date,
    endDate: project.end_date,
    dueDate: project.due_date,
    budget: project.budget,
    status: project.status as 'planning' | 'active' | 'completed' | 'on-hold',
    completion: project.completion,
    description: project.description
  }));
};
