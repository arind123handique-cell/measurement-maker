import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Check,
  RefreshCw,
  CloudCheck,
  CloudOff,
  Sparkles,
} from 'lucide-react';
import type { Building, BuildingType, SyncStatus } from '../types/architectural';

interface BuildingManagerProps {
  buildings: Building[];
  activeBuildingId: string | null;
  onSelectBuilding: (id: string) => void;
  onAddBuilding: (data: {
    name: string;
    type: BuildingType;
    num_floors: number;
    height: number;
    length?: number;
    breadth?: number;
  }) => Promise<unknown>;
  onUpdateBuilding: (id: string, updates: Partial<Building>) => Promise<unknown>;
  onDeleteBuilding: (id: string) => Promise<unknown>;
  onResetTemplates: () => Promise<unknown>;
  onSync: () => Promise<unknown>;
  syncStatus: SyncStatus;
  isOnline: boolean;
  totalRoomsByBuilding?: Record<string, number>;
  carpetAreaByBuilding?: Record<string, number>;
}

const BUILDING_TYPE_LABELS: Record<BuildingType, string> = {
  assam_type: 'Assam Type (Timber / Truss)',
  rcc: 'RCC Framed Structure',
  mixed: 'Mixed Construction',
  residential: 'Residential Quarters',
  office: 'Administrative / Office',
  school: 'Educational / School Block',
  hospital: 'Healthcare / Hospital',
  commercial: 'Commercial Complex',
  toilet_block: 'Sanitary / Toilet Block',
};

const BUILDING_PRESETS = [
  { name: 'G+1 Assam Type Main Building', type: 'assam_type' as BuildingType, floors: 2, height: 3.05 },
  { name: 'Assam Type Dormitory / Barrack Block', type: 'assam_type' as BuildingType, floors: 1, height: 3.05 },
  { name: 'Assam Type Cottage / VIP Suite', type: 'assam_type' as BuildingType, floors: 1, height: 3.05 },
  { name: 'RCC G+2 Staff Quarters', type: 'rcc' as BuildingType, floors: 3, height: 3.05 },
  { name: 'Sanitary / Community Toilet Block', type: 'toilet_block' as BuildingType, floors: 1, height: 2.80 },
];

export const BuildingManager: React.FC<BuildingManagerProps> = ({
  buildings,
  activeBuildingId,
  onSelectBuilding,
  onAddBuilding,
  onUpdateBuilding,
  onDeleteBuilding,
  onResetTemplates,
  onSync,
  syncStatus,
  isOnline,
  totalRoomsByBuilding = {},
  carpetAreaByBuilding = {},
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [deletingBuilding, setDeletingBuilding] = useState<Building | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'assam_type' as BuildingType,
    num_floors: 1,
    height: 3.05,
    length: '',
    breadth: '',
  });

  const openAddModal = (preset?: typeof BUILDING_PRESETS[0]) => {
    if (preset) {
      setFormData({
        name: preset.name,
        type: preset.type,
        num_floors: preset.floors,
        height: preset.height,
        length: '',
        breadth: '',
      });
    } else {
      setFormData({
        name: '',
        type: 'assam_type',
        num_floors: 1,
        height: 3.05,
        length: '',
        breadth: '',
      });
    }
    setIsAddModalOpen(true);
  };

  const openEditModal = (building: Building, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBuilding(building);
    setFormData({
      name: building.name,
      type: building.type,
      num_floors: building.num_floors || 1,
      height: building.height || 3.05,
      length: building.length ? String(building.length) : '',
      breadth: building.breadth ? String(building.breadth) : '',
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddBuilding({
        name: formData.name,
        type: formData.type,
        num_floors: Number(formData.num_floors) || 1,
        height: Number(formData.height) || 3.05,
        length: formData.length ? Number(formData.length) : undefined,
        breadth: formData.breadth ? Number(formData.breadth) : undefined,
      });
      setIsAddModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBuilding || !formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await onUpdateBuilding(editingBuilding.id, {
        name: formData.name,
        type: formData.type,
        num_floors: Number(formData.num_floors) || 1,
        height: Number(formData.height) || 3.05,
        length: formData.length ? Number(formData.length) : null,
        breadth: formData.breadth ? Number(formData.breadth) : null,
      });
      setEditingBuilding(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBuilding) return;
    setIsSubmitting(true);
    try {
      await onDeleteBuilding(deletingBuilding.id);
      setDeletingBuilding(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden mb-6">
      {/* Top Banner with Engineering Context & Cloud Status */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight text-white">
                Architectural Building & Block Manager
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
                {buildings.length} {buildings.length === 1 ? 'Structure' : 'Structures'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Configure independent building wings, story levels, and default floor-to-ceiling heights (IS:1200)
            </p>
          </div>
        </div>

        {/* Sync Status Badge & Global Tools */}
        <div className="flex items-center gap-2.5">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              syncStatus === 'synced'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                : syncStatus === 'syncing'
                ? 'bg-blue-950/80 text-blue-300 border-blue-700/60'
                : syncStatus === 'local' || !isOnline
                ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                : 'bg-rose-950/80 text-rose-300 border-rose-700/60'
            }`}
            title={isOnline ? 'Synced to Supabase public.buildings' : 'Operating in offline local cache'}
          >
            {syncStatus === 'synced' ? (
              <>
                <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Supabase Live</span>
              </>
            ) : syncStatus === 'syncing' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                <span>Syncing Cloud...</span>
              </>
            ) : (
              <>
                <CloudOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Offline Fallback</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => onSync()}
            title="Force refresh & sync with Supabase cloud database"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onResetTemplates()}
            title="Restore PWD Assam Type sample buildings and rooms"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset Templates</span>
          </button>

          <button
            type="button"
            onClick={() => openAddModal()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-md shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Building</span>
          </button>
        </div>
      </div>

      {/* Buildings Switcher Grid / Cards */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {buildings.map((building) => {
            const isActive = building.id === activeBuildingId;
            const roomCount = totalRoomsByBuilding[building.id] || 0;
            const carpetArea = carpetAreaByBuilding[building.id] || 0;

            return (
              <div
                key={building.id}
                onClick={() => onSelectBuilding(building.id)}
                className={`group relative text-left p-3.5 rounded-lg border cursor-pointer transition-all ${
                  isActive
                    ? 'bg-white border-emerald-600 shadow-sm ring-1 ring-emerald-600'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-xs'
                }`}
              >
                {/* Active Indicator Ribbon */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold ${
                        isActive
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                      }`}
                    >
                      {isActive ? <Check className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900 truncate" title={building.name}>
                      {building.name}
                    </h3>
                  </div>

                  {/* Actions for this building */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={(e) => openEditModal(building, e)}
                      title="Edit building parameters"
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {buildings.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingBuilding(building);
                        }}
                        title="Delete building"
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Subtitle & Specs */}
                <div className="text-xs text-slate-500 mb-2 flex items-center gap-2">
                  <span className="font-medium text-slate-700">
                    {BUILDING_TYPE_LABELS[building.type] || building.type}
                  </span>
                  <span>•</span>
                  <span>
                    {building.num_floors === 1 ? 'Single Story' : `G+${(building.num_floors || 2) - 1} (${building.num_floors} Floors)`}
                  </span>
                </div>

                {/* Engineering Metrics Row */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Height (H)</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {building.height?.toFixed(2) ?? '3.05'}m
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Rooms</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {roomCount} {roomCount === 1 ? 'room' : 'rooms'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Carpet Area</span>
                    <span className="font-semibold text-emerald-700 font-mono">
                      {carpetArea.toFixed(1)} m²
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Presets Bar */}
      <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-700">Civil Engineering Presets:</span>
          {BUILDING_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => openAddModal(preset)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded text-xs transition-colors shadow-2xs"
            >
              <Plus className="w-3 h-3 text-emerald-600" />
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add Building Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-sm">Add Architectural Building / Block</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Building Name / Block Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. G+1 Assam Type Main Building"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Structural Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as BuildingType })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="assam_type">Assam Type (Timber / Truss)</option>
                    <option value="rcc">RCC Framed Structure</option>
                    <option value="mixed">Mixed Construction</option>
                    <option value="residential">Residential Quarters</option>
                    <option value="office">Administrative / Office</option>
                    <option value="school">Educational / School Block</option>
                    <option value="hospital">Healthcare / Hospital</option>
                    <option value="toilet_block">Sanitary / Toilet Block</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Number of Floors (Stories)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.num_floors}
                      onChange={(e) => setFormData({ ...formData, num_floors: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400">
                      {formData.num_floors === 1 ? 'Story' : `G+${formData.num_floors - 1}`}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Default Ceiling Height (H in meters)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="2.0"
                    max="6.0"
                    required
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 3.05 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">meters (default 3.05m)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Standard Assam PWD interior clear ceiling height is 3.05m (10 feet).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Overall Length (m) <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 22.0"
                    value={formData.length}
                    onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Overall Breadth (m) <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 14.5"
                    value={formData.breadth}
                    onChange={(e) => setFormData({ ...formData, breadth: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Create Building</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Building Modal */}
      {editingBuilding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-semibold text-sm">Edit Building Structure</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingBuilding(null)}
                className="text-slate-400 hover:text-white text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Building Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Structural Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as BuildingType })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="assam_type">Assam Type (Timber / Truss)</option>
                    <option value="rcc">RCC Framed Structure</option>
                    <option value="mixed">Mixed Construction</option>
                    <option value="residential">Residential Quarters</option>
                    <option value="office">Administrative / Office</option>
                    <option value="school">Educational / School Block</option>
                    <option value="hospital">Healthcare / Hospital</option>
                    <option value="toilet_block">Sanitary / Toilet Block</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Floors (Stories)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.num_floors}
                    onChange={(e) => setFormData({ ...formData, num_floors: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Default Ceiling Height (m)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="2.0"
                    max="6.0"
                    required
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 3.05 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">meters</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingBuilding(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBuilding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-50 rounded-lg">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Delete Building Structure?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              Are you sure you want to delete <strong>{deletingBuilding.name}</strong>? All rooms and opening schedules
              associated with this building block will also be removed.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingBuilding(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-xs flex items-center gap-1.5"
              >
                {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Building</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
