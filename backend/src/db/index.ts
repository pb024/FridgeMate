import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { ENV } from "../config/env";

if (!ENV.DB_URL) {
    throw new Error("DB_URL is not set in environment variables");
}

// initialize PostgreSQL connection pool
const pool = new Pool({ connectionString: ENV.DB_URL }); // will be used by Drizzle to talk to database

// log when first connection is made
pool.on("connect", () => {
    console.log("Database connected successfully ✅");
});

// log when an error occurs
pool.on("error", (err) => {
    console.error("💥 Database connection error:", err);
});

export const db = drizzle(pool, { schema });