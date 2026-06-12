import { Router } from "express";
import {
    searchByIngredients,
    searchByKeyword,
    getRecipeById,
    getSavedRecipes,
    saveRecipe,
    unsaveRecipe,
} from "../contollers/recipeController";

const router = Router();

// Spoonacular search
router.get("/from-inventory", searchByIngredients);  // GET /api/spoonacular/from-inventory
router.get("/search", searchByKeyword);              // GET /api/spoonacular/search?q=...

// Saved recipes — must come before /:id to avoid route conflict
router.get("/saved", getSavedRecipes);               // GET /api/spoonacular/saved
router.post("/saved", saveRecipe);                   // POST /api/spoonacular/saved
router.delete("/saved/:id", unsaveRecipe);           // DELETE /api/spoonacular/saved/:id

// Recipe details
router.get("/:id", getRecipeById);                   // GET /api/spoonacular/:id

export default router;
