# Phase 0: Research & Architecture Analysis
## Feature: Immersive Real-Sync 3D Character Experience & Spatial HUD

---

### Research Topic 1: Real-Sync 3D Character Kinematics & Rendering Architecture

#### Decision
Implement a hybrid **Real-Sync 3D Sprite & Kinematic Physics Engine** combined with **Google Flow Persistent Character Ingredients (`@ErMilim`)**:
1. **Multi-Angle Keyframe Matrix**: High-resolution photorealistic 3D character renders generated across discrete camera yaw angles (-30° Left, 0° Center, +30° Right, -15° Downward Tablet Inspection, and Celebratory Jump pose).
2. **60fps Smooth LERP Physics Loop**: Runs inside `requestAnimationFrame` using continuous linear interpolation:
   $$X_{t} = X_{t-1} + (X_{\text{target}} - X_{t-1}) \times \alpha \quad (\alpha = 0.08)$$
3. **Parabolic Jump Kinematics**:
   When triggered (via user click, action button, or calculation milestone), applies a quadratic jump arc:
   $$Y_{\text{jump}}(t) = -4 \cdot H_{\text{max}} \cdot (t / T) \cdot (1 - t / T)$$
   where $H_{\text{max}} = 36\text{px}$, $T = 650\text{ms}$, with smooth landing squash-and-stretch ($S_y = 0.94, S_x = 1.06$ on impact).
4. **Micro-Expressions**:
   - Eye sparkle ping animation every 4 seconds.
   - Interactive smile/wink state transition on hover or click.
   - Respectful privacy turn-away (`🙈`) when password fields receive focus.

#### Rationale
- **Zero Download Latency**: Full 3D GLTF models with rigged skeletons and morph targets typically require 25MB–60MB downloads, specialized WebGL shaders, and high GPU memory, which stalls or crashes on low-end laptops and field mobile devices used by PWD site engineers.
- **Instant 60fps Smoothness**: The hybrid 3D sprite + matrix perspective transform achieves 60fps on any device with zero frame dropping, instantaneous response to mouse cursor movement, and photorealistic CGI shading that matches the Google Flow character design.
- **Character Consistency**: Grounded in Google Flow's persistent character ingredient model (`@ErMilim`), ensuring uniform PWD safety helmet, pastel field jacket, reflective high-vis straps, and tablet across all actions.

#### Alternatives Evaluated
- *Full Three.js / R3F Skinned Mesh*: Rejected due to high asset size (45MB+), complex skeletal rigging maintenance, and slower initial page load on site networks.
- *Static 2D CSS Tilt*: Rejected as previously implemented—felt flat and artificial without genuine head turns, expressions, or jumping.
- *Video Scrubbing Only*: Good for linear turntable rotation, but inflexible for discrete jump, wave, and smiling actions.

---

### Research Topic 2: Audio-Visual Feedback & State Machine Orchestration

#### Decision
Implement a centralized **Character Animation State Machine** orchestrated via React state and bound to procedural **Web Audio API** sound synthesis:
1. **States**:
   - `IDLE_BREATHING`: Subtle sine-wave vertical bobbing ($2\text{px}$ amplitude, $3.2\text{s}$ period).
   - `CURSOR_TRACKING`: Real-time gaze and torso rotation tracking mouse cursor $(X, Y) \in [-1, 1]$.
   - `SMILING`: Cheerful wink with dilated sparkle effect on avatar click or milestone success.
   - `JUMPING`: 650ms parabolic elevation with joyful celebration badge.
   - `WAVING`: Introductory departmental greeting on mount or chapter transition.
   - `INSPECTING_TABLET`: Downward head tilt when mouse enters measurement grid or financial tables.
   - `PRIVACY_SHIELD`: Respectful turn-away when password input is active.
2. **Procedural Sound FX (`soundFx.ts`)**:
   - Soft high-tech click on mouse hover/action.
   - Ascending major arpeggio chime ($C_5 \to E_5 \to G_5 \to C_6$) on jump / milestone achievement.
   - Zero external `.mp3` or `.wav` dependencies, zero network requests, instant audio playback.

#### Rationale
- Guarantees immediate, tactile responsiveness. Every engineer action produces rich visual and auditory feedback.
- Strict state isolation prevents conflicting animations (e.g. jumping while in privacy mode).

---

### Research Topic 3: Spatial Engineering HUD Layout (Resolving the "What is this?" Bug)

#### Decision
Eliminate the clunky floating Picture-in-Picture (PIP) card that overlapped and clipped at the bottom of the screen. Instead, establish two distinct, cohesive viewing modes:
1. **Mode A: Spatial Cinematic Hero View (`SPATIAL_HERO`)**:
   - Direct 1:1 replica of the benchmark design from `spark.thedigitalpanda.com`.
   - Full 100vw $\times$ 100vh canvas with atmospheric twilight sky, Circuit House mega-structure, and floating inspection drones.
   - Centered 3D character (`@ErMilim`) actively tracking cursor coordinates in the spatial scene.
   - Wide spaced modernist typography: `M E A S U R E M E N T   M A K E R`.
   - Active tracking reticles (`[+] ER.MILIM.01`, `[+] STRUCTURE.01`, `[+] DRONE.01`, `[+] DRONE.02`).
   - Prominent HUD action button: `[ 🚀 ENTER ENGINEERING CONSOLE ]`.
2. **Mode B: Tactical Engineering Console (`WORKSPACE_VIEW`)**:
   - Clean, balanced two-panel layout:
     - **Left Stage (340px)**: The 3D character rendered at full stature, with smile, jump, wave, and speech guidance controls. Fully visible, properly padded, zero clipping.
     - **Right Stage (flex-1)**: Floating glassmorphic engineering console hosting Chapter 01 to Chapter 05.
   - Re-skin `EstimateTypeHub.tsx` into dark, minimalist HUD cards with corner brackets, monospace codes, and cyan accents.

#### Rationale
- Completely removes the awkward floating card bug reported by the user in `media_1791063561469.png`.
- Gives users the option to experience the cinematic, award-winning 3D showcase or focus comfortably on civil engineering spreadsheet data entry.
