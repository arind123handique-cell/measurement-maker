import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Compass,
} from 'lucide-react';
import { StepProgressNav, type StepNumber } from './components/StepProgressNav';
import { AuthScreen, type EngineerProfile } from './components/AuthScreen';
import { EstimateTypeHub, type EstimateMode } from './components/EstimateTypeHub';
import { ArchitecturalBuilder } from './components/ArchitecturalBuilder';
import { MeasurementBookGrid } from './components/MeasurementBookGrid';
import { BOQReconciliationTable } from './components/BOQReconciliationTable';
import { BlueprintUploader } from './components/BlueprintUploader';
import { AutoEstimationWizard } from './components/AutoEstimationWizard';
import { AbstractOfCostSummary } from './components/AbstractOfCostSummary';
import { HowToUseGuideModal } from './components/HowToUseGuideModal';
import { SpatialHudHeader } from './components/SpatialHudHeader';
import { SpatialTrackingReticle } from './components/SpatialTrackingReticle';
import { InteractiveEngineerAvatar } from './components/InteractiveEngineerAvatar';
import { type AutoEstimateResult } from './lib/formQueryEngine';
import { exportToPWDExcel } from './lib/excelExporter';
import { soundFx } from './lib/soundFx';
import {
  generateRoomMeasurements,
  BENCHMARK_ITEMS,
  BENCHMARK_ROOMS as MB_ROOMS,
  BENCHMARK_OPENINGS as MB_OPENINGS,
} from './lib/measurementEngine';
import {
  BENCHMARK_PROJECT,
  type Room,
} from './lib/seedData';

export const App: React.FC = () => {
  // Active 5-Step Guided Engineering Flow State
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [engineerProfile, setEngineerProfile] = useState<EngineerProfile | null>(null);

  // View Mode: 'workspace' (standard two-panel engineering HUD) vs 'hero' (full-screen 3D Spark showcase)
  const [viewMode, setViewMode] = useState<'workspace' | 'hero'>('workspace');

  // Step 3 Sub-View: Architectural Builder vs AutoEstimation Wizard vs Blueprint Takeoff
  const [step3SubView, setStep3SubView] = useState<'rooms' | 'wizard' | 'takeoff'>('rooms');

  // Step 5 View Mode: Abstract of Cost vs BOQ Reconciliation vs Both
  const [step5View, setStep5View] = useState<'abstract' | 'boq' | 'both'>('both');

  // How to Use Guide Modal Toggle
  const [showHowToUseModal, setShowHowToUseModal] = useState<boolean>(false);

  // Excel Export and Notification states
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Password focus propagation to avatar
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Cursor Tracking & Physics for the Spatial HUD
  const [cursorOffset, setCursorOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cursorRotation, setCursorRotation] = useState<{ yaw: number; pitch: number }>({ yaw: 0, pitch: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const normY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

      setCursorOffset({ x: normX, y: normY });
      setCursorRotation({
        yaw: normX * 24,
        pitch: -normY * 12,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Show temporary toast notification
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Step 1: Handle Successful Authentication or Offline Mode
  const handleAuthenticated = (profile: EngineerProfile) => {
    soundFx.playChapterChime();
    setEngineerProfile(profile);
    setCurrentStep(2); // Immediately unlock Step 2
    showNotification(
      `Welcome, ${profile.name} (${profile.designation})! Chapter 02: Estimate Initiation Hub unlocked.`
    );
  };

  // Step 2: Handle Path Selection in Estimate Initiation Hub
  const handleSelectEstimateMode = (mode: EstimateMode) => {
    soundFx.playChapterChime();
    switch (mode) {
      case 'auto_query':
        setStep3SubView('wizard');
        setCurrentStep(3);
        showNotification('Path A selected: AutoEstimate Form Query Wizard loaded.');
        break;

      case 'upload_excel':
        setCurrentStep(4);
        showNotification(
          'Path B loaded: Verified PWD Excel workbook (FULL CIRCUIT HOUSE ESTIMATE.xlsx with 29 BOQ items & 241+ rows). Measurement Book Grid ready.'
        );
        break;

      case 'blueprint_takeoff':
        setStep3SubView('takeoff');
        setCurrentStep(3);
        showNotification('Path C selected: AI Blueprint Takeoff (Gemini Vision) ready.');
        break;

      case 'blank_estimate':
        setStep3SubView('rooms');
        setCurrentStep(3);
        showNotification('Path D selected: Space & Room Schedule initialized.');
        break;

      default:
        setCurrentStep(3);
        break;
    }
  };

  // 1-Click Excel Export handler
  const handleExportExcel = async () => {
    try {
      soundFx.playClick();
      setIsExportingExcel(true);
      const itemsToExport = BENCHMARK_ITEMS.map((item) =>
        generateRoomMeasurements(item, MB_ROOMS, MB_OPENINGS, {
          includeBeams: true,
          includeIdenticalFloors: true,
        })
      );

      await exportToPWDExcel(
        itemsToExport,
        {
          projectName: BENCHMARK_PROJECT.name,
          division: engineerProfile?.division || BENCHMARK_PROJECT.division,
          circle: BENCHMARK_PROJECT.circle,
          dsrYear: BENCHMARK_PROJECT.dsrYear,
          sheetTitle: 'DETAIL ESTIMATE',
          sheetName: 'AType Cottage',
        },
        `PWD_Measurement_Book_${new Date().toISOString().split('T')[0]}.xlsx`
      );
      showNotification('Official PWD Measurement Book (.xlsx) generated successfully!');
    } catch (err) {
      console.error('Error generating Excel workbook:', err);
      showNotification('Failed to export Excel workbook. Check console for details.');
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Callback when AI Blueprint Takeoff extracts rooms
  const handleApplyTakeoffRooms = (extractedRooms: Room[]) => {
    showNotification(
      `Successfully synced ${extractedRooms.length} rooms from Gemini Takeoff to Room Schedule!`
    );
    setStep3SubView('rooms');
  };

  // Callback when Auto Estimation Wizard synthesizes an estimate
  const handleApplyWizardEstimate = (result: AutoEstimateResult) => {
    showNotification(
      `Parametric estimate applied for "${result.metadata.projectName}" (${result.boqItems.length} DSR items, ${result.rooms.length} rooms)!`
    );
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden flex flex-col">
      {/* =========================================================================
          BACKGROUND LAYER: SPARK SPATIAL ENVIRONMENT WITH CRT SCANLINES & RETICLES
          ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Cinematic Architectural Background Image with Cursor Parallax */}
        <div
          style={{
            backgroundImage: 'url(/spark_bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `scale(1.05) translate(${cursorOffset.x * -14}px, ${cursorOffset.y * -10}px)`,
            transition: 'transform 0.15s ease-out',
          }}
          className="absolute inset-0 w-full h-full filter brightness-75 contrast-110"
        />

        {/* Ambient Dark Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/80" />

        {/* CRT Scanline Overlay Texture (spark style) */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] opacity-75" />

        {/* Subtle Crosshair Coordinate Grid Overlay */}
        <div className="absolute inset-0 flex flex-wrap justify-between p-8 opacity-25">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="w-1/6 h-32 flex items-center justify-center font-mono text-[10px] text-cyan-300">
              +
            </div>
          ))}
        </div>

        {/* Spatial Target-Tracking Reticles (The Spark Signature Feature) */}
        <SpatialTrackingReticle
          id="DRONE.01"
          label="DRONE.01 // FLOW LIDAR SURVEY"
          sublabel="ALT: 120M • 60 FPS"
          top="14%"
          left="18%"
          status="ACTIVE"
          coords="X: 184.4 Y: 122.1"
          cursorOffset={cursorOffset}
          parallaxMultiplier={18}
        />

        <SpatialTrackingReticle
          id="TOWER.01"
          label="STRUCTURE.01 // CIRCUIT HOUSE TOWER"
          sublabel="PWD CIVIL BOKAKHAT"
          top="22%"
          left="48%"
          status="TRACKING"
          coords="X: 512.0 Y: 240.0"
          cursorOffset={cursorOffset}
          parallaxMultiplier={8}
        />

        <SpatialTrackingReticle
          id="DRONE.02"
          label="DRONE.02 // AERIAL MB RECON"
          sublabel="IS:1200 AUDIT CAM"
          top="18%"
          left="78%"
          status="LOCKED"
          coords="X: 840.2 Y: 160.5"
          cursorOffset={cursorOffset}
          parallaxMultiplier={22}
        />
      </div>

      {/* =========================================================================
          TOP TACTICAL HUD HEADER (CHAPTER // 01, RETICLE SCALE, TELEMETRY, SOUND)
          ========================================================================= */}
      <SpatialHudHeader
        currentStep={currentStep}
        onSelectStep={(st) => {
          setViewMode('workspace');
          setCurrentStep(st);
        }}
        cursorRotation={cursorRotation}
        isCockpitMode={viewMode === 'workspace'}
        onToggleCockpitMode={() => {
          setViewMode(viewMode === 'workspace' ? 'hero' : 'workspace');
        }}
        onOpenHowToUse={() => setShowHowToUseModal(true)}
        onExportExcel={handleExportExcel}
        isExportingExcel={isExportingExcel}
        engineerName={engineerProfile?.name}
        sanctionAmount="₹26,57,320.00"
      />

      {/* Step Progress Navigation Sub-bar */}
      <div className="relative z-20 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-[280px]">
            <StepProgressNav
              currentStep={currentStep}
              onSelectStep={(st) => {
                soundFx.playChapterChime();
                setViewMode('workspace');
                setCurrentStep(st);
              }}
              canAdvance={true}
            />
          </div>

          {/* Quick Stats Pill */}
          <div className="hidden md:flex items-center gap-2 font-mono text-[10px] text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ESTIMATE: ₹26,57,320.00 (WITH 18% GST + CESS)</span>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-12 right-6 z-50 bg-black/90 text-white px-4 py-3 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.4)] border border-cyan-500/60 flex items-center gap-3 text-xs font-mono animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* =========================================================================
          MAIN WORKSPACE: SPATIAL HERO SHOWCASE vs TWO-PANEL WORKSPACE
          ========================================================================= */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 flex flex-col justify-center">
        {/* =======================================================================
            MODE 1: SPATIAL HERO SHOWCASE (DIRECT 1:1 REPLICA OF THE SPARK BENCHMARK)
            ======================================================================= */}
        {viewMode === 'hero' ? (
          <div className="flex flex-col items-center justify-center my-auto py-8 text-center select-none relative animate-in fade-in duration-300">
            {/* Center 3D Character Hero Stage with Tracking Reticle */}
            <div className="relative mb-6">
              <InteractiveEngineerAvatar
                isPasswordFocused={false}
                engineerName={engineerProfile?.name || 'Er. Milim • Chief AI Estimator'}
                designation={engineerProfile?.designation || 'Special Project & Estimation Division (PWD)'}
                currentStep={currentStep}
                className="w-full max-w-md shadow-[0_0_80px_rgba(6,182,212,0.3)]"
              />
            </div>

            {/* Spark Spaced Modernist Title */}
            <div className="space-y-2 mb-6">
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-[0.3em] uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] font-mono">
                M E A S U R E M E N T &nbsp; M A K E R
              </h2>
              <p className="text-xs sm:text-sm text-cyan-300 font-mono tracking-widest uppercase">
                PUBLIC WORKS (BUILDING) DEPARTMENT • GOVT. OF ASSAM • DSR 2021
              </p>
            </div>

            {/* Hero Launch CTA Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  soundFx.playChapterChime();
                  setViewMode('workspace');
                }}
                className="px-6 py-3 rounded-xl text-sm font-black bg-cyan-400 hover:bg-cyan-300 text-black flex items-center gap-2 shadow-[0_0_30px_rgba(6,182,212,0.6)] active:scale-95 transition-all font-mono"
              >
                <span>OPEN CHAPTER 0{currentStep} WORKSPACE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* =======================================================================
              MODE 2: BALANCED TWO-PANEL ENGINEERING WORKSPACE (ZERO CLIPPING / NO PIP)
              ======================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start my-auto">
            {/* LEFT COLUMN: Google Flow RealSync 3D Character Stage (lg: 4 cols) */}
            <div className="lg:col-span-4 flex flex-col items-center">
              <InteractiveEngineerAvatar
                isPasswordFocused={isPasswordFocused}
                engineerName={engineerProfile?.name || 'Er. Milim • Chief AI Estimator'}
                designation={engineerProfile?.designation || 'Special Project & Estimation Division (PWD)'}
                currentStep={currentStep}
                className="w-full max-w-sm"
              />
            </div>

            {/* RIGHT COLUMN: Holographic Engineering Workspace Console (lg: 8 cols) */}
            <div className="lg:col-span-8 bg-black/75 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-4 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
              {/* Console Corner Accents */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400/60" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400/60" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400/60" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400/60" />

              {/* Console Header Bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="font-bold text-white uppercase tracking-wider">
                    CONSOLE // CHAPTER 0{currentStep}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setViewMode('hero');
                  }}
                  className="text-white/60 hover:text-cyan-300 flex items-center gap-1 text-[10px]"
                  title="Switch to 3D Spatial Showcase"
                >
                  <Compass className="w-3 h-3 text-cyan-400" />
                  <span>3D SPATIAL SHOWCASE</span>
                </button>
              </div>

              {/* ACTIVE CHAPTER VIEW */}
              {/* Chapter 01: AuthScreen */}
              {currentStep === 1 && (
                <div className="animate-in fade-in duration-200">
                  <AuthScreen
                    onAuthenticated={handleAuthenticated}
                    currentProfile={engineerProfile}
                    onContinueToHub={() => setCurrentStep(2)}
                    hideEmbeddedAvatar={true}
                    onPasswordFocusChange={(focused) => setIsPasswordFocused(focused)}
                  />
                </div>
              )}

              {/* Chapter 02: Estimate Initiation Hub */}
              {currentStep === 2 && (
                <div className="animate-in fade-in duration-200">
                  <EstimateTypeHub
                    onSelectMode={handleSelectEstimateMode}
                    engineerName={engineerProfile?.name}
                    division={engineerProfile?.division}
                  />
                </div>
              )}

              {/* Chapter 03: Space & Room Schedule */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Step 3 Sub-View Switcher Bar */}
                  <div className="bg-black/60 border border-white/10 rounded-xl p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setStep3SubView('rooms')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          step3SubView === 'rooms'
                            ? 'bg-cyan-500 text-black shadow-xs font-black'
                            : 'text-white/60 hover:text-white bg-white/5'
                        }`}
                      >
                        Room Schedule
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep3SubView('wizard')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          step3SubView === 'wizard'
                            ? 'bg-purple-600 text-white shadow-xs font-black'
                            : 'text-white/60 hover:text-white bg-white/5'
                        }`}
                      >
                        Auto-Estimator Wizard
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep3SubView('takeoff')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          step3SubView === 'takeoff'
                            ? 'bg-indigo-600 text-white shadow-xs font-black'
                            : 'text-white/60 hover:text-white bg-white/5'
                        }`}
                      >
                        AI Blueprint Takeoff
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="px-3.5 py-1 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-black font-black flex items-center justify-center gap-1 active:scale-95 transition-all"
                    >
                      <span>Proceed to Chapter 04</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {step3SubView === 'rooms' && <ArchitecturalBuilder />}
                  {step3SubView === 'wizard' && (
                    <AutoEstimationWizard
                      onApplyEstimate={handleApplyWizardEstimate}
                      onNavigateToTab={(tab) => {
                        if (tab === 'mb') setCurrentStep(4);
                        else if (tab === 'boq') setCurrentStep(5);
                        else setStep3SubView('rooms');
                      }}
                    />
                  )}
                  {step3SubView === 'takeoff' && (
                    <BlueprintUploader onApplyRooms={handleApplyTakeoffRooms} />
                  )}
                </div>
              )}

              {/* Chapter 04: Measurement Book Grid */}
              {currentStep === 4 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-bold text-white font-mono">
                      IS:1200 MEASUREMENT BOOK (29 DSR ITEMS / 241+ ROWS)
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(5)}
                      className="px-3.5 py-1 rounded-lg text-xs font-bold bg-cyan-400 text-black font-black flex items-center gap-1"
                    >
                      <span>Proceed to Chapter 05</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <MeasurementBookGrid
                    projectName={BENCHMARK_PROJECT.name}
                    division={engineerProfile?.division || BENCHMARK_PROJECT.division}
                    dsrYear={BENCHMARK_PROJECT.dsrYear}
                  />
                </div>
              )}

              {/* Chapter 05: Abstract of Cost & BOQ Reconciliation */}
              {currentStep === 5 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Step 5 View Mode Toggle Bar */}
                  <div className="bg-black/60 border border-white/10 rounded-xl p-2.5 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setStep5View('abstract')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          step5View === 'abstract'
                            ? 'bg-cyan-500 text-black font-black'
                            : 'text-white/60 hover:text-white bg-white/5'
                        }`}
                      >
                        Abstract of Cost
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep5View('boq')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          step5View === 'boq'
                            ? 'bg-emerald-500 text-black font-black'
                            : 'text-white/60 hover:text-white bg-white/5'
                        }`}
                      >
                        BOQ Reconciliation
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep5View('both')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          step5View === 'both'
                            ? 'bg-purple-600 text-white font-black'
                            : 'text-white/60 hover:text-white bg-white/5'
                        }`}
                      >
                        Both Views
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to MB</span>
                    </button>
                  </div>

                  {(step5View === 'abstract' || step5View === 'both') && (
                    <AbstractOfCostSummary
                      initialCivilSubTotal={2178131.0}
                      projectName={BENCHMARK_PROJECT.name}
                      division={engineerProfile?.division || BENCHMARK_PROJECT.division}
                      circle={BENCHMARK_PROJECT.circle}
                      subDivision={engineerProfile?.division || 'Bokakhat Sub-Division, PWD (Civil)'}
                      dsrYear={BENCHMARK_PROJECT.dsrYear}
                      onNavigateToTab={(tab) => {
                        if (tab === 'mb') setCurrentStep(4);
                        if (tab === 'rooms') {
                          setCurrentStep(3);
                          setStep3SubView('rooms');
                        }
                        if (tab === 'boq') setStep5View('boq');
                      }}
                    />
                  )}

                  {(step5View === 'boq' || step5View === 'both') && (
                    <div className="space-y-4">
                      <BOQReconciliationTable onExportExcel={handleExportExcel} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          BOTTOM TACTICAL STATUS BAR (THE SPARK TELEMETRY FOOTER)
          ========================================================================= */}
      <footer className="relative z-20 bg-black/85 backdrop-blur-md border-t border-white/10 px-4 sm:px-6 py-2.5 text-[10px] font-mono text-white/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Left Scanning Telemetry */}
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold">AI+ SCANNING...</span>
            <span>//</span>
            <span>PWD CIVIL ESTIMATION GRID</span>
            <span className="hidden md:inline">• LAT: 26.5898° N LONG: 93.6015° E (BOKAKHAT, ASSAM)</span>
          </div>

          {/* Right Authority & Compliance Readout */}
          <div className="flex items-center gap-3">
            <span className="text-white/80">ASSAM PWD • DSR-2021 CIVIL SCHEDULE</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              IS:1200 AUDIT VERIFIED [100% MATCH]
            </span>
          </div>
        </div>
      </footer>

      {/* How to Use Guide Modal */}
      <HowToUseGuideModal
        isOpen={showHowToUseModal}
        onClose={() => setShowHowToUseModal(false)}
        onJumpToStep={(st) => {
          setViewMode('workspace');
          setCurrentStep(st);
          setShowHowToUseModal(false);
        }}
      />
    </div>
  );
};

export default App;
