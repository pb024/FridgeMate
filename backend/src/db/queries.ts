import { db } from "./index";
import { eq } from "drizzle-orm";
import { users, ingredients, meals, type NewUser, type NewIngredient, type NewMeal } from "./schema";

// USER QUERIES

// insert new user into db table and then return user
export const createUser = async (data: NewUser) => {
    const [user] = await db.insert(users).values(data).returning();
    return user;
}

export const getUserByID = async (id: string) => {
    const user = await db.query.users.findFirst({
        where: eq(users.id, id)
    });
    return user;
}

export const updateUser = async (id: string, data: Partial<NewUser>) => {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
}

// upsert => create or update
export const upsertUser = async (data: NewUser) => {
    const existingUser = await getUserByID(data.id);
    if (existingUser) {
        return await updateUser(data.id, data);
    } else {
        return await createUser(data);
    }
}

// INGREDIENT QUERIES

export const createIngredient = async (data: NewIngredient) => {
    const [ingredient] = await db.insert(ingredients).values(data).returning();
    return ingredient;
}

export const getIngredientsByUserID = async (userID: string) => {
    const ingredientsList = await db.query.ingredients.findMany({
        where: eq(ingredients.userID, userID)
    });
    return ingredientsList;
}

export const updateIngredient = async (id: string, data: Partial<NewIngredient>) => {
    const [ingredient] = await db.update(ingredients).set(data).where(eq(ingredients.id, id)).returning();
    return ingredient;
}

export const deleteIngredient = async (id: string) => {
    await db.delete(ingredients).where(eq(ingredients.id, id));
}

// MEAL QUERIES

export const createMeal = async (data: NewMeal) => {
    const [meal] = await db.insert(meals).values(data).returning();
    return meal;
}

export const getMealsByUserID = async (userID: string) => {
    const mealsList = await db.query.meals.findMany({
        where: eq(meals.userID, userID)
    });
    return mealsList;
}

export const updateMeal = async (id: string, data: Partial<NewMeal>) => {
    const [meal] = await db.update(meals).set(data).where(eq(meals.id, id)).returning();
    return meal;
}

export const deleteMeal = async (id: string) => {
    await db.delete(meals).where(eq(meals.id, id));
}