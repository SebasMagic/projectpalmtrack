
import { supabase } from "@/integrations/supabase/client";
import { Project } from "../types";
import { toast } from "sonner";

/**
 * Fetches all projects from Supabase
 */
export const fetchProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*, cities(id, name, state)');
  
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
    // Format location to include city name if available
    location: project.cities 
      ? `${project.cities.name}, ${project.cities.state}` 
      : (project.location || 'No location'),
    cityId: project.city_id,
    startDate: project.start_date,
    endDate: project.end_date,
    dueDate: project.due_date,
    budget: project.budget,
    status: project.status as 'planning' | 'active' | 'completed' | 'on-hold',
    completion: project.completion,
    description: project.description
  }));
};

/**
 * Fetches a single project by ID from Supabase
 */
export const fetchProjectById = async (projectId: string): Promise<Project | null> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*, cities(id, name, state)')
    .eq('id', projectId)
    .single();
  
  if (error) {
    console.error('Error fetching project:', error);
    toast.error('Failed to load project details');
    return null;
  }
  
  return {
    id: data.id,
    name: data.name,
    client: data.client,
    // Format location to include city name if available
    location: data.cities 
      ? `${data.cities.name}, ${data.cities.state}` 
      : (data.location || 'No location'),
    cityId: data.city_id,
    startDate: data.start_date,
    endDate: data.end_date,
    dueDate: data.due_date,
    budget: data.budget,
    status: data.status as 'planning' | 'active' | 'completed' | 'on-hold',
    completion: data.completion,
    description: data.description
  };
};
