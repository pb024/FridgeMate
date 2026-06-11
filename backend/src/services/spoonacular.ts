import { ENV } from "../config/env";

const BASE = "https://api.spoonacular.com";

async function spoonacularFetch(path: string, params: Record<string, string | number | boolean> = {}) {
    if (!ENV.SPOONACULAR_API_KEY) throw new Error("SPOONACULAR_API_KEY is not set");

    const url = new URL(`${BASE}${path}`);
    url.searchParams.set("apiKey", ENV.SPOONACULAR_API_KEY);
    for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, String(v));
    }

    const res = await fetch(url.toString());
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Spoonacular ${res.status}: ${text}`);
    }
    return res.json();
}

export const searchByIngredients = (ingredients: string[], number = 10) =>
    spoonacularFetch("/recipes/findByIngredients", {
        ingredients: ingredients.join(",+"),
        number,
        ranking: 1,       // maximise used ingredients
        ignorePantry: true,
    });

export const searchByKeyword = (query: string, number = 10) =>
    spoonacularFetch("/recipes/complexSearch", { query, number });

export const getRecipeDetails = (id: number) =>
    spoonacularFetch(`/recipes/${id}/information`);
