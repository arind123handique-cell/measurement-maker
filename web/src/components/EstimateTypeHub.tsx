import React, { useState } from 'react';
import {
  Wand2,
  FileSpreadsheet,
  Sparkles,
  ArrowRight,
  Calculator,
  Activity,
} from 'lucide-react';
import { soundFx } from '../lib/soundFx';

export type EstimateMode = 'auto_query' | 'upload_excel' | 'blueprint_takeoff' | 'blank_estimate';

export interface EstimateTypeHubProps {
  onSelectMode: (mode: EstimateMode) => void;
  engineerName?: string;
  division?: string;
}

export const EstimateTypeHub: React.FC<EstimateTypeHubProps> = ({
  onSelectMode,
  engineerName = 'Er. Pranjal Barua',
  division = 'Golaghat Road Division, PWD (Civil)',
}) => {
  const [selectedCard, setSelectedCard] = useState<EstimateMode>('auto_query');

  const PATHS = [
    {
      id: 'auto_query' as EstimateMode,
      code: 'PATH // 01',
      badge: 'RECOMMENDED • FAST',
      badgeColor: 'border-cyan-400 text-cyan-300 bg-cyan-950/40',
      title: 'AutoEstimate Parametric Wizard',
      icon: Wand2,
      description:
        'Specify built-up plinth area (50–1500 sqm), building typology (Circuit House, Office, Dormitory, Cottage), and finish specs. Generates complete IS:1200 room schedules and DSR 2021 estimate instantly.',
      features: ['Plinth Area slider (50–1500 sqm)', 'DSR 2021 Rate engine', '1-click PWD Excel export'],
    },
    {
      id: 'upload_excel' as EstimateMode,
      code: 'PATH // 02',
      badge: 'VERIFIED BENCHMARK',
      badgeColor: 'border-emerald-400 text-emerald-300 bg-emerald-950/40',
      title: 'Ingest PWD Excel (.xlsx)',
      icon: FileSpreadsheet,
      description:
        'Upload or load verified PWD workbooks (e.g. FULL CIRCUIT HOUSE ESTIMATE.xlsx). Parses 241+ measurement rows, room perimeters, beam girths, and 29 BOQ items.',
      features: ['Circuit House Bokakhat preset', 'Native =D*F*J formulas', '0.00 discrepancy audit'],
    },
    {
      id: 'blueprint_takeoff' as EstimateMode,
      code: 'PATH // 03',
      badge: 'GEMINI VISION AI',
      badgeColor: 'border-indigo-400 text-indigo-300 bg-indigo-950/40',
      title: 'AI Blueprint Plan Takeoff',
      icon: Sparkles,
      description:
        'Drop architectural drawings in PDF, JPEG, or PNG format. Gemini Vision scans walls, OCRs dimension annotations (LxB), and extracts door/window schedules (D1, W1, V).',
      features: ['Interactive pan/zoom canvas', 'Scale calibration tool', 'Automatic opening counts'],
    },
    {
      id: 'blank_estimate' as EstimateMode,
      code: 'PATH // 04',
      badge: 'DEPARTMENTAL STANDARD',
      badgeColor: 'border-pink-400 text-pink-300 bg-pink-950/40',
      title: 'Blank Departmental Estimate',
      icon: Calculator,
      description:
        'Start a clean estimate from scratch for Special Repairs (SR) or Original Works. Enter custom room dimensions, assign Schedule of Rates items, and build your MB.',
      features: ['Special Repairs vs Original Works', 'Manual room builder', 'Custom DSR item assignment'],
    },
  ];

  const handleCardClick = (id: EstimateMode) => {
    soundFx.playClick();
    setSelectedCard(id);
  };

  const handleProceed = (id: EstimateMode) => {
    soundFx.playChapterChime();
    onSelectMode(id);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto py-2 font-mono text-white select-none">
      {/* Sci-Fi HUD Header Card */}
      <div className="bg-black/70 border border-cyan-500/30 rounded-xl p-4 sm:p-5 backdrop-blur-md relative">
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-cyan-300 flex items-center gap-1">
                <Activity className="w-3 h-3 text-cyan-400" />
                CHAPTER // 02 • ESTIMATE INITIATION HUB
              </span>
              <span className="text-[9px] text-white/40">
                • {engineerName} ({division})
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
              Select Estimation Synthesis Path
            </h3>
            <p className="text-xs text-white/60 font-sans">
              Choose an automated parametric wizard, verified PWD benchmark, multimodal blueprint takeoff, or blank MB.
            </p>
          </div>

          <button
            onClick={() => handleProceed(selectedCard)}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-black font-black flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 transition-all shrink-0"
          >
            <span>Launch Selected Path</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid of 4 Sci-Fi HUD Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PATHS.map((p) => {
          const isSelected = selectedCard === p.id;
          const Icon = p.icon;

          return (
            <div
              key={p.id}
              onClick={() => handleCardClick(p.id)}
              className={`relative rounded-xl p-4 transition-all cursor-pointer backdrop-blur-md flex flex-col justify-between group ${
                isSelected
                  ? 'bg-black/85 border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)]'
                  : 'bg-black/50 border border-white/15 hover:border-cyan-400/50 hover:bg-black/70'
              }`}
            >
              {/* Corner Reticle Accents */}
              <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-white/40" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-white/40" />
              <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l border-white/40" />
              <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-white/40" />

              <div>
                {/* Top Code & Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-white/60">
                    {p.code}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${p.badgeColor}`}>
                    {p.badge}
                  </span>
                </div>

                {/* Title & Icon */}
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                    isSelected ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/10 text-white/70'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    {p.title}
                  </h4>
                </div>

                {/* Description */}
                <p className="text-xs text-white/65 font-sans leading-relaxed mb-3">
                  {p.description}
                </p>

                {/* Feature Bullet Points */}
                <div className="space-y-1 mb-4">
                  {p.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[10px] text-white/70">
                      <span className="text-cyan-400">▹</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px]">
                <span className={isSelected ? 'text-cyan-300 font-bold' : 'text-white/40'}>
                  {isSelected ? '● ACTIVE SELECTION' : '○ CLICK TO SELECT'}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProceed(p.id);
                  }}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-cyan-400 text-black font-black hover:bg-cyan-300 shadow-xs'
                      : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
                  }`}
                >
                  <span>Launch</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EstimateTypeHub;
