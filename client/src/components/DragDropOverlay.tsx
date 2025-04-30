interface DragDropOverlayProps {
  active: boolean;
}

export default function DragDropOverlay({ active }: DragDropOverlayProps) {
  if (!active) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 pointer-events-auto transition-opacity duration-300">
      <div className="p-8 border-3 border-dashed border-white rounded-lg text-center text-white bg-blue-500/50 max-w-[80%]">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <h3 className="text-xl font-semibold mb-2">Drop GeoJSON File Here</h3>
        <p>Release to add to the map</p>
      </div>
    </div>
  );
}
