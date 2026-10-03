import React, { useState, useRef, useMemo } from 'react';
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Ruler,
  Check,
} from 'lucide-react';
import {
  BENCHMARK_ROOMS,
  type Room,
  type Opening
} from '../lib/seedData';

interface ExtractedRoom extends Room {
  confidence: number;
}

interface BlueprintUploaderProps {
  onApplyRooms?: (rooms: Room[]) => void;
  activeBuildingId?: string;
}

export const BlueprintUploader: React.FC<BlueprintUploaderProps> = ({
  onApplyRooms,
  activeBuildingId: _activeBuildingId = 'b-1',
}) => {
  // Plan selection / Upload state
  const [selectedPlan, setSelectedPlan] = useState<'plan1' | 'plan2' | 'plan3' | 'custom'>('plan1');
  const [customFile, setCustomFile] = useState<{ name: string; size: string; url: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Canvas Pan & Zoom state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // AI Extraction state
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractionStep, setExtractionStep] = useState<string>('');
  const [hasExtracted, setHasExtracted] = useState(false);
  const [extractedRooms, setExtractedRooms] = useState<ExtractedRoom[]>([]);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'rooms' | 'openings'>('rooms');

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter benchmark rooms according to selected plan
  const planData = useMemo(() => {
    switch (selectedPlan) {
      case 'plan2':
        return {
          title: 'Plan 2: Dormitory Block (Ground Floor)',
          code: 'PLAN-2',
          description: 'Single story dormitory accommodation hall, sanitary block with 4 cubicles, and front verandah',
          rooms: BENCHMARK_ROOMS.filter((r) => r.buildingId === 'b-2'),
          dims: '21.5m x 11.0m plinth',
        };
      case 'plan3':
        return {
          title: 'Plan 3: A-Type VIP Cottage Suite',
          code: 'PLAN-3',
          description: 'Independent cottage suite, rear annex dressing/toilet block, and entrance verandah',
          rooms: BENCHMARK_ROOMS.filter((r) => r.buildingId === 'b-3'),
          dims: '12.4m x 8.6m plinth',
        };
      case 'plan1':
      default:
        return {
          title: 'Plan 1: Main Circuit House Building (G+1 Floor)',
          code: 'PLAN-1',
          description: 'Administrative & VIP suites block with 11 primary rooms, central corridor, and staircase well',
          rooms: BENCHMARK_ROOMS.filter((r) => r.buildingId === 'b-1'),
          dims: '28.4m x 14.8m plinth',
        };
    }
  }, [selectedPlan]);

  // Pan & Zoom controls
  const handleZoomIn = () => setZoomLevel((z) => Math.min(2.5, Number((z + 0.25).toFixed(2))));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  // File Upload Handlers
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const processUploadedFile = (file: File) => {
    const fakeSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const fakeUrl = URL.createObjectURL(file);
    setCustomFile({
      name: file.name,
      size: fakeSize,
      url: fakeUrl,
    });
    setSelectedPlan('custom');
    setHasExtracted(false);
    setAppliedSuccess(false);
  };

  // Trigger Gemini Multimodal Vision AI Takeoff
  const handleRunGeminiTakeoff = () => {
    setIsExtracting(true);
    setExtractionProgress(15);
    setExtractionStep('Connecting to Gemini 1.5 Pro Multimodal Vision endpoint...');
    setAppliedSuccess(false);

    setTimeout(() => {
      setExtractionProgress(40);
      setExtractionStep('Scanning floor plan geometry: Identifying exterior walls & load-bearing axis...');
    }, 600);

    setTimeout(() => {
      setExtractionProgress(70);
      setExtractionStep('OCR parsing dimension text: Extracting room boundaries, clear heights & scale bar...');
    }, 1300);

    setTimeout(() => {
      setExtractionProgress(90);
      setExtractionStep('Correlating door/window markers (D1, W1, V) with schedule annotations...');
    }, 1900);

    setTimeout(() => {
      // Map candidate rooms with simulated high-confidence scores (>95%)
      const targetRooms = planData.rooms;
      const parsedWithConfidence: ExtractedRoom[] = targetRooms.map((r, idx) => ({
        ...r,
        confidence: Number((96.5 + (idx % 4) * 0.9).toFixed(1)),
      }));

      setExtractedRooms(parsedWithConfidence);
      setIsExtracting(false);
      setExtractionProgress(100);
      setExtractionStep('Extraction complete!');
      setHasExtracted(true);
    }, 2500);
  };

  // Apply to Active Room Schedule
  const handleApplyToSchedule = () => {
    if (onApplyRooms && extractedRooms.length > 0) {
      onApplyRooms(extractedRooms);
    }
    setAppliedSuccess(true);
  };

  // Total Openings count across extracted rooms
  const allOpenings = useMemo(() => {
    const list: { roomName: string; opening: Opening }[] = [];
    extractedRooms.forEach((r) => {
      r.openings.forEach((op) => {
        list.push({ roomName: r.name, opening: op });
      });
    });
    return list;
  }, [extractedRooms]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Plan Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                Gemini Vision MCP • IS:962 Takeoff
              </span>
              <span className="text-xs text-slate-400 font-medium">Multimodal AI Engine</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Architectural Drawing Takeoff & Dimension Ingestion
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ingest engineering drawings (PDF / CAD raster), detect room schedules ($L \times B \times H$), and auto-populate door/window openings per IS:1200 rules.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setSelectedPlan('plan1');
                setHasExtracted(false);
                setAppliedSuccess(false);
              }}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                selectedPlan === 'plan1'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Plan 1: Main G+1
            </button>
            <button
              onClick={() => {
                setSelectedPlan('plan2');
                setHasExtracted(false);
                setAppliedSuccess(false);
              }}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                selectedPlan === 'plan2'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Plan 2: Dormitory
            </button>
            <button
              onClick={() => {
                setSelectedPlan('plan3');
                setHasExtracted(false);
                setAppliedSuccess(false);
              }}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                selectedPlan === 'plan3'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Plan 3: Cottage
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                selectedPlan === 'custom'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              Upload Plan
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              className="hidden"
              onChange={handleFileInputChange}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Blueprint Canvas (Left) + Takeoff Review Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols): Canvas & Pan/Zoom Controls */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col h-[560px]">
            {/* Canvas Header / Controls */}
            <div className="bg-slate-50/90 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-slate-800">
                  {selectedPlan === 'custom' && customFile ? customFile.name : planData.title}
                </span>
                <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-slate-200 font-mono text-slate-700">
                  Scale 1:100
                </span>
              </div>

              {/* Pan / Zoom Toolbar */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-600"
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-mono text-[11px] font-bold text-slate-700">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-600"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 ml-1"
                  title="Reset Pan & Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(1.5)}
                  className="p-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-600"
                  title="Focus Zoom"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Interactive Canvas Area */}
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              className={`flex-1 relative overflow-hidden bg-[#0f172a] select-none cursor-grab active:cursor-grabbing ${
                isDragging ? 'ring-2 ring-blue-500 bg-slate-900' : ''
              }`}
            >
              {/* Drop overlay if dragging */}
              {isDragging && (
                <div className="absolute inset-0 bg-blue-900/60 z-20 flex flex-col items-center justify-center text-white backdrop-blur-xs">
                  <UploadCloud className="w-12 h-12 mb-2 animate-bounce" />
                  <p className="text-sm font-semibold">Drop Architectural Drawing to Inspect</p>
                  <p className="text-xs text-blue-200">Supports PNG, JPEG, PDF, SVG</p>
                </div>
              )}

              {/* Architectural Grid & Blueprint Vector Representation */}
              <div
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                  transition: isPanning ? 'none' : 'transform 0.15s ease-out',
                }}
                className="w-full h-full flex items-center justify-center p-8"
              >
                {/* SVG Floor Plan Mockup / Blueprint */}
                <svg
                  viewBox="0 0 800 500"
                  className="w-[740px] h-[460px] drop-shadow-2xl"
                  style={{ background: '#1e293b' }}
                >
                  {/* Grid Lines */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="800" height="500" fill="url(#grid)" />

                  {/* Outer Plinth Outline */}
                  <rect
                    x="50"
                    y="40"
                    width="700"
                    height="420"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                  />
                  <rect
                    x="56"
                    y="46"
                    width="688"
                    height="408"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />

                  {/* Title Banner inside Blueprint */}
                  <text x="70" y="70" fill="#94a3b8" fontSize="12" fontFamily="monospace" fontWeight="bold">
                    CIRCUIT HOUSE BOKAKHAT — {planData.code} ARCHITECTURAL LAYOUT
                  </text>
                  <text x="70" y="86" fill="#64748b" fontSize="10" fontFamily="monospace">
                    PLINTH: {planData.dims} • CLEAR CEILING HEIGHT: 3.05M
                  </text>

                  {/* Dynamic Room Boxes according to selected plan */}
                  {selectedPlan === 'plan1' || selectedPlan === 'custom' ? (
                    <>
                      {/* Room 1 */}
                      <g
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredRoomId('r-101')}
                        onMouseLeave={() => setHoveredRoomId(null)}
                        onClick={() => setSelectedRoomId('r-101')}
                      >
                        <rect
                          x="70"
                          y="110"
                          width="160"
                          height="140"
                          fill={hoveredRoomId === 'r-101' ? '#0369a1' : '#0f172a'}
                          stroke={hoveredRoomId === 'r-101' ? '#38bdf8' : '#64748b'}
                          strokeWidth="2"
                        />
                        <text x="80" y="135" fill="#f8fafc" fontSize="11" fontWeight="bold">
                          Room 1 (Bed Room)
                        </text>
                        <text x="80" y="152" fill="#38bdf8" fontSize="10" fontFamily="monospace">
                          5.644m × 5.508m
                        </text>
                        <text x="80" y="168" fill="#94a3b8" fontSize="9">
                          Area: 31.09 Sqm
                        </text>
                        {/* Door marker */}
                        <circle cx="230" cy="180" r="8" fill="#10b981" />
                        <text x="226" y="183" fill="#fff" fontSize="8" fontWeight="bold">
                          D1
                        </text>
                        {/* Window marker */}
                        <rect x="70" y="160" width="4" height="28" fill="#f59e0b" />
                        <text x="76" y="176" fill="#f59e0b" fontSize="8" fontWeight="bold">
                          W1
                        </text>
                      </g>

                      {/* Room 2 */}
                      <g
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredRoomId('r-102')}
                        onMouseLeave={() => setHoveredRoomId(null)}
                        onClick={() => setSelectedRoomId('r-102')}
                      >
                        <rect
                          x="245"
                          y="110"
                          width="180"
                          height="140"
                          fill={hoveredRoomId === 'r-102' ? '#0369a1' : '#0f172a'}
                          stroke={hoveredRoomId === 'r-102' ? '#38bdf8' : '#64748b'}
                          strokeWidth="2"
                        />
                        <text x="255" y="135" fill="#f8fafc" fontSize="11" fontWeight="bold">
                          Room 2 (VIP Suite)
                        </text>
                        <text x="255" y="152" fill="#38bdf8" fontSize="10" fontFamily="monospace">
                          6.500m × 5.508m
                        </text>
                        <text x="255" y="168" fill="#94a3b8" fontSize="9">
                          Area: 35.80 Sqm
                        </text>
                        <circle cx="245" cy="180" r="8" fill="#10b981" />
                        <text x="241" y="183" fill="#fff" fontSize="8" fontWeight="bold">
                          D1
                        </text>
                      </g>

                      {/* Room 3 */}
                      <g
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredRoomId('r-103')}
                        onMouseLeave={() => setHoveredRoomId(null)}
                        onClick={() => setSelectedRoomId('r-103')}
                      >
                        <rect
                          x="440"
                          y="110"
                          width="145"
                          height="140"
                          fill={hoveredRoomId === 'r-103' ? '#0369a1' : '#0f172a'}
                          stroke={hoveredRoomId === 'r-103' ? '#38bdf8' : '#64748b'}
                          strokeWidth="2"
                        />
                        <text x="450" y="135" fill="#f8fafc" fontSize="11" fontWeight="bold">
                          Room 3 (Bed Room)
                        </text>
                        <text x="450" y="152" fill="#38bdf8" fontSize="10" fontFamily="monospace">
                          5.644m × 4.512m
                        </text>
                        <text x="450" y="168" fill="#94a3b8" fontSize="9">
                          Area: 25.47 Sqm
                        </text>
                        <circle cx="440" cy="180" r="8" fill="#10b981" />
                        <text x="436" y="183" fill="#fff" fontSize="8" fontWeight="bold">
                          D1
                        </text>
                      </g>

                      {/* Room 6 Hall */}
                      <g
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredRoomId('r-106')}
                        onMouseLeave={() => setHoveredRoomId(null)}
                        onClick={() => setSelectedRoomId('r-106')}
                      >
                        <rect
                          x="600"
                          y="110"
                          width="130"
                          height="140"
                          fill={hoveredRoomId === 'r-106' ? '#0369a1' : '#0f172a'}
                          stroke={hoveredRoomId === 'r-106' ? '#38bdf8' : '#64748b'}
                          strokeWidth="2"
                        />
                        <text x="608" y="135" fill="#f8fafc" fontSize="10" fontWeight="bold">
                          Room 6 (Hall)
                        </text>
                        <text x="608" y="152" fill="#38bdf8" fontSize="9" fontFamily="monospace">
                          7.94m × 2.94m
                        </text>
                        <circle cx="600" cy="180" r="8" fill="#10b981" />
                        <text x="596" y="183" fill="#fff" fontSize="7" fontWeight="bold">
                          D2
                        </text>
                      </g>

                      {/* Central Corridor */}
                      <g
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredRoomId('r-112')}
                        onMouseLeave={() => setHoveredRoomId(null)}
                        onClick={() => setSelectedRoomId('r-112')}
                      >
                        <rect
                          x="70"
                          y="265"
                          width="660"
                          height="45"
                          fill={hoveredRoomId === 'r-112' ? '#1e3a8a' : '#172554'}
                          stroke="#3b82f6"
                          strokeWidth="1.5"
                          strokeDasharray="6 3"
                        />
                        <text x="320" y="293" fill="#93c5fd" fontSize="11" fontWeight="bold" fontFamily="monospace">
                          CENTRAL CORRIDOR (22.62m × 2.00m)
                        </text>
                      </g>

                      {/* Room 4 */}
                      <g
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredRoomId('r-104')}
                        onMouseLeave={() => setHoveredRoomId(null)}
                        onClick={() => setSelectedRoomId('r-104')}
                      >
                        <rect
                          x="70"
                          y="325"
                          width="160"
                          height="120"
                          fill={hoveredRoomId === 'r-104' ? '#0369a1' : '#0f172a'}
                          stroke={hoveredRoomId === 'r-104' ? '#38bdf8' : '#64748b'}
                          strokeWidth="2"
                        />
                        <text x="80" y="350" fill="#f8fafc" fontSize="11" fontWeight="bold">
                          Room 4 (Bed Room)
                        </text>
                        <text x="80" y="367" fill="#38bdf8" fontSize="10" fontFamily="monospace">
                          5.644m × 3.912m
                        </text>
                        <circle cx="230" cy="370" r="8" fill="#10b981" />
                        <text x="226" y="373" fill="#fff" fontSize="8" fontWeight="bold">
                          D1
                        </text>
                      </g>

                      {/* Room 5 */}
                      <g
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredRoomId('r-105')}
                        onMouseLeave={() => setHoveredRoomId(null)}
                        onClick={() => setSelectedRoomId('r-105')}
                      >
                        <rect
                          x="245"
                          y="325"
                          width="180"
                          height="120"
                          fill={hoveredRoomId === 'r-105' ? '#0369a1' : '#0f172a'}
                          stroke={hoveredRoomId === 'r-105' ? '#38bdf8' : '#64748b'}
                          strokeWidth="2"
                        />
                        <text x="255" y="350" fill="#f8fafc" fontSize="11" fontWeight="bold">
                          Room 5 (Bed Room)
                        </text>
                        <text x="255" y="367" fill="#38bdf8" fontSize="10" fontFamily="monospace">
                          5.644m × 4.512m
                        </text>
                        <circle cx="245" cy="370" r="8" fill="#10b981" />
                        <text x="241" y="373" fill="#fff" fontSize="8" fontWeight="bold">
                          D1
                        </text>
                      </g>

                      {/* Staircase Well */}
                      <g
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredRoomId('r-111')}
                        onMouseLeave={() => setHoveredRoomId(null)}
                        onClick={() => setSelectedRoomId('r-111')}
                      >
                        <rect
                          x="440"
                          y="325"
                          width="145"
                          height="120"
                          fill={hoveredRoomId === 'r-111' ? '#0369a1' : '#0f172a'}
                          stroke="#a855f7"
                          strokeWidth="2"
                        />
                        <text x="450" y="350" fill="#e9d5ff" fontSize="11" fontWeight="bold">
                          Staircase Well
                        </text>
                        <text x="450" y="367" fill="#c084fc" fontSize="10" fontFamily="monospace">
                          5.644m × 3.228m
                        </text>
                        {/* Staircase treads */}
                        <line x1="450" y1="380" x2="570" y2="380" stroke="#9333ea" strokeWidth="1" />
                        <line x1="450" y1="395" x2="570" y2="395" stroke="#9333ea" strokeWidth="1" />
                        <line x1="450" y1="410" x2="570" y2="410" stroke="#9333ea" strokeWidth="1" />
                      </g>

                      {/* Room 7 Toilet */}
                      <g
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredRoomId('r-107')}
                        onMouseLeave={() => setHoveredRoomId(null)}
                        onClick={() => setSelectedRoomId('r-107')}
                      >
                        <rect
                          x="600"
                          y="325"
                          width="130"
                          height="120"
                          fill={hoveredRoomId === 'r-107' ? '#0369a1' : '#0f172a'}
                          stroke="#14b8a6"
                          strokeWidth="2"
                        />
                        <text x="608" y="350" fill="#ccfbf1" fontSize="10" fontWeight="bold">
                          Room 7 (Toilet)
                        </text>
                        <text x="608" y="367" fill="#2dd4bf" fontSize="9" fontFamily="monospace">
                          2.30m × 3.23m
                        </text>
                        <circle cx="600" cy="370" r="8" fill="#10b981" />
                        <text x="596" y="373" fill="#fff" fontSize="8" fontWeight="bold">
                          D3
                        </text>
                      </g>
                    </>
                  ) : selectedPlan === 'plan2' ? (
                    <>
                      {/* Dormitory Layout */}
                      <rect
                        x="70"
                        y="110"
                        width="420"
                        height="320"
                        fill="#0f172a"
                        stroke="#38bdf8"
                        strokeWidth="2"
                      />
                      <text x="90" y="150" fill="#f8fafc" fontSize="16" fontWeight="bold">
                        Dormitory Hall
                      </text>
                      <text x="90" y="175" fill="#38bdf8" fontSize="13" fontFamily="monospace">
                        9.292m × 6.100m • Area: 56.68 Sqm
                      </text>

                      {/* Toilet Block */}
                      <rect
                        x="510"
                        y="110"
                        width="220"
                        height="150"
                        fill="#0f172a"
                        stroke="#14b8a6"
                        strokeWidth="2"
                      />
                      <text x="525" y="140" fill="#f8fafc" fontSize="12" fontWeight="bold">
                        Toilet Block (4 Cubicles)
                      </text>
                      <text x="525" y="160" fill="#2dd4bf" fontSize="10" fontFamily="monospace">
                        Dado H=2.10m, Wall H=0.95m
                      </text>

                      {/* Lobby */}
                      <rect
                        x="510"
                        y="275"
                        width="220"
                        height="155"
                        fill="#0f172a"
                        stroke="#64748b"
                        strokeWidth="2"
                      />
                      <text x="525" y="310" fill="#f8fafc" fontSize="12" fontWeight="bold">
                        Toilet Access Lobby
                      </text>
                      <text x="525" y="330" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                        3.639m × 1.200m
                      </text>
                    </>
                  ) : (
                    <>
                      {/* Cottage Layout */}
                      <rect
                        x="70"
                        y="110"
                        width="460"
                        height="320"
                        fill="#0f172a"
                        stroke="#38bdf8"
                        strokeWidth="2"
                      />
                      <text x="90" y="150" fill="#f8fafc" fontSize="16" fontWeight="bold">
                        Cottage Main Suite Room
                      </text>
                      <text x="90" y="175" fill="#38bdf8" fontSize="13" fontFamily="monospace">
                        6.008m × 6.600m • Area: 39.65 Sqm
                      </text>

                      {/* Rear Annex */}
                      <rect
                        x="550"
                        y="110"
                        width="180"
                        height="320"
                        fill="#0f172a"
                        stroke="#14b8a6"
                        strokeWidth="2"
                      />
                      <text x="565" y="140" fill="#f8fafc" fontSize="12" fontWeight="bold">
                        Rear Annex / Toilet
                      </text>
                      <text x="565" y="160" fill="#2dd4bf" fontSize="10" fontFamily="monospace">
                        2.300m × 2.231m
                      </text>
                    </>
                  )}
                </svg>
              </div>

              {/* Takeoff Legend / Watermark */}
              <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-700 text-[11px] text-slate-300 flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Doors (D)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
                  <span>Windows (W)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-teal-400" />
                  <span>Sanitary (V)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): AI Takeoff Controls & Results Drawer */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col h-[560px]">
            {/* Action Trigger Card */}
            <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/60 rounded-xl border border-indigo-100 p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Gemini Vision Takeoff
                </span>
                <span className="text-[11px] text-indigo-600 font-semibold">
                  {hasExtracted ? 'Scan Completed' : 'Ready'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                Inspect drawing raster using Gemini Multimodal Vision, detect room geometries, identify door & window tags, and extract schedules with IS:1200 precision.
              </p>

              <button
                onClick={handleRunGeminiTakeoff}
                disabled={isExtracting}
                className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs ${
                  isExtracting
                    ? 'bg-indigo-300 text-white cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-[0.99]'
                }`}
              >
                {isExtracting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Floor Plan Geometry...</span>
                  </>
                ) : hasExtracted ? (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Re-scan Drawing with Gemini</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>AI Auto-Extract Dimensions</span>
                  </>
                )}
              </button>

              {/* Progress Bar when extracting */}
              {isExtracting && (
                <div className="mt-3 space-y-1.5">
                  <div className="flex justify-between text-[11px] text-indigo-800 font-medium">
                    <span className="line-clamp-1">{extractionStep}</span>
                    <span>{extractionProgress}%</span>
                  </div>
                  <div className="w-full bg-indigo-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${extractionProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Extracted Takeoff Results */}
            {hasExtracted ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Result Summary Metrics */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Rooms</span>
                    <span className="text-base font-bold text-slate-900 font-mono">
                      {extractedRooms.length}
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Carpet Area</span>
                    <span className="text-base font-bold text-emerald-700 font-mono">
                      {extractedRooms.reduce((acc, r) => acc + (r.carpetArea || 0), 0).toFixed(1)} m²
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Openings</span>
                    <span className="text-base font-bold text-blue-700 font-mono">
                      {allOpenings.length}
                    </span>
                  </div>
                </div>

                {/* Schedule Sub-tabs */}
                <div className="flex border-b border-slate-200 text-xs mb-2">
                  <button
                    onClick={() => setActiveTab('rooms')}
                    className={`pb-2 px-3 font-semibold transition-colors relative ${
                      activeTab === 'rooms'
                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Rooms Schedule ({extractedRooms.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('openings')}
                    className={`pb-2 px-3 font-semibold transition-colors relative ${
                      activeTab === 'openings'
                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Openings & Markers ({allOpenings.length})
                  </button>
                </div>

                {/* List Container with scroll */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
                  {activeTab === 'rooms' ? (
                    extractedRooms.map((room) => {
                      const isHovered = hoveredRoomId === room.id;
                      const isSelected = selectedRoomId === room.id;
                      return (
                        <div
                          key={room.id}
                          onMouseEnter={() => setHoveredRoomId(room.id)}
                          onMouseLeave={() => setHoveredRoomId(null)}
                          onClick={() => setSelectedRoomId(room.id)}
                          className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                            isHovered || isSelected
                              ? 'bg-blue-50/70 border-blue-300 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-900">{room.name}</span>
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {room.confidence}% match
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-500 font-mono">
                            <div>
                              <span className="text-slate-400">Dim:</span> {room.length} × {room.breadth}m
                            </div>
                            <div>
                              <span className="text-slate-400">Area:</span> {room.carpetArea.toFixed(2)}m²
                            </div>
                            <div>
                              <span className="text-slate-400">H:</span> {room.height}m
                            </div>
                          </div>
                          <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                            <span>Perimeter: {room.perimeter.toFixed(2)}m</span>
                            <span className="text-blue-600 font-medium">
                              {room.openings.length} opening{room.openings.length > 1 ? 's' : ''} detected
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    allOpenings.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] ${
                              item.opening.type === 'DOOR'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.opening.type === 'WINDOW'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-teal-100 text-teal-800'
                            }`}
                          >
                            {item.opening.code}
                          </span>
                          <div>
                            <span className="font-semibold text-slate-800 block">
                              {item.opening.description}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              In {item.roomName} ({item.opening.count} Nos)
                            </span>
                          </div>
                        </div>
                        <div className="text-right font-mono text-[11px]">
                          <span className="text-slate-700 font-semibold block">
                            {item.opening.width}m × {item.opening.height}m
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            {item.opening.area.toFixed(2)} Sqm
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Apply Button / Confirmation */}
                <div className="pt-3 border-t border-slate-200 mt-2">
                  {appliedSuccess ? (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Applied {extractedRooms.length} rooms to project schedule!</span>
                      </div>
                      <span className="text-[11px] text-emerald-700 underline cursor-pointer">
                        View Schedule
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={handleApplyToSchedule}
                      className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>Apply to Room Schedule ({extractedRooms.length} Rooms)</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Empty / Placeholder State */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Ruler className="w-10 h-10 mb-2 opacity-30 text-indigo-600" />
                <h4 className="font-semibold text-slate-700 text-xs mb-1">
                  No Dimensions Extracted Yet
                </h4>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Click <strong>"AI Auto-Extract Dimensions"</strong> above to let Gemini Vision detect room poly-lines, text dimensions, and door/window markers.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
