import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import * as queries from "../db/queries";
import * as spoonacular from "../services/spoonacular";

export const searchByIngredients = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const userIngredients = await queries.getIngredientsByUserID(userId);
        if (userIngredients.length === 0) return res.status(200).json([]);

        const names = userIngredients.map((i) => i.name);
        const number = Number(req.query.number) || 10;
        const results = await spoonacular.searchByIngredients(names, number);
        res.status(200).json(results);
    } catch (error) {
        console.error("Error searching recipes by inventory:", error);
        res.status(500).json({ error: "Failed to search recipes by inventory" });
    }
};

export const searchByKeyword = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const q = req.query.q as string;
        if (!q) return res.status(400).json({ error: "q is required" });

        const number = Number(req.query.number) || 10;
        const results = await spoonacular.searchByKeyword(q, number);
        res.status(200).json(results);
    } catch (error) {
        console.error("Error searching recipes by keyword:", error);
        res.status(500).json({ error: "Failed to search recipes" });
    }
};

export const getRecipeById = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: "Invalid recipe ID" });

        const recipe = await spoonacular.getRecipeDetails(id);
        res.status(200).json(recipe);
    } catch (error) {
        console.error("Error fetching recipe details:", error);
        res.status(500).json({ error: "Failed to fetch recipe details" });
    }
};

export const getSavedRecipes = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const recipes = await queries.getSavedRecipesByUserID(userId);
        res.status(200).json(recipes);
    } catch (error) {
        console.error("Error fetching saved recipes:", error);
        res.status(500).json({ error: "Failed to fetch saved recipes" });
    }
};

export const saveRecipe = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { spoonacularId, title, image, sourceUrl } = req.body;
        if (!spoonacularId || !title) {
            return res.status(400).json({ error: "spoonacularId and title are required" });
        }

        const recipe = await queries.saveRecipe({
            userID: userId,
            spoonacularId,
            title,
            image,
            sourceUrl,
        });

        if (!recipe) return res.status(200).json({ message: "Already saved" });

        res.status(201).json(recipe);
    } catch (error) {
        console.error("Error saving recipe:", error);
        res.status(500).json({ error: "Failed to save recipe" });
    }
};

export const unsaveRecipe = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const deleted = await queries.deleteSavedRecipeByOwner(req.params.id, userId);
        if (!deleted) return res.status(404).json({ error: "Saved recipe not found" });

        res.status(200).json({ message: "Recipe unsaved successfully" });
    } catch (error) {
        console.error("Error unsaving recipe:", error);
        res.status(500).json({ error: "Failed to unsave recipe" });
    }
};
