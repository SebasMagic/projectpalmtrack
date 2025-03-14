
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { fetchTransactionCategories } from '@/lib/supabase/transactionUtils';
import { TransactionCategory } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { TransactionTypeSelector } from './transaction/TransactionTypeSelector';
import { DatePickerField } from './transaction/DatePickerField';
import { AmountField } from './transaction/AmountField';
import { CategorySelector } from './transaction/CategorySelector';
import { DescriptionField } from './transaction/DescriptionField';

const transactionSchema = z.object({
  date: z.date(),
  amount: z.coerce.number().positive('Amount must be a positive number'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Please select a category'),
  description: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface AddTransactionFormProps {
  projectId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddTransactionForm({ 
  projectId, 
  onSuccess, 
  onCancel 
}: AddTransactionFormProps) {
  const [selectedType, setSelectedType] = useState<'income' | 'expense'>('income');
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date(),
      amount: undefined,
      type: 'income',
      category: '',
      description: '',
    },
  });

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      try {
        console.log('Loading transaction categories...');
        const categoriesData = await fetchTransactionCategories();
        console.log('Fetched categories:', categoriesData);
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error loading categories:', error);
        toast.error('Failed to load categories');
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCategories();
  }, []);

  async function onSubmit(values: TransactionFormValues) {
    try {
      console.log('Submitting transaction:', values);
      const { error } = await supabase
        .from('transactions')
        .insert({
          id: uuidv4(),
          project_id: projectId,
          date: format(values.date, 'yyyy-MM-dd'),
          amount: values.amount,
          type: values.type,
          category: values.category,
          description: values.description || ''
        });

      if (error) {
        throw error;
      }

      toast.success('Transaction added successfully');
      onSuccess();
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction');
    }
  }

  // Update available categories when type changes
  const onTypeChange = (type: 'income' | 'expense') => {
    setSelectedType(type);
    form.setValue('type', type);
    form.setValue('category', ''); // Reset category when type changes
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <TransactionTypeSelector 
            form={form} 
            selectedType={selectedType} 
            onTypeChange={onTypeChange} 
          />
          <DatePickerField form={form} />
        </div>

        <AmountField form={form} />
        <CategorySelector 
          form={form} 
          categories={categories} 
          isLoading={isLoading} 
          selectedType={selectedType} 
        />
        <DescriptionField form={form} />

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Add Transaction
          </Button>
        </div>
      </form>
    </Form>
  );
}
