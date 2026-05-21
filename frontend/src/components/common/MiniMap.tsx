import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = { width: '100%', height: '180px', borderRadius: '0.625rem' };

interface Props {
  latitude: number;
  longitude: number;
}

export default function MiniMap({ latitude, longitude }: Props) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  if (loadError || !isLoaded || !latitude || !longitude) {
    return (
      <div className="h-[120px] bg-surface-secondary rounded-xl flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-200">
        {latitude && longitude
          ? `${latitude}, ${longitude}`
          : 'No location data'}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{ lat: latitude, lng: longitude }}
        zoom={15}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          draggable: false,
          zoomControl: true,
        }}
      >
        <Marker position={{ lat: latitude, lng: longitude }} />
      </GoogleMap>
    </div>
  );
}
