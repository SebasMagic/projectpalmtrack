
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Fetches all cities from Supabase
 */
export const fetchCities = async () => {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error fetching cities:', error);
    toast.error('Failed to load cities');
    return [];
  }
  
  return data;
};
