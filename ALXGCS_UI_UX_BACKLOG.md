# AIRLOGIX GCS — UI/UX Development Backlog

**Project:** ALXGCS  
**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Ready for Development

---

## 📊 Current State Analysis

### Repository Contents (as of now):
- ✅ `AIRLOGIX_GCS_ARCHITECTURE.md` — Architecture specification
- ✅ `gcs-concept.jsx` — Flight View UI concept (React component)

### What Exists in gcs-concept.jsx:
- ✅ Dark/Light theme toggle
- ✅ Basic telemetry display
- ✅ Attitude Indicator (Artificial Horizon)
- ✅ Compass/Heading Indicator
- ✅ Vertical Speed Indicator
- ✅ Battery indicator
- ✅ Waypoint progress bar
- ✅ Signal indicators
- ✅ Map placeholder with waypoints
- ✅ Mini HUD overlay
- ✅ Quick Actions bar
- ✅ Flight Mode badge
- ✅ System status panel

### What's Missing (To Be Built):
- ❌ Project structure (Tauri + React)
- ❌ Real MAVLink integration
- ❌ Actual map implementation (MapLibre)
- ❌ Plan View (Mission Planning)
- ❌ Configure View (Vehicle Setup)
- ❌ Analyze View (Post-flight)
- ❌ Navigation/Routing
- ❌ State management
- ❌ Data persistence
- ❌ All backend (Rust)

---

## 🎯 Epic Overview

| Epic ID | Epic Name | Priority | Estimated Effort |
|---------|-----------|----------|------------------|
| E-001 | Project Foundation | P0 - Critical | 2 weeks |
| E-002 | Design System | P0 - Critical | 1 week |
| E-003 | Flight View | P0 - Critical | 3 weeks |
| E-004 | Plan View | P1 - High | 3 weeks |
| E-005 | Configure View | P1 - High | 3 weeks |
| E-006 | Analyze View | P2 - Medium | 2 weeks |
| E-007 | Navigation & Layout | P0 - Critical | 1 week |
| E-008 | Settings & Preferences | P2 - Medium | 1 week |
| E-009 | Multi-vehicle Support | P3 - Low | 2 weeks |
| E-010 | Video Integration | P2 - Medium | 2 weeks |
| E-011 | Responsive & Mobile | P3 - Low | 2 weeks |
| E-012 | Accessibility | P2 - Medium | 1 week |

---

## 📋 Detailed Backlog

---

# EPIC E-001: Project Foundation

## US-001: Initialize Tauri + React Project
**Priority:** P0 | **Points:** 5 | **Sprint:** 1

**Description:**
As a developer, I need a properly configured Tauri 2.0 + React + TypeScript project so that I can start building the GCS.

**Acceptance Criteria:**
- [ ] Tauri 2.0 project initialized
- [ ] React 18 with TypeScript configured
- [ ] Vite as build tool
- [ ] pnpm as package manager
- [ ] ESLint + Prettier configured
- [ ] Tailwind CSS installed
- [ ] Hot reload working
- [ ] Build produces working binaries for Windows/Mac/Linux

**Technical Tasks:**
```bash
# Project structure
alxgcs/
├── src-tauri/           # Rust backend
│   ├── src/
│   │   ├── main.rs
│   │   ├── lib.rs
│   │   └── commands/
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/                 # React frontend
│   ├── components/
│   ├── views/
│   ├── hooks/
│   ├── stores/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## US-002: Setup State Management
**Priority:** P0 | **Points:** 3 | **Sprint:** 1

**Description:**
As a developer, I need global state management for vehicle data, UI state, and settings.

**Acceptance Criteria:**
- [ ] Zustand store configured
- [ ] Immer middleware for immutable updates
- [ ] DevTools integration
- [ ] Persist middleware for settings
- [ ] TypeScript types for all stores

**Stores to Create:**
```typescript
// stores/vehicleStore.ts
interface VehicleStore {
  vehicles: Map<string, Vehicle>;
  activeVehicleId: string | null;
  telemetry: VehicleTelemetry;
  // actions
  setActiveVehicle: (id: string) => void;
  updateTelemetry: (data: Partial<VehicleTelemetry>) => void;
}

// stores/missionStore.ts
interface MissionStore {
  missions: Mission[];
  activeMission: Mission | null;
  editingMission: Mission | null;
  // actions
  createMission: () => void;
  addWaypoint: (wp: Waypoint) => void;
  updateWaypoint: (id: string, wp: Partial<Waypoint>) => void;
  deleteWaypoint: (id: string) => void;
}

// stores/uiStore.ts
interface UIStore {
  theme: 'dark' | 'light';
  activeView: ViewType;
  sidebarCollapsed: boolean;
  mapSettings: MapSettings;
  // actions
  toggleTheme: () => void;
  setView: (view: ViewType) => void;
}

// stores/settingsStore.ts
interface SettingsStore {
  units: UnitSystem;
  language: string;
  mapProvider: string;
  // persisted
}
```

---

## US-003: Setup Tauri IPC Bridge
**Priority:** P0 | **Points:** 5 | **Sprint:** 1

**Description:**
As a developer, I need typed IPC commands between React frontend and Rust backend.

**Acceptance Criteria:**
- [ ] Tauri commands defined in Rust
- [ ] TypeScript types generated/matching
- [ ] Event listeners for telemetry stream
- [ ] Error handling wrapper
- [ ] Loading states

**Commands to Implement:**
```rust
// src-tauri/src/commands/mod.rs

#[tauri::command]
async fn connect_vehicle(link_config: LinkConfig) -> Result<VehicleInfo, String>;

#[tauri::command]
async fn disconnect_vehicle(vehicle_id: String) -> Result<(), String>;

#[tauri::command]
async fn send_command(vehicle_id: String, command: MavCommand) -> Result<(), String>;

#[tauri::command]
async fn upload_mission(vehicle_id: String, mission: Mission) -> Result<(), String>;

#[tauri::command]
async fn download_mission(vehicle_id: String) -> Result<Mission, String>;

#[tauri::command]
async fn get_parameters(vehicle_id: String) -> Result<Vec<Parameter>, String>;

#[tauri::command]
async fn set_parameter(vehicle_id: String, name: String, value: f32) -> Result<(), String>;
```

---

## US-004: Setup Testing Infrastructure
**Priority:** P1 | **Points:** 3 | **Sprint:** 1

**Description:**
As a developer, I need testing setup for unit, component, and E2E tests.

**Acceptance Criteria:**
- [ ] Vitest configured for unit tests
- [ ] React Testing Library for components
- [ ] Playwright for E2E
- [ ] Coverage reporting
- [ ] CI pipeline (GitHub Actions)

---

# EPIC E-002: Design System

## US-010: Create Color Tokens
**Priority:** P0 | **Points:** 2 | **Sprint:** 1

**Description:**
As a designer, I need consistent color tokens for both themes.

**Acceptance Criteria:**
- [ ] CSS variables defined
- [ ] Dark theme colors
- [ ] Light theme colors
- [ ] Semantic colors (success, warning, error)
- [ ] Theme switching works

**Implementation:**
```css
/* styles/tokens.css */
:root {
  /* Dark Theme (default) */
  --color-bg-primary: #030508;
  --color-bg-secondary: #0a0f14;
  --color-bg-tertiary: #1a2332;
  --color-bg-elevated: #0d1117;
  
  --color-border: #2a3444;
  --color-border-subtle: #1a2332;
  
  --color-text-primary: #ffffff;
  --color-text-secondary: #8899aa;
  --color-text-muted: #667788;
  
  --color-accent: #00d4ff;
  --color-accent-hover: #00b8e0;
  --color-accent-muted: rgba(0, 212, 255, 0.15);
  
  --color-success: #00ff88;
  --color-success-muted: rgba(0, 255, 136, 0.15);
  
  --color-warning: #ffaa00;
  --color-warning-muted: rgba(255, 170, 0, 0.15);
  
  --color-error: #ff4466;
  --color-error-muted: rgba(255, 68, 102, 0.15);
  
  /* Telemetry specific */
  --color-altitude: #00d4ff;
  --color-speed: #00ff88;
  --color-heading: #ffaa00;
  --color-battery: #8855ff;
}

[data-theme="light"] {
  --color-bg-primary: #f0f4f8;
  --color-bg-secondary: #ffffff;
  --color-bg-tertiary: #e2e8f0;
  --color-bg-elevated: #ffffff;
  
  --color-border: #cbd5e1;
  --color-border-subtle: #e2e8f0;
  
  --color-text-primary: #1e293b;
  --color-text-secondary: #64748b;
  --color-text-muted: #94a3b8;
  
  --color-accent: #0066cc;
  --color-accent-hover: #0052a3;
  
  --color-success: #16a34a;
  --color-warning: #d97706;
  --color-error: #dc2626;
}
```

---

## US-011: Create Typography System
**Priority:** P0 | **Points:** 2 | **Sprint:** 1

**Description:**
As a designer, I need consistent typography across the application.

**Acceptance Criteria:**
- [ ] Font families defined (Inter + JetBrains Mono)
- [ ] Font sizes scale
- [ ] Line heights
- [ ] Font weights
- [ ] Tailwind config updated

**Implementation:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'telemetry-xl': ['2rem', { lineHeight: '1.2', fontWeight: '600' }],
        'telemetry-lg': ['1.5rem', { lineHeight: '1.2', fontWeight: '600' }],
        'telemetry-md': ['1.125rem', { lineHeight: '1.2', fontWeight: '600' }],
        'telemetry-sm': ['0.875rem', { lineHeight: '1.2', fontWeight: '500' }],
        'label': ['0.625rem', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.05em' }],
      }
    }
  }
}
```

---

## US-012: Create Component Library - Base
**Priority:** P0 | **Points:** 5 | **Sprint:** 1-2

**Description:**
As a developer, I need reusable base components.

**Components to Create:**

### Buttons
```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
}
```

### Inputs
```typescript
// components/ui/Input.tsx
// components/ui/Select.tsx
// components/ui/Checkbox.tsx
// components/ui/Switch.tsx
// components/ui/Slider.tsx
// components/ui/NumberInput.tsx
```

### Feedback
```typescript
// components/ui/Badge.tsx
// components/ui/Alert.tsx
// components/ui/Toast.tsx
// components/ui/Progress.tsx
// components/ui/Spinner.tsx
```

### Layout
```typescript
// components/ui/Card.tsx
// components/ui/Panel.tsx
// components/ui/Divider.tsx
// components/ui/Tabs.tsx
// components/ui/Modal.tsx
// components/ui/Dropdown.tsx
```

---

## US-013: Create Telemetry Components
**Priority:** P0 | **Points:** 8 | **Sprint:** 2

**Description:**
As a pilot, I need specialized telemetry display components.

**Components to Create:**

### TelemetryValue
```typescript
// components/telemetry/TelemetryValue.tsx
interface TelemetryValueProps {
  label: string;
  value: number | string;
  unit?: string;
  precision?: number;
  trend?: 'up' | 'down' | 'stable';
  status?: 'normal' | 'warning' | 'critical';
  size?: 'sm' | 'md' | 'lg';
}
```

### TelemetryCard
```typescript
// components/telemetry/TelemetryCard.tsx
interface TelemetryCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  status?: 'normal' | 'warning' | 'critical';
  collapsible?: boolean;
}
```

### AttitudeIndicator
```typescript
// components/instruments/AttitudeIndicator.tsx
interface AttitudeIndicatorProps {
  pitch: number;      // degrees
  roll: number;       // degrees
  size?: number;      // pixels
  showScale?: boolean;
}
```

### CompassIndicator
```typescript
// components/instruments/CompassIndicator.tsx
interface CompassIndicatorProps {
  heading: number;          // degrees
  courseToWaypoint?: number;
  size?: number;
}
```

### VerticalSpeedIndicator
```typescript
// components/instruments/VerticalSpeedIndicator.tsx
interface VSIProps {
  verticalSpeed: number;  // m/s
  maxScale?: number;
  orientation?: 'vertical' | 'horizontal';
}
```

### BatteryIndicator
```typescript
// components/instruments/BatteryIndicator.tsx
interface BatteryIndicatorProps {
  percentage: number;
  voltage: number;
  current: number;
  cellCount?: number;
  showDetails?: boolean;
}
```

### GPSIndicator
```typescript
// components/instruments/GPSIndicator.tsx
interface GPSIndicatorProps {
  fixType: GPSFixType;
  satellites: number;
  hdop: number;
  vdop?: number;
}
```

### SignalStrength
```typescript
// components/instruments/SignalStrength.tsx
interface SignalStrengthProps {
  strength: number;     // 0-100
  label?: string;
  showValue?: boolean;
  bars?: number;
}
```

---

## US-014: Create Map Components
**Priority:** P0 | **Points:** 8 | **Sprint:** 2-3

**Description:**
As a pilot, I need map components for vehicle tracking and mission planning.

**Components to Create:**

### MapContainer
```typescript
// components/map/MapContainer.tsx
interface MapContainerProps {
  center?: [number, number];
  zoom?: number;
  children?: ReactNode;
  onMapClick?: (latlng: LatLng) => void;
  onMapMove?: (bounds: Bounds) => void;
}
```

### VehicleMarker
```typescript
// components/map/VehicleMarker.tsx
interface VehicleMarkerProps {
  position: [number, number];
  heading: number;
  vehicleType: VehicleType;
  isActive?: boolean;
  trail?: [number, number][];
  trailLength?: number;
}
```

### WaypointMarker
```typescript
// components/map/WaypointMarker.tsx
interface WaypointMarkerProps {
  position: [number, number];
  index: number;
  type: WaypointType;
  isActive?: boolean;
  isSelected?: boolean;
  isDraggable?: boolean;
  onDrag?: (newPosition: [number, number]) => void;
  onClick?: () => void;
}
```

### MissionPath
```typescript
// components/map/MissionPath.tsx
interface MissionPathProps {
  waypoints: Waypoint[];
  currentWaypoint?: number;
  showAltitudeProfile?: boolean;
}
```

### GeofenceOverlay
```typescript
// components/map/GeofenceOverlay.tsx
interface GeofenceOverlayProps {
  geofence: Geofence;
  isEditing?: boolean;
  onEdit?: (geofence: Geofence) => void;
}
```

### HomeMarker
```typescript
// components/map/HomeMarker.tsx
interface HomeMarkerProps {
  position: [number, number];
}
```

### MapControls
```typescript
// components/map/MapControls.tsx
// - Zoom buttons
// - Layer selector
// - Center on vehicle
// - Measure tool
// - Screenshot
```

### MapHUD
```typescript
// components/map/MapHUD.tsx
// Overlay showing key telemetry on map
interface MapHUDProps {
  altitude: number;
  speed: number;
  heading: number;
  position?: 'top' | 'bottom';
}
```

---

# EPIC E-003: Flight View

## US-020: Flight View Layout
**Priority:** P0 | **Points:** 5 | **Sprint:** 2

**Description:**
As a pilot, I need the main Flight View layout with all panels.

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────────────┐
│                          HEADER BAR                                  │
├──────────────┬─────────────────────────────────┬────────────────────┤
│              │                                 │                    │
│    LEFT      │                                 │       RIGHT        │
│    PANEL     │          MAP AREA               │       PANEL        │
│              │                                 │                    │
│  (Instruments)│        (Full Map)              │   (Telemetry)      │
│              │                                 │                    │
├──────────────┴─────────────────────────────────┴────────────────────┤
│                         BOTTOM BAR                                   │
└─────────────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Header bar with vehicle info
- [ ] Collapsible left panel (instruments)
- [ ] Main map area
- [ ] Collapsible right panel (telemetry/video)
- [ ] Bottom action bar
- [ ] Panels resizable
- [ ] Layout persisted
- [ ] Keyboard shortcuts working

---

## US-021: Header Bar Component
**Priority:** P0 | **Points:** 3 | **Sprint:** 2

**Description:**
As a pilot, I need a header bar showing vehicle status at a glance.

**Elements:**
- [ ] Hamburger menu (navigation)
- [ ] Vehicle selector dropdown
- [ ] Flight mode badge (editable)
- [ ] Armed status indicator (with toggle)
- [ ] Battery indicator (mini)
- [ ] GPS status (satellites + fix)
- [ ] Link status (signal + latency)
- [ ] Flight time counter
- [ ] Theme toggle
- [ ] Settings button

**Acceptance Criteria:**
- [ ] All elements update in real-time
- [ ] Click on flight mode opens mode selector
- [ ] Click on arm status toggles arm (with confirmation)
- [ ] Battery shows warning colors at thresholds
- [ ] GPS shows red if no fix

---

## US-022: Instrument Panel (Left)
**Priority:** P0 | **Points:** 5 | **Sprint:** 2-3

**Description:**
As a pilot, I need primary flight instruments on the left panel.

**Layout:**
```
┌────────────────────┐
│  Attitude Indicator│
│    (Artificial     │
│     Horizon)       │
├────────────────────┤
│ ┌────────┐ ┌─────┐ │
│ │Compass │ │ VSI │ │
│ └────────┘ └─────┘ │
├────────────────────┤
│    Battery Card    │
├────────────────────┤
│  Waypoint Progress │
├────────────────────┤
│   Speed/Altitude   │
│      Cards         │
├────────────────────┤
│   Wind/Weather     │
└────────────────────┘
```

**Acceptance Criteria:**
- [ ] All instruments animate smoothly
- [ ] Attitude indicator shows pitch/roll
- [ ] Compass shows heading + course
- [ ] VSI shows climb/descent
- [ ] Battery shows % + voltage + current
- [ ] Waypoint progress shows current/total
- [ ] Panel collapsible to icons only

---

## US-023: Telemetry Panel (Right)
**Priority:** P0 | **Points:** 5 | **Sprint:** 2-3

**Description:**
As a pilot, I need detailed telemetry on the right panel.

**Layout:**
```
┌────────────────────┐
│    Video Feed      │
│    (or placeholder)│
├────────────────────┤
│  Primary Telemetry │
│  ┌──────┬───────┐  │
│  │ ALT  │  SPD  │  │
│  │ 847m │72km/h │  │
│  ├──────┼───────┤  │
│  │ VS   │ DIST  │  │
│  │+2.3  │12.8km │  │
│  └──────┴───────┘  │
├────────────────────┤
│  System Status     │
│  ▣ Autopilot OK    │
│  ▣ GPS OK          │
│  ▣ Compass OK      │
│  ▣ Baro OK         │
│  ⚠ EKF Warning     │
├────────────────────┤
│  Warnings/Alerts   │
│  ⚠ High Wind       │
└────────────────────┘
```

**Acceptance Criteria:**
- [ ] Video feed with placeholder
- [ ] Telemetry grid with key values
- [ ] System status checklist
- [ ] Warnings panel (auto-expanding)
- [ ] Values color-coded by status
- [ ] Click to expand details

---

## US-024: Map Integration
**Priority:** P0 | **Points:** 8 | **Sprint:** 3

**Description:**
As a pilot, I need a real map with vehicle position and mission.

**Acceptance Criteria:**
- [ ] MapLibre GL integration
- [ ] Multiple tile providers (satellite, street, terrain)
- [ ] Offline tile support
- [ ] Vehicle marker with heading
- [ ] Flight trail (last N points)
- [ ] Mission path overlay
- [ ] Current waypoint highlighted
- [ ] Home position marker
- [ ] Click-to-fly (sends GUIDED command)
- [ ] Double-click zoom
- [ ] Keyboard navigation (arrows pan)

---

## US-025: Quick Actions Bar
**Priority:** P0 | **Points:** 3 | **Sprint:** 3

**Description:**
As a pilot, I need quick access to common flight commands.

**Actions:**
- [ ] **Pause/Resume** — Loiter in place / Resume mission
- [ ] **RTL** — Return to Launch (with confirmation)
- [ ] **Land** — Land now (with confirmation)
- [ ] **GoTo** — Enter guided mode, click on map
- [ ] **Loiter** — Loiter at current position
- [ ] **Camera** — Toggle camera controls

**Acceptance Criteria:**
- [ ] Clear icons with labels
- [ ] Destructive actions require confirmation
- [ ] Keyboard shortcuts (P, R, L, G)
- [ ] Disabled state when not applicable
- [ ] Feedback on action execution

---

## US-026: HUD Overlay
**Priority:** P1 | **Points:** 3 | **Sprint:** 3

**Description:**
As a pilot, I need key telemetry overlaid on the map.

**Elements:**
- [ ] Altitude (AGL)
- [ ] Speed (ground)
- [ ] Heading
- [ ] Optional: waypoint info

**Acceptance Criteria:**
- [ ] Semi-transparent background
- [ ] Positioned at top center
- [ ] Large, readable fonts
- [ ] Can be toggled off
- [ ] Doesn't obscure vehicle

---

## US-027: Fullscreen Mode
**Priority:** P2 | **Points:** 2 | **Sprint:** 3

**Description:**
As a pilot, I need fullscreen mode for maximum map visibility.

**Acceptance Criteria:**
- [ ] F11 toggles fullscreen
- [ ] Header collapses to minimal
- [ ] Panels auto-hide (show on hover)
- [ ] HUD remains visible
- [ ] Quick actions accessible

---

# EPIC E-004: Plan View (Mission Planning)

## US-030: Plan View Layout
**Priority:** P1 | **Points:** 5 | **Sprint:** 4

**Description:**
As a mission planner, I need a dedicated view for creating missions.

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────────────┐
│  Mission: Recon Alpha  │ ✓ Valid │ 💾 Save │ 📤 Upload │ ⚙ Settings │
├─────────────────┬───────────────────────────────────┬───────────────┤
│  MISSION LIST   │                                   │  PROPERTIES   │
│  ──────────────  │                                   │  ────────────  │
│  ▶ 1. Takeoff   │                                   │               │
│    2. Waypoint  │                                   │  Waypoint 3   │
│    3. Waypoint◀ │          MAP + EDITING            │  ────────────  │
│    4. Survey    │                                   │  Lat: 50.450  │
│    5. RTL       │                                   │  Lon: 30.523  │
│                 │                                   │  Alt: 150m    │
│  + Add Item     │                                   │               │
│  ──────────────  │                                   │  [ Delete ]   │
│  EST: 45min     │                                   │               │
│  DIST: 28.4km   │                                   │               │
├─────────────────┴───────────────────────────────────┴───────────────┤
│  🔧 Tools: [Waypoint] [Survey] [Corridor] [Loiter] [RTL] [Land]     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## US-031: Mission Item List
**Priority:** P1 | **Points:** 5 | **Sprint:** 4

**Description:**
As a mission planner, I need to see and manage all mission items.

**Acceptance Criteria:**
- [ ] List of all items with icons
- [ ] Drag to reorder
- [ ] Click to select (highlights on map)
- [ ] Double-click to edit
- [ ] Right-click context menu
- [ ] Current item highlighted (during flight)
- [ ] Validation indicators per item
- [ ] Keyboard navigation (↑↓)

---

## US-032: Waypoint Editor
**Priority:** P1 | **Points:** 5 | **Sprint:** 4

**Description:**
As a mission planner, I need to edit waypoint properties.

**Fields:**
- [ ] Latitude/Longitude (manual entry + map click)
- [ ] Altitude (MSL/AGL toggle)
- [ ] Hold time
- [ ] Acceptance radius
- [ ] Pass-through vs stop
- [ ] Yaw (optional)

**Acceptance Criteria:**
- [ ] Real-time validation
- [ ] Map preview of changes
- [ ] Terrain elevation shown
- [ ] Copy/paste coordinates
- [ ] Undo/redo

---

## US-033: Survey Pattern Tool
**Priority:** P1 | **Points:** 8 | **Sprint:** 4-5

**Description:**
As a mission planner, I need to create survey patterns.

**Types:**
- [ ] Grid survey
- [ ] Corridor scan
- [ ] Circular pattern
- [ ] Polygon survey

**Parameters:**
- [ ] Altitude
- [ ] Grid spacing (overlap %)
- [ ] Grid angle
- [ ] Overshoot distance
- [ ] Turnaround distance
- [ ] Camera trigger distance
- [ ] Terrain following toggle

**Acceptance Criteria:**
- [ ] Draw polygon on map
- [ ] Preview generated path
- [ ] Estimated duration
- [ ] Adjust parameters with live preview
- [ ] Export as waypoints

---

## US-034: Geofence Editor
**Priority:** P1 | **Points:** 5 | **Sprint:** 5

**Description:**
As a mission planner, I need to define safe flying area.

**Features:**
- [ ] Inclusion zone (must stay inside)
- [ ] Exclusion zones (no-fly areas)
- [ ] Max altitude
- [ ] Max distance from home
- [ ] Breach action selector

**Acceptance Criteria:**
- [ ] Draw polygons on map
- [ ] Edit vertices by dragging
- [ ] Delete zones
- [ ] Visual differentiation (inclusion=green, exclusion=red)
- [ ] Upload to vehicle

---

## US-035: Rally Points Editor
**Priority:** P2 | **Points:** 3 | **Sprint:** 5

**Description:**
As a mission planner, I need to set emergency landing points.

**Acceptance Criteria:**
- [ ] Add rally points on map
- [ ] Set altitude per point
- [ ] Set approach direction (optional)
- [ ] Max 10 points
- [ ] Upload to vehicle

---

## US-036: Terrain Profile
**Priority:** P2 | **Points:** 5 | **Sprint:** 5

**Description:**
As a mission planner, I need to see terrain along the mission path.

**Acceptance Criteria:**
- [ ] Chart showing elevation along path
- [ ] Mission altitude overlay
- [ ] Terrain collision warnings
- [ ] AGL vs MSL toggle
- [ ] Hover to see specific points

---

## US-037: Mission Statistics
**Priority:** P1 | **Points:** 3 | **Sprint:** 4

**Description:**
As a mission planner, I need estimated mission statistics.

**Metrics:**
- [ ] Total distance
- [ ] Estimated duration
- [ ] Max altitude
- [ ] Estimated battery usage
- [ ] Waypoint count

**Acceptance Criteria:**
- [ ] Updates in real-time while editing
- [ ] Warnings if exceeds vehicle limits
- [ ] Based on vehicle performance

---

## US-038: Mission Import/Export
**Priority:** P2 | **Points:** 3 | **Sprint:** 5

**Description:**
As a mission planner, I need to save and load missions.

**Formats:**
- [ ] Native (.alxmission)
- [ ] QGroundControl (.plan)
- [ ] Mission Planner (.waypoints)
- [ ] KML/KMZ
- [ ] GPX

**Acceptance Criteria:**
- [ ] File picker dialogs
- [ ] Validation on import
- [ ] Preserve all parameters

---

# EPIC E-005: Configure View

## US-040: Configure View Layout
**Priority:** P1 | **Points:** 5 | **Sprint:** 6

**Description:**
As a technician, I need to configure vehicle settings.

**Sections (sidebar navigation):**
1. Summary
2. Airframe
3. Sensors
4. Radio
5. Flight Modes
6. Safety
7. Power
8. Motors
9. Parameters

---

## US-041: Summary Dashboard
**Priority:** P1 | **Points:** 3 | **Sprint:** 6

**Description:**
As a technician, I need an overview of vehicle health.

**Elements:**
- [ ] Vehicle name + type + image
- [ ] Firmware version
- [ ] Calibration status checklist
- [ ] Sensor health
- [ ] Last flight stats
- [ ] Quick actions (reboot, factory reset)

---

## US-042: Sensor Calibration Wizards
**Priority:** P1 | **Points:** 8 | **Sprint:** 6-7

**Description:**
As a technician, I need guided sensor calibration.

**Wizards:**
- [ ] Accelerometer calibration (6-position)
- [ ] Compass calibration (rotation)
- [ ] Gyro calibration (stationary)
- [ ] Level horizon
- [ ] Radio calibration

**Acceptance Criteria:**
- [ ] Step-by-step instructions
- [ ] Visual guides (3D model or images)
- [ ] Progress indication
- [ ] Success/failure feedback
- [ ] Retry option

---

## US-043: Radio Calibration
**Priority:** P1 | **Points:** 5 | **Sprint:** 6

**Description:**
As a technician, I need to calibrate RC transmitter.

**Acceptance Criteria:**
- [ ] Channel visualization (8 channels)
- [ ] Min/max calibration wizard
- [ ] Trim adjustment
- [ ] Channel reversal
- [ ] Failsafe configuration

---

## US-044: Flight Modes Configuration
**Priority:** P1 | **Points:** 5 | **Sprint:** 6

**Description:**
As a technician, I need to assign flight modes to RC switch.

**Acceptance Criteria:**
- [ ] 6 flight mode slots
- [ ] Mode dropdown selector
- [ ] RC channel assignment
- [ ] PWM range per mode
- [ ] Live preview (current mode highlighted)
- [ ] Simple/Standard/Advanced mode

---

## US-045: Safety Configuration
**Priority:** P1 | **Points:** 5 | **Sprint:** 7

**Description:**
As a technician, I need to configure safety features.

**Settings:**
- [ ] Geofence enable/action
- [ ] RTL altitude
- [ ] RTL speed
- [ ] Battery failsafe (warn/RTL/land)
- [ ] GCS failsafe
- [ ] RC failsafe
- [ ] EKF failsafe

---

## US-046: Parameter Editor
**Priority:** P1 | **Points:** 8 | **Sprint:** 7

**Description:**
As a technician, I need full access to vehicle parameters.

**Features:**
- [ ] Parameter tree with groups
- [ ] Search/filter
- [ ] Modified indicator
- [ ] Default value reference
- [ ] Min/max validation
- [ ] Description tooltip
- [ ] Refresh from vehicle
- [ ] Write single / Write all
- [ ] Compare with file
- [ ] Load/Save to file

**Acceptance Criteria:**
- [ ] Lazy loading (1000+ params)
- [ ] Change highlighting
- [ ] Undo changes
- [ ] Export modified only

---

## US-047: Motor Test
**Priority:** P2 | **Points:** 3 | **Sprint:** 7

**Description:**
As a technician, I need to test individual motors.

**Acceptance Criteria:**
- [ ] Motor diagram (quad/hex/etc)
- [ ] Test individual motor
- [ ] Adjustable throttle
- [ ] Spin direction verification
- [ ] Safety warnings

---

## US-048: Firmware Update
**Priority:** P2 | **Points:** 5 | **Sprint:** 7

**Description:**
As a technician, I need to update vehicle firmware.

**Acceptance Criteria:**
- [ ] Current version display
- [ ] Available versions list
- [ ] Custom firmware upload
- [ ] Progress indication
- [ ] Verification after flash
- [ ] Backup parameters before

---

# EPIC E-006: Analyze View

## US-050: Analyze View Layout
**Priority:** P2 | **Points:** 3 | **Sprint:** 8

**Description:**
As an analyst, I need to review flight data.

**Sections:**
1. Flight List
2. Flight Replay
3. Graph Builder
4. 3D View
5. Reports

---

## US-051: Flight List
**Priority:** P2 | **Points:** 3 | **Sprint:** 8

**Description:**
As an analyst, I need to browse recorded flights.

**Columns:**
- [ ] Date/Time
- [ ] Vehicle
- [ ] Duration
- [ ] Max altitude
- [ ] Distance
- [ ] Status (complete/crash/etc)

**Acceptance Criteria:**
- [ ] Sortable columns
- [ ] Search/filter
- [ ] Delete with confirmation
- [ ] Export selection

---

## US-052: Flight Replay
**Priority:** P2 | **Points:** 8 | **Sprint:** 8

**Description:**
As an analyst, I need to replay recorded flights.

**Features:**
- [ ] Map with flight path
- [ ] Vehicle position playback
- [ ] Timeline scrubber
- [ ] Play/Pause/Speed controls
- [ ] Synchronized telemetry panel
- [ ] Event markers on timeline

**Acceptance Criteria:**
- [ ] Smooth playback up to 10x
- [ ] Seek to any point
- [ ] Sync with video (if available)

---

## US-053: Graph Builder
**Priority:** P2 | **Points:** 8 | **Sprint:** 8-9

**Description:**
As an analyst, I need custom telemetry graphs.

**Features:**
- [ ] Select any logged value
- [ ] Multiple Y-axes
- [ ] Zoom and pan
- [ ] Cursor with values
- [ ] Export as PNG/CSV

**Acceptance Criteria:**
- [ ] Up to 8 traces
- [ ] Correlation cursor
- [ ] Statistics (min/max/avg)
- [ ] Save graph configuration

---

## US-054: Report Generator
**Priority:** P3 | **Points:** 5 | **Sprint:** 9

**Description:**
As an analyst, I need to generate flight reports.

**Acceptance Criteria:**
- [ ] PDF export
- [ ] Include: summary, map, graphs, events
- [ ] Customizable sections
- [ ] Branding options

---

# EPIC E-007: Navigation & Layout

## US-060: Main Navigation
**Priority:** P0 | **Points:** 3 | **Sprint:** 2

**Description:**
As a user, I need to navigate between main views.

**Views:**
- Flight (default)
- Plan
- Configure
- Analyze
- Settings

**Acceptance Criteria:**
- [ ] Sidebar navigation (collapsible)
- [ ] Icons + labels
- [ ] Active indicator
- [ ] Keyboard shortcuts (1-5)
- [ ] Remember last view

---

## US-061: Notifications System
**Priority:** P1 | **Points:** 5 | **Sprint:** 3

**Description:**
As a user, I need to see important notifications.

**Types:**
- [ ] Info (blue)
- [ ] Success (green)
- [ ] Warning (yellow)
- [ ] Error (red)

**Acceptance Criteria:**
- [ ] Toast notifications
- [ ] Notification center
- [ ] Sound alerts (optional)
- [ ] Persistent critical alerts
- [ ] Click to see details

---

## US-062: Command Palette
**Priority:** P2 | **Points:** 3 | **Sprint:** 5

**Description:**
As a power user, I need quick command access.

**Acceptance Criteria:**
- [ ] Cmd/Ctrl+K to open
- [ ] Search all commands
- [ ] Recent commands
- [ ] Keyboard shortcut hints

---

# EPIC E-008: Settings & Preferences

## US-070: Settings Panel
**Priority:** P2 | **Points:** 5 | **Sprint:** 9

**Description:**
As a user, I need to customize the application.

**Sections:**
- [ ] General (theme, language, units)
- [ ] Map (default provider, cache)
- [ ] Telemetry (update rate, recording)
- [ ] Connections (default ports, baud)
- [ ] Notifications (sounds, alerts)
- [ ] Keyboard shortcuts
- [ ] About

---

## US-071: Unit System
**Priority:** P2 | **Points:** 2 | **Sprint:** 9

**Description:**
As a user, I need to choose measurement units.

**Options:**
- [ ] Metric (m, km/h, °C)
- [ ] Imperial (ft, mph, °F)
- [ ] Custom mix

---

# EPIC E-009: Multi-vehicle Support

## US-080: Vehicle Switcher
**Priority:** P3 | **Points:** 5 | **Sprint:** 10

**Description:**
As a swarm operator, I need to manage multiple vehicles.

**Acceptance Criteria:**
- [ ] Vehicle list in header
- [ ] Quick switch dropdown
- [ ] All vehicles on map
- [ ] Active vehicle highlighted
- [ ] Telemetry for active only (or all)

---

## US-081: Multi-vehicle Map View
**Priority:** P3 | **Points:** 5 | **Sprint:** 10

**Description:**
As a swarm operator, I need to see all vehicles at once.

**Acceptance Criteria:**
- [ ] Different colors per vehicle
- [ ] Labels with vehicle name
- [ ] Click to select
- [ ] Fit all in view button

---

# EPIC E-010: Video Integration

## US-090: Video Panel
**Priority:** P2 | **Points:** 5 | **Sprint:** 9

**Description:**
As a pilot, I need to view video feed.

**Acceptance Criteria:**
- [ ] RTSP stream support
- [ ] Resizable panel
- [ ] Fullscreen mode
- [ ] Recording controls
- [ ] Overlay telemetry (optional)

---

## US-091: Gimbal Control
**Priority:** P2 | **Points:** 5 | **Sprint:** 10

**Description:**
As a pilot, I need to control the camera gimbal.

**Acceptance Criteria:**
- [ ] Pan/Tilt sliders
- [ ] Keyboard control (arrow keys)
- [ ] Click on video to point
- [ ] Presets (forward, down, home)

---

# EPIC E-011: Responsive & Mobile

## US-100: Tablet Layout
**Priority:** P3 | **Points:** 8 | **Sprint:** 11

**Description:**
As a field operator, I need tablet-friendly layout.

**Acceptance Criteria:**
- [ ] Larger touch targets (44px min)
- [ ] Collapsing panels
- [ ] Bottom navigation option
- [ ] Gesture support (pinch zoom)

---

## US-101: Landscape/Portrait Support
**Priority:** P3 | **Points:** 3 | **Sprint:** 11

**Description:**
As a tablet user, I need both orientations.

**Acceptance Criteria:**
- [ ] Layout adapts to orientation
- [ ] Panels reflow appropriately

---

# EPIC E-012: Accessibility

## US-110: Keyboard Navigation
**Priority:** P2 | **Points:** 5 | **Sprint:** 10

**Description:**
As a keyboard user, I need full keyboard access.

**Acceptance Criteria:**
- [ ] All interactive elements focusable
- [ ] Visible focus indicators
- [ ] Logical tab order
- [ ] Skip links
- [ ] Shortcut reference (?)

---

## US-111: Screen Reader Support
**Priority:** P3 | **Points:** 5 | **Sprint:** 11

**Description:**
As a visually impaired user, I need screen reader support.

**Acceptance Criteria:**
- [ ] ARIA labels on all controls
- [ ] Live regions for updates
- [ ] Meaningful alt text
- [ ] Heading structure

---

## US-112: High Contrast Mode
**Priority:** P3 | **Points:** 2 | **Sprint:** 11

**Description:**
As a user with low vision, I need high contrast option.

**Acceptance Criteria:**
- [ ] Toggle in settings
- [ ] Increased contrast ratios
- [ ] Visible borders on all elements

---

# 📊 Sprint Planning Suggestion

## Sprint 1 (Week 1-2): Foundation
- US-001: Project setup
- US-002: State management
- US-010: Color tokens
- US-011: Typography
- US-060: Main navigation

## Sprint 2 (Week 3-4): Base Components
- US-012: Component library base
- US-020: Flight View layout
- US-021: Header bar

## Sprint 3 (Week 5-6): Flight Instruments
- US-013: Telemetry components
- US-022: Instrument panel
- US-023: Telemetry panel
- US-025: Quick actions

## Sprint 4 (Week 7-8): Map & Mission
- US-014: Map components
- US-024: Map integration
- US-030: Plan View layout
- US-031: Mission item list

## Sprint 5 (Week 9-10): Mission Planning
- US-032: Waypoint editor
- US-033: Survey pattern tool
- US-037: Mission statistics
- US-003: Tauri IPC bridge

## Sprint 6 (Week 11-12): Configuration
- US-040: Configure View layout
- US-041: Summary dashboard
- US-042: Sensor calibration
- US-044: Flight modes

## Sprint 7 (Week 13-14): Advanced Config
- US-045: Safety configuration
- US-046: Parameter editor
- US-034: Geofence editor

## Sprint 8 (Week 15-16): Analysis
- US-050: Analyze View
- US-051: Flight list
- US-052: Flight replay
- US-053: Graph builder

## Sprint 9 (Week 17-18): Polish
- US-061: Notifications
- US-070: Settings
- US-090: Video panel
- US-026: HUD overlay

## Sprint 10 (Week 19-20): Advanced Features
- US-080: Multi-vehicle
- US-091: Gimbal control
- US-110: Keyboard navigation

---

# 📈 Progress Tracking

## Metrics to Track
- Story points completed per sprint
- Bug count (by severity)
- Test coverage %
- Build time
- Bundle size

## Definition of Done
- [ ] Code complete
- [ ] Unit tests written (>80% coverage)
- [ ] Component documented in Storybook
- [ ] Reviewed by peer
- [ ] Tested on all platforms
- [ ] No P1/P2 bugs
- [ ] Accessibility checked

---

**Document Version:** 1.0  
**Created:** January 2026  
**Author:** Claude  
**Status:** Ready for Development
