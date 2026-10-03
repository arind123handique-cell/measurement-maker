import React, { useMemo } from 'react';
import {
  Building2,
  Table2,
  Ruler,
  DoorClosed,
} from 'lucide-react';
import { useArchitecturalStore } from '../lib/architecturalStore';
import { BuildingManager } from './BuildingManager';
import { RoomScheduleTable } from './RoomScheduleTable';
import { OpeningScheduleModal } from './OpeningScheduleModal';
import { roundTo } from '../lib/utils';
import type { Room } from '../types/architectural';

export const ArchitecturalBuilder: React.FC = () => {
  const {
    buildings,
    rooms,
    openings,
    activeBuilding,
    activeBuildingId,
    activeRooms,
    selectedRoom,
    selectedRoomOpenings,
    syncStatus,
    isOnline,
    setActiveBuildingId,
    setSelectedRoomId,
    addBuilding,
    updateBuilding,
    deleteBuilding,
    addRoom,
    updateRoom,
    deleteRoom,
    duplicateRoom,
    addOpening,
    updateOpening,
    deleteOpening,
    syncWithSupabase,
    resetToTemplates,
  } = useArchitecturalStore();

  // Metrics by building for the BuildingManager cards
  const totalRoomsByBuilding = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of rooms) {
      map[r.building_id] = (map[r.building_id] || 0) + 1;
    }
    return map;
  }, [rooms]);

  const carpetAreaByBuilding = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of rooms) {
      const area = r.carpet_area ?? r.length * r.breadth;
      map[r.building_id] = roundTo((map[r.building_id] || 0) + area, 2);
    }
    return map;
  }, [rooms]);

  // Overall project metrics
  const projectTotalRooms = rooms.length;
  const projectTotalCarpetArea = roundTo(
    rooms.reduce((s, r) => s + (r.carpet_area ?? r.length * r.breadth), 0),
    2
  );
  const projectTotalOpenings = openings.reduce((s, o) => s + (o.quantity || 1), 0);
  const projectTotalOpeningArea = roundTo(
    openings.reduce((s, o) => s + (o.quantity || 1) * o.width * o.height, 0),
    2
  );

  return (
    <div className="space-y-6">
      {/* Civil Engineering Project Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        {/* Subtle Background Pattern Accent */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-emerald-500/10 via-blue-500/5 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PWD (Civil) Division Bokakhat
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                SOR: DSR Civil 2021
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                IS:1200 Method of Measurement
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Repairing and Renovation of Circuit House at Bokakhat
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-3xl">
              Architectural Room Schedule & Openings Deductions Engine. Configure building structures, room geometries
              ($L \times B \times H$), and door/window opening schedules for automated measurement book generation.
            </p>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-left">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                Structures
              </span>
              <div className="text-lg font-bold text-white font-mono mt-0.5">{buildings.length}</div>
              <span className="text-[10px] text-slate-400">Assam Type & RCC</span>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-left">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Table2 className="w-3.5 h-3.5 text-emerald-400" />
                Total Rooms
              </span>
              <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">{projectTotalRooms}</div>
              <span className="text-[10px] text-slate-400">Across all blocks</span>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-left">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5 text-amber-400" />
                Carpet Area
              </span>
              <div className="text-lg font-bold text-white font-mono mt-0.5">
                {projectTotalCarpetArea.toFixed(1)} <span className="text-xs text-slate-400 font-normal">m²</span>
              </div>
              <span className="text-[10px] text-slate-400">Net Floor Area</span>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-left">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <DoorClosed className="w-3.5 h-3.5 text-rose-400" />
                Deductions
              </span>
              <div className="text-lg font-bold text-white font-mono mt-0.5">
                {projectTotalOpeningArea.toFixed(1)} <span className="text-xs text-slate-400 font-normal">m²</span>
              </div>
              <span className="text-[10px] text-slate-400">{projectTotalOpenings} Openings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Building Manager Component */}
      <BuildingManager
        buildings={buildings}
        activeBuildingId={activeBuildingId}
        onSelectBuilding={setActiveBuildingId}
        onAddBuilding={addBuilding}
        onUpdateBuilding={updateBuilding}
        onDeleteBuilding={deleteBuilding}
        onResetTemplates={resetToTemplates}
        onSync={syncWithSupabase}
        syncStatus={syncStatus}
        isOnline={isOnline}
        totalRoomsByBuilding={totalRoomsByBuilding}
        carpetAreaByBuilding={carpetAreaByBuilding}
      />

      {/* Room Schedule Table for Active Building */}
      {activeBuilding ? (
        <RoomScheduleTable
          building={activeBuilding}
          rooms={activeRooms}
          openings={openings}
          onAddRoom={addRoom}
          onUpdateRoom={updateRoom}
          onDeleteRoom={deleteRoom}
          onDuplicateRoom={duplicateRoom}
          onManageOpenings={(room: Room) => setSelectedRoomId(room.id)}
        />
      ) : (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-xl">
          <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No Building Selected</p>
          <p className="text-xs text-slate-500 mt-1">
            Select or create a building block above to begin managing room schedules.
          </p>
        </div>
      )}

      {/* Opening Schedule Modal */}
      {selectedRoom && (
        <OpeningScheduleModal
          room={selectedRoom}
          openings={selectedRoomOpenings}
          isOpen={Boolean(selectedRoom)}
          onClose={() => setSelectedRoomId(null)}
          onAddOpening={addOpening}
          onUpdateOpening={updateOpening}
          onDeleteOpening={deleteOpening}
        />
      )}
    </div>
  );
};
