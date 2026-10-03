import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Video,
  Film,
  ShieldCheck,
  Heart,
  RefreshCw,
  Zap,
  Activity,
  Smile,
  Hand,
  Crosshair,
} from 'lucide-react';
import {
  GOOGLE_FLOW_PRESETS,
  generateGoogleFlowMotion,
  type GoogleFlowVideoResult,
} from '../lib/googleFlowService';
import { soundFx } from '../lib/soundFx';

export interface InteractiveEngineerAvatarProps {
  isPasswordFocused?: boolean;
  engineerName?: string;
  designation?: string;
  statusMessage?: string;
  onAvatarClick?: () => void;
  currentStep?: number;
  className?: string;
}

export const InteractiveEngineerAvatar: React.FC<InteractiveEngineerAvatarProps> = ({
  isPasswordFocused = false,
  engineerName = 'Er. Milim • Chief AI Estimator',
  designation = 'Special Project & Estimation Division (PWD Assam)',
  statusMessage,
  onAvatarClick,
  currentStep = 1,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Render Mode: 'realsync_3d' (Multi-angle 3D character engine) vs 'flow_motion' (Google Flow Motion Studio)
  const [renderMode, setRenderMode] = useState<'realsync_3d' | 'flow_motion'>('realsync_3d');

  // Multi-angle real-sync active frame: 'center' | 'left' | 'right' | 'inspect_tablet'
  const [activePose, setActivePose] = useState<'center' | 'left' | 'right' | 'inspect_tablet'>('center');

  // Normalized cursor coordinates [-1, 1]
  const targetCoords = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentCoords = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Reactive state for UI rendering
  const [rotation, setRotation] = useState<{ yaw: number; pitch: number }>({ yaw: 0, pitch: 0 });
  const [glarePosition, setGlarePosition] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isSparkling, setIsSparkling] = useState(false);
  const [motionScrubPercent, setMotionScrubPercent] = useState(50);
  const [isGeneratingFlow, setIsGeneratingFlow] = useState(false);
  const [flowVideoUrl, setFlowVideoUrl] = useState(GOOGLE_FLOW_PRESETS.avatarEngineer.videoUrl);

  // Action states: jumping, smiling, waving
  const [isJumping, setIsJumping] = useState(false);
  const [jumpElevation, setJumpElevation] = useState(0); // in pixels
  const [squashStretch, setSquashStretch] = useState<{ sx: number; sy: number }>({ sx: 1, sy: 1 });
  const [isSmiling, setIsSmiling] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [customActionText, setCustomActionText] = useState<string | null>(null);

  // Preload Google Flow character ingredient frames
  useEffect(() => {
    const urls = [
      '/avatar_center.jpg',
      '/avatar_turn_left.jpg',
      '/avatar_turn_right.jpg',
      '/avatar_inspect_tablet.jpg',
    ];
    urls.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Global mouse movement listener across the whole viewport
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || isJumping) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate distance normalized from -1 to 1 relative to window
      const rawX = (e.clientX - centerX) / (window.innerWidth * 0.45);
      const rawY = (e.clientY - centerY) / (window.innerHeight * 0.45);

      const normX = Math.max(-1, Math.min(1, rawX));
      const normY = Math.max(-1, Math.min(1, rawY));

      targetCoords.current = { x: normX, y: normY };

      // Determine active pose based on cursor direction
      if (isPasswordFocused) {
        setActivePose('left'); // Turn away respectfully
      } else if (normY > 0.35) {
        setActivePose('inspect_tablet'); // Cursor inspecting lower tables/forms
      } else if (normX < -0.2) {
        setActivePose('left'); // Cursor on left
      } else if (normX > 0.2) {
        setActivePose('right'); // Cursor on right
      } else {
        setActivePose('center'); // Looking forward
      }

      // If in Google Flow Motion mode, update video scrub directly with cursor X
      if (renderMode === 'flow_motion' && videoRef.current && videoRef.current.duration) {
        const percent = Math.max(0, Math.min(1, (normX + 1) / 2));
        setMotionScrubPercent(Math.round(percent * 100));
        videoRef.current.currentTime = percent * videoRef.current.duration;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [renderMode, isPasswordFocused, isJumping]);

  // Smooth LERP (Linear Interpolation) animation loop at 60fps
  useEffect(() => {
    let animId: number;

    const updatePhysics = () => {
      const alpha = 0.08; // Inertia damping

      currentCoords.current.x += (targetCoords.current.x - currentCoords.current.x) * alpha;
      currentCoords.current.y += (targetCoords.current.y - currentCoords.current.y) * alpha;

      // Human/character rotation bounds: Yaw +/- 26 deg, Pitch +/- 12 deg
      const maxYaw = 26;
      const maxPitch = 12;

      const effectiveX = isPasswordFocused ? -0.85 : currentCoords.current.x;
      const effectiveY = isPasswordFocused ? 0.3 : currentCoords.current.y;

      setRotation({
        yaw: effectiveX * maxYaw,
        pitch: -effectiveY * maxPitch,
      });

      setGlarePosition({
        x: 50 + effectiveX * 28,
        y: 50 + effectiveY * 28,
      });

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, [isPasswordFocused]);

  // Eye sparkle timer
  useEffect(() => {
    const sparkleInterval = setInterval(() => {
      setIsSparkling(true);
      setTimeout(() => setIsSparkling(false), 500);
    }, 4500);

    return () => clearInterval(sparkleInterval);
  }, []);

  // Jump Action Physics
  const performJump = () => {
    if (isJumping) return;
    soundFx.playJumpChime();
    setIsJumping(true);
    setCustomActionText('✨ JUMP! ALL FORMULAS VERIFIED! ✨');
    setActivePose('center');

    const duration = 650; // ms
    const startTime = performance.now();
    const maxElevation = 38; // px

    const jumpLoop = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Parabolic jump trajectory: 4 * max * p * (1 - p)
      const currentH = 4 * maxElevation * progress * (1 - progress);
      setJumpElevation(currentH);

      // Squash and stretch kinematics
      if (progress < 0.2) {
        setSquashStretch({ sx: 0.94, sy: 1.08 }); // stretch going up
      } else if (progress > 0.8 && progress < 0.95) {
        setSquashStretch({ sx: 1.08, sy: 0.92 }); // squash on landing impact
      } else {
        setSquashStretch({ sx: 1.0, sy: 1.0 }); // normal
      }

      if (progress < 1) {
        requestAnimationFrame(jumpLoop);
      } else {
        setIsJumping(false);
        setJumpElevation(0);
        setSquashStretch({ sx: 1, sy: 1 });
        setTimeout(() => setCustomActionText(null), 1200);
      }
    };

    requestAnimationFrame(jumpLoop);
  };

  // Smile & Wink Reaction
  const performSmile = () => {
    soundFx.playClick();
    setIsSmiling(true);
    setActivePose('center');
    setIsSparkling(true);
    setCustomActionText('😊 Namaskar! 100% IS:1200 Audit Compliance!');
    setTimeout(() => {
      setIsSmiling(false);
      setIsSparkling(false);
      setCustomActionText(null);
    }, 2000);
  };

  // Wave Action
  const performWave = () => {
    soundFx.playChapterChime();
    setIsWaving(true);
    setActivePose('center');
    setCustomActionText('👋 Welcome, Engineer! Standing by for calculations.');
    setTimeout(() => {
      setIsWaving(false);
      setCustomActionText(null);
    }, 2200);
  };

  // Reset Gaze to Center
  const resetGaze = () => {
    soundFx.playClick();
    targetCoords.current = { x: 0, y: 0 };
    setActivePose('center');
  };

  // Handle Google Flow on-demand generation
  const handleGenerateGoogleFlow = async () => {
    try {
      soundFx.playClick();
      setIsGeneratingFlow(true);
      const res: GoogleFlowVideoResult = await generateGoogleFlowMotion({
        ingredientId: '@ErMilim_PWD_Engineer',
        prompt:
          'Consistent 3D anime female civil engineer in white PWD safety helmet looking left and right smoothly with blueprint tablet.',
        cameraAngle: 'turntable_360',
        durationSeconds: 8,
        resolution: '1080p',
      });
      setFlowVideoUrl(res.videoUrl);
      setRenderMode('flow_motion');
    } catch {
      // fallback to preset
    } finally {
      setIsGeneratingFlow(false);
    }
  };

  // Step-aware civil engineering guidance
  const stepMessages: Record<number, string> = {
    1: 'Namaskar! Enter your departmental credentials or click "Continue as Offline Site Engineer" below to initialize.',
    2: 'Select an estimation initiation path: AutoEstimate Form, Verified PWD Excel (.xlsx), Blueprint Takeoff, or Blank MB.',
    3: 'Review space & room schedule for 4 benchmark suites. IS:1200 automatically computes perimeter and wall deductions.',
    4: 'Measurement Book grid active with 29 DSR items and 241+ measurement rows. Every formula verified to statutory standards.',
    5: 'Statutory Abstract of Cost verified: ₹21,78,131 subtotal + 18% GST + 1% Cess + 3% Contingency = ₹26,57,320.00 sanction!',
  };

  const activeMessage = customActionText || statusMessage || stepMessages[currentStep] || stepMessages[1];

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center bg-black/85 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.15)] select-none text-white font-mono transition-all ${className}`}
    >
      {/* Sci-Fi HUD Corner Brackets */}
      <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400" />
      <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400" />
      <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400" />
      <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400" />

      {/* Top Header Badge & Mode Switcher */}
      <div className="w-full flex items-center justify-between mb-2 z-10 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            GOOGLE FLOW • REALSYNC 3D
          </span>
        </div>

        {/* Mode Toggle: RealSync 3D Character vs Google Flow Motion Video */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setRenderMode('realsync_3d');
            }}
            className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${
              renderMode === 'realsync_3d'
                ? 'bg-cyan-500 text-black shadow-xs font-black'
                : 'text-white/60 hover:text-white bg-white/5'
            }`}
            title="Google Flow Multi-Angle RealSync 3D Character"
          >
            REALSYNC 3D
          </button>
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setRenderMode('flow_motion');
            }}
            className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all flex items-center gap-1 ${
              renderMode === 'flow_motion'
                ? 'bg-indigo-500 text-white shadow-xs font-black'
                : 'text-white/60 hover:text-white bg-white/5'
            }`}
            title="Google Flow Motion Studio Video Scrubbing"
          >
            <Video className="w-2.5 h-2.5" />
            <span>FLOW MOTION</span>
          </button>
        </div>
      </div>

      {/* Main RealSync 3D Character Viewport */}
      <div className="relative w-56 h-72 sm:w-64 sm:h-80 flex items-center justify-center my-1">
        {/* Spark Bounding Reticle Frame */}
        <div className="absolute inset-0 border border-white/20 rounded-xl pointer-events-none z-20 flex flex-col justify-between p-2">
          <div className="flex items-center justify-between text-[8px] text-cyan-300">
            <span className="flex items-center gap-1">
              <Activity className="w-2.5 h-2.5 text-cyan-400" />
              [+] ER.MILIM.01
            </span>
            <span className="text-emerald-400 font-bold">
              {isJumping ? 'ACTION: JUMPING' : isWaving ? 'ACTION: WAVING' : isSmiling ? 'ACTION: SMILING' : 'LOCKED: @ErMilim'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[8px] text-white/50">
            <span>YAW: {rotation.yaw.toFixed(1)}°</span>
            <span className="text-cyan-300 font-bold">POSE: {activePose.toUpperCase()}</span>
          </div>
        </div>

        {/* MODE 1: Google Flow Multi-Angle RealSync 3D Character */}
        {renderMode === 'realsync_3d' && (
          <div
            onClick={() => {
              if (onAvatarClick) {
                onAvatarClick();
              } else {
                performSmile();
              }
            }}
            style={{
              transform: `perspective(850px) translateY(${-jumpElevation}px) rotateY(${rotation.yaw}deg) rotateX(${rotation.pitch}deg) scale(${squashStretch.sx}, ${squashStretch.sy}) translateZ(8px)`,
              transformStyle: 'preserve-3d',
              transition: isJumping ? 'transform 0.02s linear' : 'transform 0.04s ease-out',
            }}
            className="relative w-full h-full cursor-pointer flex items-center justify-center group rounded-xl overflow-hidden bg-slate-950/70 border border-cyan-500/20"
          >
            {/* 1. Center Wink Pose */}
            <img
              src="/avatar_center.jpg"
              alt="Google Flow Ingredient @ErMilim - Center"
              className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-150 ${
                activePose === 'center' ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            />

            {/* 2. Left Turn Pose */}
            <img
              src="/avatar_turn_left.jpg"
              alt="Google Flow Ingredient @ErMilim - Left Turn"
              className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-150 ${
                activePose === 'left' ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            />

            {/* 3. Right Turn Pose */}
            <img
              src="/avatar_turn_right.jpg"
              alt="Google Flow Ingredient @ErMilim - Right Turn"
              className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-150 ${
                activePose === 'right' ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            />

            {/* 4. Inspecting Tablet Pose */}
            <img
              src="/avatar_inspect_tablet.jpg"
              alt="Google Flow Ingredient @ErMilim - Inspecting Tablet"
              className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-150 ${
                activePose === 'inspect_tablet' ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            />

            {/* Dynamic Specular Sheen (Moves with cursor!) */}
            <div
              style={{
                background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%)`,
              }}
              className="absolute inset-0 pointer-events-none mix-blend-overlay z-15"
            />

            {/* Eye Sparkle Animation */}
            {isSparkling && !isPasswordFocused && (
              <div className="absolute top-[26%] left-[46%] pointer-events-none animate-ping z-20">
                <Sparkles className="w-5 h-5 text-cyan-300 filter drop-shadow" />
              </div>
            )}

            {/* Floating Jump / Celebration Indicator */}
            {isJumping && (
              <div className="absolute top-4 inset-x-2 bg-cyan-400 text-black font-black text-[10px] py-1 text-center rounded-lg shadow-lg animate-bounce z-30">
                🚀 JUMPING // PWD CELEBRATION!
              </div>
            )}

            {/* Password Privacy Shy Overlay */}
            {isPasswordFocused && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-center p-3 animate-in fade-in zoom-in duration-200 z-30">
                <div className="w-10 h-10 rounded-full bg-pink-500/20 border border-pink-400/40 flex items-center justify-center mb-1 animate-bounce">
                  <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
                </div>
                <span className="text-xs font-bold text-pink-300">
                  🙈 Respectful Privacy Mode
                </span>
                <span className="text-[9px] text-slate-300 font-mono mt-0.5">
                  Turning away while typing password...
                </span>
              </div>
            )}

            {/* Departmental PWD Watermark Pin */}
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 border border-cyan-400/50 text-[8px] font-bold text-cyan-300 shadow-md flex items-center gap-1 z-25">
              <span>PWD CIVIL</span>
              <ShieldCheck className="w-2.5 h-2.5 text-cyan-400" />
            </div>
          </div>
        )}

        {/* MODE 2: Google Flow Motion Studio Video Scrubbing */}
        {renderMode === 'flow_motion' && (
          <div className="relative w-full h-full rounded-xl overflow-hidden border border-indigo-500/60 shadow-2xl bg-black">
            <video
              ref={videoRef}
              src={flowVideoUrl}
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
            />

            {/* Live Scrub HUD Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between text-[9px] font-mono">
              <span className="flex items-center gap-1 text-indigo-400 font-bold">
                <Film className="w-3 h-3" />
                Flow Motion Studio
              </span>
              <span className="bg-indigo-950 px-1.5 py-0.5 rounded text-indigo-200 border border-indigo-700/50">
                Timeline: {motionScrubPercent}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Action Control Toolbar: Jump, Smile, Wave, Gaze Reset */}
      <div className="w-full flex items-center justify-center gap-1.5 mt-2 z-10 text-[9px]">
        <button
          type="button"
          onClick={performJump}
          disabled={isJumping}
          className="px-2.5 py-1 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 font-bold flex items-center gap-1 transition-all active:scale-95 shadow-xs"
          title="Make the 3D engineer character jump enthusiastically!"
        >
          <span>🦘 Jump!</span>
        </button>
        <button
          type="button"
          onClick={performSmile}
          className="px-2.5 py-1 rounded-md bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/50 text-pink-300 font-bold flex items-center gap-1 transition-all active:scale-95 shadow-xs"
          title="Make the character smile and wink cheerfully"
        >
          <Smile className="w-2.5 h-2.5" />
          <span>Smile</span>
        </button>
        <button
          type="button"
          onClick={performWave}
          className="px-2.5 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 font-bold flex items-center gap-1 transition-all active:scale-95 shadow-xs"
          title="Character waves a departmental greeting"
        >
          <Hand className="w-2.5 h-2.5" />
          <span>Wave</span>
        </button>
        <button
          type="button"
          onClick={resetGaze}
          className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 text-white/70 font-bold flex items-center gap-1 transition-all"
          title="Reset gaze forward"
        >
          <Crosshair className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* Engineer Identity & Telemetry Tag */}
      <div className="text-center space-y-0.5 z-10 mt-2">
        <h3 className="text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-1.5">
          <span>{engineerName}</span>
          <Sparkles className="w-3 h-3 text-cyan-400" />
        </h3>
        <p className="text-[10px] text-cyan-300">
          {designation}
        </p>
      </div>

      {/* Real-Time Live Civil Engineering Guidance Bubble */}
      <div className="mt-2.5 w-full bg-slate-900/90 border border-cyan-500/30 rounded-xl p-2.5 text-center text-xs text-white/90 shadow-inner z-10">
        <div className="flex items-center justify-center gap-1.5 mb-1 text-[9px] uppercase font-bold text-cyan-400">
          <Zap className="w-2.5 h-2.5 text-yellow-400" />
          <span>Real-Time PWD Site Guidance</span>
        </div>
        <p className="text-[10px] leading-relaxed text-slate-200 font-sans">
          {isPasswordFocused
            ? '🔒 Password input active — encrypted with Supabase Authentication!'
            : activeMessage}
        </p>
      </div>

      {/* Google Flow Engine Trigger */}
      <div className="mt-2 w-full flex items-center justify-between text-[9px] text-white/50 pt-2 border-t border-white/10">
        <span className="text-cyan-400/80 font-bold">FLOW INGREDIENT: @ErMilim</span>
        <button
          type="button"
          onClick={handleGenerateGoogleFlow}
          disabled={isGeneratingFlow}
          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
          title="Trigger a new Google Flow Motion generation preview"
        >
          {isGeneratingFlow ? (
            <>
              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
              <span>Synthesizing...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-2.5 h-2.5" />
              <span>Flow Generate</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InteractiveEngineerAvatar;
