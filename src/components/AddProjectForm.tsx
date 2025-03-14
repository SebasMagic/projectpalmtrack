
import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Calendar as CalendarIcon, Check, ChevronsUpDown, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import { fetchCities } from "@/lib/supabaseUtils";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const projectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  client: z.string().min(2, "Client name is required"),
  cityId: z.string().optional(),
  location: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  budget: z.coerce.number().positive("Budget must be a positive number"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  endDate: z.date().optional(),
  status: z.enum(["planning", "active", "on-hold", "completed"]),
  completion: z.coerce.number().min(0).max(100).default(0),
});

interface AddProjectFormProps {
  onSuccess: () => void;
}

interface City {
  id: string;
  name: string;
  state: string;
}

const AddProjectForm = ({ onSuccess }: AddProjectFormProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const loadCities = async () => {
      const citiesData = await fetchCities();
      setCities(citiesData);
    };
    
    loadCities();
  }, []);

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      client: "",
      location: "",
      cityId: undefined,
      description: "",
      budget: 0,
      status: "planning",
      completion: 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof projectSchema>) => {
    setSubmitting(true);
    try {
      console.log("Submitting project with values:", values);
      
      // Format dates for Supabase
      const projectData = {
        name: values.name,
        client: values.client,
        location: values.location || null,
        city_id: values.cityId || null,
        description: values.description,
        budget: values.budget,
        start_date: format(values.startDate, "yyyy-MM-dd"),
        end_date: values.endDate ? format(values.endDate, "yyyy-MM-dd") : null,
        due_date: format(values.dueDate, "yyyy-MM-dd"),
        status: values.status,
        completion: values.completion,
      };

      console.log("Formatted project data:", projectData);

      const { data, error } = await supabase
        .from("projects")
        .insert([projectData])
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      toast.success("Project created successfully!");
      onSuccess();
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter project name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="client"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <FormControl>
                  <Input placeholder="Enter client name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cityId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>City</FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? cities.find((city) => city.id === field.value)
                            ? `${cities.find((city) => city.id === field.value)?.name}, ${cities.find((city) => city.id === field.value)?.state}`
                            : "Select city"
                          : "Select city"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search city..." className="h-9" />
                      <CommandEmpty>No city found.</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          {cities.map((city) => (
                            <CommandItem
                              key={city.id}
                              value={`${city.name}, ${city.state}`}
                              onSelect={() => {
                                form.setValue("cityId", city.id);
                                setOpen(false);
                              }}
                            >
                              {`${city.name}, ${city.state}`}
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  city.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Location Details (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="E.g., Building, Floor, Suite" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget ($)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" placeholder="Enter budget amount" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
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
                <FormLabel>Due Date (Required)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
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
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Actual End Date (Optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ?? undefined}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="completion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Completion Percentage</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Enter completion percentage"
                    {...field}
                  />
                </FormControl>
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
                  placeholder="Enter project description"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddProjectForm;
