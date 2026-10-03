import React, { useState } from 'react';
import { Volume2, VolumeX, BookOpen, Download, Layers } from 'lucide-react';
import { soundFx } from '../lib/soundFx';
import { type StepNumber } from './StepProgressNav';

export interface SpatialHudHeaderProps {
  currentStep: StepNumber;
  onSelectStep: (step: StepNumber) => void;
  cursorRotation: { yaw: number; pitch: number };
  isCockpitMode: boolean;
  onToggleCockpitMode: () => void;
  onOpenHowToUse: () => void;
  onExportExcel: () => void;
  isExportingExcel: boolean;
  engineerName?: string;
  sanctionAmount?: string;
}

export const SpatialHudHeader: React.FC<SpatialHudHeaderProps> = ({
  currentStep,
  onSelectStep,
  cursorRotation,
  isCockpitMode,
  onToggleCockpitMode,
  onOpenHowToUse,
  onExportExcel,
  isExportingExcel,
  engineerName = 'Er. Pranjal Barua',
  sanctionAmount = '₹26,57,320.00',
}) => {
  const [isSoundOn, setIsSoundOn] = useState(true);

  const toggleSound = () => {
    const next = !isSoundOn;
    setIsSoundOn(next);
    soundFx.enabled = next;
    if (next) soundFx.playClick();
  };

  const handleStepClick = (step: StepNumber) => {
    soundFx.playChapterChime();
    onSelectStep(step);
  };

  const chapterNames: Record<StepNumber, string> = {
    1: 'AUTH & ENGINEER PROFILE',
    2: 'ESTIMATE INITIATION HUB',
    3: 'SPACE & ROOM SCHEDULE',
    4: 'MEASUREMENT BOOK (MB GRID)',
    5: 'ABSTRACT OF COST & SANCTION',
  };

  return (
    <header className="relative w-full z-40 select-none bg-black/85 backdrop-blur-md border-b border-white/15 px-3 sm:px-6 py-2.5 text-white font-mono">
      {/* Top Telemetry & Reticle Grid Bar */}
      <div className="flex items-center justify-between gap-4">
        {/* LEFT: CHAPTER // 0X Square Bracket Badge (Spark Style) */}
        <div className="flex items-center gap-3">
          <div className="relative border-2 border-white/90 bg-black/60 px-2.5 py-1 flex flex-col justify-between shadow-[0_0_15px_rgba(255,255,255,0.15)] group">
            {/* Corner Bracket Accents */}
            <div className="text-[9px] font-bold tracking-widest text-white/70 uppercase">
              CHAPTER //
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tighter">
              0{currentStep}
            </div>

            {/* Quick Chapter Selector Dropdown on Hover/Click */}
            <div className="flex items-center gap-1 mt-1 pt-1 border-t border-white/20">
              {([1, 2, 3, 4, 5] as StepNumber[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleStepClick(st)}
                  className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center transition-all ${
                    currentStep === st
                      ? 'bg-cyan-400 text-black shadow-xs font-black'
                      : 'text-white/50 hover:text-white hover:bg-white/20'
                  }`}
                  title={`Go to Chapter 0${st}: ${chapterNames[st]}`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Chapter Description & Department Tag */}
          <div className="hidden md:flex flex-col">
            <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              PWD ASSAM • CIVIL ENGINEERING HUD
            </span>
            <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
              {chapterNames[currentStep]}
            </span>
            <span className="text-[9px] text-white/50">
              PROJECT: CIRCUIT HOUSE BOKAKHAT • DSR-2021 • {engineerName}
            </span>
          </div>
        </div>

        {/* CENTER: Precision Compass Alignment Reticle Ruler */}
        <div className="hidden lg:flex flex-col items-center justify-center">
          {/* Spark Reticle Ruler */}
          <div className="flex items-center gap-1 text-[11px] font-bold text-white/75 tracking-widest">
            <span className="text-cyan-400">o</span>
            <span>! ! ! ! ! ! !</span>
            <span className="text-cyan-300 font-black text-xs animate-bounce">▾</span>
            <span>! ! ! ! ! ! !</span>
            <span className="text-cyan-400">o</span>
          </div>

          {/* Real-Time Angle / Yaw Telemetry */}
          <div className="flex items-center gap-3 text-[9px] text-white/60 tracking-wider mt-0.5">
            <span className="text-cyan-300">
              YAW: {cursorRotation.yaw >= 0 ? `+${cursorRotation.yaw.toFixed(1)}` : cursorRotation.yaw.toFixed(1)}°
            </span>
            <span>•</span>
            <span className="text-pink-300">
              PITCH: {cursorRotation.pitch >= 0 ? `+${cursorRotation.pitch.toFixed(1)}` : cursorRotation.pitch.toFixed(1)}°
            </span>
            <span>•</span>
            <span className="text-emerald-300">
              GOOGLE FLOW: REAL-SYNC LOCKED
            </span>
          </div>
        </div>

        {/* RIGHT: Tactical Telemetry Readout & Sound Control */}
        <div className="flex items-center gap-3">
          {/* Sound Control Switch (spark style) */}
          <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded border border-white/20">
            <span className="text-[9px] text-white/70 uppercase">
              SOUND ///
            </span>
            <button
              type="button"
              onClick={toggleSound}
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all flex items-center gap-1 ${
                isSoundOn
                  ? 'bg-cyan-400 text-black shadow-xs'
                  : 'bg-white/10 text-white/50 hover:text-white'
              }`}
              title="Toggle Telemetry Audio FX"
            >
              {isSoundOn ? <Volume2 className="w-2.5 h-2.5" /> : <VolumeX className="w-2.5 h-2.5" />}
              <span>{isSoundOn ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Mini Telemetry Readout (Desktop) */}
          <div className="hidden xl:flex flex-col text-[8px] text-white/70 leading-tight border-l border-white/20 pl-3">
            <div className="flex justify-between gap-2">
              <span className="text-white/40">AI ENGINE:</span>
              <span className="text-cyan-300 font-bold">GOOGLE FLOW</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-white/40">FLOW INGREDIENT:</span>
              <span className="text-emerald-400 font-bold">@ErMilim</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-white/40">SANCTION:</span>
              <span className="text-white font-bold">{sanctionAmount}</span>
            </div>
          </div>

          {/* View Mode Toggle: 3D Spatial Showcase vs Engineering Console */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onToggleCockpitMode();
            }}
            className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-all flex items-center gap-1.5 ${
              !isCockpitMode
                ? 'bg-cyan-500 text-black border-cyan-400 font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-black/60 border-white/20 text-white/80 hover:bg-white/10'
            }`}
            title="Toggle between 3D Spatial Showcase and Engineering Console"
          >
            <Layers className="w-3 h-3 text-cyan-300" />
            <span className="hidden sm:inline">
              {!isCockpitMode ? 'CONSOLE VIEW' : '3D SHOWCASE'}
            </span>
          </button>

          {/* 'How to Use' Guide */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onOpenHowToUse();
            }}
            className="px-2.5 py-1 rounded text-[10px] font-bold bg-black/60 hover:bg-white/15 text-white border border-white/20 flex items-center gap-1 transition-all"
            title="Open PWD Engineering Guide"
          >
            <BookOpen className="w-3 h-3 text-cyan-400" />
            <span className="hidden md:inline">GUIDE</span>
          </button>

          {/* 1-Click Excel Export */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onExportExcel();
            }}
            disabled={isExportingExcel}
            className={`px-3 py-1 rounded text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-xs ${
              isExportingExcel
                ? 'bg-emerald-900 text-white/50 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400 active:scale-95'
            }`}
            title="Export PWD Measurement Book & Abstract of Cost (.xlsx)"
          >
            {isExportingExcel ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-3 h-3" />
            )}
            <span className="hidden sm:inline">EXPORT EXCEL</span>
          </button>
        </div>
      </div>
    </header>
  );
};
