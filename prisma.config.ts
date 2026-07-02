import path from "path";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Make sure environment variables are loaded
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL || "",
  },
});