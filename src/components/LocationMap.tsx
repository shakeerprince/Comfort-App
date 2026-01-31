'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationMapProps {
    myLocation: { lat: number; lng: number } | null;
    partnerLocation: { lat: number; lng: number } | null;
    myName: string;
    partnerName: string;
}

export default function LocationMap({ myLocation, partnerLocation, myName, partnerName }: LocationMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const myMarkerRef = useRef<L.Marker | null>(null);
    const partnerMarkerRef = useRef<L.Marker | null>(null);
    const lineRef = useRef<L.Polyline | null>(null);

    const capitalize = (s: string | null | undefined) => {
        if (!s) return 'User';
        return s.charAt(0).toUpperCase() + s.slice(1);
    };

    // Create custom icons
    const createIcon = (emoji: string, color: string) => {
        return L.divIcon({
            html: `
        <div style="
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${color}, ${color}dd);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: 3px solid white;
        ">
          ${emoji}
        </div>
      `,
            className: 'custom-marker',
            iconSize: [48, 48],
            iconAnchor: [24, 24],
        });
    };

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Default center (India)
        const defaultCenter: L.LatLngExpression = [20.5937, 78.9629];

        mapInstanceRef.current = L.map(mapRef.current, {
            center: defaultCenter,
            zoom: 5,
            zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
        }).addTo(mapInstanceRef.current);

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Update markers when locations change
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        const map = mapInstanceRef.current;
        // Generic emojis based on role or fallback
        const myEmoji = '👤';
        const partnerEmoji = '❤️';

        const myColor = '#60a5fa'; // Blue
        const partnerColor = '#f472b6'; // Pink

        // Update my marker
        if (myLocation) {
            if (myMarkerRef.current) {
                myMarkerRef.current.setLatLng([myLocation.lat, myLocation.lng]);
            } else {
                myMarkerRef.current = L.marker([myLocation.lat, myLocation.lng], {
                    icon: createIcon(myEmoji, myColor),
                })
                    .addTo(map)
                    .bindPopup(`<b>You (${capitalize(myName)})</b>`);
            }
        }

        // Update partner marker
        if (partnerLocation) {
            if (partnerMarkerRef.current) {
                partnerMarkerRef.current.setLatLng([partnerLocation.lat, partnerLocation.lng]);
            } else {
                partnerMarkerRef.current = L.marker([partnerLocation.lat, partnerLocation.lng], {
                    icon: createIcon(partnerEmoji, partnerColor),
                })
                    .addTo(map)
                    .bindPopup(`<b>${capitalize(partnerName)}</b>`);
            }
        }

        // Draw line between both if both exist
        if (myLocation && partnerLocation) {
            if (lineRef.current) {
                lineRef.current.setLatLngs([
                    [myLocation.lat, myLocation.lng],
                    [partnerLocation.lat, partnerLocation.lng],
                ]);
            } else {
                lineRef.current = L.polyline(
                    [
                        [myLocation.lat, myLocation.lng],
                        [partnerLocation.lat, partnerLocation.lng],
                    ],
                    {
                        color: '#f472b6',
                        weight: 3,
                        opacity: 0.7,
                        dashArray: '10, 10',
                    }
                ).addTo(map);
            }

            // Fit bounds to show both markers
            const bounds = L.latLngBounds(
                [myLocation.lat, myLocation.lng],
                [partnerLocation.lat, partnerLocation.lng]
            );
            map.fitBounds(bounds, { padding: [50, 50] });
        } else if (myLocation) {
            map.setView([myLocation.lat, myLocation.lng], 15);
        } else if (partnerLocation) {
            map.setView([partnerLocation.lat, partnerLocation.lng], 15);
        }
    }, [myLocation, partnerLocation, myName, partnerName]);

    return (
        <div
            ref={mapRef}
            className="h-[400px] rounded-xl overflow-hidden"
            style={{ zIndex: 0 }}
        />
    );
}
