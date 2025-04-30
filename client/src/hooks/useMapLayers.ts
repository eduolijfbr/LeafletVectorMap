import { useState, useRef, useCallback } from 'react';
import L, { Map } from 'leaflet';
import { FeatureCollection } from 'geojson';

export interface VectorLayer {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  layer: L.GeoJSON;
}

export function useMapLayers() {
  const [layers, setLayers] = useState<VectorLayer[]>([]);
  const [map, setMap] = useState<Map | null>(null);
  
  // Generate a random color for layers
  const getRandomColor = useCallback(() => {
    const colors = [
      '#3B82F6', // blue
      '#10B981', // green
      '#F59E0B', // amber
      '#EF4444', // red
      '#8B5CF6', // purple
      '#EC4899', // pink
      '#06B6D4', // cyan
      '#F97316'  // orange
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);
  
  // Add a GeoJSON layer to the map
  const addGeoJSONLayer = useCallback((
    geojson: FeatureCollection, 
    name: string
  ) => {
    if (!map) return;
    
    try {
      // Create a random color for the layer
      const color = getRandomColor();
      
      // Create the layer with custom styling
      const layer = L.geoJSON(geojson, {
        style: function() {
          return {
            color: color,
            weight: 2,
            opacity: 1,
            fillOpacity: 0.5
          };
        },
        pointToLayer: function(_feature, latlng) {
          return L.circleMarker(latlng, {
            radius: 8,
            fillColor: color,
            color: '#fff',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          });
        },
        onEachFeature: function(feature, layer) {
          if (feature.properties) {
            const content = Object.entries(feature.properties)
              .map(([key, value]) => `<strong>${key}</strong>: ${value}`)
              .join('<br>');
            
            if (content) {
              layer.bindPopup(content);
            }
          }
        }
      }).addTo(map);
      
      // Add to state
      const layerInfo: VectorLayer = {
        id: Date.now().toString(),
        name: name || `Layer ${layers.length + 1}`,
        layer: layer,
        visible: true,
        color: color
      };
      
      setLayers(prevLayers => [...prevLayers, layerInfo]);
      
      // Fit map to the layer bounds if it has features
      if (geojson.features.length > 0) {
        map.fitBounds(layer.getBounds());
      }
      
      return layerInfo;
    } catch (error) {
      console.error('Error adding GeoJSON layer:', error);
      return null;
    }
  }, [map, layers.length, getRandomColor]);
  
  // Toggle layer visibility
  const toggleLayerVisibility = useCallback((layerId: string) => {
    if (!map) return;
    
    setLayers(prevLayers => 
      prevLayers.map(layer => {
        if (layer.id === layerId) {
          // Toggle visibility
          if (layer.visible) {
            map.removeLayer(layer.layer);
          } else {
            map.addLayer(layer.layer);
          }
          
          return { ...layer, visible: !layer.visible };
        }
        return layer;
      })
    );
  }, [map]);
  
  // Remove layer
  const removeLayer = useCallback((layerId: string) => {
    if (!map) return;
    
    setLayers(prevLayers => {
      const layerToRemove = prevLayers.find(l => l.id === layerId);
      if (layerToRemove) {
        map.removeLayer(layerToRemove.layer);
      }
      
      return prevLayers.filter(l => l.id !== layerId);
    });
  }, [map]);
  
  return {
    layers,
    addGeoJSONLayer,
    toggleLayerVisibility,
    removeLayer,
    map,
    setMap
  };
}
