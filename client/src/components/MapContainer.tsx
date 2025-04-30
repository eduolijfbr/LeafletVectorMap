import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { toast } from '@/hooks/use-toast';

interface MapContainerProps {
  activeBasemap: string;
  setIsDraggingFile: (isDragging: boolean) => void;
  handleDrop: (files: FileList) => void;
  setMap: (map: L.Map) => void;
}

export default function MapContainer({ 
  activeBasemap, 
  setIsDraggingFile, 
  handleDrop,
  setMap 
}: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const activeBasemapLayerRef = useRef<L.TileLayer | null>(null);

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const mapInstance = L.map(mapRef.current, {
        center: [20, 0], // Default to a world view
        zoom: 2,
        zoomControl: true,
        attributionControl: true,
      });
      
      mapInstanceRef.current = mapInstance;
      setMap(mapInstance);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [setMap]);

  // Handle basemap changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    // Remove current basemap if exists
    if (activeBasemapLayerRef.current) {
      mapInstanceRef.current.removeLayer(activeBasemapLayerRef.current);
      activeBasemapLayerRef.current = null;
    }
    
    let newBasemap: L.TileLayer;
    
    switch (activeBasemap) {
      case 'osm':
        newBasemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        });
        break;
      case 'google-satellite':
        newBasemap = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
          attribution: '&copy; Google Maps',
          maxZoom: 20
        });
        break;
      case 'google-standard':
        newBasemap = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
          attribution: '&copy; Google Maps',
          maxZoom: 20
        });
        break;
      default:
        newBasemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        });
    }
    
    newBasemap.addTo(mapInstanceRef.current);
    activeBasemapLayerRef.current = newBasemap;
    
  }, [activeBasemap]);

  // Set up drag-and-drop handlers
  useEffect(() => {
    const mapElement = mapRef.current;
    if (!mapElement) return;

    const preventDefaults = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const highlightDropArea = () => {
      setIsDraggingFile(true);
    };

    const unhighlightDropArea = () => {
      setIsDraggingFile(false);
    };

    const handleFileDrop = (e: DragEvent) => {
      unhighlightDropArea();
      if (e.dataTransfer?.files) {
        handleDrop(e.dataTransfer.files);
      }
    };

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      mapElement.addEventListener(eventName, preventDefaults, false);
      document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop area when item is dragged over
    ['dragenter', 'dragover'].forEach(eventName => {
      mapElement.addEventListener(eventName, highlightDropArea, false);
    });

    // Unhighlight drop area when item is dragged out or dropped
    ['dragleave', 'drop'].forEach(eventName => {
      mapElement.addEventListener(eventName, unhighlightDropArea, false);
    });

    // Handle file drop
    mapElement.addEventListener('drop', handleFileDrop as EventListener, false);

    return () => {
      // Clean up event listeners
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        mapElement.removeEventListener(eventName, preventDefaults, false);
        document.body.removeEventListener(eventName, preventDefaults, false);
      });

      ['dragenter', 'dragover'].forEach(eventName => {
        mapElement.removeEventListener(eventName, highlightDropArea, false);
      });

      ['dragleave', 'drop'].forEach(eventName => {
        mapElement.removeEventListener(eventName, unhighlightDropArea, false);
      });

      mapElement.removeEventListener('drop', handleFileDrop as EventListener, false);
    };
  }, [setIsDraggingFile, handleDrop]);

  return (
    <div 
      id="map" 
      ref={mapRef} 
      className="w-full h-screen z-0"
    />
  );
}
