
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';

interface AmountFieldProps {
  form: UseFormReturn<any>;
}

export const AmountField: React.FC<AmountFieldProps> = ({
  form
}) => {
  return (
    <FormField
      control={form.control}
      name="amount"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Amount ($)</FormLabel>
          <FormControl>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...field}
              onChange={(e) => {
                const value = e.target.value;
                field.onChange(value === '' ? '' : parseFloat(value));
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
