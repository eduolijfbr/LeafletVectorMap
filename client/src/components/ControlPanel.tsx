import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Upload, Check, Circle } from 'lucide-react';
import { VectorLayer } from '@/hooks/useMapLayers';

interface ControlPanelProps {
  activeBasemap: string;
  onBasemapChange: (basemap: 'osm' | 'google-satellite' | 'google-standard') => void;
  vectorLayers: VectorLayer[];
  toggleLayerVisibility: (id: string) => void;
  removeLayer: (id: string) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLoadFromSupabase: () => Promise<void>;
  isConnected: boolean;
  isLoading: boolean;
}

export default function ControlPanel({
  activeBasemap,
  onBasemapChange,
  vectorLayers,
  toggleLayerVisibility,
  removeLayer,
  onFileSelect,
  onLoadFromSupabase,
  isConnected,
  isLoading
}: ControlPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="absolute top-4 right-4 z-10 w-72 md:w-80 overflow-hidden transition-all duration-300 shadow-lg">
      <div className="px-4 py-3 bg-primary text-white flex justify-between items-center">
        <h2 className="text-lg font-semibold">GeoMap Explorer</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-white hover:bg-blue-600 rounded"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </Button>
      </div>
      
      {!isCollapsed && (
        <div className="p-4">
          {/* Basemap Selection */}
          <div className="mb-4">
            <h3 className="font-medium text-gray-800 mb-2">Basemaps</h3>
            
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  name="basemap" 
                  value="osm" 
                  checked={activeBasemap === 'osm'} 
                  onChange={() => onBasemapChange('osm')}
                  className="mr-2"
                />
                <div className="w-10 h-10 rounded overflow-hidden border border-gray-300 mr-2">
                  <div className="w-full h-full bg-blue-100"></div>
                </div>
                <span>OpenStreetMap</span>
              </label>
              
              <label className="flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  name="basemap" 
                  value="google-satellite" 
                  checked={activeBasemap === 'google-satellite'} 
                  onChange={() => onBasemapChange('google-satellite')}
                  className="mr-2"
                />
                <div className="w-10 h-10 rounded overflow-hidden border border-gray-300 mr-2">
                  <div className="w-full h-full bg-green-900"></div>
                </div>
                <span>Google Satellite</span>
              </label>
              
              <label className="flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  name="basemap" 
                  value="google-standard" 
                  checked={activeBasemap === 'google-standard'} 
                  onChange={() => onBasemapChange('google-standard')}
                  className="mr-2"
                />
                <div className="w-10 h-10 rounded overflow-hidden border border-gray-300 mr-2">
                  <div className="w-full h-full bg-gray-200"></div>
                </div>
                <span>Google Standard</span>
              </label>
            </div>
          </div>
          
          {/* Layer Control */}
          <div className="mb-4">
            <h3 className="font-medium text-gray-800 mb-2">Vector Layers</h3>
            
            <div className="space-y-2">
              {vectorLayers.length > 0 ? (
                vectorLayers.map(layer => (
                  <div 
                    key={layer.id} 
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-sm mr-2" 
                        style={{ backgroundColor: layer.color }}
                      ></div>
                      <span className="text-sm truncate max-w-[120px]">{layer.name}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6 text-gray-500 hover:text-gray-700" 
                        onClick={() => toggleLayerVisibility(layer.id)}
                        title="Toggle visibility"
                      >
                        {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6 text-gray-500 hover:text-gray-700" 
                        onClick={() => removeLayer(layer.id)}
                        title="Remove layer"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center p-3 bg-gray-50 border border-dashed border-gray-300 rounded text-gray-500">
                  <p className="text-sm">No vector layers loaded</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Data Upload Section */}
          <div className="mb-2">
            <h3 className="font-medium text-gray-800 mb-2">Add Data</h3>
            
            <div className="text-sm text-gray-600 mb-2">
              Drag & drop GeoJSON files onto the map or:
            </div>
            
            <Button 
              className="w-full bg-primary hover:bg-blue-600 text-white"
              onClick={handleUploadClick}
            >
              <Upload size={16} className="mr-2" />
              <span>Upload GeoJSON</span>
            </Button>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".geojson,application/json" 
              onChange={onFileSelect}
            />
          </div>
          
          {/* Supabase Connection */}
          <Separator className="my-2" />
          <div className="pt-2">
            <h3 className="font-medium text-gray-800 mb-2">Supabase Connection</h3>
            
            <div className="flex items-center justify-between">
              <span className="text-sm inline-flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : isLoading ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                <span>{isLoading ? 'Loading...' : isConnected ? 'Connected' : 'Disconnected'}</span>
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs px-2 py-1 h-7" 
                onClick={onLoadFromSupabase}
                disabled={isLoading || !isConnected}
              >
                Load Vectors
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
