import { Router } from "express";
import { getMyInventory, createIngredient, updateIngredient, deleteIngredient } from "../contollers/inventoryController";

const router = Router();

router.get("/", getMyInventory);
router.post("/", createIngredient);
router.put("/:id", updateIngredient);
router.delete("/:id", deleteIngredient);

export default router;