import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

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

        const meal = await queries.createMeal({
            userID: userId,
            date: new Date(date),
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

        const userMeals = await queries.getMealsByUserID(userId);
        const existingMeal = userMeals.find(m => m.id === id);
        if (!existingMeal) {
            return res.status(404).json({ error: "Meal not found" });
        }

        const { date, mealType, recipeName } = req.body;

        const meal = await queries.updateMeal(id, {
            date: date ? new Date(date) : undefined,
            mealType,
            recipeName,
        });

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

        const userMeals = await queries.getMealsByUserID(userId);
        const existingMeal = userMeals.find(m => m.id === id);
        if (!existingMeal) {
            return res.status(404).json({ error: "Meal not found" });
        }

        await queries.deleteMeal(id);
        res.status(200).json({ message: "Meal deleted successfully" });
    } catch (error) {
        console.error("Error deleting meal:", error);
        res.status(500).json({ error: "Failed to delete meal" });
    }
};
