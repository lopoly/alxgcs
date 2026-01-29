import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UnitSystem = 'metric' | 'imperial';

export type SpeedUnit = 'm/s' | 'km/h' | 'mph' | 'kts';
export type AltitudeUnit = 'm' | 'ft';
export type DistanceUnit = 'm' | 'km' | 'mi' | 'nm';
export type TemperatureUnit = 'C' | 'F';

interface UnitPreferences {
  speed: SpeedUnit;
  altitude: AltitudeUnit;
  distance: DistanceUnit;
  temperature: TemperatureUnit;
}

interface UnitState {
  unitSystem: UnitSystem;
  preferences: UnitPreferences;
  setUnitSystem: (system: UnitSystem) => void;
  setSpeedUnit: (unit: SpeedUnit) => void;
  setAltitudeUnit: (unit: AltitudeUnit) => void;
  setDistanceUnit: (unit: DistanceUnit) => void;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
}

const metricDefaults: UnitPreferences = {
  speed: 'm/s',
  altitude: 'm',
  distance: 'm',
  temperature: 'C',
};

const imperialDefaults: UnitPreferences = {
  speed: 'mph',
  altitude: 'ft',
  distance: 'mi',
  temperature: 'F',
};

export const useUnitStore = create<UnitState>()(
  persist(
    (set) => ({
      unitSystem: 'metric',
      preferences: metricDefaults,
      setUnitSystem: (system) =>
        set({
          unitSystem: system,
          preferences: system === 'metric' ? metricDefaults : imperialDefaults,
        }),
      setSpeedUnit: (unit) =>
        set((state) => ({
          preferences: { ...state.preferences, speed: unit },
        })),
      setAltitudeUnit: (unit) =>
        set((state) => ({
          preferences: { ...state.preferences, altitude: unit },
        })),
      setDistanceUnit: (unit) =>
        set((state) => ({
          preferences: { ...state.preferences, distance: unit },
        })),
      setTemperatureUnit: (unit) =>
        set((state) => ({
          preferences: { ...state.preferences, temperature: unit },
        })),
    }),
    {
      name: 'airlogix-units',
    }
  )
);

// Conversion utilities
export const convertSpeed = (value: number, from: SpeedUnit, to: SpeedUnit): number => {
  // Convert to m/s first
  const toMs: Record<SpeedUnit, number> = {
    'm/s': 1,
    'km/h': 1 / 3.6,
    'mph': 0.44704,
    'kts': 0.514444,
  };

  // Convert from m/s to target
  const fromMs: Record<SpeedUnit, number> = {
    'm/s': 1,
    'km/h': 3.6,
    'mph': 2.23694,
    'kts': 1.94384,
  };

  const msValue = value * toMs[from];
  return msValue * fromMs[to];
};

export const convertAltitude = (value: number, from: AltitudeUnit, to: AltitudeUnit): number => {
  if (from === to) return value;
  if (from === 'm' && to === 'ft') return value * 3.28084;
  if (from === 'ft' && to === 'm') return value / 3.28084;
  return value;
};

export const convertDistance = (value: number, from: DistanceUnit, to: DistanceUnit): number => {
  // Convert to meters first
  const toM: Record<DistanceUnit, number> = {
    'm': 1,
    'km': 1000,
    'mi': 1609.344,
    'nm': 1852,
  };

  // Convert from meters to target
  const fromM: Record<DistanceUnit, number> = {
    'm': 1,
    'km': 0.001,
    'mi': 0.000621371,
    'nm': 0.000539957,
  };

  const mValue = value * toM[from];
  return mValue * fromM[to];
};

export const convertTemperature = (value: number, from: TemperatureUnit, to: TemperatureUnit): number => {
  if (from === to) return value;
  if (from === 'C' && to === 'F') return (value * 9/5) + 32;
  if (from === 'F' && to === 'C') return (value - 32) * 5/9;
  return value;
};

// Format value with unit
export const formatWithUnit = (value: number, unit: string, decimals: number = 1): string => {
  return `${value.toFixed(decimals)} ${unit}`;
};
