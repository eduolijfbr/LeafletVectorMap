import { users, type User, type InsertUser, vectorLayers, type VectorLayer, type InsertVectorLayer } from "@shared/schema";

// Modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Vector layer methods
  getVectorLayers(): Promise<VectorLayer[]>;
  getVectorLayer(id: number): Promise<VectorLayer | undefined>;
  createVectorLayer(layer: Omit<InsertVectorLayer, 'id'>): Promise<VectorLayer>;
  deleteVectorLayer(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vectorLayers: Map<number, VectorLayer>;
  private currentUserId: number;
  private currentVectorLayerId: number;

  constructor() {
    this.users = new Map();
    this.vectorLayers = new Map();
    this.currentUserId = 1;
    this.currentVectorLayerId = 1;
    
    // Initialize with sample vector data
    this.createVectorLayer({
      name: "Sample GeoJSON",
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              name: "Sample Point",
              description: "This is a sample point feature"
            },
            geometry: {
              type: "Point",
              coordinates: [0, 0]
            }
          },
          {
            type: "Feature",
            properties: {
              name: "Sample Polygon",
              description: "This is a sample polygon feature"
            },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [-5, 5],
                [5, 5],
                [5, -5],
                [-5, -5],
                [-5, 5]
              ]]
            }
          }
        ]
      },
      created_at: new Date().toISOString(),
      user_id: 1
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Vector layer methods
  async getVectorLayers(): Promise<VectorLayer[]> {
    return Array.from(this.vectorLayers.values());
  }
  
  async getVectorLayer(id: number): Promise<VectorLayer | undefined> {
    return this.vectorLayers.get(id);
  }
  
  async createVectorLayer(layer: Omit<InsertVectorLayer, 'id'>): Promise<VectorLayer> {
    const id = this.currentVectorLayerId++;
    const vectorLayer: VectorLayer = { ...layer, id };
    this.vectorLayers.set(id, vectorLayer);
    return vectorLayer;
  }
  
  async deleteVectorLayer(id: number): Promise<boolean> {
    return this.vectorLayers.delete(id);
  }
}

export const storage = new MemStorage();
