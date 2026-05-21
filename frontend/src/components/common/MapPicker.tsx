import { useCallback, useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { motion } from 'framer-motion';

const containerStyle = { width: '100%', height: '250px', borderRadius: '0.625rem' };
const defaultCenter = { lat: 8.5694, lng: 81.2300 }; // Trincomalee

interface Props {
  latitude: string;
  longitude: string;
  onLocationChange: (lat: string, lng: string) => void;
}

export default function MapPicker({ latitude, longitude, onLocationChange }: Props) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const center = (latitude && longitude)
    ? { lat: parseFloat(latitude), lng: parseFloat(longitude) }
    : defaultCenter;

  const onClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      onLocationChange(e.latLng.lat().toFixed(6), e.latLng.lng().toFixed(6));
    }
  }, [onLocationChange]);

  if (loadError) {
    return (
      <div className="h-[200px] bg-surface-secondary rounded-xl flex items-center justify-center text-sm text-gray-400 border border-dashed border-gray-200">
        Map unavailable — enter coordinates manually
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="h-[200px] bg-surface-secondary rounded-xl flex items-center justify-center text-sm text-gray-400"
      >
        Loading map...
      </motion.div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        onClick={onClick}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {latitude && longitude && (
          <Marker
            position={{ lat: parseFloat(latitude), lng: parseFloat(longitude) }}
            draggable
            onDragEnd={(e) => {
              if (e.latLng) {
                onLocationChange(e.latLng.lat().toFixed(6), e.latLng.lng().toFixed(6));
              }
            }}
          />
        )}
      </GoogleMap>
      <p className="text-[11px] text-gray-400 px-3 py-1.5 bg-surface-secondary border-t border-gray-100">
        Click on the map or drag the marker to set the exact location
      </p>
    </div>
  );
}
