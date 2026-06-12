import express from "express";
import cors from "cors";
import { ENV } from "./config/env"
import { clerkMiddleware } from "@clerk/express";
import userRoutes from "./routes/userRoutes";
import inventoryRoutes from "./routes/inventoryRoutes";
import recipesRoutes from "./routes/mealRoutes";
import spoonacularRoutes from "./routes/recipeRoutes";

const app = express();

app.use(cors({ origin: ENV.FRONTEND_URL, credentials: true }));
// `credentials: true` allows the frontend to send cookies to the backend so that we can authenticate the user
app.use(clerkMiddleware()); // auth object attached to req
app.use(express.json()); // parses JSON request bodies.
app.use(express.urlencoded({ extended: true })); // parses form data (like HTML forms)


// 
app.get("/", (_req, res) => {
    res.json({
        message: "Welcome to FridgeMate!",
        endpoints: {
            users: "/api/users",
            inventory: "/api/inventory",
            recipes: "/api/recipes",
            spoonacular: "/api/spoonacular",
        }
    });
});

app.use("/api/users", userRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/recipes", recipesRoutes);
app.use("/api/spoonacular", spoonacularRoutes);

// starts the server
app.listen(ENV.PORT, () => console.log("Server is up and running on PORT:", ENV.PORT));