import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    searchRecipesByInventory,
    searchRecipesByKeyword,
    getRecipeById,
    getSavedRecipes,
    saveRecipe,
    unsaveRecipe,
} from '../lib/api'

export function useRecipeDetails(id) {
    return useQuery({
        queryKey: ['spoonacular', 'details', id],
        queryFn: () => getRecipeById(id),
        enabled: !!id,
    });
}

function useSpoonacular() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeQuery, setActiveQuery] = useState('');

    const isSearchMode = !!activeQuery;

    const inventoryQuery = useQuery({
        queryKey: ['spoonacular', 'inventory'],
        queryFn: searchRecipesByInventory,
        enabled: !isSearchMode,
    });

    const keywordQuery = useQuery({
        queryKey: ['spoonacular', 'keyword', activeQuery],
        queryFn: () => searchRecipesByKeyword(activeQuery),
        enabled: isSearchMode,
    });

    const savedQuery = useQuery({
        queryKey: ['spoonacular', 'saved'],
        queryFn: getSavedRecipes,
    });

    const invalidateSaved = () => queryClient.invalidateQueries({ queryKey: ['spoonacular', 'saved'] });

    const saveMutation = useMutation({ mutationFn: saveRecipe, onSuccess: invalidateSaved });
    const unsaveMutation = useMutation({ mutationFn: unsaveRecipe, onSuccess: invalidateSaved });

    const savedRecipes = savedQuery.data ?? [];
    const savedIds = new Set(savedRecipes.map(r => r.spoonacularId));

    // findByIngredients returns a flat array; complexSearch returns { results: [...] }
    const recipes = isSearchMode
        ? (keywordQuery.data?.results ?? [])
        : (inventoryQuery.data ?? []);

    return {
        searchQuery,
        setSearchQuery,
        activeQuery,
        submitSearch: () => setActiveQuery(searchQuery.trim()),
        clearSearch: () => { setSearchQuery(''); setActiveQuery(''); },
        isSearchMode,
        recipes,
        isLoading: isSearchMode ? keywordQuery.isLoading : inventoryQuery.isLoading,
        savedIds,
        savedRecipes,
        save: saveMutation.mutate,
        unsave: unsaveMutation.mutate,
        getSavedEntry: (spoonacularId) => savedRecipes.find(r => r.spoonacularId === spoonacularId),
    };
}

export default useSpoonacular
