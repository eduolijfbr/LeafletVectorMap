import { useState, useEffect } from 'react';
import { apiRequest } from './queryClient';
import { FeatureCollection } from 'geojson';
import { toast } from '@/hooks/use-toast';

interface UseSupabaseResult {
  isConnected: boolean;
  isLoading: boolean;
  loadVectorData: () => Promise<FeatureCollection | null>;
  saveVectorData: (data: FeatureCollection, name: string) => Promise<boolean>;
}

export function useSupabase(): UseSupabaseResult {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check connection on mount
    checkConnection();
  }, []);

  async function checkConnection() {
    try {
      const response = await apiRequest('GET', '/api/supabase/status');
      const data = await response.json();
      setIsConnected(data.connected);
    } catch (error) {
      setIsConnected(false);
      console.error('Failed to check Supabase connection:', error);
    }
  }

  async function loadVectorData(): Promise<FeatureCollection | null> {
    setIsLoading(true);
    try {
      const response = await apiRequest('GET', '/api/supabase/vectors');
      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Error loading data",
        description: "Failed to load vector data from Supabase",
        variant: "destructive"
      });
      console.error('Failed to load vector data:', error);
      return null;
    }
  }

  async function saveVectorData(data: FeatureCollection, name: string): Promise<boolean> {
    setIsLoading(true);
    try {
      await apiRequest('POST', '/api/supabase/vectors', { 
        data, 
        name 
      });
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Error saving data",
        description: "Failed to save vector data to Supabase",
        variant: "destructive"
      });
      console.error('Failed to save vector data:', error);
      return false;
    }
  }

  return {
    isConnected,
    isLoading,
    loadVectorData,
    saveVectorData
  };
}
