# SkillCraft Technology - Certificate Verification Clone

A complete clone of the certificate verification page from [skillcrafttech.com/verify](https://skillcrafttech.com/verify).

## Features
- **Accurate UI & Styles**: Exact CSS layout, dark/light theme support, responsive navigation, SVGs, and animations.
- **Client-Side Verification**: Verifies certificates using query parameter `?id=...` or the interactive input form.
- **Offline / Static Support**: Works directly without a backend using local fallback certificates (`data/certificates.json`) or directly in the browser.
- **Integrated Python Server**: Includes a local server (`server.py`) handling static files and the `/.netlify/functions/verify` endpoint with upstream proxy fallback.

## Quick Start

### Option 1: Run the Local Server (Recommended)
```bash
python3 server.py
```
Open in your browser:
- [http://localhost:8080/index.html?id=SCT/JUN26/2924](http://localhost:8080/index.html?id=SCT/JUN26/2924)

### Option 2: Open Directly in Browser
You can open `index.html` directly in your browser:
```bash
open index.html
```

## Directory Structure
```
├── index.html              # Main verification page
├── server.py               # Local server with API handling & CORS
├── data/
│   └── certificates.json   # Local certificate database
├── script/
│   ├── bundle.js           # Alpine.js & UI interaction bundle
│   ├── verify.js           # Enhanced verification logic with offline fallback
│   └── verify.original.js  # Original unmodified verify script
├── style/
│   └── style.css           # Compiled Tailwind / site styles
└── images/                 # Brand logos, icons, and SVG decorations
```

## Verified Record (ID: SCT/JUN26/2924)
- **ID**: `SCT/JUN26/2924`
- **Name**: SAISAKTHI MK
- **Track**: Prompt Engineering
- **College**: SRM Institute of Science and Technology
- **Date**: 2026-07-03
- **LoR**: Yes
