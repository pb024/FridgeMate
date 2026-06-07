import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

function parseDate(value: unknown): Date | undefined | null {
    if (value === undefined || value === null || value === "") return undefined;
    const ts = Date.parse(String(value));
    if (isNaN(ts)) return null;
    return new Date(ts);
}

// Get meals for current user (protected)
export const getMyMeals = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const meals = await queries.getMealsByUserID(userId);
        res.status(200).json(meals);
    } catch (error) {
        console.error("Error getting user meals:", error);
        res.status(500).json({ error: "Failed to get user meals" });
    }
};

// Create meal (protected)
export const createMeal = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { date, mealType, recipeName } = req.body;

        if (!date || !mealType) {
            return res.status(400).json({ error: "date and mealType are required" });
        }

        const parsedDate = parseDate(date);
        if (parsedDate === null) return res.status(400).json({ error: "Invalid date" });

        const meal = await queries.createMeal({
            userID: userId,
            date: parsedDate!,
            mealType,
            recipeName,
        });

        res.status(201).json(meal);
    } catch (error) {
        console.error("Error creating meal:", error);
        res.status(500).json({ error: "Failed to create meal" });
    }
};

// Update meal (protected - owner only)
export const updateMeal = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const id = req.params.id as string;
        const { date, mealType, recipeName } = req.body;

        const parsedDate = parseDate(date);
        if (parsedDate === null) return res.status(400).json({ error: "Invalid date" });

        const meal = await queries.updateMealByOwner(id, userId, {
            date: parsedDate,
            mealType,
            recipeName,
        });

        if (!meal) return res.status(404).json({ error: "Meal not found" });

        res.status(200).json(meal);
    } catch (error) {
        console.error("Error updating meal:", error);
        res.status(500).json({ error: "Failed to update meal" });
    }
};

// Delete meal (protected - owner only)
export const deleteMeal = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const id = req.params.id as string;

        const deleted = await queries.deleteMealByOwner(id, userId);
        if (!deleted) return res.status(404).json({ error: "Meal not found" });

        res.status(200).json({ message: "Meal deleted successfully" });
    } catch (error) {
        console.error("Error deleting meal:", error);
        res.status(500).json({ error: "Failed to delete meal" });
    }
};
