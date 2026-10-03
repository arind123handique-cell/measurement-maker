import React from 'react';

export interface SpatialTrackingReticleProps {
  id: string;
  label: string;
  sublabel?: string;
  top: string;
  left: string;
  width?: string;
  height?: string;
  status?: string;
  coords?: string;
  cursorOffset?: { x: number; y: number };
  parallaxMultiplier?: number;
}

export const SpatialTrackingReticle: React.FC<SpatialTrackingReticleProps> = ({
  id,
  label,
  sublabel,
  top,
  left,
  width = '140px',
  height = '140px',
  status = 'TRACKING',
  coords = 'X: 384.2  Y: 192.8',
  cursorOffset = { x: 0, y: 0 },
  parallaxMultiplier = 12,
}) => {
  const offsetX = cursorOffset.x * parallaxMultiplier;
  const offsetY = cursorOffset.y * parallaxMultiplier;

  return (
    <div
      style={{
        top,
        left,
        width,
        height,
        transform: `translate(${offsetX}px, ${offsetY}px)`,
        transition: 'transform 0.1s ease-out',
      }}
      className="absolute pointer-events-none select-none z-10 flex flex-col justify-between p-1.5 font-mono text-[9px] text-white/80 group"
    >
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/60" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white/60" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white/60" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/60" />

      {/* Center Target Reticle Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="w-4 h-4 border border-cyan-400/40 rounded-full flex items-center justify-center">
          <span className="text-cyan-400 text-[10px] leading-none">+</span>
        </div>
      </div>

      {/* Top Tag & Status */}
      <div className="flex items-start justify-between">
        <div className="bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded border border-white/15">
          <div className="font-bold tracking-wider text-white text-[9px]">
            {label}
          </div>
          {sublabel && (
            <div className="text-[8px] text-cyan-300">
              {sublabel}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-[8px] text-emerald-400 bg-black/60 px-1 py-0.5 rounded border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{status}</span>
        </div>
      </div>

      {/* Target Diagonal Line Pin */}
      <div className="absolute -bottom-6 -left-6 flex items-center gap-1 text-[8px] text-white/50">
        <span className="w-1 h-1 rounded-full bg-cyan-400" />
        <span className="font-mono">{coords}</span>
      </div>

      {/* Bottom ID Badge */}
      <div className="self-end bg-black/40 px-1 py-0.5 rounded text-[8px] text-white/40">
        {id}
      </div>
    </div>
  );
};
