import React from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

interface MapViewProps {
  apiKey: string;
  className?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
}

export const MapView: React.FC<MapViewProps> = ({ apiKey, className, center = { lat: 25.793, lng: -108.995 }, zoom = 12 }) => {
  return (
    <div className={`w-full h-full rounded-2xl overflow-hidden ${className}`}>
      <APIProvider apiKey={apiKey} language="es" region="MX">
        <Map
          defaultCenter={center}
          defaultZoom={zoom}
          mapId="DEMO_MAP_ID"
          gestureHandling="greedy"
          disableDefaultUI={false}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        >
          <AdvancedMarker position={center}>
            <Pin background={'#00f0ff'} glyphColor={'#05171d'} borderColor={'#00f0ff'} />
          </AdvancedMarker>
        </Map>
      </APIProvider>
    </div>
  );
};
