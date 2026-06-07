import { Router } from "express";
import { getMyMeals, createMeal, updateMeal, deleteMeal } from "../contollers/mealController";

const router = Router();

router.get("/", getMyMeals);
router.post("/", createMeal);
router.put("/:id", updateMeal);
router.delete("/:id", deleteMeal);

export default router;