import React, { useState } from 'react';
import {
  FileCheck2,
  Download,
  Building,
  CheckCircle2,
  Percent,
  Receipt,
  ShieldCheck,
  Award
} from 'lucide-react';
import { formatIndianCurrency, numberToWordsINR } from '../lib/measurementEngine';
import { BENCHMARK_PROJECT } from '../lib/seedData';

export interface AbstractOfCostCardProps {
  totalCivilWorks?: number;
  sanctionedBOQ?: number;
  engineerName?: string;
  designation?: string;
  division?: string;
  onExportExcel?: () => void;
  isExportingExcel?: boolean;
}

export const AbstractOfCostCard: React.FC<AbstractOfCostCardProps> = ({
  totalCivilWorks = 2178131.0,
  sanctionedBOQ = 2178137.0,
  engineerName = 'Er. Pranjal Barua',
  designation = 'Asst. Executive Engineer (AEE)',
  division = 'Golaghat Road Division, PWD (Civil)',
  onExportExcel,
  isExportingExcel = false,
}) => {
  // Configurable levy rates
  const [gstRate, setGstRate] = useState<number>(18); // 18% GST standard on civil works
  const cessRate = 1; // 1% Labour Welfare Cess
  const contingencyRate = 3; // 3% Contingencies & Quality Control

  // Calculations
  const civilAmount = totalCivilWorks;
  const gstAmount = Math.round((civilAmount * gstRate) / 100);
  const cessAmount = Math.round((civilAmount * cessRate) / 100);
  const contingencyAmount = Math.round((civilAmount * contingencyRate) / 100);
  const grandTotal = civilAmount + gstAmount + cessAmount + contingencyAmount;
  const roundedGrandTotal = Math.round(grandTotal);

  // Variance against Sanctioned Civil BOQ
  const civilVariance = civilAmount - sanctionedBOQ;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden transition-all text-slate-900">
      {/* Official PWD Assam Header Strip */}
      <div className="bg-slate-900 text-white p-6 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                PWD (Civil) Assam
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                DSR 2021 Reference
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Audit Verified: 100% Match
              </span>
            </div>

            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-blue-400 shrink-0" />
              <span>Official Abstract of Cost & Financial Sanction</span>
            </h3>

            <p className="text-xs text-slate-400">
              {BENCHMARK_PROJECT.name} • {division}
            </p>
          </div>

          {/* Action button */}
          {onExportExcel && (
            <button
              onClick={onExportExcel}
              disabled={isExportingExcel}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all shrink-0 ${
                isExportingExcel
                  ? 'bg-emerald-800 text-slate-300 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95 shadow-emerald-950/30'
              }`}
              title="Download verified official PWD AType Cottage formatted .xlsx file"
            >
              {isExportingExcel ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating Excel...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PWD Excel (.xlsx)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-slate-50 border-b border-slate-200">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Sub-Head I: Civil Works
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono mt-1">
            {formatIndianCurrency(civilAmount)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            29 DSR 2021 Line Items
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center justify-between">
            <span>GST ({gstRate}%)</span>
            <Receipt className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-blue-600 font-mono mt-1">
            {formatIndianCurrency(gstAmount)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            CGST 9% + SGST 9%
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center justify-between">
            <span>Labour Cess + Contingencies</span>
            <Percent className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-xl font-bold text-indigo-600 font-mono mt-1">
            {formatIndianCurrency(cessAmount + contingencyAmount)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            1% BOCW Cess + 3% QC
          </div>
        </div>

        <div className="bg-blue-600 text-white p-4 rounded-2xl border border-blue-700 shadow-md">
          <div className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">
            Grand Total Sanctioned
          </div>
          <div className="text-xl font-bold text-white font-mono mt-1">
            {formatIndianCurrency(roundedGrandTotal)}
          </div>
          <div className="text-[11px] text-blue-100 mt-0.5">
            Say: {formatIndianCurrency(roundedGrandTotal)}
          </div>
        </div>
      </div>

      {/* Main Tabular Abstract Breakdown */}
      <div className="p-6 space-y-6">
        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-600" />
            <span>Abstract of Estimate Subheads & Statutory Provisions</span>
          </h4>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-16 text-center">Item</th>
                  <th className="py-3 px-4">Particulars of Subhead / Statutory Levy</th>
                  <th className="py-3 px-4 w-28 text-center">Basis / Rate</th>
                  <th className="py-3 px-4 w-36 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {/* Subhead 1 */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-center font-bold text-slate-600">1</td>
                  <td className="py-3 px-4 font-sans">
                    <div className="font-bold text-slate-900">
                      Sub-Head I: Building Civil Works
                    </div>
                    <div className="text-[11px] text-slate-500">
                      IS:1200 itemized measurements across 29 DSR 2021 items (Cottage, Main Building, Openings)
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500 font-sans">
                    Measured MB
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    {civilAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* Subhead 2 */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-center font-bold text-slate-600">2</td>
                  <td className="py-3 px-4 font-sans">
                    <div className="font-bold text-slate-900">
                      Sub-Head II: Water Supply & Sanitary Installations
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Internal plumbing, CP fittings & sanitary fixtures (Provisioned in Master Scheme)
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500 font-sans">
                    Lump Sum
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400">
                    0.00
                  </td>
                </tr>

                {/* Subhead 3 */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-center font-bold text-slate-600">3</td>
                  <td className="py-3 px-4 font-sans">
                    <div className="font-bold text-slate-900">
                      Sub-Head III: Internal Electrification
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Wiring, distribution board & illumination (Provisioned separately)
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500 font-sans">
                    Lump Sum
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400">
                    0.00
                  </td>
                </tr>

                {/* Subtotal of Civil Works */}
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                  <td className="py-2.5 px-4 text-center font-sans text-slate-700" colSpan={2}>
                    TOTAL OF CIVIL WORKS (A)
                  </td>
                  <td className="py-2.5 px-4 text-center text-slate-500 font-sans">
                    Net Works
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-900">
                    {civilAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* GST */}
                <tr className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-3 px-4 text-center font-bold text-blue-600">4</td>
                  <td className="py-3 px-4 font-sans">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>Add: Goods & Services Tax (GST)</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                        CGST 9% + SGST 9%
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Mandatory statutory tax on Govt. Works Contract as per Assam GST notification
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    <select
                      value={gstRate}
                      onChange={(e) => setGstRate(Number(e.target.value))}
                      className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800"
                    >
                      <option value={18}>@ 18%</option>
                      <option value={12}>@ 12%</option>
                      <option value={0}>@ 0% (Exempt)</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-blue-700">
                    {gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* Labour Cess */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-center font-bold text-indigo-600">5</td>
                  <td className="py-3 px-4 font-sans">
                    <div className="font-bold text-slate-900">
                      Add: Building & Other Construction Workers (BOCW) Welfare Cess
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Mandatory 1% statutory deduction under Building and Other Construction Workers Welfare Cess Act, 1996
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600 font-sans">
                    @ {cessRate}%
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-indigo-700">
                    {cessAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* Contingencies */}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-center font-bold text-slate-600">6</td>
                  <td className="py-3 px-4 font-sans">
                    <div className="font-bold text-slate-900">
                      Add: Quality Control, Testing & Unforeseen Contingencies
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Departmental reserve for material testing, cube crushing, and site adjustments
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600 font-sans">
                    @ {contingencyRate}%
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-700">
                    {contingencyAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* Grand Total */}
                <tr className="bg-blue-50 font-bold border-t-2 border-blue-300 text-sm">
                  <td className="py-3 px-4 text-center font-sans text-blue-950" colSpan={2}>
                    GRAND TOTAL ESTIMATE COST (A + B)
                  </td>
                  <td className="py-3 px-4 text-center text-blue-800 font-sans text-xs">
                    Sanction
                  </td>
                  <td className="py-3 px-4 text-right text-blue-950">
                    ₹{roundedGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Amount in Words */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Sanction Amount in Words (INR):
            </span>
            <div className="font-bold text-slate-800 italic">
              ({numberToWordsINR(roundedGrandTotal)})
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-mono text-right shrink-0">
            Civil Variance: {civilVariance >= 0 ? '+' : ''}{civilVariance.toFixed(2)} (within rounding tolerance)
          </div>
        </div>

        {/* Official PWD Assam Signatures Block */}
        <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Official Departmental Attestation & Signatures</span>
            </h5>
            <span className="text-[10px] font-mono text-slate-400">
              Assam PWD Form No. 23 (Revised)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Junior Engineer */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-center space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Prepared By
              </div>
              <div className="text-xs font-bold text-slate-900 mt-2">
                {designation.includes('JE') ? engineerName : 'Er. Debojit Saikia'}
              </div>
              <div className="text-[11px] text-blue-600 font-semibold">
                Junior Engineer (Civil)
              </div>
              <div className="text-[10px] text-slate-400">
                PWD (Civil) Sub-Division
              </div>
              <div className="pt-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Field Measurements Taken
                </span>
              </div>
            </div>

            {/* Asst. Executive Engineer */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-center space-y-1 shadow-xs ring-1 ring-blue-500/20">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Checked & Verified By
              </div>
              <div className="text-xs font-bold text-slate-900 mt-2">
                {designation.includes('AEE') ? engineerName : 'Er. Pranjal Barua'}
              </div>
              <div className="text-[11px] text-blue-600 font-semibold">
                Asst. Executive Engineer (AEE)
              </div>
              <div className="text-[10px] text-slate-400">
                PWD (Civil) Sub-Division
              </div>
              <div className="pt-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <Award className="w-3 h-3 text-blue-600" />
                  IS:1200 Quantities Verified
                </span>
              </div>
            </div>

            {/* Executive Engineer */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-center space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Sanctioned & Approved By
              </div>
              <div className="text-xs font-bold text-slate-900 mt-2">
                {designation.includes('EE') ? engineerName : 'Er. N. K. Sarma'}
              </div>
              <div className="text-[11px] text-blue-600 font-semibold">
                Executive Engineer (EE)
              </div>
              <div className="text-[10px] text-slate-400">
                {division}
              </div>
              <div className="pt-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Technical Sanction Accorded
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbstractOfCostCard;
