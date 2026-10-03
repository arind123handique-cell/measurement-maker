# PWD Online Measurement Maker

> **Next-Generation Spatial Engineering HUD & Civil Measurement Automation Suite**  
> Compliant with **IS:1200**, **Assam PWD Schedule of Rates**, and **DSR 2021**.  
> Features an interactive 3D Engineering Assistant powered by **Google Flow RealSync Engine** and a full-bleed spatial HUD interface inspired by [Spark](https://spark.thedigitalpanda.com/).

---

## 🌟 Overview

The **PWD Online Measurement Maker** bridges civil engineering statutory compliance with immersive web technology. Designed specifically for Assistant Executive Engineers (AEE), Sub-Divisional Engineers (SDE), and Section Officers (SO) in Public Works Departments:

- **100% Statutory Mathematical Fidelity**: Matches the statutory Assam PWD Circuit House sanction of **₹26,57,320.00** across 29 benchmark items with exact formula reconciliation:
  $$\text{Grand Total} = (\text{Sub-Total ₹21,78,131.00} \times 1.18 \text{ GST}) + 1\% \text{ Labour Cess} + 3\% \text{ Contingency}$$
- **Full-Bleed Spatial Engineering HUD**: Immersive sci-fi tracking HUD with dynamic cursor reticles (`DRONE.01`, `STRUCTURE.01`, `DRONE.02`), procedural Web Audio SFX, CRT scanlines, and reticle scale rulers.
- **Google Flow RealSync 3D Character (`@ErMilim`)**: A persistent 3D civil engineering avatar with 60fps cursor-tracking (LERP $\alpha=0.08$), multi-angle head/torso poses (left, right, tablet inspect, center), parabolic kinematic jump arc with squash/stretch landing physics, and interactive reactions.
- **1-Click 3-Sheet Statutory Excel Exporter**: Generates inspection-ready `.xlsx` workbooks containing:
  1. Sheet 1: **Measurement Book (MB)** with deduct rules and room-by-room takeoffs
  2. Sheet 2: **Schedule of Rates (DSR 2021)**
  3. Sheet 3: **Abstract of Cost** with statutory tax breakdown

---

## 🏗️ Architecture & Key Components

```
Measurement Maker/
├── .agents/skills/               # SpecKit agent workflows and skills
├── specs/001-online-measurement-maker/
│   ├── spec.md                   # Feature specification & user stories
│   ├── research.md               # Kinematic physics & spatial HUD research
│   ├── data-model.md             # Character state machine & entity schemas
│   ├── plan.md                   # Implementation plan & quality gates
│   ├── quickstart.md             # Validation test scenarios
│   └── contracts/                # RealSync interaction contracts
├── web/
│   ├── src/
│   │   ├── components/
│   │   │   ├── InteractiveEngineerAvatar.tsx  # Google Flow RealSync 3D Character
│   │   │   ├── SpatialHudHeader.tsx           # Sci-Fi HUD header & chapter controls
│   │   │   ├── SpatialTrackingReticle.tsx     # Cursor parallax tracking brackets
│   │   │   ├── EstimateTypeHub.tsx            # Engineering workflow intake hub
│   │   │   ├── AutoEstimationWizard.tsx       # AI prompt-driven measurement wizard
│   │   │   ├── BlueprintUploader.tsx          # CAD/PDF plan extraction interface
│   │   │   ├── MeasurementBookGrid.tsx        # IS:1200 measurement book table
│   │   │   ├── BOQReconciliationTable.tsx     # Rate analysis & quantity audit
│   │   │   ├── AbstractOfCostSummary.tsx      # Statutory tax & cost breakdown
│   │   │   └── AuthScreen.tsx                 # PWD Engineer authentication
│   │   ├── lib/
│   │   │   ├── googleFlowService.ts           # Google Flow character motion synthesis
│   │   │   ├── soundFx.ts                     # Web Audio API procedural sound synthesizer
│   │   │   ├── excelExporter.ts               # ExcelJS statutory 3-sheet exporter
│   │   │   ├── measurementEngine.ts           # IS:1200 civil formula calculation engine
│   │   │   └── formQueryEngine.ts             # Natural language estimation query parser
│   │   └── App.tsx                            # Root Spatial HUD canvas & view controller
│   └── package.json
├── benchmark_29_items.json       # Ground-truth validation dataset
└── package.json                  # Root monorepo workspace scripts
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/arind123handique-cell/measurement-maker.git
cd measurement-maker

# Install dependencies in the web application
cd web
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:5173` to explore the spatial interface.

### Build & Verification

```bash
# Type check and build production bundle
npm run build

# Run Oxlint high-speed linter
npm run lint
```

---

## 📐 Civil Engineering Compliance Reference

| Specification | Standard / Reference |
| :--- | :--- |
| **Measurement Code** | IS:1200 (Parts 1 to 28) |
| **Schedule of Rates** | CPWD DSR 2021 & APWD Schedule of Rates |
| **Statutory GST** | 18.00% as per GST Council Civil Works Directive |
| **Labour Welfare Cess** | 1.00% under Building & Other Construction Workers Act 1996 |
| **Physical Contingency** | 3.00% Assam PWD Financial Handbook |
| **Benchmark Sanction** | **₹26,57,320.00** (Full Circuit House Estimate) |

---

## 🤖 Google Flow RealSync Engine

The avatar system integrates Google Flow's persistent character ingredient pattern:

- **Ingredient ID**: `@ErMilim_PWD_Engineer`
- **Pose Interpolation**: Smooth LERP smoothing factor $\alpha = 0.08$ on normalized viewport coordinate space $([-1, 1], [-1, 1])$.
- **Dynamic Poses**:
  - `Center (Wink)`: Default gaze target with friendly engineering salute.
  - `Turn Left`: Head and torso rotate towards left telemetry panels.
  - `Turn Right`: Head and torso rotate towards right estimate tables.
  - `Inspect Tablet`: Focuses downward on blueprint measurements.
- **Kinematic Physics**: Parabolic jump trajectory:
  $$y(t) = 4h \left(\frac{t}{T}\right) \left(1 - \frac{t}{T}\right)$$
  coupled with dynamic squash-and-stretch on landing.

---

## 📄 License

Proprietary — Developed for Assam PWD Civil Works & Online Measurement Systems.
