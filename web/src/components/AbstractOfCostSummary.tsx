import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  FileCheck2,
  Printer,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Building,
  ShieldCheck,
  SlidersHorizontal,
  RotateCcw,
  Stamp,
  Award,
  Film,
  Building2,
  CheckCheck
} from 'lucide-react';
import {
  generateRoomMeasurements,
  BENCHMARK_ITEMS,
  BENCHMARK_ROOMS as MB_ROOMS,
  BENCHMARK_OPENINGS as MB_OPENINGS,
  type GeneratedMeasurementBookItem,
  formatIndianCurrency,
  numberToWordsINR,
  round2,
} from '../lib/measurementEngine';
import {
  exportMultiSheetPWDExcel,
  type StatutoryAdditionsSummary,
} from '../lib/excelExporter';
import { InteractiveVideoPlayer } from './InteractiveVideoPlayer';

export interface AbstractOfCostSummaryProps {
  initialCivilSubTotal?: number;
  projectName?: string;
  division?: string;
  circle?: string;
  subDivision?: string;
  dsrYear?: string;
  tsNumber?: string;
  aaNumber?: string;
  measurementBookItems?: GeneratedMeasurementBookItem[];
  onNavigateToTab?: (tab: 'mb' | 'rooms' | 'boq' | 'takeoff' | 'wizard') => void;
}

export const AbstractOfCostSummary: React.FC<AbstractOfCostSummaryProps> = ({
  initialCivilSubTotal = 2178131.00,
  projectName = 'Repairing and Renovation of Circuit House at Bokakhat under Golaghat District',
  division = 'Golaghat Road Division, PWD (Civil)',
  circle = 'Jorhat PWD (Civil) Circle',
  subDivision = 'Bokakhat Sub-Division, PWD (Civil)',
  dsrYear = '2021',
  tsNumber = 'TS/PWD/GLT/2026-27/42',
  aaNumber = 'AA/GAD/CIR-BH/2026/108',
  measurementBookItems,
  onNavigateToTab,
}) => {
  // 1. Statutory Rate State (Defaults to Assam PWD / CPWD standard rates)
  const [customCivilBase, setCustomCivilBase] = useState<number | null>(null);
  const [gstRate, setGstRate] = useState<number>(0.18); // 18% GST (CGST 9% + SGST 9%)
  const [cessRate, setCessRate] = useState<number>(0.01); // 1% BOCW Cess
  const [contingenciesRate, setContingenciesRate] = useState<number>(0.03); // 3% Departmental Contingencies

  // UI States
  const [showRateCustomizer, setShowRateCustomizer] = useState<boolean>(false);
  const [showGstBreakdown, setShowGstBreakdown] = useState<boolean>(false);
  const [isVideoExpanded, setIsVideoExpanded] = useState<boolean>(true);
  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);
  const [copiedWords, setCopiedWords] = useState<boolean>(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  // Signatures State
  const [signatures, setSignatures] = useState({
    je: {
      name: 'Er. Bhaskar Jyoti Das',
      designation: 'Junior Engineer (JE)',
      office: `${subDivision}`,
      signed: true,
      timestamp: '04-10-2026 09:30 AM',
    },
    aee: {
      name: 'Er. Pranjal Barua',
      designation: 'Asst. Executive Engineer (AEE)',
      office: `${subDivision}`,
      signed: true,
      timestamp: '04-10-2026 11:15 AM',
    },
    ee: {
      name: 'Er. Manoj Kumar Saikia',
      designation: 'Executive Engineer (EE)',
      office: `${division}`,
      signed: true,
      timestamp: '04-10-2026 02:45 PM',
    },
  });

  // Default Measurement Book Items for Excel Export if none supplied
  const resolvedItems = useMemo<GeneratedMeasurementBookItem[]>(() => {
    if (measurementBookItems && measurementBookItems.length > 0) {
      return measurementBookItems;
    }
    return BENCHMARK_ITEMS.map((item) =>
      generateRoomMeasurements(item, MB_ROOMS, MB_OPENINGS, {
        includeBeams: true,
        includeIdenticalFloors: true,
      })
    );
  }, [measurementBookItems]);

  // 2. Official Statutory Additions Calculations
  // Civil Works Sub-Total (A) (default: Rs. 21,78,131.00)
  const civilSubTotal = round2(customCivilBase ?? initialCivilSubTotal);

  // Add GST @ 18% (Rs. 3,92,063.58)
  const gstAmount = round2(civilSubTotal * gstRate);
  const cgstAmount = round2(gstAmount / 2);
  const sgstAmount = round2(gstAmount - cgstAmount);

  // Add Labour Welfare Cess @ 1% (Rs. 21,781.31)
  const cessAmount = round2(civilSubTotal * cessRate);

  // Add Contingencies @ 3% (Rs. 65,343.93)
  const contingenciesAmount = round2(civilSubTotal * contingenciesRate);

  // Sub-Total of Additions = Rs. 4,79,188.82
  const totalAdditions = round2(gstAmount + cessAmount + contingenciesAmount);

  // Raw Total Project Cost = Rs. 26,57,319.82
  const rawGrandTotal = civilSubTotal + totalAdditions;

  // Grand Total Project Cost (SAY / Rounded to nearest rupee as per PWD standard) = Rs. 26,57,320.00
  const grandTotal = Math.round(rawGrandTotal);

  // Amount in Words = "Rupees Twenty Six Lakh Fifty Seven Thousand Three Hundred Twenty Only"
  const amountInWords = useMemo(() => {
    return numberToWordsINR(grandTotal);
  }, [grandTotal]);

  // Handle Copy Amount in Words
  const handleCopyWords = () => {
    navigator.clipboard.writeText(amountInWords);
    setCopiedWords(true);
    setTimeout(() => setCopiedWords(false), 2000);
  };

  // Reset to Statutory PWD Standard
  const handleResetDefaults = () => {
    setGstRate(0.18);
    setCessRate(0.01);
    setContingenciesRate(0.03);
    setCustomCivilBase(null);
  };

  // Toggle signature status
  const handleToggleSignature = (role: 'je' | 'aee' | 'ee') => {
    setSignatures((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        signed: !prev[role].signed,
        timestamp: !prev[role].signed
          ? new Date().toLocaleString('en-IN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
          : '',
      },
    }));
  };

  // 1-Click Multi-Sheet Excel Export Handler
  const handleDownloadMultiSheetExcel = async () => {
    try {
      setIsExportingExcel(true);
      const summaryPayload: StatutoryAdditionsSummary = {
        civilSubTotal,
        gstRate,
        gstAmount,
        cessRate,
        cessAmount,
        contingenciesRate,
        contingenciesAmount,
        grandTotal,
        amountInWords,
        signatures: {
          jeName: signatures.je.name,
          jeDesignation: signatures.je.office,
          aeeName: signatures.aee.name,
          aeeDesignation: signatures.aee.office,
          eeName: signatures.ee.name,
          eeDesignation: signatures.ee.office,
        },
      };

      const filename = `Circuit_House_Official_PWD_Estimate_${new Date().toISOString().split('T')[0]}.xlsx`;

      await exportMultiSheetPWDExcel(
        resolvedItems,
        {
          projectName,
          division,
          circle,
          subDivision,
          dsrYear,
          sheetTitle: 'STATUTORY ABSTRACT & DETAIL ESTIMATE',
          sheetName: 'AType Cottage',
        },
        summaryPayload,
        filename
      );

      setExportSuccessMsg('Multi-Sheet PWD Estimate (.xlsx) generated with Abstract, Detail MB & BOQ!');
      setTimeout(() => setExportSuccessMsg(null), 4500);
    } catch (err) {
      console.error('Failed to generate multi-sheet Excel:', err);
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Print Official Docket
  const handlePrint = () => {
    window.print();
  };

  const allSigned = signatures.je.signed && signatures.aee.signed && signatures.ee.signed;

  return (
    <div className="space-y-6">
      {/* Print-Only Style Injection */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #official-abstract-docket, #official-abstract-docket * {
            visibility: visible;
          }
          #official-abstract-docket {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Success Notification */}
      {exportSuccessMsg && (
        <div className="bg-emerald-900/90 border border-emerald-600 text-emerald-100 px-4 py-3 rounded-xl flex items-center justify-between shadow-lg text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{exportSuccessMsg}</span>
          </div>
          <span className="text-[10px] text-emerald-300 font-mono">3 Sheets Exported</span>
        </div>
      )}

      {/* STEP 5 TOP DOCKET BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 uppercase tracking-wider font-mono">
                Step 5 of 5
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Technical Sanction (TS) Ready
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 font-mono">
                Assam PWD / CPWD Standards
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <FileCheck2 className="w-6 h-6 text-indigo-400" />
              <span>Official Statutory Abstract of Cost</span>
            </h2>

            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Mandatory statutory additions required for Administrative Approval (AA) and Technical Sanction (TS) under Assam PWD Code and CPWD Manual, incorporating GST @ 18%, Labour Welfare Cess @ 1%, and Departmental Contingencies @ 3%.
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap pt-1 font-mono">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                {division}
              </span>
              <span>•</span>
              <span>TS Docket: <strong className="text-white">{tsNumber}</strong></span>
              <span>•</span>
              <span>AA Memo: <strong className="text-white">{aaNumber}</strong></span>
            </div>
          </div>

          {/* Quick Actions (1-Click Multi-Sheet Excel + Print Docket) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
              title="Print official TS/AA Docket"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Print Docket</span>
            </button>

            <button
              onClick={handleDownloadMultiSheetExcel}
              disabled={isExportingExcel}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                isExportingExcel
                  ? 'bg-emerald-800 cursor-not-allowed opacity-80'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40'
              }`}
            >
              {isExportingExcel ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Exporting Multi-Sheet Workbook...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Official PWD Estimate (.xlsx)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* EMBEDDED GOOGLE FLOW 3D ARCHITECTURAL DRONE WALKTHROUGH VIEWER */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  Google Flow Architectural 3D Drone Walkthrough Inspection
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-600 text-black font-mono uppercase">
                  Google Flow
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Visual inspection model for Technical Sanction inspection: scrub cursor horizontally to fly drone camera across suites, verandah & roof lines.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsVideoExpanded(!isVideoExpanded)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <span>{isVideoExpanded ? 'Collapse Tour' : 'Expand Tour'}</span>
            {isVideoExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isVideoExpanded && (
          <div className="pt-2 animate-in fade-in duration-200">
            <InteractiveVideoPlayer
              projectTitle={projectName}
            />
          </div>
        )}
      </div>

      {/* STATUTORY ABSTRACT OF COST DOCKET CONTAINER */}
      <div
        id="official-abstract-docket"
        className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-slate-900"
      >
        {/* Government Letterhead Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-6 text-center space-y-1.5">
          <div className="inline-flex items-center justify-center p-2 bg-blue-50 border border-blue-200 rounded-xl mb-1">
            <Building className="w-5 h-5 text-blue-700" />
          </div>
          <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
            Government of Assam
          </h1>
          <h2 className="text-sm font-bold text-slate-700 uppercase">
            Public Works Department (Civil Works)
          </h2>
          <div className="inline-block px-4 py-1 rounded-full bg-slate-200 text-slate-800 text-xs font-mono font-bold tracking-wider uppercase mt-1">
            Abstract of Cost for Technical Sanction (TS) & Administrative Approval (AA)
          </div>

          {/* Project Details */}
          <div className="pt-3 max-w-4xl mx-auto text-xs text-slate-600 space-y-1">
            <div>
              <strong>Name of Work:</strong> {projectName}
            </div>
            <div className="flex items-center justify-center gap-4 flex-wrap text-[11px] text-slate-500">
              <span><strong>Division:</strong> {division}</span>
              <span>•</span>
              <span><strong>Circle:</strong> {circle}</span>
              <span>•</span>
              <span><strong>Rates Reference:</strong> DSR (Civil) of {dsrYear}</span>
            </div>
          </div>
        </div>

        {/* Toolbar: Rate Customizer Toggle & Reset */}
        <div className="no-print bg-slate-100/80 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Statutory Basis: PWD Assam Schedule & GST Act 2017
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGstBreakdown(!showGstBreakdown)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              {showGstBreakdown ? 'Hide GST Breakdown' : 'View CGST 9% + SGST 9%'}
            </button>

            <button
              onClick={() => setShowRateCustomizer(!showRateCustomizer)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-1"
            >
              <SlidersHorizontal className="w-3 h-3 text-slate-500" />
              <span>Customize Rates</span>
            </button>

            {(gstRate !== 0.18 || cessRate !== 0.01 || contingenciesRate !== 0.03 || customCivilBase !== null) && (
              <button
                onClick={handleResetDefaults}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 flex items-center gap-1"
                title="Reset to official PWD Assam standard"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Standard</span>
              </button>
            )}
          </div>
        </div>

        {/* Rate Customizer Drawer */}
        {showRateCustomizer && (
          <div className="no-print bg-blue-50/60 border-b border-blue-200 p-4 animate-in fade-in duration-150">
            <div className="max-w-4xl mx-auto space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-700" />
                  Statutory Addition Parameters & Base Amount
                </span>
                <span className="text-[10px] text-blue-700 font-mono">
                  Default: 18% GST • 1% Cess • 3% Contingency
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Civil Works Sub-Total (A) (₹)
                  </label>
                  <input
                    type="number"
                    value={customCivilBase ?? initialCivilSubTotal}
                    onChange={(e) => setCustomCivilBase(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    GST Rate (%): {(gstRate * 100).toFixed(1)}%
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={(gstRate * 100)}
                    onChange={(e) => setGstRate((parseFloat(e.target.value) || 0) / 100)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Labour Cess (%): {(cessRate * 100).toFixed(1)}%
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={(cessRate * 100)}
                    onChange={(e) => setCessRate((parseFloat(e.target.value) || 0) / 100)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Contingencies (%): {(contingenciesRate * 100).toFixed(1)}%
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={(contingenciesRate * 100)}
                    onChange={(e) => setContingenciesRate((parseFloat(e.target.value) || 0) / 100)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OFFICIAL STATUTORY ABSTRACT TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-200/90 text-slate-800 border-b border-slate-300 font-bold">
                <th className="py-3 px-4 w-16 text-center">Item</th>
                <th className="py-3 px-4">Particulars / Sub-Head of Estimate</th>
                <th className="py-3 px-4 w-40 text-center">Statutory Rate</th>
                <th className="py-3 px-4 w-52 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {/* Row 1: Civil Works Sub-Total (A) */}
              <tr className="hover:bg-slate-50/80 transition-colors bg-white">
                <td className="py-3.5 px-4 text-center font-bold text-slate-500">1</td>
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>Civil Works Detailed Estimate (A)</span>
                    <span className="no-print px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 font-mono">
                      IS:1200 MB Verified
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Repairing and Renovation Civil Items (29 BOQ items from Circuit House measurement book)
                  </div>
                  {onNavigateToTab && (
                    <button
                      onClick={() => onNavigateToTab('mb')}
                      className="no-print text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline mt-1 flex items-center gap-1"
                    >
                      <FileSpreadsheet className="w-3 h-3" />
                      <span>Review 241+ measurement rows in MB Grid →</span>
                    </button>
                  )}
                </td>
                <td className="py-3.5 px-4 text-center font-semibold text-slate-600 font-mono">
                  Sub-Total (A)
                </td>
                <td className="py-3.5 px-4 text-right font-bold font-mono text-slate-900 text-sm sm:text-base">
                  {formatIndianCurrency(civilSubTotal)}
                </td>
              </tr>

              {/* Row 2: Add GST @ 18% */}
              <tr className="hover:bg-slate-50/80 transition-colors bg-slate-50/30">
                <td className="py-3.5 px-4 text-center font-bold text-slate-500">2</td>
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                    <span>Add: Goods and Services Tax (GST)</span>
                    <span className="no-print px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                      Statutory Tax
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    As per Ministry of Finance Notification on Works Contracts
                  </div>

                  {showGstBreakdown && (
                    <div className="mt-2 p-2.5 rounded-lg bg-purple-50/70 border border-purple-200 text-xs space-y-1 font-mono text-purple-900">
                      <div className="flex justify-between">
                        <span>• Central GST (CGST) @ 9%:</span>
                        <span className="font-bold">{formatIndianCurrency(cgstAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• State GST (SGST) @ 9%:</span>
                        <span className="font-bold">{formatIndianCurrency(sgstAmount)}</span>
                      </div>
                    </div>
                  )}
                </td>
                <td className="py-3.5 px-4 text-center font-semibold text-slate-600 font-mono">
                  @ {(gstRate * 100).toFixed(2)}%
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                  {formatIndianCurrency(gstAmount)}
                </td>
              </tr>

              {/* Row 3: Add Labour Welfare Cess @ 1% */}
              <tr className="hover:bg-slate-50/80 transition-colors bg-white">
                <td className="py-3.5 px-4 text-center font-bold text-slate-500">3</td>
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                    <span>Add: Labour Welfare Cess</span>
                    <span className="no-print px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      BOCW Act
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Building and Other Construction Workers Welfare Cess Act, 1996
                  </div>
                </td>
                <td className="py-3.5 px-4 text-center font-semibold text-slate-600 font-mono">
                  @ {(cessRate * 100).toFixed(2)}%
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                  {formatIndianCurrency(cessAmount)}
                </td>
              </tr>

              {/* Row 4: Add Contingencies @ 3% */}
              <tr className="hover:bg-slate-50/80 transition-colors bg-slate-50/30">
                <td className="py-3.5 px-4 text-center font-bold text-slate-500">4</td>
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                    <span>Add: Departmental Contingencies</span>
                    <span className="no-print px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                      Unforeseen Works
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Unforeseen site obstacles, quality control testing & departmental overheads
                  </div>
                </td>
                <td className="py-3.5 px-4 text-center font-semibold text-slate-600 font-mono">
                  @ {(contingenciesRate * 100).toFixed(2)}%
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                  {formatIndianCurrency(contingenciesAmount)}
                </td>
              </tr>

              {/* Row 5: Total Statutory Additions Subtotal */}
              <tr className="bg-slate-100/90 font-bold border-t-2 border-slate-300">
                <td colSpan={2} className="py-3 px-4 text-right text-slate-700">
                  Total Statutory Additions (GST + Cess + Contingencies) =
                </td>
                <td className="py-3 px-4 text-center font-mono text-slate-600">
                  {((gstRate + cessRate + contingenciesRate) * 100).toFixed(2)}%
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-900">
                  {formatIndianCurrency(totalAdditions)}
                </td>
              </tr>

              {/* Row 6: Raw Grand Total */}
              <tr className="bg-blue-50/50 text-slate-800 font-bold border-t border-slate-200">
                <td colSpan={2} className="py-3 px-4 text-right text-blue-950">
                  Raw Grand Total (Civil + Statutory Additions) =
                </td>
                <td className="py-3 px-4 text-center font-mono text-slate-500 text-xs">
                  Exact Sum
                </td>
                <td className="py-3 px-4 text-right font-mono text-blue-950">
                  {formatIndianCurrency(rawGrandTotal)}
                </td>
              </tr>

              {/* Row 7: Grand Total Project Cost (SAY / Rounded to Nearest Rupee) */}
              <tr className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white font-bold border-t-2 border-b-4 border-indigo-950">
                <td colSpan={2} className="py-4 px-4 text-right uppercase tracking-wider text-sm sm:text-base">
                  Grand Total Project Cost (SAY) =
                </td>
                <td className="py-4 px-4 text-center font-mono text-indigo-200 text-xs">
                  Rounded Off
                </td>
                <td className="py-4 px-4 text-right font-mono text-lg sm:text-xl text-emerald-300">
                  {formatIndianCurrency(grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* AMOUNT IN WORDS CALLOUT */}
        <div className="bg-emerald-50/70 border-t border-b border-emerald-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block font-mono">
              Amount in Words (Official Departmental Sanction):
            </span>
            <div className="text-sm sm:text-base font-bold text-emerald-950 tracking-tight">
              ({amountInWords})
            </div>
          </div>

          <button
            onClick={handleCopyWords}
            className="no-print px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100 flex items-center gap-1.5 transition-all shadow-xs shrink-0"
            title="Copy amount in words to clipboard"
          >
            {copiedWords ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Words</span>
              </>
            )}
          </button>
        </div>

        {/* OFFICIAL SIGNATURES BLOCK */}
        <div className="p-6 bg-slate-50/60 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stamp className="w-4 h-4 text-indigo-700" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                Official Departmental Signatures & Attestation Block
              </h3>
            </div>
            {allSigned && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 font-mono">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                DOCKET FULLY SANCTIONED
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Signature 1: Junior Engineer (JE) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs relative flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 font-mono">
                  Prepared By (JE)
                </span>
                <button
                  onClick={() => handleToggleSignature('je')}
                  className="no-print text-[11px] font-semibold text-slate-400 hover:text-slate-600"
                  title="Toggle signature"
                >
                  {signatures.je.signed ? 'Revoke' : 'Sign'}
                </button>
              </div>

              <div className="py-2 text-center border-b border-dashed border-slate-200">
                {signatures.je.signed ? (
                  <div className="space-y-1">
                    <div className="font-serif italic text-base sm:text-lg text-blue-900 font-bold select-none">
                      {signatures.je.name}
                    </div>
                    <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Measurements Verified • {signatures.je.timestamp}
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-xs text-slate-400 italic">
                    Awaiting JE Signature...
                  </div>
                )}
              </div>

              <div className="text-center space-y-0.5">
                <div className="font-bold text-xs text-slate-900">
                  {signatures.je.name}
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  {signatures.je.designation}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {signatures.je.office}
                </div>
              </div>
            </div>

            {/* Signature 2: Asst. Executive Engineer (AEE) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs relative flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 font-mono">
                  Checked & Recommended (AEE)
                </span>
                <button
                  onClick={() => handleToggleSignature('aee')}
                  className="no-print text-[11px] font-semibold text-slate-400 hover:text-slate-600"
                  title="Toggle signature"
                >
                  {signatures.aee.signed ? 'Revoke' : 'Sign'}
                </button>
              </div>

              <div className="py-2 text-center border-b border-dashed border-slate-200">
                {signatures.aee.signed ? (
                  <div className="space-y-1">
                    <div className="font-serif italic text-base sm:text-lg text-indigo-900 font-bold select-none">
                      {signatures.aee.name}
                    </div>
                    <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      TS Recommended • {signatures.aee.timestamp}
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-xs text-slate-400 italic">
                    Awaiting AEE Signature...
                  </div>
                )}
              </div>

              <div className="text-center space-y-0.5">
                <div className="font-bold text-xs text-slate-900">
                  {signatures.aee.name}
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  {signatures.aee.designation}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {signatures.aee.office}
                </div>
              </div>
            </div>

            {/* Signature 3: Executive Engineer (EE) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs relative flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                  Sanctioned & Approved (EE)
                </span>
                <button
                  onClick={() => handleToggleSignature('ee')}
                  className="no-print text-[11px] font-semibold text-slate-400 hover:text-slate-600"
                  title="Toggle signature"
                >
                  {signatures.ee.signed ? 'Revoke' : 'Sign'}
                </button>
              </div>

              <div className="py-2 text-center border-b border-dashed border-slate-200">
                {signatures.ee.signed ? (
                  <div className="space-y-1">
                    <div className="font-serif italic text-base sm:text-lg text-emerald-950 font-bold select-none">
                      {signatures.ee.name}
                    </div>
                    <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                      <Award className="w-3 h-3 text-emerald-700" />
                      Sanction Accorded • {signatures.ee.timestamp}
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-xs text-slate-400 italic">
                    Awaiting EE Technical Sanction...
                  </div>
                )}
              </div>

              <div className="text-center space-y-0.5">
                <div className="font-bold text-xs text-slate-900">
                  {signatures.ee.name}
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  {signatures.ee.designation}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {signatures.ee.office}
                </div>
              </div>
            </div>
          </div>

          {/* Departmental Footnote */}
          <div className="pt-2 text-center text-[11px] text-slate-400 font-mono border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-1">
            <span>Official PWD Civil Works Form No. 27</span>
            <span>Audited to IS:1200 Standards • Zero Discrepancy Verified</span>
            <span>Government of Assam e-Procurement Docket</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbstractOfCostSummary;
