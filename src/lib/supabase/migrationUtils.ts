
import { supabase } from "@/integrations/supabase/client";
import { MOCK_PROJECTS, MOCK_TRANSACTIONS } from "../mockData";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

/**
 * Migrates mock data to Supabase database
 */
export const migrateDataToSupabase = async () => {
  try {
    // Start by checking if we have data in the projects table
    const { data: existingProjects } = await supabase
      .from('projects')
      .select('id')
      .limit(1);
    
    // If we already have data, don't migrate
    if (existingProjects && existingProjects.length > 0) {
      console.log('Data already exists in Supabase, skipping migration');
      return { success: true, message: 'Data already exists in Supabase' };
    }

    // Create a mapping of old project IDs to new UUIDs
    const projectIdMap = new Map();
    
    // Prepare projects for insertion with proper UUIDs
    const projectsToInsert = MOCK_PROJECTS.map(project => {
      const newId = uuidv4();
      projectIdMap.set(project.id, newId);
      
      return {
        id: newId,
        name: project.name,
        client: project.client,
        location: project.location,
        start_date: project.startDate,
        end_date: project.endDate,
        due_date: project.dueDate,
        budget: project.budget,
        status: project.status,
        completion: project.completion,
        description: project.description
      };
    });

    console.log('Inserting projects:', projectsToInsert);

    // Insert projects
    const { error: projectsError } = await supabase
      .from('projects')
      .insert(projectsToInsert);

    if (projectsError) {
      console.error('Error inserting projects:', projectsError);
      return { success: false, message: `Error inserting projects: ${projectsError.message}` };
    }

    // Prepare transactions for insertion with proper UUIDs and updated project references
    const transactionsToInsert = MOCK_TRANSACTIONS.map(transaction => ({
      id: uuidv4(),
      project_id: projectIdMap.get(transaction.projectId), // Use the new UUID for the project
      date: transaction.date,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      description: transaction.description
    }));

    // Insert transactions
    const { error: transactionsError } = await supabase
      .from('transactions')
      .insert(transactionsToInsert);

    if (transactionsError) {
      console.error('Error inserting transactions:', transactionsError);
      return { success: false, message: `Error inserting transactions: ${transactionsError.message}` };
    }

    console.log('Successfully migrated data to Supabase');
    return { success: true, message: 'Successfully migrated data to Supabase' };
  } catch (error) {
    console.error('Error in data migration:', error);
    return { success: false, message: `Error in data migration: ${error}` };
  }
};
