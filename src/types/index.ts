// Theme types
export type Theme = 'dark' | 'light';

// Vehicle types based on architecture spec
export type VehicleType = 'FixedWing' | 'MultiRotor' | 'VTOL' | 'Rover';

export type AutopilotType =
  | { type: 'ArduPilot'; version: string }
  | { type: 'PX4'; version: string }
  | { type: 'SKYWARD'; version: string };

export type GpsFixType = 'NoFix' | 'Fix2D' | 'Fix3D' | 'DGps' | 'RtkFloat' | 'RtkFixed';

export type FlightMode =
  | 'MANUAL'
  | 'STABILIZE'
  | 'ACRO'
  | 'FBWA'
  | 'FBWB'
  | 'CRUISE'
  | 'AUTO'
  | 'RTL'
  | 'LOITER'
  | 'GUIDED'
  | 'LAND'
  | 'TAKEOFF'
  | 'QSTABILIZE'
  | 'QHOVER'
  | 'QLOITER'
  | 'QLAND';

// Vehicle state
export interface VehicleState {
  // Position
  latitude: number;
  longitude: number;
  altitudeMsl: number;
  altitudeAgl: number;
  // Velocity
  groundSpeed: number;
  airSpeed: number;
  verticalSpeed: number;
  // Attitude
  roll: number;
  pitch: number;
  yaw: number;
  heading: number;
  // Navigation
  flightMode: FlightMode;
  armed: boolean;
  gpsFix: GpsFixType;
  satellites: number;
  // Power
  batteryVoltage: number;
  batteryCurrent: number;
  batteryRemaining: number;
  batteryMahUsed: number;
  // Throttle
  throttle: number;
}

// Vehicle info
export interface Vehicle {
  id: string;
  systemId: number;
  name: string;
  vehicleType: VehicleType;
  autopilot: AutopilotType;
  state: VehicleState;
}

// Telemetry data for UI
export interface TelemetryData {
  altitude: number;
  speed: number;
  heading: number;
  battery: number;
  signalStrength: number;
  gpsCount: number;
  flightMode: FlightMode;
  armed: boolean;
  latitude: number;
  longitude: number;
  verticalSpeed: number;
  groundSpeed: number;
  airSpeed: number;
  throttle: number;
  pitch: number;
  roll: number;
  yaw: number;
  voltage: number;
  current: number;
  mah: number;
  distance: number;
  homeDistance: number;
  eta: string;
  flightTime: string;
  nextWaypoint: number;
  totalWaypoints: number;
  distanceToWaypoint: number;
  windSpeed: number;
  windDir: number;
  temperature: number;
}

// Mission types
export interface Waypoint {
  id: number;
  latitude: number;
  longitude: number;
  altitude: number;
  type: MissionItemType;
}

export type MissionItemType =
  | 'Waypoint'
  | 'Loiter'
  | 'ReturnToLaunch'
  | 'Land'
  | 'Takeoff'
  | 'Survey'
  | 'Corridor';

export interface Mission {
  id: string;
  name: string;
  items: Waypoint[];
  createdAt: Date;
  updatedAt: Date;
}

// Link types
export type LinkType =
  | { type: 'Serial'; port: string; baud: number }
  | { type: 'UdpClient'; host: string; port: number }
  | { type: 'UdpServer'; bind: string; port: number }
  | { type: 'TcpClient'; host: string; port: number }
  | { type: 'Bluetooth'; address: string };

export interface LinkStats {
  bytesSent: number;
  bytesReceived: number;
  packetLossPercent: number;
  latencyMs: number;
}

export interface Link {
  id: string;
  name: string;
  linkType: LinkType;
  connected: boolean;
  stats: LinkStats;
}

// System status
export type SystemStatus = 'ok' | 'warning' | 'critical' | 'unknown';

export interface SystemHealth {
  autopilot: SystemStatus;
  gps: SystemStatus;
  compass: SystemStatus;
  barometer: SystemStatus;
  ekf: SystemStatus;
  gyro: SystemStatus;
  accel: SystemStatus;
  mag: SystemStatus;
}

// View types
export type ViewType = 'flight' | 'plan' | 'configure' | 'analyze' | 'admin';

// Component props
export interface ThemeProps {
  theme: Theme;
}

export interface TelemetryCardStatus {
  good: string;
  warning: string;
  critical: string;
}
