import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
    id: text("id").primaryKey(), //clerk ID
    email: text("email").notNull().unique(),
    name: text("name"),
    imageURL: text("image_url"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const ingredients = pgTable("ingredients", {
    id: uuid("id").defaultRandom().primaryKey(),
    userID: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    quantity: integer("quantity").notNull(),
    unit: text("unit").notNull(),
    category: text("category"),
    purchaseDate: timestamp("purchase_date"),
    expirationDate: timestamp("expiration_date"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const meals = pgTable("meals", {
    id: uuid("id").defaultRandom().primaryKey(),
    userID: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    date: timestamp("date").notNull(),
    mealType: text("meal_type").notNull(), // breakfast, lunch, dinner
    recipeName: text("recipe_name"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// each user can be associated with many ingredients and many meals
export const usersRelations = relations(users, ({ many }) => ({
    ingredients: many(ingredients), //  One user → many ingredients
    meals: many(meals), //  One user → many meals
}));

// each ingredients maps to one user
export const ingredientsRelations = relations(ingredients, ({ one }) => ({
    user: one(users, { fields: [ingredients.userID], references: [users.id] })
}));

// each meal maps to one user
export const mealsRelations = relations(meals, ({ one }) => ({
    user: one(users, { fields: [meals.userID], references: [users.id] })
}));

// type inference
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Ingredient = typeof ingredients.$inferSelect;
export type NewIngredient = typeof ingredients.$inferInsert;

export type Meal = typeof meals.$inferSelect;
export type NewMeal = typeof meals.$inferInsert;
