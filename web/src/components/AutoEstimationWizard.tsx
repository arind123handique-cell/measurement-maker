import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Wand2,
  Download,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Sliders,
  Info
} from 'lucide-react';
import {
  type FormQueryInput,
  type AutoEstimateResult,
  type BuildingTypology,
  FORM_QUERY_PRESETS,
  synthesizeEstimateFromQuery,
  parseNaturalLanguageQuery
} from '../lib/formQueryEngine';
import { formatIndianCurrency } from '../lib/measurementEngine';
import { exportToPWDExcel } from '../lib/excelExporter';

export interface AutoEstimationWizardProps {
  onApplyEstimate?: (result: AutoEstimateResult) => void;
  onNavigateToTab?: (tab: 'mb' | 'rooms' | 'boq') => void;
}

export const AutoEstimationWizard: React.FC<AutoEstimationWizardProps> = ({
  onApplyEstimate,
  onNavigateToTab,
}) => {
  // Active Form Query State initialized with Preset 1 (Bokakhat Benchmark)
  const [formInput, setFormInput] = useState<FormQueryInput>(FORM_QUERY_PRESETS[0].query);
  const [queryPrompt, setQueryPrompt] = useState<string>(
    FORM_QUERY_PRESETS[0].query.queryText || ''
  );
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [previewTab, setPreviewTab] = useState<'boq' | 'rooms' | 'mb'>('boq');
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Automatically calculate estimate whenever formInput changes
  const estimateResult: AutoEstimateResult = useMemo(() => {
    return synthesizeEstimateFromQuery(formInput);
  }, [formInput]);

  // Handle Preset Selection
  const handleSelectPreset = (preset: typeof FORM_QUERY_PRESETS[0]) => {
    setFormInput(preset.query);
    setQueryPrompt(preset.query.queryText || '');
    setAppliedSuccess(false);
  };

  // Handle Natural Language Prompt submission
  const handleParsePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryPrompt.trim()) return;
    const parsed = parseNaturalLanguageQuery(queryPrompt, formInput);
    setFormInput(parsed);
    setAppliedSuccess(false);
  };

  // Toggle specification checkbox
  const handleToggleSpec = (key: keyof FormQueryInput['specs']) => {
    setFormInput((prev) => ({
      ...prev,
      specs: {
        ...prev.specs,
        [key]: !prev.specs[key],
      },
    }));
    setAppliedSuccess(false);
  };

  // 1-Click Excel Export from this Wizard
  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      await exportToPWDExcel(
        estimateResult.measurementBookItems,
        {
          projectName: estimateResult.metadata.projectName,
          division: estimateResult.metadata.division,
          circle: estimateResult.metadata.authority,
          dsrYear: estimateResult.metadata.dsrYear,
          sheetTitle: 'PARAMETRIC DETAIL ESTIMATE',
          sheetName: 'Form_Estimate',
        },
        `${estimateResult.metadata.buildingType}_AutoEstimate_${new Date().toISOString().split('T')[0]}.xlsx`
      );
    } catch (err) {
      console.error('Error exporting auto estimate to Excel:', err);
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Commit this synthesized estimate to the active project state
  const handleApplyToActiveProject = () => {
    if (onApplyEstimate) {
      onApplyEstimate(estimateResult);
    }
    setAppliedSuccess(true);
    setTimeout(() => {
      setAppliedSuccess(false);
      if (onNavigateToTab) {
        onNavigateToTab('mb'); // Switch to Measurement Book tab to review
      }
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-indigo-700/40 relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-4xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              AI Parametric Estimator
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/10 text-white/80">
              IS:1200 Rules • DSR 2021
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Auto Estimation via Form Query & Natural Language</span>
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
            Specify project parameters, built-up area, building typology, and finish specifications. The system automatically synthesizes the architectural room schedule, computes IS:1200 perimeter walls and opening deductions, applies DSR 2021 rates, and formulates the official Measurement Book (MB).
          </p>
        </div>

        {/* Natural Language Prompt Query Bar */}
        <div className="mt-5 relative z-10">
          <form onSubmit={handleParsePrompt} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Wand2 className="w-4 h-4 text-indigo-300" />
              </div>
              <input
                type="text"
                value={queryPrompt}
                onChange={(e) => setQueryPrompt(e.target.value)}
                placeholder="Type query: e.g., 'G+1 Circuit House 500 sqm with acrylic paint, vitrified tiles, false ceiling and paver blocks'..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/10 text-white placeholder-slate-300 text-xs sm:text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/15 transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-400 text-white flex items-center justify-center gap-2 shadow-sm transition-all shrink-0 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Parse & Estimate</span>
            </button>
          </form>

          {/* Quick Presets Pills */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar pb-1 text-xs">
            <span className="text-indigo-200 text-[11px] font-semibold shrink-0">Quick Presets:</span>
            {FORM_QUERY_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 flex items-center gap-1.5 border ${
                  formInput.projectName === p.query.projectName
                    ? 'bg-white text-indigo-950 font-bold border-white shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                }`}
              >
                <span>{p.name}</span>
                <span className="opacity-75 text-[10px]">({p.badge.split('•')[0].trim()})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Controls Form, Right Live Estimated Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls (4 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Parametric Form Query Controls</span>
              </h3>
              <button
                onClick={() => handleSelectPreset(FORM_QUERY_PRESETS[0])}
                className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1"
                title="Reset to default benchmark"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* 1. Project Info */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                1. Project & Authority
              </label>
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={formInput.projectName}
                  onChange={(e) =>
                    setFormInput({ ...formInput, projectName: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    PWD Division
                  </label>
                  <input
                    type="text"
                    value={formInput.division}
                    onChange={(e) =>
                      setFormInput({ ...formInput, division: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    DSR Schedule
                  </label>
                  <input
                    type="text"
                    value={formInput.dsrYear}
                    onChange={(e) =>
                      setFormInput({ ...formInput, dsrYear: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. Building Geometry */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                2. Building Geometry & Typology
              </label>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Typology
                </label>
                <select
                  value={formInput.buildingType}
                  onChange={(e) =>
                    setFormInput({
                      ...formInput,
                      buildingType: e.target.value as BuildingTypology,
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="circuit_house">Circuit House / Inspection Bungalow</option>
                  <option value="office">PWD Administrative Office (G+1)</option>
                  <option value="dormitory">Assam Type Dormitory / Barrack Block</option>
                  <option value="cottage">VIP Inspection Cottage Suite</option>
                  <option value="residential">PWD Staff Quarters / Residential</option>
                </select>
              </div>

              {/* Plinth Area Slider & Number */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 mb-1">
                  <span>Plinth Area</span>
                  <span className="font-mono font-bold text-blue-700">
                    {formInput.plinthArea} Sqm ({(formInput.plinthArea * 10.764).toFixed(0)} Sq.ft)
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1500"
                  step="10"
                  value={formInput.plinthArea}
                  onChange={(e) =>
                    setFormInput({
                      ...formInput,
                      plinthArea: Number(e.target.value),
                    })
                  }
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Storeys / Floors
                  </label>
                  <select
                    value={formInput.floorsCount}
                    onChange={(e) =>
                      setFormInput({
                        ...formInput,
                        floorsCount: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value={1}>Single Storey (Ground)</option>
                    <option value={2}>G+1 (Two Storeys)</option>
                    <option value={3}>G+2 (Three Storeys)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Ceiling Height
                  </label>
                  <select
                    value={formInput.ceilingHeight}
                    onChange={(e) =>
                      setFormInput({
                        ...formInput,
                        ceilingHeight: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value={3.05}>3.05 m (10'-0")</option>
                    <option value={3.35}>3.35 m (11'-0")</option>
                    <option value={3.65}>3.65 m (12'-0")</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Work Scope
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormInput({ ...formInput, workScope: 'renovation' })
                    }
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold border text-center transition-all ${
                      formInput.workScope === 'renovation'
                        ? 'bg-blue-50 border-blue-600 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Repair & Renovation
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormInput({ ...formInput, workScope: 'new_construction' })
                    }
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold border text-center transition-all ${
                      formInput.workScope === 'new_construction'
                        ? 'bg-blue-50 border-blue-600 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    New Construction
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Specification & DSR Item Toggles */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                3. Specifications & DSR 2021 Items
              </label>

              <div className="space-y-2 text-xs">
                {/* Wall Finishes */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="font-bold text-[11px] text-slate-800 uppercase tracking-wide block">
                    Wall Finishes & Paint
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formInput.specs.interiorPaint}
                      onChange={() => handleToggleSpec('interiorPaint')}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Acrylic Emulsion Painting (DSR 13.83.2)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formInput.specs.primer}
                      onChange={() => handleToggleSpec('primer')}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Water-Thinnable Cement Primer (DSR 13.85.3)</span>
                  </label>
                  {formInput.workScope === 'renovation' && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formInput.specs.scrapingOldPaint}
                        onChange={() => handleToggleSpec('scrapingOldPaint')}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Scraping Old Surface (DSR 15.57.1)</span>
                    </label>
                  )}
                </div>

                {/* Flooring & Tiling */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="font-bold text-[11px] text-slate-800 uppercase tracking-wide block">
                    Flooring & Tiling
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formInput.specs.vitrifiedFlooring}
                      onChange={() => handleToggleSpec('vitrifiedFlooring')}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Vitrified Floor Tiles 600x600 (DSR 11.41.2)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formInput.specs.toiletWallDado}
                      onChange={() => handleToggleSpec('toiletWallDado')}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Toilet Wall Glazed Dado 2.10m (DSR 11.37)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formInput.specs.toiletFloorTiles}
                      onChange={() => handleToggleSpec('toiletFloorTiles')}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Non-Skid Ceramic Toilet Floor (DSR 11.38)</span>
                  </label>
                </div>

                {/* Roofing & False Ceiling */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="font-bold text-[11px] text-slate-800 uppercase tracking-wide block">
                    Roofing & Ceilings
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formInput.specs.giRoofing}
                      onChange={() => handleToggleSpec('giRoofing')}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Precoated GI Sheet Roofing (DSR 12.50)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formInput.specs.steelTrusses}
                      onChange={() => handleToggleSpec('steelTrusses')}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Tubular Steel Trusses (DSR 10.16.2)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formInput.specs.falseCeiling}
                      onChange={() => handleToggleSpec('falseCeiling')}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>PVC Laminated Gypsum False Ceiling (DSR 12.52.3)</span>
                  </label>
                </div>

                {/* Site Works */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="font-bold text-[11px] text-slate-800 uppercase tracking-wide block">
                    Site Development & Approach
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formInput.specs.paverBlocks}
                      onChange={() => handleToggleSpec('paverBlocks')}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>60mm M-30 Interlocking Paver Blocks (DSR 16.68)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formInput.specs.granularSubBase}
                      onChange={() => handleToggleSpec('granularSubBase')}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Granular Sub-Base GSB (DSR 16.78.1)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Estimated Budget & Preview (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Executive Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Total Cost */}
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Total Estimated Cost
              </div>
              <div className="text-lg sm:text-xl font-bold text-slate-900 font-mono mt-1">
                {formatIndianCurrency(estimateResult.metadata.totalEstimatedCost)}
              </div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                ₹{(estimateResult.metadata.totalEstimatedCost / 100000).toFixed(2)} Lakhs
              </div>
            </div>

            {/* Plinth Area Rate */}
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Plinth Area Rate
              </div>
              <div className="text-base sm:text-lg font-bold text-blue-700 font-mono mt-1">
                ₹{estimateResult.metadata.costPerSqm} <span className="text-xs font-normal text-slate-500">/sqm</span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                ₹{estimateResult.metadata.costPerSqft} / sq.ft
              </div>
            </div>

            {/* Synthesized Rooms */}
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Synthesized Rooms
              </div>
              <div className="text-base sm:text-lg font-bold text-indigo-700 font-mono mt-1">
                {estimateResult.rooms.length} Rooms
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                {estimateResult.metadata.totalCarpetArea} Sqm Carpet
              </div>
            </div>

            {/* BOQ DSR Items */}
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                BOQ DSR Items
              </div>
              <div className="text-base sm:text-lg font-bold text-slate-800 font-mono mt-1">
                {estimateResult.metadata.itemCount} Items
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                {estimateResult.openings.length} Openings
              </div>
            </div>
          </div>

          {/* Category Share Progress Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Cost Distribution by Work Category</span>
              <span className="text-slate-500 font-normal">
                Total: {formatIndianCurrency(estimateResult.metadata.totalEstimatedCost)}
              </span>
            </div>

            <div className="h-3 w-full rounded-full bg-slate-100 flex overflow-hidden">
              <div
                style={{
                  width: `${(estimateResult.categoryBreakdown.finishes / estimateResult.metadata.totalEstimatedCost) * 100}%`,
                }}
                className="bg-blue-500 h-full"
                title={`Finishes: ${formatIndianCurrency(estimateResult.categoryBreakdown.finishes)}`}
              />
              <div
                style={{
                  width: `${(estimateResult.categoryBreakdown.flooring / estimateResult.metadata.totalEstimatedCost) * 100}%`,
                }}
                className="bg-emerald-500 h-full"
                title={`Flooring: ${formatIndianCurrency(estimateResult.categoryBreakdown.flooring)}`}
              />
              <div
                style={{
                  width: `${(estimateResult.categoryBreakdown.roofing / estimateResult.metadata.totalEstimatedCost) * 100}%`,
                }}
                className="bg-amber-500 h-full"
                title={`Roofing: ${formatIndianCurrency(estimateResult.categoryBreakdown.roofing)}`}
              />
              <div
                style={{
                  width: `${(estimateResult.categoryBreakdown.doors / estimateResult.metadata.totalEstimatedCost) * 100}%`,
                }}
                className="bg-purple-500 h-full"
                title={`Doors: ${formatIndianCurrency(estimateResult.categoryBreakdown.doors)}`}
              />
              <div
                style={{
                  width: `${(estimateResult.categoryBreakdown.site_work / estimateResult.metadata.totalEstimatedCost) * 100}%`,
                }}
                className="bg-indigo-500 h-full"
                title={`Site Works: ${formatIndianCurrency(estimateResult.categoryBreakdown.site_work)}`}
              />
              <div
                style={{
                  width: `${(estimateResult.categoryBreakdown.dismantling / estimateResult.metadata.totalEstimatedCost) * 100}%`,
                }}
                className="bg-rose-500 h-full"
                title={`Dismantling: ${formatIndianCurrency(estimateResult.categoryBreakdown.dismantling)}`}
              />
              <div
                style={{
                  width: `${(estimateResult.categoryBreakdown.civil / estimateResult.metadata.totalEstimatedCost) * 100}%`,
                }}
                className="bg-slate-500 h-full"
                title={`Civil / Masonry: ${formatIndianCurrency(estimateResult.categoryBreakdown.civil)}`}
              />
            </div>

            <div className="flex items-center gap-3 text-[10px] text-slate-600 flex-wrap pt-1">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Finishes (Paint/Plaster)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Flooring & Tiles
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Roofing & Trusses
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Doors
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Site Works (Pavers)
              </span>
            </div>
          </div>

          {/* Action Toolbar: 1-Click Apply & 1-Click Excel */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-3.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <div className="text-xs text-indigo-950 font-medium">
                {appliedSuccess ? (
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Estimate applied to active project!
                  </span>
                ) : (
                  <span>Ready to sync with live Measurement Book and Room Schedules.</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleExportExcel}
                disabled={isExportingExcel}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 flex items-center justify-center gap-1.5 shadow-xs transition-all"
                title="Download verified official PWD formatted Excel workbook"
              >
                {isExportingExcel ? (
                  <div className="w-3.5 h-3.5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>Export .xlsx</span>
              </button>

              <button
                onClick={handleApplyToActiveProject}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <span>Apply to Active Project</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Tabbed Inspection Panel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="flex items-center border-b border-slate-200 bg-slate-50/60 px-4 pt-2 gap-2 text-xs font-semibold text-slate-600">
              <button
                onClick={() => setPreviewTab('boq')}
                className={`pb-2.5 px-3 border-b-2 font-bold transition-all ${
                  previewTab === 'boq'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                1. BOQ Item Schedule ({estimateResult.boqItems.length})
              </button>
              <button
                onClick={() => setPreviewTab('rooms')}
                className={`pb-2.5 px-3 border-b-2 font-bold transition-all ${
                  previewTab === 'rooms'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                2. Synthesized Rooms ({estimateResult.rooms.length})
              </button>
              <button
                onClick={() => setPreviewTab('mb')}
                className={`pb-2.5 px-3 border-b-2 font-bold transition-all ${
                  previewTab === 'mb'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                3. MB Calculation Sample
              </button>
            </div>

            <div className="p-4 max-h-[460px] overflow-y-auto">
              {/* TAB 1: Itemized BOQ Summary Table */}
              {previewTab === 'boq' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                        <th className="p-2 w-12 text-center">Item</th>
                        <th className="p-2 w-20">Code</th>
                        <th className="p-2">Description</th>
                        <th className="p-2 w-20 text-right">Qty</th>
                        <th className="p-2 w-14 text-center">Unit</th>
                        <th className="p-2 w-20 text-right">Rate (₹)</th>
                        <th className="p-2 w-28 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {estimateResult.boqItems.map((it) => (
                        <tr key={it.itemNo} className="hover:bg-slate-50">
                          <td className="p-2 text-center font-mono font-semibold text-slate-500">
                            {it.itemNo}
                          </td>
                          <td className="p-2 font-mono text-blue-700 font-semibold">
                            {it.dsrCode}
                          </td>
                          <td className="p-2 text-slate-700 font-medium">
                            {it.description}
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-slate-800">
                            {it.quantity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2 text-center font-mono text-slate-500">
                            {it.unit}
                          </td>
                          <td className="p-2 text-right font-mono text-slate-600">
                            {it.rate.toFixed(2)}
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-slate-900">
                            ₹{it.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-800">
                        <td colSpan={6} className="p-2.5 text-right uppercase tracking-wider text-xs">
                          Grand Total Estimate:
                        </td>
                        <td className="p-2.5 text-right font-mono text-sm text-emerald-400">
                          {formatIndianCurrency(estimateResult.metadata.totalEstimatedCost)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* TAB 2: Synthesized Rooms */}
              {previewTab === 'rooms' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {estimateResult.rooms.map((rm) => {
                    const carpet = (rm.length * rm.breadth).toFixed(2);
                    const perim = (2 * (rm.length + rm.breadth)).toFixed(2);
                    const ops = estimateResult.openings.filter((o) => o.room_id === rm.id);
                    return (
                      <div
                        key={rm.id}
                        className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{rm.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">
                            {rm.floor_name || 'Ground'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-600">
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Dimensions</span>
                            {rm.length.toFixed(2)}m × {rm.breadth.toFixed(2)}m
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Carpet Area</span>
                            {carpet} sqm
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Perimeter</span>
                            {perim} m
                          </div>
                        </div>
                        {rm.dado_height && rm.dado_height > 0 && (
                          <div className="text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                            Tile dado height: {rm.dado_height.toFixed(2)}m (Paint above dado: {(rm.height - rm.dado_height).toFixed(2)}m)
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[10px]">
                          <span className="text-slate-400">Openings:</span>
                          {ops.map((o, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono"
                            >
                              {o.count}x {o.mark} ({o.width}m x {o.height}m)
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 3: Sample MB Calculation */}
              {previewTab === 'mb' && (
                <div className="space-y-3 text-xs">
                  <div className="text-xs text-slate-500 italic flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span>Showing sample room perimeter walls and negative opening deductions generated per IS:1200:</span>
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2">PARTICULARS</th>
                          <th className="p-2 text-center">No.</th>
                          <th className="p-2 text-right">L</th>
                          <th className="p-2 text-right">B</th>
                          <th className="p-2 text-right">H</th>
                          <th className="p-2 text-right">QTY</th>
                          <th className="p-2 text-center">Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {estimateResult.measurementBookItems[0]?.rows.slice(0, 15).map((row) => (
                          <tr
                            key={row.id}
                            className={
                              row.is_header
                                ? 'bg-blue-50/70 font-sans font-bold text-blue-900'
                                : row.is_deduction
                                ? 'bg-red-50/50 text-red-700'
                                : 'hover:bg-slate-50'
                            }
                          >
                            <td className="p-2">{row.particulars}</td>
                            <td className="p-2 text-center">{row.nos ?? '-'}</td>
                            <td className="p-2 text-right">{row.length?.toFixed(3) ?? '-'}</td>
                            <td className="p-2 text-right">{row.breadth?.toFixed(3) ?? '-'}</td>
                            <td className="p-2 text-right">{row.height?.toFixed(3) ?? '-'}</td>
                            <td
                              className={`p-2 text-right font-bold ${
                                row.is_deduction ? 'text-red-600' : 'text-slate-800'
                              }`}
                            >
                              {row.quantity.toFixed(2)}
                            </td>
                            <td className="p-2 text-center text-slate-500">{row.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoEstimationWizard;
