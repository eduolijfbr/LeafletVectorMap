import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// GeoJSON related schema
export const vectorLayers = pgTable("vector_layers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  data: jsonb("data").notNull(), // Store GeoJSON as JSONB
  created_at: text("created_at").notNull(),
  user_id: integer("user_id").references(() => users.id),
});

export const insertVectorLayerSchema = createInsertSchema(vectorLayers).pick({
  name: true,
  data: true,
  user_id: true,
});

export type InsertVectorLayer = z.infer<typeof insertVectorLayerSchema>;
export type VectorLayer = typeof vectorLayers.$inferSelect;
