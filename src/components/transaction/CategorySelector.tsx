
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { TransactionCategory } from '@/lib/types';
import { UseFormReturn } from 'react-hook-form';

interface CategorySelectorProps {
  form: UseFormReturn<any>;
  categories: TransactionCategory[];
  isLoading: boolean;
  selectedType: 'income' | 'expense';
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  form,
  categories,
  isLoading,
  selectedType
}) => {
  // Ensure categories is always an array and filter by selected type
  const filteredCategories = Array.isArray(categories) 
    ? categories.filter(category => category.type === selectedType) 
    : [];
  
  console.log('Filtered categories:', filteredCategories);
  console.log('Selected type:', selectedType);
  console.log('Categories in selector:', categories);

  return (
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Category</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between",
                    !field.value && "text-muted-foreground"
                  )}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading categories..." : 
                    field.value ? 
                      filteredCategories.find(category => category.name === field.value)?.name || field.value 
                      : "Select category"
                  }
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 bg-popover" align="start" side="bottom" sideOffset={4}>
              <Command>
                <CommandInput placeholder="Search category..." />
                <CommandEmpty>No category found.</CommandEmpty>
                <CommandGroup className="max-h-64 overflow-auto">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                      <CommandItem
                        value={category.name}
                        key={category.id}
                        onSelect={() => {
                          form.setValue("category", category.name);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            category.name === field.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {category.name}
                      </CommandItem>
                    ))
                  ) : (
                    <CommandItem disabled className="py-2 text-center text-sm opacity-70">
                      No {selectedType} categories available
                    </CommandItem>
                  )}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
