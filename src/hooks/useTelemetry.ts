import { useState, useEffect } from 'react';
import type { TelemetryData, FlightMode } from '@/types';

const initialTelemetry: TelemetryData = {
  altitude: 847,
  speed: 72,
  heading: 127,
  battery: 78,
  signalStrength: 92,
  gpsCount: 14,
  flightMode: 'AUTO' as FlightMode,
  armed: true,
  latitude: 50.4501,
  longitude: 30.5234,
  verticalSpeed: 2.3,
  groundSpeed: 68,
  airSpeed: 72,
  throttle: 45,
  pitch: -3.2,
  roll: 1.8,
  yaw: 127,
  voltage: 24.8,
  current: 12.4,
  mah: 3420,
  distance: 12847,
  homeDistance: 4230,
  eta: '00:18:42',
  flightTime: '00:41:18',
  nextWaypoint: 7,
  totalWaypoints: 12,
  windSpeed: 8,
  windDir: 245,
  temperature: -12,
};

export function useTelemetry(): TelemetryData {
  const [data, setData] = useState<TelemetryData>(initialTelemetry);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => ({
        ...prev,
        altitude: prev.altitude + (Math.random() - 0.5) * 5,
        speed: Math.max(0, prev.speed + (Math.random() - 0.5) * 3),
        heading: (prev.heading + (Math.random() - 0.5) * 2 + 360) % 360,
        battery: Math.max(0, prev.battery - 0.01),
        verticalSpeed: (Math.random() - 0.5) * 4,
        pitch: (Math.random() - 0.5) * 8,
        roll: (Math.random() - 0.5) * 5,
        current: 10 + Math.random() * 5,
        throttle: 40 + Math.random() * 20,
      }));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return data;
}
