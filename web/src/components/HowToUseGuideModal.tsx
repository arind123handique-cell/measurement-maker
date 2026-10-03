import React from 'react';
import {
  X,
  ShieldCheck,
  Compass,
  Building2,
  FileSpreadsheet,
  FileCheck2,
  CheckCircle2,
  BookOpen,
  Info,
  Sparkles,
  Ruler
} from 'lucide-react';

export interface HowToUseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToStep?: (step: 1 | 2 | 3 | 4 | 5) => void;
}

export const HowToUseGuideModal: React.FC<HowToUseGuideModalProps> = ({
  isOpen,
  onClose,
  onJumpToStep,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                PWD Assam Manual
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                IS:1200 & DSR 2021
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Civil Engineering Standard
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-400" />
              <span>How to Use: 5-Step Guided Engineering Flow</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Standard Operating Procedure (SOP) for preparing, auditing, and exporting official PWD Measurement Books and Detailed Estimates.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* Workflow Steps Overview */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>The 5-Step Engineering Workflow</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Step 1 */}
              <div
                onClick={() => {
                  if (onJumpToStep) {
                    onJumpToStep(1);
                    onClose();
                  }
                }}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600/30 text-blue-300 border border-blue-500/30">
                    Step 1
                  </span>
                  <ShieldCheck className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-blue-300">
                  Auth & Engineer Profile
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Authenticate using Supabase cloud credentials or click <strong>"Continue as Offline Site Engineer"</strong> for zero-login field work. Select your designation (Junior Engineer, AEE, or EE) to automatically populate official PWD signature blocks.
                </p>
              </div>

              {/* Step 2 */}
              <div
                onClick={() => {
                  if (onJumpToStep) {
                    onJumpToStep(2);
                    onClose();
                  }
                }}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
                    Step 2
                  </span>
                  <Compass className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-indigo-300">
                  Estimate Initiation Hub
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Select your estimation path: <strong>Path A (AutoEstimate Form Query)</strong> synthesizes full schedules from area inputs, <strong>Path B (Ingest PWD Excel)</strong> parses verified workbooks like Bokakhat Circuit House, and <strong>Path C (Blueprint Takeoff)</strong> extracts rooms using Gemini Vision.
                </p>
              </div>

              {/* Step 3 */}
              <div
                onClick={() => {
                  if (onJumpToStep) {
                    onJumpToStep(3);
                    onClose();
                  }
                }}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600/30 text-emerald-300 border border-emerald-500/30">
                    Step 3
                  </span>
                  <Building2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-300">
                  Space & Room Schedule
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Configure Assam Type cottage rooms, dimensions (Length × Breadth × Height), and door/window opening schedules (D1, W1, V). Switch between the manual architectural builder, parametric AI wizard, and blueprint takeoff anytime.
                </p>
              </div>

              {/* Step 4 */}
              <div
                onClick={() => {
                  if (onJumpToStep) {
                    onJumpToStep(4);
                    onClose();
                  }
                }}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600/30 text-amber-300 border border-amber-500/30">
                    Step 4
                  </span>
                  <FileSpreadsheet className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-amber-300">
                  IS:1200 Measurement Book (MB)
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Review the official tabular MB grid. Features automated Long Wall / Short Wall perimeters, door/window deductions, and beam girth projections conforming 100% to Indian Standard IS:1200 measurement rules.
                </p>
              </div>

              {/* Step 5 */}
              <div
                onClick={() => {
                  if (onJumpToStep) {
                    onJumpToStep(5);
                    onClose();
                  }
                }}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer group md:col-span-2"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600/30 text-purple-300 border border-purple-500/30">
                    Step 5
                  </span>
                  <FileCheck2 className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-purple-300">
                  Abstract of Cost & BOQ Reconciliation
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Examine statutory levies (18% GST + 1% Labour Welfare Cess + 3% Contingencies) on the certified Civil Works subtotal. Cross-reconcile all 29 DSR items against the sanctioned tender with zero discrepancy, and download the official multi-sheet PWD Excel (.xlsx) file in 1 click.
                </p>
              </div>
            </div>
          </div>

          {/* IS:1200 Engineering Rules Summary */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Ruler className="w-4 h-4 text-emerald-400" />
              <span>IS:1200 Measurement Standard Rules Cheat Sheet</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-bold text-blue-300 block mb-1">
                  1. Plastering Deductions (IS:1200 Part 12)
                </span>
                <p className="text-slate-400">
                  • Area ≤ 0.50 sqm: No deduction is made, nor are jambs/soffits added.<br />
                  • 0.50 &lt; Area ≤ 3.00 sqm: Deduction made for one face only; ends, jambs, and sills not added.<br />
                  • Area &gt; 3.00 sqm: Deduction made for both faces; jambs and soffits added.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-bold text-emerald-300 block mb-1">
                  2. Brick Masonry Deductions (IS:1200 Part 3)
                </span>
                <p className="text-slate-400">
                  • Openings up to 0.10 sqm in area are not deducted.<br />
                  • Ends of beams, posts, rafters, purlins up to 500 sqcm in section are not deducted.<br />
                  • Wall plates and lintel bearings are deducted per physical dimensions.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-bold text-amber-300 block mb-1">
                  3. Painting & Finishing Multipliers
                </span>
                <p className="text-slate-400">
                  • Panelled doors: 1.125 times flat area per face.<br />
                  • Glazed / Sash windows: 0.80 times flat area per face.<br />
                  • Flush doors: 1.00 times flat area.<br />
                  • Corrugated sheet roofing: 1.14 multiplier for slopes.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-bold text-purple-300 block mb-1">
                  4. RCC & Concrete Works (IS:1200 Part 2)
                </span>
                <p className="text-slate-400">
                  • Columns measured from top of column base to underside of beam or slab.<br />
                  • Beams measured between columns; depth measured below slab soffit to prevent double count.<br />
                  • Reinforcement steel measured by linear length × theoretical weight.
                </p>
              </div>
            </div>
          </div>

          {/* Quick FAQ / Tips */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white text-xs">
                Field Site Deployment Note
              </span>
              <p className="text-[11px] text-slate-400">
                The web app is optimized for spot inspections on tablet and mobile. You do not need an active internet connection after loading: all calculations, room schedules, deduction formulas, and Excel export run 100% locally in your browser.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/90 text-xs">
          <span className="text-slate-400 font-mono text-[11px]">
            Benchmark: FULL CIRCUIT HOUSE ESTIMATE.xlsx (Bokakhat PWD)
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md active:scale-95 transition-all"
          >
            Got it, Return to Workspace
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowToUseGuideModal;
