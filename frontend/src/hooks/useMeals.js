import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMeals, createMeal, deleteMeal } from '../lib/api'

function useMeals({ onSuccess, onError } = {}) {
    const queryClient = useQueryClient();

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['meals'] });

    const { data: meals = [], isLoading } = useQuery({
        queryKey: ['meals'],
        queryFn: getMeals,
    });

    const createMutation = useMutation({
        mutationFn: createMeal,
        onSuccess: () => { invalidate(); onSuccess?.(); },
        onError: (err) => onError?.(err),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteMeal,
        onSuccess: invalidate,
        onError: (err) => onError?.(err),
    });

    return {
        meals,
        isLoading,
        create: createMutation.mutate,
        remove: deleteMutation.mutate,
        isSubmitting: createMutation.isPending,
        deletingId: deleteMutation.isPending ? deleteMutation.variables : null,
    };
}

export default useMeals
