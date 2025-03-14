
import React from 'react';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';

interface TransactionTypeSelectorProps {
  form: UseFormReturn<any>;
  selectedType: 'income' | 'expense';
  onTypeChange: (type: 'income' | 'expense') => void;
}

export const TransactionTypeSelector: React.FC<TransactionTypeSelectorProps> = ({
  form,
  selectedType,
  onTypeChange
}) => {
  return (
    <FormField
      control={form.control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Transaction Type</FormLabel>
          <div className="flex space-x-2">
            <Button 
              type="button"
              variant={selectedType === 'income' ? 'default' : 'outline'}
              onClick={() => onTypeChange('income')}
              className="flex-1"
            >
              Income
            </Button>
            <Button 
              type="button"
              variant={selectedType === 'expense' ? 'default' : 'outline'}
              onClick={() => onTypeChange('expense')}
              className="flex-1"
            >
              Expense
            </Button>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
