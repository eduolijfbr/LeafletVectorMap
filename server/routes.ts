import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

// GeoJSON validation schema
const geoJSONSchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(
    z.object({
      type: z.literal("Feature"),
      geometry: z.object({
        type: z.string(),
        coordinates: z.any(),
      }),
      properties: z.record(z.any()).optional(),
    })
  ),
});

const vectorLayerInputSchema = z.object({
  name: z.string().min(1).max(100),
  data: geoJSONSchema,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  
  // Check Supabase connection status
  app.get("/api/supabase/status", (_req: Request, res: Response) => {
    try {
      // For this implementation, we'll just simulate the connection
      // In a real implementation, you would check the actual connection status
      res.json({ connected: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to check connection status" });
    }
  });

  // Get vector layers from Supabase
  app.get("/api/supabase/vectors", async (_req: Request, res: Response) => {
    try {
      const vectorLayers = await storage.getVectorLayers();
      
      if (vectorLayers.length > 0) {
        res.json(vectorLayers[0].data); // Return first layer's data for simplicity
      } else {
        // Return empty GeoJSON if no layers found
        res.json({
          type: "FeatureCollection",
          features: []
        });
      }
    } catch (error) {
      console.error("Error getting vector layers:", error);
      res.status(500).json({ message: "Failed to fetch vector layers" });
    }
  });

  // Save vector layer to Supabase
  app.post("/api/supabase/vectors", async (req: Request, res: Response) => {
    try {
      const { data, name } = req.body;
      
      // Validate input
      const validatedData = vectorLayerInputSchema.parse({
        name,
        data
      });
      
      // Save to storage
      await storage.createVectorLayer({
        name: validatedData.name,
        data: validatedData.data,
        created_at: new Date().toISOString(),
        user_id: 1 // Default user ID
      });
      
      res.status(201).json({ message: "Vector layer saved successfully" });
    } catch (error) {
      console.error("Error saving vector layer:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data format", details: error.errors });
      } else {
        res.status(500).json({ message: "Failed to save vector layer" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
