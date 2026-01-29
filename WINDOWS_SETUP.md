# AIRLOGIX GCS - Windows Setup Guide

Step-by-step instructions for setting up and running AIRLOGIX GCS on Windows.

---

## Prerequisites

### Step 1: Install Node.js

1. Go to https://nodejs.org/
2. Download the **LTS version** (recommended)
3. Run the installer
4. Check "Automatically install the necessary tools" during installation
5. Follow the prompts to complete installation

**Verify installation:**
```powershell
node --version
npm --version
```

---

### Step 2: Install Rust

1. Go to https://rustup.rs/
2. Download and run `rustup-init.exe`
3. When prompted, select option **1** (default installation)
4. Wait for installation to complete
5. **Restart your terminal/PowerShell**

**Verify installation:**
```powershell
rustc --version
cargo --version
```

---

### Step 3: Install Visual Studio Build Tools

Tauri requires C++ build tools on Windows.

1. Go to https://visualstudio.microsoft.com/visual-cpp-build-tools/
2. Download "Build Tools for Visual Studio"
3. Run the installer
4. In the installer, select:
   - **"Desktop development with C++"**
   - Make sure these are checked:
     - MSVC v143 (or latest)
     - Windows 10/11 SDK
     - C++ CMake tools for Windows
5. Click "Install" and wait for completion
6. **Restart your computer**

---

### Step 4: Install WebView2

WebView2 is required for Tauri on Windows. It's pre-installed on Windows 11 and recent Windows 10 updates.

If needed, download from: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

---

## Project Setup

### Step 5: Clone the Repository

Open PowerShell or Command Prompt:

```powershell
git clone https://github.com/lopoly/alxgcs.git
cd alxgcs
```

Or if you already have the project:
```powershell
cd path\to\alxgcs
```

---

### Step 6: Install Dependencies

```powershell
npm install
```

This will install all Node.js dependencies (React, Vite, Tailwind, etc.)

---

## Running the Application

### Option A: Web Development Mode (Recommended for First Test)

This runs only the frontend in a browser - no Rust compilation needed:

```powershell
npm run dev
```

Then open your browser to: **http://localhost:1420**

Press `Ctrl+C` to stop the server.

---

### Option B: Tauri Development Mode (Full Desktop App)

This runs the complete desktop application with Tauri:

```powershell
npm run tauri:dev
```

**Note:** First run will take several minutes as Rust compiles all dependencies.

The desktop window will open automatically when ready.

---

## Building for Production

### Build Web Version Only

```powershell
npm run build
```

Output will be in the `dist/` folder.

---

### Build Windows Installer (MSI/EXE)

```powershell
npm run tauri:build
```

**Note:** First build takes 5-10 minutes.

Output locations:
- **MSI Installer:** `src-tauri/target/release/bundle/msi/`
- **EXE Installer:** `src-tauri/target/release/bundle/nsis/`
- **Portable EXE:** `src-tauri/target/release/airlogix-gcs.exe`

---

## Troubleshooting

### "rustc not found"
- Restart your terminal after installing Rust
- Or run: `refreshenv` (if using Chocolatey)

### "LINK.exe not found" or C++ errors
- Ensure Visual Studio Build Tools are installed with C++ workload
- Restart your computer after installation

### "WebView2 not found"
- Download and install WebView2 from Microsoft

### Build fails with memory errors
- Close other applications to free up RAM
- Tauri builds require ~4GB RAM

### "npm not found"
- Restart terminal after installing Node.js
- Or reinstall Node.js and ensure "Add to PATH" is checked

---

## Quick Command Reference

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start web dev server |
| `npm run tauri:dev` | Start Tauri desktop app |
| `npm run build` | Build web version |
| `npm run tauri:build` | Build Windows installer |
| `npm run lint` | Run ESLint |

---

## Keyboard Shortcuts (In App)

| Shortcut | Action |
|----------|--------|
| `F1` | Switch to Flight view |
| `F2` | Switch to Plan view |
| `F3` | Switch to Configure view |
| `F4` | Switch to Analyze view |
| `Tab` | Cycle to next view |
| `Shift+Tab` | Cycle to previous view |

---

## System Requirements

- **OS:** Windows 10 (1803+) or Windows 11
- **RAM:** 4GB minimum, 8GB recommended
- **Disk:** 2GB free space (for build tools and dependencies)
- **Display:** 1280x720 minimum resolution

---

## Support

For issues and feature requests, visit:
https://github.com/lopoly/alxgcs/issues
