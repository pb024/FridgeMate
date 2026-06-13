import api from './axios';

// USER API
export const syncUser = async (userData) => {
    const { data } = await api.post('/users/sync', userData);
    return data;
}

// INVENTORY API
export const getInventory = async () => {
    const { data } = await api.get('/inventory');
    return data;
};

export const createIngredient = async (ingredient) => {
    const { data } = await api.post('/inventory', ingredient);
    return data;
};

export const updateIngredient = async (id, ingredient) => {
    const { data } = await api.put(`/inventory/${id}`, ingredient);
    return data;
};

export const deleteIngredient = async (id) => {
    const { data } = await api.delete(`/inventory/${id}`);
    return data;
};

// MEALS API
export const getMeals = async () => {
    const { data } = await api.get('/recipes');
    return data;
};

export const createMeal = async (meal) => {
    const { data } = await api.post('/recipes', meal);
    return data;
};

export const updateMeal = async (id, meal) => {
    const { data } = await api.put(`/recipes/${id}`, meal);
    return data;
};

export const deleteMeal = async (id) => {
    const { data } = await api.delete(`/recipes/${id}`);
    return data;
};

// SPOONACULAR API
export const searchRecipesByInventory = async (number = 10) => {
    const { data } = await api.get('/spoonacular/from-inventory', { params: { number } });
    return data;
};

export const searchRecipesByKeyword = async (q, number = 10) => {
    const { data } = await api.get('/spoonacular/search', { params: { q, number } });
    return data;
};

export const getRecipeById = async (id) => {
    const { data } = await api.get(`/spoonacular/${id}`);
    return data;
};

export const getSavedRecipes = async () => {
    const { data } = await api.get('/spoonacular/saved');
    return data;
};

export const saveRecipe = async (recipe) => {
    const { data } = await api.post('/spoonacular/saved', recipe);
    return data;
};

export const unsaveRecipe = async (id) => {
    const { data } = await api.delete(`/spoonacular/saved/${id}`);
    return data;
};