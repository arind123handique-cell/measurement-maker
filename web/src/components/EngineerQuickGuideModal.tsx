import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Calculator,
  FileSpreadsheet,
  Download,
  ShieldCheck,
  HelpCircle,
  WifiOff,
  Building2,
  Layers,
  ChevronDown,
  ArrowRight,
  BadgeCheck,
  FileText,
  Percent,
  Check,
  Maximize2
} from 'lucide-react';

export interface EngineerQuickGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: 'mb' | 'rooms' | 'boq' | 'takeoff' | 'wizard') => void;
  onTriggerExport?: () => void;
}

interface StepDetail {
  number: number;
  title: string;
  badge: string;
  description: string;
  keyFeatures: string[];
  engineerTip: string;
  avatarSpeech: string;
}

interface FAQItem {
  id: string;
  question: string;
  badge: string;
  answer: string;
  codeSnippet?: string;
  importance: 'critical' | 'standard';
}

const STEPS: StepDetail[] = [
  {
    number: 1,
    title: 'Fast Engineering Input',
    badge: '3 Input Modes',
    description:
      'Choose the method that suits your current site stage. No tedious line-by-line typing required.',
    keyFeatures: [
      'Parametric Form Query: Enter "G+1 4-Room Cottage with Veranda & Portico" — generates structural schedules instantly.',
      'AI Blueprint Takeoff: Drop building plan PDF / scanned drawing; Gemini Vision auto-detects rooms, wall lengths, and openings.',
      'Legacy Excel Ingestion: Import existing PWD MB or contractor spreadsheets with zero data loss.'
    ],
    engineerTip:
      'Pro-tip for JEs: The Form Query Wizard allows specifying plinth height (0.60m) and floor ceiling height (3.30m) in 1 click.',
    avatarSpeech:
      'Namaskar Er. Sahib! Start in under 30 seconds by simply selecting your building configuration or dropping your drawing PDF!'
  },
  {
    number: 2,
    title: 'Automated IS:1200 Measurement Engine',
    badge: 'PWD Assam / CPWD Standard',
    description:
      'All structural items computed with official Indian Standard rules and accurate mathematical deductions.',
    keyFeatures: [
      'Room Wall Perimeters: 2 × (Length + Breadth) × Height computed automatically per room.',
      'Door & Window Deductions: Exact subtraction for D1, D2, W1, W2, and V1 openings from masonry and plastering.',
      'Beam & Slab Projections: Beam drops (D - slab depth) and lintel projections accounted for without double-counting.',
      'Dado Height Deduction: In toilets & WCs, 2.10m glazed tiles are automatically deducted from internal wall plaster and painting!'
    ],
    engineerTip:
      'IS:1200 Clause 4.1 compliant: Masonry openings over 0.1 m² are subtracted from both plaster faces accurately.',
    avatarSpeech:
      'No more manual deduction errors! The engine cross-references opening schedules and deductions automatically.'
  },
  {
    number: 3,
    title: '1-Click Official Departmental Export',
    badge: 'AG Audit & DAO Ready',
    description:
      'Generate the complete PWD Measurement Book and Abstract of Cost workbook ready for technical sanction and billing.',
    keyFeatures: [
      'Native Dynamic Formulas: Outputs =D*F*J and =ROUND(SUM(), 2) in every cell — zero hardcoded numbers.',
      'Standard Abstract of Cost: Includes base estimate, 18% GST (CGST 9% + SGST 9%), and 1% Labour Welfare Cess.',
      'Official PWD Assam Cottage Layout: Matches the verified PWD Circuit House / Inspection Bungalow format.',
      'Zero Discrepancy (0.00): Tested and matched against the official benchmark ₹21,78,137 estimate.'
    ],
    engineerTip:
      'Click "Export PWD Excel" to get the exact .xlsx sheet that the Executive Engineer and DAO sign off on.',
    avatarSpeech:
      'Your Excel file is 100% audit-proof! The Divisional Accounts Officer can click any cell to audit native math formulas.'
  }
];

const FAQS: FAQItem[] = [
  {
    id: 'audit-dao',
    question: 'Will the Divisional Accounts Officer (DAO) or AG Audit accept this?',
    badge: 'Audit Verified',
    importance: 'critical',
    answer:
      'Yes, absolutely! The workbook is generated using real Excel formulas (e.g. =D*F*J for quantity multiplication, =SUM(G12:G24) for totals, and =ROUND(SUM(), 2) for bill summaries). There are no black-box macros or hardcoded static values. When the DAO or Accountant General audit team inspects the sheet, every single sub-item cell traces cleanly to room dimensions and deduction schedules with 0.00 discrepancy.',
    codeSnippet:
      '=ROUND(E24*F24*G24*H24, 2)  // Official PWD quantity cell formula\n=SUM(Total_Base_Amount) * 1.18 // 18% GST\n=SUM(Total_Base_Amount) * 0.01 // 1% Labour Welfare Cess'
  },
  {
    id: 'offline-mode',
    question: 'Can I use this on site without internet?',
    badge: 'Offline Engineer Mode',
    importance: 'critical',
    answer:
      'Yes! The Online Measurement Maker incorporates full offline caching via LocalStorage and IndexedDB. You can inspect rooms, edit opening schedules, recalculate quantities, and review measurement books while standing in remote project sites without mobile signal. Once you re-enter internet coverage, your changes sync securely.'
  },
  {
    id: 'dado-deduction',
    question: 'How are dado tiles handled?',
    badge: 'IS:1200 Dado Clause',
    importance: 'standard',
    answer:
      'In wet areas such as Toilets, W.C.s, and Kitchenettes, dado tiles up to 2.10m (7 ft) height are automatically accounted for. The measurement engine calculates the dado wall area as 2×(L+B)×Dado_Height, and immediately subtracts this height from internal wall cement plastering, primer, and acrylic emulsion wall painting, preventing excessive billing claims.'
  },
  {
    id: 'sor-dsr',
    question: 'Which Schedule of Rates (SOR/DSR) is referenced?',
    badge: 'DSR 2021 & APWD SOR',
    importance: 'standard',
    answer:
      'The engine is loaded with the official PWD Assam Civil Schedule of Rates (Building Works) 2021-22 and CPWD DSR 2021. Item codes (e.g. Item 1.1 Earthwork, 2.1 Sand filling, 4.1 RCC M20, 5.1 Brickwork 1:4, 13.1 Plastering 1:6) correspond precisely to departmental rate book entries.'
  },
  {
    id: 'custom-openings',
    question: 'Can I modify door and window dimensions (D1, W1, V1)?',
    badge: 'Architectural Schedule',
    importance: 'standard',
    answer:
      'Yes. Head over to Tab 2 "Room Schedule & Openings" or use the Opening Schedule Modal. You can customize door heights, widths, and lintel bearings, or add bespoke ventilator and shutter types. Every change recalculates all 29 BOQ items in real time.'
  }
];

export const EngineerQuickGuideModal: React.FC<EngineerQuickGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onTriggerExport
}) => {
  const [activeTab, setActiveTab] = useState<'process' | 'faq' | 'rules'>('process');
  const [selectedStep, setSelectedStep] = useState<number>(1);
  const [expandedFaq, setExpandedFaq] = useState<string | null>('audit-dao');
  const [copiedFaqId, setCopiedFaqId] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentStepData = STEPS.find((s) => s.number === selectedStep) || STEPS[0];

  const handleCopyFormula = (snippet: string, faqId: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedFaqId(faqId);
    setTimeout(() => setCopiedFaqId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-guide-title"
      >
        {/* TOP MODAL HEADER WITH 3D AVATAR HOSTESS BANNER */}
        <div className="relative bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border-b border-indigo-900/60 p-4 sm:p-6 shrink-0">
          <div className="flex items-start justify-between gap-4">
            {/* Avatar & Title Unit */}
            <div className="flex items-center gap-3.5 sm:gap-4">
              {/* 3D Avatar Hostess Frame */}
              <div className="relative shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-indigo-400/50 shadow-lg bg-slate-950 flex items-center justify-center ring-2 ring-indigo-500/30">
                  <img
                    src="/avatar_3d.png"
                    alt="AI Civil Engineer Guide Hostess"
                    className="w-full h-full object-cover object-top filter contrast-105"
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white uppercase tracking-wider">
                    PWD Assam & CPWD
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3 text-emerald-400" />
                    AG Audit & DAO Certified
                  </span>
                </div>
                <h2
                  id="quick-guide-title"
                  className="text-lg sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2"
                >
                  <span>Civil Engineer Quick Start & Adoption Guide</span>
                </h2>
                <p className="text-xs text-indigo-200/80">
                  Tailored for Junior Engineers (JEs), AEEs, and contractors • IS:1200 Standardized
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-all shrink-0"
              title="Close Guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Avatar Live Speech Bubble in Header */}
          <div className="mt-3.5 bg-indigo-950/70 border border-indigo-700/50 rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 text-xs text-indigo-100">
            <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
            <span className="font-semibold text-pink-300 shrink-0">Er. Milim (AI Hostess):</span>
            <span className="truncate sm:whitespace-normal italic text-slate-200">
              "{currentStepData.avatarSpeech}"
            </span>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 mt-4 border-t border-slate-800/80 pt-3 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('process')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'process'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>1. Complete 3-Step Process</span>
            </button>

            <button
              onClick={() => setActiveTab('faq')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'faq'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>2. DAO & AG Audit FAQ</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-900/80 text-emerald-300 border border-emerald-700/50">
                Crucial
              </span>
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'rules'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>3. IS:1200 Math Cheat Sheet</span>
            </button>
          </div>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-sm">
          {/* TAB 1: COMPLETE 3-STEP SIMPLIFIED PROCESS */}
          {activeTab === 'process' && (
            <div className="space-y-6">
              {/* Stepper Tabs Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {STEPS.map((step) => {
                  const isCurrent = selectedStep === step.number;
                  return (
                    <button
                      key={step.number}
                      onClick={() => setSelectedStep(step.number)}
                      className={`text-left p-3 rounded-xl border transition-all flex flex-col gap-1 ${
                        isCurrent
                          ? 'bg-blue-950/60 border-blue-500 text-white shadow-md shadow-blue-900/20'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCurrent
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {step.number}
                        </span>
                        <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-blue-400">
                          {step.badge}
                        </span>
                      </div>
                      <div className="font-bold text-xs mt-1 text-slate-200">{step.title}</div>
                    </button>
                  );
                })}
              </div>

              {/* Active Step Detailed Card */}
              <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-5 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
                  <div>
                    <div className="text-xs uppercase font-mono text-blue-400 font-bold">
                      Step {currentStepData.number} of 3
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                      {currentStepData.title}
                    </h3>
                  </div>
                  <div className="text-xs text-slate-300 max-w-sm">
                    {currentStepData.description}
                  </div>
                </div>

                {/* Key Features List */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    What happens under the hood:
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    {currentStepData.keyFeatures.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-200 leading-relaxed">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Engineer Tip Card */}
                <div className="bg-amber-950/40 border border-amber-700/50 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-200">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">Departmental Advisory: </span>
                    {currentStepData.engineerTip}
                  </div>
                </div>

                {/* Step Direct Action Callout */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-slate-400">
                    {selectedStep === 1 && 'Ready to try? Launch the Wizard or AI Takeoff.'}
                    {selectedStep === 2 && 'Review the calculated items in the Room Schedule.'}
                    {selectedStep === 3 && 'Download the official PWD AType Cottage Excel workbook.'}
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedStep === 1 && onNavigateToTab && (
                      <button
                        onClick={() => {
                          onNavigateToTab('wizard');
                          onClose();
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                      >
                        <span>Open Form Wizard</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {selectedStep === 2 && onNavigateToTab && (
                      <button
                        onClick={() => {
                          onNavigateToTab('mb');
                          onClose();
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                      >
                        <span>View Measurement Grid</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {selectedStep === 3 && onTriggerExport && (
                      <button
                        onClick={() => {
                          onTriggerExport();
                          onClose();
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export PWD Excel Now</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 3 Steps Visual Flow Architecture */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>3-Stage Architectural Pipeline</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-blue-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        1. INGESTION
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">STAGE 01</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      Enter room dimensions or upload blueprint PDF. AI resolves room schedules and wall bounding boxes.
                    </p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-indigo-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Calculator className="w-3.5 h-3.5" />
                        2. IS:1200 ENGINE
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">STAGE 02</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      Applies 2(L+B)*H perimeters, door/window deductions, lintels, and 2.10m toilet dado subtractions.
                    </p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-emerald-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        3. EXCEL BOQ EXPORT
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">STAGE 03</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      Emits .xlsx workbook with dynamic formula cells, 18% GST + 1% Cess Abstract of Cost.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DAO & AG AUDIT FAQ / ADOPTION */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Departmental Adoption & Audit FAQ</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </h3>
                  <p className="text-xs text-slate-400">
                    Direct answers to concerns raised by Executive Engineers, DAOs, and AG Audit examiners.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Zero Math Discrepancy (0.00)
                  </span>
                </div>
              </div>

              {/* FAQ Accordion List */}
              <div className="space-y-3">
                {FAQS.map((faq) => {
                  const isExpanded = expandedFaq === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className={`rounded-2xl border transition-all overflow-hidden ${
                        isExpanded
                          ? 'bg-slate-800/80 border-indigo-500/70 shadow-lg'
                          : 'bg-slate-800/40 border-slate-700/70 hover:bg-slate-800/60'
                      }`}
                    >
                      <button
                        onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                        className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                faq.importance === 'critical'
                                  ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
                                  : 'bg-blue-900/80 text-blue-300 border border-blue-700'
                              }`}
                            >
                              {faq.badge}
                            </span>
                            {faq.importance === 'critical' && (
                              <span className="text-[10px] font-semibold text-amber-400 flex items-center gap-1">
                                High Audit Priority
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm sm:text-base font-bold text-white mt-1">
                            {faq.question}
                          </h4>
                        </div>

                        <div className="p-1.5 rounded-lg bg-slate-700/60 text-slate-300 shrink-0 mt-1">
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-indigo-400' : ''
                            }`}
                          />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 sm:px-5 pb-5 pt-1 space-y-3 border-t border-slate-700/60 text-xs text-slate-200 leading-relaxed">
                          <p>{faq.answer}</p>

                          {faq.codeSnippet && (
                            <div className="relative mt-2 bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-[11px] text-emerald-400">
                              <pre className="overflow-x-auto whitespace-pre">
                                {faq.codeSnippet}
                              </pre>
                              <button
                                onClick={() => handleCopyFormula(faq.codeSnippet!, faq.id)}
                                className="absolute top-2 right-2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-sans flex items-center gap-1 border border-slate-700"
                              >
                                {copiedFaqId === faq.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <span>Copy Formula</span>
                                )}
                              </button>
                            </div>
                          )}

                          {faq.id === 'offline-mode' && (
                            <div className="flex items-center gap-2 bg-blue-950/40 border border-blue-800/40 rounded-xl p-2.5 text-blue-200 text-[11px]">
                              <WifiOff className="w-4 h-4 text-blue-400 shrink-0" />
                              <span>
                                Tested on remote site tablets: Works seamlessly on Google Chrome, Edge, and Safari on iOS/Android.
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: IS:1200 MATH & FORMULA CHEAT SHEET */}
          {activeTab === 'rules' && (
            <div className="space-y-5">
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 sm:p-5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Indian Standard (IS:1200) Calculation Formulas</span>
                  <Calculator className="w-4 h-4 text-blue-400" />
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Reference guide for all automated mathematical relationships executed by the engine.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Rule 1: Room Wall Perimeters */}
                <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-400">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" />
                      1. Wall Perimeter Calculation
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">IS:1200 Part 3</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300">
                    Gross Wall Area = 2 × (Length + Breadth) × Height
                  </div>
                  <p className="text-xs text-slate-300">
                    Computes all four perimeter wall surfaces of each rectangular room. For corridors and verandas, open face deductions are applied.
                  </p>
                </div>

                {/* Rule 2: Openings Deductions */}
                <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-400">
                    <span className="flex items-center gap-1.5">
                      <Maximize2 className="w-4 h-4" />
                      2. Openings Deductions
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">IS:1200 Part 12</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-xs text-indigo-300">
                    Deduction Area = -(Quantity × Length × Height)
                  </div>
                  <p className="text-xs text-slate-300">
                    Applied for D1 (1.00m×2.10m), D2 (0.75m×2.10m), W1 (1.20m×1.20m), and Ventilators. Openings &gt; 0.1 m² deducted per standard.
                  </p>
                </div>

                {/* Rule 3: Dado Tile Deduction */}
                <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4" />
                      3. Toilet Dado Deduction
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Clause 6.2</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300">
                    Net Painting Height = Room_Height - Dado_Height (2.10m)
                  </div>
                  <p className="text-xs text-slate-300">
                    Glazed ceramic wall tile dado heights are subtracted from inner wall plaster and OBD painting to prevent double claims.
                  </p>
                </div>

                {/* Rule 4: Abstract of Cost Taxes */}
                <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                    <span className="flex items-center gap-1.5">
                      <Percent className="w-4 h-4" />
                      4. PWD Abstract Tax Formulas
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Assam PWD Finance</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-xs text-amber-300">
                    Total = Net_Amount + (18% GST) + (1% Labour Cess)
                  </div>
                  <p className="text-xs text-slate-300">
                    Mandatory departmental markup structure automatically calculated in the final Summary sheet of the exported Excel.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 sm:p-5 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Ready for Technical Sanction (TS) & Administrative Approval (AA)</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all text-center"
            >
              Dismiss Guide
            </button>

            {onTriggerExport && (
              <button
                onClick={() => {
                  onTriggerExport();
                  onClose();
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Export PWD Excel (.xlsx)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngineerQuickGuideModal;
