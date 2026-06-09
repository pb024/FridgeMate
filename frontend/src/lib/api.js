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