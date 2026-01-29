import { useState, useEffect, useCallback } from 'react';
import type { TelemetryData, FlightMode, ConnectionStatus } from '@/types';

// Default telemetry values when disconnected (all zeroed/null state)
const disconnectedTelemetry: TelemetryData = {
  altitude: 0,
  speed: 0,
  heading: 0,
  battery: 0,
  signalStrength: 0,
  gpsCount: 0,
  flightMode: 'MANUAL' as FlightMode,
  armed: false,
  latitude: 0,
  longitude: 0,
  verticalSpeed: 0,
  groundSpeed: 0,
  airSpeed: 0,
  throttle: 0,
  pitch: 0,
  roll: 0,
  yaw: 0,
  voltage: 0,
  current: 0,
  mah: 0,
  distance: 0,
  homeDistance: 0,
  eta: '--:--:--',
  flightTime: '00:00:00',
  nextWaypoint: 0,
  totalWaypoints: 0,
  distanceToWaypoint: 0,
  windSpeed: 0,
  windDir: 0,
  temperature: 0,
};

// Mock telemetry for demo mode
const demoTelemetry: TelemetryData = {
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
  distanceToWaypoint: 1420,
  windSpeed: 8,
  windDir: 245,
  temperature: -12,
};

export interface UseTelemetryResult {
  data: TelemetryData;
  connectionStatus: ConnectionStatus;
  isDemo: boolean;
  enableDemo: () => void;
  disableDemo: () => void;
}

export function useTelemetry(): UseTelemetryResult {
  const [connectionStatus] = useState<ConnectionStatus>('disconnected');
  const [isDemo, setIsDemo] = useState(false);
  const [data, setData] = useState<TelemetryData>(disconnectedTelemetry);

  const enableDemo = useCallback(() => {
    setIsDemo(true);
    setData(demoTelemetry);
  }, []);

  const disableDemo = useCallback(() => {
    setIsDemo(false);
    setData(disconnectedTelemetry);
  }, []);

  // Simulate telemetry updates only in demo mode
  useEffect(() => {
    if (!isDemo) return;

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
        distanceToWaypoint: Math.max(0, prev.distanceToWaypoint - prev.speed * 0.1 / 3.6),
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [isDemo]);

  return {
    data,
    connectionStatus: isDemo ? 'connected' : connectionStatus,
    isDemo,
    enableDemo,
    disableDemo,
  };
}
