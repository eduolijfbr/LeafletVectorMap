import { useState } from 'react';
import MapContainer from '@/components/MapContainer';
import ControlPanel from '@/components/ControlPanel';
import DragDropOverlay from '@/components/DragDropOverlay';
import ToastNotification from '@/components/ToastNotification';
import { useSupabase } from '@/lib/useSupabase';
import { useMapLayers } from '@/hooks/useMapLayers';
import { FeatureCollection } from 'geojson';
import { toast } from '@/hooks/use-toast';
import { Layer } from 'leaflet';

type BasemapType = 'osm' | 'google-satellite' | 'google-standard';

export default function MapExplorer() {
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [activeBasemap, setActiveBasemap] = useState<BasemapType>('osm');
  const { isConnected, isLoading, loadVectorData } = useSupabase();
  const { 
    layers, 
    addGeoJSONLayer, 
    toggleLayerVisibility, 
    removeLayer,
    map,
    setMap
  } = useMapLayers();

  const handleBasemapChange = (basemap: BasemapType) => {
    setActiveBasemap(basemap);
  };

  const handleDrop = async (files: FileList) => {
    if (files.length > 0) {
      const file = files[0];
      
      // Check if file is JSON
      if (!file.name.endsWith('.geojson') && !file.name.endsWith('.json')) {
        toast({
          title: "Invalid File Type",
          description: "Please drop a GeoJSON file",
          variant: "destructive"
        });
        return;
      }
      
      try {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const result = e.target?.result;
            if (typeof result === 'string') {
              const geojson = JSON.parse(result) as FeatureCollection;
              // Validate it's a proper GeoJSON
              if (!geojson.type || !geojson.features) {
                throw new Error("Invalid GeoJSON format");
              }
              
              // Extract name from filename
              const name = file.name.replace(/\.(geojson|json)$/, '');
              addGeoJSONLayer(geojson, name);
              
              toast({
                title: "Success",
                description: `GeoJSON file "${name}" successfully loaded!`,
              });
            }
          } catch (error) {
            toast({
              title: "Error",
              description: `Failed to parse GeoJSON: ${(error as Error).message}`,
              variant: "destructive"
            });
          }
        };
        
        reader.readAsText(file);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to read file",
          variant: "destructive"
        });
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleDrop(e.target.files);
      // Reset the input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  const handleLoadFromSupabase = async () => {
    const data = await loadVectorData();
    if (data) {
      addGeoJSONLayer(data, 'Supabase Data');
      toast({
        title: "Success",
        description: "Vector data loaded from Supabase",
      });
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <MapContainer 
        activeBasemap={activeBasemap} 
        setIsDraggingFile={setIsDraggingFile}
        handleDrop={handleDrop}
        setMap={setMap}
      />
      
      <ControlPanel 
        activeBasemap={activeBasemap}
        onBasemapChange={handleBasemapChange}
        vectorLayers={layers}
        toggleLayerVisibility={toggleLayerVisibility}
        removeLayer={removeLayer}
        onFileSelect={handleFileSelect}
        onLoadFromSupabase={handleLoadFromSupabase}
        isConnected={isConnected}
        isLoading={isLoading}
      />
      
      <DragDropOverlay active={isDraggingFile} />
    </div>
  );
}
