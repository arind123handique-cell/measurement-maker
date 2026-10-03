import React from 'react';
import {
  ShieldCheck,
  Compass,
  Building2,
  FileSpreadsheet,
  FileCheck2,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

export type StepNumber = 1 | 2 | 3 | 4 | 5;

export interface StepProgressNavProps {
  currentStep: StepNumber;
  onSelectStep: (step: StepNumber) => void;
  canAdvance?: boolean;
}

const STEPS = [
  { step: 1, label: '1. Auth & Engineer Profile', icon: ShieldCheck, desc: 'Supabase & Offline Mode' },
  { step: 2, label: '2. Estimate Initiation Hub', icon: Compass, desc: 'Auto / Excel / Blueprint' },
  { step: 3, label: '3. Space & Room Schedule', icon: Building2, desc: 'Assam Type & Openings' },
  { step: 4, label: '4. Measurement Book (MB)', icon: FileSpreadsheet, desc: 'IS:1200 Tabular Grid' },
  { step: 5, label: '5. Abstract of Cost & Export', icon: FileCheck2, desc: 'GST 18% & PWD Excel' },
] as const;

export const StepProgressNav: React.FC<StepProgressNavProps> = ({
  currentStep,
  onSelectStep,
  canAdvance = true,
}) => {
  const handlePrev = () => {
    if (currentStep > 1) {
      onSelectStep((currentStep - 1) as StepNumber);
    }
  };

  const handleNext = () => {
    if (currentStep < 5 && canAdvance) {
      onSelectStep((currentStep + 1) as StepNumber);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-lg backdrop-blur-xl space-y-2">
      {/* Stepper Buttons Row */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar pb-1">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.step;
          const isCompleted = currentStep > s.step;

          return (
            <button
              key={s.step}
              onClick={() => onSelectStep(s.step as StepNumber)}
              className={`flex-1 min-w-[170px] p-2.5 rounded-xl text-left border transition-all flex items-center gap-2.5 ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-900/40'
                  : isCompleted
                  ? 'bg-slate-800/80 text-emerald-400 border-emerald-800/60 hover:bg-slate-800'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : isCompleted
                    ? 'bg-emerald-950 text-emerald-400'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <div className="text-[11px] font-bold truncate leading-tight">
                  {s.label}
                </div>
                <div
                  className={`text-[9px] truncate ${
                    isActive
                      ? 'text-blue-100'
                      : isCompleted
                      ? 'text-emerald-500'
                      : 'text-slate-500'
                  }`}
                >
                  {s.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation Quick Bar (Prev / Next) */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 px-1 text-xs">
        <button
          onClick={handlePrev}
          disabled={currentStep === 1}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
            currentStep === 1
              ? 'opacity-40 text-slate-500 cursor-not-allowed'
              : 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-850'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous Step</span>
        </button>

        <span className="text-[11px] font-mono text-slate-400">
          Step <span className="text-white font-bold">{currentStep}</span> of 5
        </span>

        <button
          onClick={handleNext}
          disabled={currentStep === 5 || !canAdvance}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold text-xs transition-all ${
            currentStep === 5
              ? 'opacity-40 text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm active:scale-95'
          }`}
        >
          <span>Next Step</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default StepProgressNav;
