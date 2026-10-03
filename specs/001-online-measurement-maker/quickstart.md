# Quickstart Validation Guide: Immersive 3D Character & Spatial HUD
## Feature: Immersive Real-Sync 3D Character Experience & Spatial HUD

---

### Prerequisites
- Node.js 18+ installed
- Modern browser (Chrome, Edge, Firefox, or Safari) with Web Audio API enabled

---

### Setup & Run Commands
```bash
# 1. Navigate to web directory
cd "D:\PROJECTS APP\Measurement Maker\web"

# 2. Run verification build & linter
npm run build
npm run lint

# 3. Start local development server
npm run dev
```

---

### Validation Scenarios

#### Scenario 1: Smooth 60fps Real-Sync Head & Gaze Tracking
1. Open `http://localhost:5173` in a desktop browser.
2. Move the mouse cursor smoothly from the far left of the screen to the far right.
3. **Expected Outcome**:
   - The 3D character smoothly turns head and body to the left when cursor is left ($X < -0.15$).
   - The 3D character smoothly turns head and body to the right when cursor is right ($X > +0.15$).
   - Motion is damped at 60fps without stuttering or coordinate snapping.
   - Top reticle ruler updates Yaw and Pitch readouts in real time (`YAW: +14.2° • PITCH: -3.8°`).

#### Scenario 2: Interactive Jump & Smile Reactions
1. Click the character directly, or click the **"Jump"** action button.
2. **Expected Outcome**:
   - Character performs a smooth 650ms parabolic jump ($36\text{px}$ elevation) with playful squash-and-stretch on landing.
   - Procedural Web Audio synthesizer plays an ascending chime ($C_5 \to E_5 \to G_5 \to C_6$).
   - Speech bubble flashes an enthusiastic celebration cheer.
3. Click the **"Smile"** button.
   - Character winks cheerfully, and an eye sparkle ping animation triggers.

#### Scenario 3: Respectful Password Privacy Mode
1. In Chapter 01 (Auth), click inside the **"Account Password"** input field.
2. **Expected Outcome**:
   - Character turns away immediately, covers eyes, and displays a floating badge: `🙈 Respectful Privacy Mode — Encrypting password with Supabase!`.
3. Click outside the password input.
   - Character smoothly returns to cursor-tracking gaze.

#### Scenario 4: Clean Spatial Layout (Zero Clipped PIP Widgets)
1. Navigate between Chapter 01, Chapter 02 (Hub), Chapter 03, Chapter 04, and Chapter 05.
2. Toggle between **"Spatial Hero Mode"** and **"Workspace View"**.
3. **Expected Outcome**:
   - No floating picture-in-picture widget overlapping the footer or getting cut off at the bottom.
   - All cards in Chapter 02 (Estimate Initiation Hub) display sleek dark sci-fi HUD borders and typography.
   - Measurement Book and Abstract of Cost render with 100% mathematical accuracy.
