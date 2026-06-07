import type { Request, Response } from "express";

import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

function parseDate(value: unknown): Date | undefined | null {
    if (value === undefined || value === null || value === "") return undefined;
    const ts = Date.parse(String(value));
    if (isNaN(ts)) return null; // signals invalid
    return new Date(ts);
}

// Get inventory items by current user (protected)
export const getMyInventory = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const products = await queries.getIngredientsByUserID(userId);
        res.status(200).json(products);
    } catch (error) {
        console.error("Error getting user inventory:", error);
        res.status(500).json({ error: "Failed to get user ingredients" });
    }
};

// Create ingredient (protected)
export const createIngredient = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { name, quantity, unit, category, purchaseDate, expirationDate } = req.body;

        if (!name || quantity === undefined || !unit) {
            return res.status(400).json({ error: "name, quantity, and unit are required" });
        }

        const parsedPurchaseDate = parseDate(purchaseDate);
        const parsedExpirationDate = parseDate(expirationDate);
        if (parsedPurchaseDate === null) return res.status(400).json({ error: "Invalid purchaseDate" });
        if (parsedExpirationDate === null) return res.status(400).json({ error: "Invalid expirationDate" });

        const product = await queries.createIngredient({
            userID: userId,
            name,
            quantity,
            unit,
            category,
            purchaseDate: parsedPurchaseDate,
            expirationDate: parsedExpirationDate,
        });

        res.status(201).json(product);
    } catch (error) {
        console.error("Error creating ingredient:", error);
        res.status(500).json({ error: "Failed to create ingredient" });
    }
};

// Update ingredient (protected - owner only)
export const updateIngredient = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const id = req.params.id as string;

        const { name, quantity, unit, category, purchaseDate, expirationDate } = req.body;

        const parsedPurchaseDate = parseDate(purchaseDate);
        const parsedExpirationDate = parseDate(expirationDate);
        if (parsedPurchaseDate === null) return res.status(400).json({ error: "Invalid purchaseDate" });
        if (parsedExpirationDate === null) return res.status(400).json({ error: "Invalid expirationDate" });

        const product = await queries.updateIngredientByOwner(id, userId, {
            name,
            quantity,
            unit,
            category,
            purchaseDate: parsedPurchaseDate,
            expirationDate: parsedExpirationDate,
        });

        if (!product) return res.status(404).json({ error: "Ingredient not found" });

        res.status(200).json(product);
    } catch (error) {
        console.error("Error updating ingredient:", error);
        res.status(500).json({ error: "Failed to update ingredient" });
    }
};

// Delete ingredient (protected - owner only)
export const deleteIngredient = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const id = req.params.id as string;

        const deleted = await queries.deleteIngredientByOwner(id, userId);
        if (!deleted) return res.status(404).json({ error: "Ingredient not found" });

        res.status(200).json({ message: "Ingredient deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Failed to delete product" });
    }
};
