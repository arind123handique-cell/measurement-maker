# Interface Contract: Interactive Character & Spatial HUD
## Feature: Immersive Real-Sync 3D Character Experience & Spatial HUD

---

### 1. `InteractiveEngineerAvatar` Component Contract

```typescript
export interface InteractiveEngineerAvatarProps {
  /**
   * Whether the active input is a password field.
   * When true, character triggers privacy shield (turns away, covers eyes).
   */
  isPasswordFocused?: boolean;

  /**
   * Display name of the engineer avatar (default: 'Er. Milim • Chief AI Estimator')
   */
  engineerName?: string;

  /**
   * Departmental designation tag
   */
  designation?: string;

  /**
   * Custom speech bubble guidance message. If omitted, uses chapter-specific guidance.
   */
  statusMessage?: string;

  /**
   * Active engineering chapter number (1 to 5)
   */
  currentStep?: number;

  /**
   * Callback fired when user clicks directly on the avatar
   */
  onAvatarClick?: () => void;

  /**
   * External trigger to initiate specific action animations
   */
  triggeredAction?: 'jump' | 'smile' | 'wave' | null;

  /**
   * Callback fired when action animation completes
   */
  onActionComplete?: () => void;

  /**
   * Layout container styling overrides
   */
  className?: string;
}
```

---

### 2. Character Action Dispatcher Contract

```typescript
export interface CharacterActionDispatcher {
  /**
   * Triggers a joyful jump animation with celebratory audio chime
   */
  triggerJump: () => void;

  /**
   * Triggers a cheerful smile & wink reaction with eye sparkle
   */
  triggerSmile: () => void;

  /**
   * Triggers introductory greeting wave
   */
  triggerWave: () => void;

  /**
   * Updates speech bubble with context-aware message
   */
  speak: (message: string, durationMs?: number) => void;
}
```

---

### 3. Procedural Audio Synthesizer Contract (`soundFx.ts`)

```typescript
export interface SoundEngineContract {
  enabled: boolean;
  playClick(): void;
  playBleep(): void;
  playJumpChime(): void;
  playChapterChime(): void;
}
```
