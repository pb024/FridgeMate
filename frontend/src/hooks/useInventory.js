import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getInventory, createIngredient, updateIngredient, deleteIngredient } from '../lib/api'

function useInventory({ onSuccess } = {}) {
    const queryClient = useQueryClient();

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['inventory'] });

    const { data: inventory = [], isLoading } = useQuery({
        queryKey: ['inventory'],
        queryFn: getInventory,
    });

    const createMutation = useMutation({
        mutationFn: createIngredient,
        onSuccess: () => { invalidate(); onSuccess?.(); },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updateIngredient(id, data),
        onSuccess: () => { invalidate(); onSuccess?.(); },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteIngredient,
        onSuccess: invalidate,
    });

    return {
        inventory,
        isLoading,
        create: createMutation.mutate,
        update: updateMutation.mutate,
        remove: deleteMutation.mutate,
        isSubmitting: createMutation.isPending || updateMutation.isPending,
        deletingId: deleteMutation.isPending ? deleteMutation.variables : null,
    };
}

export default useInventory
