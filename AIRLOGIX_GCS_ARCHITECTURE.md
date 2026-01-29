# AIRLOGIX GCS — System Architecture Specification v1.0

**Document ID:** ALX-GCS-ARCH-001 | **Date:** January 2026 | **Status:** APPROVED FOR DEVELOPMENT

---

## 1. EXECUTIVE SUMMARY

### 1.1 Vision
AIRLOGIX GCS — next-generation Ground Control Station replacing Mission Planner and QGroundControl with a modern, secure platform for professional UAV operations.

### 1.2 Competitive Analysis

| Capability | Mission Planner | QGroundControl | AIRLOGIX GCS |
|------------|-----------------|----------------|--------------|
| Platform | Windows only | Cross-platform | Cross-platform + Web |
| Technology | C#/WinForms (2010) | Qt/C++ (2015) | **Tauri/Rust/React (2025)** |
| Offline Maps | Basic caching | Good | **Vector tiles + First-class** |
| Encryption | None | TLS only | **E2E + Link encryption** |
| Plugin System | Python scripts | QML plugins | **WASM sandboxed** |
| Multi-vehicle | Limited | Good | **Swarm-native** |
| Config UI | Comprehensive | Basic | **Full + Validation** |
| Binary Size | ~150MB | ~200MB | **~50MB** |
| Memory | ~500MB | ~400MB | **~150MB** |

### 1.3 Key Differentiators
- **Rust Backend:** Memory-safe, zero-cost abstractions
- **React Frontend:** Modern component architecture
- **WASM Plugins:** Secure sandboxed extensions
- **Vector Maps:** Smooth at any zoom, minimal storage
- **Link Encryption:** AES-256-GCM on data links
- **SKYWARD Native:** GPS-denied operation awareness

### 1.4 Best Features Inherited

**From Mission Planner:**
- Comprehensive parameter editor with grouping/search
- Detailed sensor calibration wizards
- Advanced survey patterns (grid, corridor, polygon)
- Full firmware update capability
- Motor test interface

**From QGroundControl:**
- Clean, modern UI design
- Cross-platform from day one
- Smooth map interaction
- Video streaming integration
- Vehicle setup wizards

---

## 2. SYSTEM ARCHITECTURE

### 2.1 High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                             │
│   Flight View │ Mission Planner │ Configure │ Analyze │ Admin      │
├─────────────────────────────────────────────────────────────────────┤
│                        UI FRAMEWORK                                 │
│          React 18 + TypeScript + Zustand + TanStack Query          │
├─────────────────────────────────────────────────────────────────────┤
│                        TAURI BRIDGE                                 │
│            IPC Commands │ Events │ State Sync │ File I/O           │
├─────────────────────────────────────────────────────────────────────┤
│                      APPLICATION CORE                               │
│   Vehicle Manager │ Mission Engine │ Telemetry │ Maps │ Plugins    │
├─────────────────────────────────────────────────────────────────────┤
│                    COMMUNICATION LAYER                              │
│   MAVLink Codec │ Link Manager │ Crypto │ Serial │ UDP │ TCP       │
├─────────────────────────────────────────────────────────────────────┤
│                      PLATFORM LAYER                                 │
│              Tauri Runtime │ OS APIs │ Hardware Access              │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

**Backend (Rust):**
| Component | Technology |
|-----------|------------|
| Runtime | Tauri 2.0 |
| Async | Tokio |
| MAVLink | mavlink-rs + custom |
| Serialization | serde + bincode |
| Database | SQLite + rusqlite |
| Crypto | ring + rustls |
| Serial | serialport-rs |
| Concurrency | DashMap + crossbeam |

**Frontend (TypeScript/React):**
| Component | Technology |
|-----------|------------|
| Framework | React 18 |
| State | Zustand + Immer |
| Data | TanStack Query v5 |
| Maps | MapLibre GL JS |
| Charts | Recharts + D3 |
| Styling | Tailwind + Radix UI |
| Build | Vite |

### 2.3 Core Modules

#### 2.3.1 Vehicle Manager
```rust
pub struct VehicleManager {
    vehicles: DashMap<VehicleId, Vehicle>,
    active_vehicle: AtomicU32,
    event_tx: broadcast::Sender<VehicleEvent>,
}

pub struct Vehicle {
    pub id: VehicleId,
    pub system_id: u8,
    pub vehicle_type: VehicleType,
    pub autopilot: AutopilotType,
    pub state: RwLock<VehicleState>,
    pub parameters: Arc<ParameterCache>,
    pub capabilities: VehicleCapabilities,
}

pub struct VehicleState {
    // Position
    pub latitude: f64, pub longitude: f64,
    pub altitude_msl: f32, pub altitude_agl: f32,
    // Velocity
    pub ground_speed: f32, pub air_speed: f32, pub vertical_speed: f32,
    // Attitude
    pub roll: f32, pub pitch: f32, pub yaw: f32, pub heading: f32,
    // Navigation
    pub flight_mode: FlightMode, pub armed: bool,
    pub gps_fix: GpsFixType, pub satellites: u8,
    // Power
    pub battery_voltage: f32, pub battery_remaining: u8,
}

pub enum VehicleType {
    FixedWing, MultiRotor, VTOL, Rover,
}

pub enum AutopilotType {
    ArduPilot { version: String },
    PX4 { version: String },
    SKYWARD { version: String },
}
```

#### 2.3.2 Mission Engine
```rust
pub struct MissionEngine {
    missions: DashMap<MissionId, Mission>,
    planner: Arc<PathPlanner>,
    validator: Arc<MissionValidator>,
    terrain_db: Arc<TerrainDatabase>,
}

pub struct Mission {
    pub id: MissionId,
    pub name: String,
    pub items: Vec<MissionItem>,
    pub geofence: Option<Geofence>,
    pub rally_points: Vec<RallyPoint>,
}

pub enum MissionItem {
    Waypoint(WaypointItem),
    Loiter(LoiterItem),
    ReturnToLaunch,
    Land(LandItem),
    Takeoff(TakeoffItem),
    Survey(SurveyPattern),
    Corridor(CorridorPattern),
    DoChangeSpeed(SpeedItem),
    DoSetServo(ServoItem),
}

pub struct SurveyPattern {
    pub polygon: Vec<(f64, f64)>,
    pub altitude: f32,
    pub grid_spacing: f32,
    pub grid_angle: f32,
    pub terrain_follow: bool,
}

pub struct Geofence {
    pub action: GeofenceAction,
    pub max_altitude: f32,
    pub inclusion_zones: Vec<GeoPolygon>,
    pub exclusion_zones: Vec<GeoPolygon>,
}
```

#### 2.3.3 Telemetry Recorder
```rust
pub struct TelemetryRecorder {
    sessions: DashMap<SessionId, RecordingSession>,
    storage: Arc<TelemetryStorage>,
}

// File format: ALXT (Airlogix Telemetry)
pub struct TelemetryHeader {
    pub magic: [u8; 4],        // "ALXT"
    pub version: u16,
    pub vehicle_uuid: [u8; 16],
    pub start_time: i64,
    pub frame_count: u64,
    pub index_offset: u64,
}

pub struct TelemetryFrame {
    pub timestamp_offset_us: u32,
    pub message_id: u16,
    pub payload_len: u16,
    // payload follows
}
```

**Features:** Auto start/stop on arm/disarm, LZ4 compression (10:1), indexed seeking, export to tlog/ulog/CSV.

#### 2.3.4 Map Service
```rust
pub struct MapService {
    tile_cache: Arc<TileCache>,
    terrain_db: Arc<TerrainDatabase>,
    airspace_db: Arc<AirspaceDatabase>,
}

impl TerrainDatabase {
    pub fn get_elevation(&self, lat: f64, lon: f64) -> Option<f32>;
    pub fn get_elevation_path(&self, path: &[(f64, f64)]) -> Vec<f32>;
}
```

**Features:** Vector tiles via MapLibre, offline download, SRTM terrain, airspace visualization.

#### 2.3.5 Link Manager
```rust
pub struct LinkManager {
    links: DashMap<LinkId, Arc<dyn Link>>,
    router: Arc<MessageRouter>,
    crypto: Option<Arc<CryptoEngine>>,
}

pub enum LinkType {
    Serial { port: String, baud: u32 },
    UdpClient { host: String, port: u16 },
    UdpServer { bind: String, port: u16 },
    TcpClient { host: String, port: u16 },
    Bluetooth { address: String },
}

pub struct LinkStats {
    pub bytes_sent: u64,
    pub bytes_received: u64,
    pub packet_loss_percent: f32,
    pub latency_ms: f32,
}
```

**Features:** Auto port detection, multiple links, AES-256-GCM encryption, MAVLink signing.

#### 2.3.6 Plugin Host
```rust
pub struct PluginHost {
    runtime: wasmtime::Engine,
    plugins: DashMap<PluginId, LoadedPlugin>,
}

pub struct PluginPermissions {
    pub can_read_telemetry: bool,
    pub can_send_commands: bool,
    pub can_modify_mission: bool,
    pub can_access_network: bool,
}
```

**Features:** WASM sandboxing, granular permissions, hot-reload, React UI injection.

---

## 3. USER INTERFACE

### 3.1 Design System

**Dark Theme (Field):**
| Token | Value |
|-------|-------|
| bg-primary | #030508 |
| bg-secondary | #0a0f14 |
| accent | #00d4ff |
| success | #00ff88 |
| warning | #ffaa00 |
| error | #ff4466 |

**Light Theme (Office):**
| Token | Value |
|-------|-------|
| bg-primary | #f0f4f8 |
| bg-secondary | #ffffff |
| accent | #0066cc |
| success | #16a34a |
| warning | #d97706 |
| error | #dc2626 |

### 3.2 Main Views

#### Flight View
```
┌──────────────────────────────────────────────────────────────────────┐
│ [≡] GOR-01 ▾ │ AUTO │ ● ARMED │ ████ 78% │ 🛰14 │ 📶92% │ 00:41:18 │
├──────────────┬────────────────────────────────────┬──────────────────┤
│              │                                    │                  │
│ ┌──────────┐ │                                    │ ┌──────────────┐ │
│ │ Attitude │ │                                    │ │ Video Feed   │ │
│ │Indicator │ │                                    │ └──────────────┘ │
│ └──────────┘ │          MAP VIEW                  │                  │
│              │      ┌───────────────┐             │  ALT    847 m    │
│ ┌──────────┐ │      │ALT│SPD│HDG    │             │  SPD    72 km/h  │
│ │ Compass  │ │      └───────────────┘             │  VS    +2.3 m/s  │
│ └──────────┘ │            ✈                       │                  │
│              │       ┌─────────┐                  │  DIST  12.8 km   │
│    ┌───┐     │       │ WP 7/12 │                  │  HOME   4.2 km   │
│    │VSI│     │       └─────────┘                  │                  │
│    └───┘     │                                    │  ▣ System OK     │
├──────────────┴────────────────────────────────────┴──────────────────┤
│   ⏸ Pause  │  🏠 RTL  │  🎯 Loiter  │  📍 GoTo  │  📷 Camera       │
└──────────────────────────────────────────────────────────────────────┘
```

**Elements:**
- Header: Vehicle, mode, arm, battery, GPS, signal, time
- Left: Attitude indicator, compass, VSI
- Center: Map + HUD overlay
- Right: Video, telemetry cards
- Bottom: Quick actions

#### Plan View
- Mission item list (drag to reorder)
- Map with waypoint editing
- Properties panel
- Survey/corridor tools
- Geofence editor
- Validation status

#### Configure View
1. **Summary** — Health overview
2. **Airframe** — Type, motors
3. **Sensors** — Calibration wizards
4. **Radio** — RC calibration
5. **Flight Modes** — Assignment
6. **Safety** — Geofence, RTL
7. **Power** — Battery, ESC
8. **Parameters** — Full tree

#### Analyze View
- Flight replay
- Graph builder
- 3D visualization
- Event timeline
- Report export

### 3.3 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Arm/Disarm |
| R | RTL |
| L | Land |
| P | Pause |
| G | GUIDED |
| 1-9 | Select vehicle |
| Tab | Cycle views |
| +/- | Zoom |
| F11 | Fullscreen |

---

## 4. COMMUNICATION

### 4.1 MAVLink

**Message sets:** common, ardupilotmega, uAvionix, airlogix (custom)

**Handling by rate:**
| Message | Rate | Processing |
|---------|------|------------|
| ATTITUDE | 50-100Hz | Ring buffer → UI |
| LOCAL_POSITION | 50Hz | Interpolated → map |
| GPS_RAW | 5-10Hz | Quality check |
| SYS_STATUS | 1-4Hz | State machine |
| HEARTBEAT | 1Hz | Connection |

### 4.2 Encryption

```rust
pub struct CryptoEngine {
    cipher: Aes256Gcm,
    nonce_counter: AtomicU64,
}

impl CryptoEngine {
    pub fn encrypt(&self, data: &[u8]) -> Result<EncryptedMessage>;
    pub fn decrypt(&self, msg: &EncryptedMessage) -> Result<Vec<u8>>;
}
```

| Purpose | Algorithm | Key Size |
|---------|-----------|----------|
| Link | AES-256-GCM | 256-bit |
| Storage | AES-256-XTS | 512-bit |
| Key Exchange | X25519 | 256-bit |
| Signing | Ed25519 | 256-bit |

### 4.3 Video

| Protocol | Latency | Use Case |
|----------|---------|----------|
| RTSP | 200-500ms | IP cameras |
| WebRTC | 50-150ms | Ultra-low latency |
| Custom UDP | 30-100ms | Direct stream |

---

## 5. DATA MANAGEMENT

### 5.1 Database Schema

```sql
CREATE TABLE vehicles (
    id INTEGER PRIMARY KEY,
    uuid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    autopilot TEXT NOT NULL
);

CREATE TABLE parameters (
    vehicle_id INTEGER REFERENCES vehicles(id),
    name TEXT NOT NULL,
    value REAL NOT NULL,
    UNIQUE(vehicle_id, name)
);

CREATE TABLE missions (
    id INTEGER PRIMARY KEY,
    uuid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    data BLOB NOT NULL
);

CREATE TABLE flight_sessions (
    id INTEGER PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id),
    start_time TIMESTAMP NOT NULL,
    telemetry_file TEXT
);

CREATE TABLE map_tiles (
    provider TEXT, z INTEGER, x INTEGER, y INTEGER,
    data BLOB NOT NULL,
    UNIQUE(provider, z, x, y)
);
```

### 5.2 File Structure

```
~/.airlogix-gcs/
├── config/settings.toml
├── data/
│   ├── airlogix.db
│   ├── vehicles/{uuid}/
│   └── missions/{uuid}.mission
├── logs/
│   ├── telemetry/{session}.alx
│   └── video/{session}/
├── maps/
│   ├── tiles.db
│   └── terrain/
└── plugins/{id}/
```

---

## 6. SECURITY

### 6.1 Threat Mitigations

| Threat | Mitigation |
|--------|------------|
| Link interception | AES-256-GCM |
| Command injection | MAVLink signing |
| Replay attacks | Nonce-based |
| Plugin exploits | WASM sandbox |
| Data exfiltration | Encrypted storage |

### 6.2 Audit Logging

All events signed with Ed25519:
- Login/logout
- Arm/disarm
- Mission upload/start
- Parameter changes
- Emergency actions

---

## 7. TESTING

### 7.1 Test Coverage

| Level | Target | Framework |
|-------|--------|-----------|
| Unit | >80% | cargo test, Vitest |
| Integration | >60% | Rust integration |
| Component | >70% | React Testing Library |
| E2E | Critical | Playwright |
| SITL | All modes | ArduPilot SITL |

### 7.2 SITL Example

```rust
#[tokio::test]
async fn test_mission_cycle() {
    let sitl = SitlInstance::start(ArduPlane).await;
    let gcs = TestGcs::connect(&sitl).await;
    
    let mission = Mission::builder()
        .takeoff(100.0)
        .waypoint(47.0, 8.0, 100.0)
        .rtl()
        .build();
    
    gcs.upload_mission(&mission).await.unwrap();
    gcs.arm().await.unwrap();
    gcs.set_mode(Auto).await.unwrap();
    gcs.wait_for_disarm(300).await.unwrap();
}
```

---

## 8. DEPLOYMENT

### 8.1 Build Targets

| Platform | Format | Size |
|----------|--------|------|
| Windows | MSI, ZIP | ~50MB |
| macOS | DMG (universal) | ~45MB |
| Linux | AppImage, deb | ~40MB |

### 8.2 Updates

- Delta updates (bsdiff)
- Ed25519 signed
- Rollback support
- Staged rollout
- Offline USB update

---

## 9. ROADMAP

### Phase 1: Foundation (Weeks 1-8)
- [x] Project setup
- [ ] Basic MAVLink
- [ ] Single vehicle
- [ ] Minimal Flight View

**Deliverable:** Connect, view telemetry

### Phase 2: Flight Ops (Weeks 9-16)
- [ ] Full Flight View
- [ ] Mission upload/download
- [ ] Recording
- [ ] Multiple links

**Deliverable:** Fly missions

### Phase 3: Planning (Weeks 17-24)
- [ ] Plan View
- [ ] Survey patterns
- [ ] Terrain following
- [ ] Offline maps

**Deliverable:** Mission planning

### Phase 4: Config (Weeks 25-32)
- [ ] Configure View
- [ ] Calibration
- [ ] Parameters
- [ ] Firmware update

**Deliverable:** Vehicle setup

### Phase 5: Analysis (Weeks 33-40)
- [ ] Analyze View
- [ ] Replay
- [ ] Graphs
- [ ] Reports

**Deliverable:** Post-flight analysis

### Phase 6: Advanced (Weeks 41-52)
- [ ] Multi-vehicle
- [ ] Video
- [ ] Plugins
- [ ] Encryption
- [ ] SKYWARD integration

**Deliverable:** Production GCS

### Milestones

| Week | Milestone |
|------|-----------|
| 8 | Alpha 1: Connection |
| 16 | Alpha 2: Flight Ready |
| 24 | Beta 1: Planning |
| 32 | Beta 2: Config |
| 40 | RC 1: Feature Complete |
| 52 | Release 1.0 |

---

## 10. APPENDICES

### A. Acronyms

| Term | Definition |
|------|------------|
| GCS | Ground Control Station |
| MAVLink | Micro Air Vehicle Link |
| SITL | Software In The Loop |
| RTL | Return To Launch |
| AGL | Above Ground Level |
| MSL | Mean Sea Level |
| WASM | WebAssembly |

### B. References

1. MAVLink v2.0 — mavlink.io
2. Mission Planner — github.com/ArduPilot/MissionPlanner
3. QGroundControl — github.com/mavlink/qgroundcontrol
4. Tauri v2 — v2.tauri.app
5. SKYWARD Autopilot Spec v1.0

---

**Document Status:** APPROVED FOR DEVELOPMENT  
**Author:** Claude (Architect) | **Date:** January 2026

*— End of Document —*
