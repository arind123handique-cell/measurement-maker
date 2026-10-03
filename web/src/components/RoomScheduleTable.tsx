import React, { useState } from 'react';
import {
  Table2,
  Plus,
  DoorClosed,
  Copy,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Sparkles,
} from 'lucide-react';
import type { Room, Opening, Building } from '../types/architectural';
import { roundTo, formatNumber } from '../lib/utils';

interface RoomScheduleTableProps {
  building: Building;
  rooms: Room[];
  openings: Opening[];
  onAddRoom: (data: {
    building_id: string;
    floor_id?: string;
    name: string;
    length: number;
    breadth: number;
    height?: number;
    room_type?: string;
    notes?: string;
  }) => Promise<unknown>;
  onUpdateRoom: (roomId: string, updates: Partial<Room>) => Promise<unknown>;
  onDeleteRoom: (roomId: string) => Promise<unknown>;
  onDuplicateRoom: (roomId: string) => Promise<unknown>;
  onManageOpenings: (room: Room) => void;
}

const ROOM_PRESETS = [
  { name: 'Bed Room (Large)', length: 5.644, breadth: 5.508, type: 'Bed Room' },
  { name: 'Suite / VIP Lounge', length: 6.500, breadth: 5.508, type: 'Suite' },
  { name: 'Bed Room (Standard)', length: 5.644, breadth: 4.512, type: 'Bed Room' },
  { name: 'Bed Room (Compact)', length: 5.644, breadth: 3.912, type: 'Bed Room' },
  { name: 'Central Corridor', length: 19.380, breadth: 2.400, type: 'Corridor' },
  { name: 'Dormitory Hall', length: 12.500, breadth: 6.200, type: 'Hall' },
  { name: 'Attached Washroom', length: 2.800, breadth: 2.200, type: 'Toilet Block' },
];

export const RoomScheduleTable: React.FC<RoomScheduleTableProps> = ({
  building,
  rooms,
  openings,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
  onDuplicateRoom,
  onManageOpenings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Quick Inline Add Bar state
  const [quickName, setQuickName] = useState('');
  const [quickL, setQuickL] = useState('');
  const [quickB, setQuickB] = useState('');
  const [quickH, setQuickH] = useState(String(building.height || 3.05));
  const [quickType, setQuickType] = useState('Bed Room');

  // Inline Editing row state
  const [inlineData, setInlineData] = useState<{
    name: string;
    length: number;
    breadth: number;
    height: number;
    room_type: string;
  }>({
    name: '',
    length: 0,
    breadth: 0,
    height: 3.05,
    room_type: '',
  });

  // Modal Add Form State
  const [modalForm, setModalForm] = useState({
    name: '',
    room_type: 'Bed Room',
    length: '',
    breadth: '',
    height: String(building.height || 3.05),
    notes: '',
  });

  // Filtered rooms
  const filteredRooms = rooms.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.room_type && r.room_type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Map openings by room
  const openingsByRoom = React.useMemo(() => {
    const map = new Map<string, Opening[]>();
    for (const o of openings) {
      const list = map.get(o.room_id) || [];
      list.push(o);
      map.set(o.room_id, list);
    }
    return map;
  }, [openings]);

  // Grand Totals for current building rooms
  const totalLength = roundTo(rooms.reduce((s, r) => s + r.length, 0), 2);
  const totalPerimeter = roundTo(
    rooms.reduce((s, r) => s + (r.perimeter ?? 2 * (r.length + r.breadth)), 0),
    3
  );
  const totalCarpetArea = roundTo(
    rooms.reduce((s, r) => s + (r.carpet_area ?? r.length * r.breadth), 0),
    2
  );
  const totalOpeningsCount = rooms.reduce((s, r) => {
    const list = openingsByRoom.get(r.id) || [];
    return s + list.reduce((q, o) => q + (o.quantity || 1), 0);
  }, 0);

  // Quick inline add handler
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim() || !quickL || !quickB) return;

    await onAddRoom({
      building_id: building.id,
      name: quickName.trim(),
      length: parseFloat(quickL) || 0,
      breadth: parseFloat(quickB) || 0,
      height: parseFloat(quickH) || building.height || 3.05,
      room_type: quickType,
    });

    setQuickName('');
    setQuickL('');
    setQuickB('');
    setQuickH(String(building.height || 3.05));
  };

  // Start inline editing
  const startInlineEdit = (room: Room) => {
    setEditingRoomId(room.id);
    setInlineData({
      name: room.name,
      length: room.length,
      breadth: room.breadth,
      height: room.height,
      room_type: room.room_type || 'Bed Room',
    });
  };

  const cancelInlineEdit = () => {
    setEditingRoomId(null);
  };

  const saveInlineEdit = async (roomId: string) => {
    await onUpdateRoom(roomId, {
      name: inlineData.name,
      length: inlineData.length,
      breadth: inlineData.breadth,
      height: inlineData.height,
      room_type: inlineData.room_type,
    });
    setEditingRoomId(null);
  };

  // Preset click
  const applyPresetToQuick = (preset: typeof ROOM_PRESETS[0]) => {
    const nextIndex = rooms.length + 1;
    setQuickName(`Room ${nextIndex} (${preset.name})`);
    setQuickL(String(preset.length));
    setQuickB(String(preset.breadth));
    setQuickH(String(building.height || 3.05));
    setQuickType(preset.type);
  };

  const handleModalAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalForm.name.trim() || !modalForm.length || !modalForm.breadth) return;

    await onAddRoom({
      building_id: building.id,
      name: modalForm.name.trim(),
      length: parseFloat(modalForm.length) || 0,
      breadth: parseFloat(modalForm.breadth) || 0,
      height: parseFloat(modalForm.height) || building.height || 3.05,
      room_type: modalForm.room_type,
      notes: modalForm.notes.trim() || undefined,
    });

    setIsAddModalOpen(false);
    setModalForm({
      name: '',
      room_type: 'Bed Room',
      length: '',
      breadth: '',
      height: String(building.height || 3.05),
      notes: '',
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Table Header Bar */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
            <Table2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold tracking-tight">
                Room Schedule: <span className="text-emerald-400">{building.name}</span>
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
                {rooms.length} {rooms.length === 1 ? 'Room' : 'Rooms'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Dimensional inputs for automated wall perimeter $2(L+B)$ and carpet area calculations
            </p>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-800 text-slate-100 placeholder-slate-400 border border-slate-700 rounded-md focus:outline-hidden focus:ring-1 focus:ring-emerald-500 w-48"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-md shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Room Modal</span>
          </button>
        </div>
      </div>

      {/* Quick Add Inline Bar & Engineering Presets */}
      <div className="bg-slate-50 border-b border-slate-200 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Room Dimensions:</span>
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {ROOM_PRESETS.slice(0, 5).map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPresetToQuick(preset)}
                className="text-[11px] px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 rounded transition-colors"
              >
                + {preset.name} ({preset.length}×{preset.breadth}m)
              </button>
            ))}
          </div>
        </div>

        {/* Fast Inline Add Form */}
        <form onSubmit={handleQuickAdd} className="grid grid-cols-2 md:grid-cols-12 gap-2 text-xs">
          <div className="col-span-2 md:col-span-4">
            <input
              type="text"
              required
              placeholder="Room Name / Tag (e.g. Room 1 (Bed Room))"
              value={quickName}
              onChange={(e) => setQuickName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <select
              value={quickType}
              onChange={(e) => setQuickType(e.target.value)}
              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-700 font-medium"
            >
              <option value="Bed Room">Bed Room</option>
              <option value="Suite">Suite / Lounge</option>
              <option value="Corridor">Corridor / Passage</option>
              <option value="Hall">Hall / Dormitory</option>
              <option value="Toilet Block">Washroom / Toilet</option>
              <option value="Kitchen">Kitchen / Pantry</option>
              <option value="Store">Store Room</option>
              <option value="Verandah">Verandah / Porch</option>
            </select>
          </div>
          <div className="col-span-1 md:col-span-1">
            <input
              type="number"
              step="0.001"
              required
              placeholder="L (m)"
              value={quickL}
              onChange={(e) => setQuickL(e.target.value)}
              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-right font-mono"
            />
          </div>
          <div className="col-span-1 md:col-span-1">
            <input
              type="number"
              step="0.001"
              required
              placeholder="B (m)"
              value={quickB}
              onChange={(e) => setQuickB(e.target.value)}
              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-right font-mono"
            />
          </div>
          <div className="col-span-1 md:col-span-1">
            <input
              type="number"
              step="0.01"
              required
              placeholder="H (m)"
              value={quickH}
              onChange={(e) => setQuickH(e.target.value)}
              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-right font-mono"
            />
          </div>
          <div className="col-span-1 md:col-span-1 text-right self-center text-slate-500 font-mono text-[11px] truncate">
            {quickL && quickB ? `${roundTo(parseFloat(quickL) * parseFloat(quickB), 2)} m²` : '—'}
          </div>
          <div className="col-span-2 md:col-span-2">
            <button
              type="submit"
              className="w-full py-1.5 px-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-medium flex items-center justify-center gap-1 shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Fast Add</span>
            </button>
          </div>
        </form>
      </div>

      {/* Room Schedule Table (High-Density Engineering Layout) */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200 select-none">
            <tr>
              <th className="py-2.5 px-3 w-10 text-center text-slate-400">#</th>
              <th className="py-2.5 px-3 min-w-[200px]">Room Name / Tag</th>
              <th className="py-2.5 px-3 w-28">Type</th>
              <th className="py-2.5 px-3 w-24 text-right">Length L (m)</th>
              <th className="py-2.5 px-3 w-24 text-right">Breadth B (m)</th>
              <th className="py-2.5 px-3 w-24 text-right">Height H (m)</th>
              <th className="py-2.5 px-3 w-32 text-right bg-blue-50/70 text-blue-900 font-bold">
                Perimeter 2(L+B) (m)
              </th>
              <th className="py-2.5 px-3 w-32 text-right bg-emerald-50/70 text-emerald-900 font-bold">
                Carpet Area L×B (m²)
              </th>
              <th className="py-2.5 px-3 min-w-[190px]">Openings Schedule</th>
              <th className="py-2.5 px-3 w-28 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {filteredRooms.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400">
                  <Table2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-medium text-slate-600">No rooms found</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {searchQuery ? 'Try a different search term' : 'Add your first room using the quick inputs above'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredRooms.map((room, idx) => {
                const isEditing = editingRoomId === room.id;
                const roomOpenings = openingsByRoom.get(room.id) || [];
                const totalOpeningsInRoom = roomOpenings.reduce((s, o) => s + (o.quantity || 1), 0);
                const perimeterVal = room.perimeter ?? roundTo(2 * (room.length + room.breadth), 3);
                const carpetAreaVal = room.carpet_area ?? roundTo(room.length * room.breadth, 2);

                if (isEditing) {
                  return (
                    <tr key={room.id} className="bg-amber-50/60">
                      <td className="py-2 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={inlineData.name}
                          onChange={(e) => setInlineData({ ...inlineData, name: e.target.value })}
                          className="w-full px-2 py-1 text-xs border border-amber-300 rounded font-semibold bg-white"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={inlineData.room_type}
                          onChange={(e) => setInlineData({ ...inlineData, room_type: e.target.value })}
                          className="w-full px-2 py-1 text-xs border border-amber-300 rounded bg-white"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          step="0.001"
                          value={inlineData.length}
                          onChange={(e) =>
                            setInlineData({ ...inlineData, length: parseFloat(e.target.value) || 0 })
                          }
                          className="w-20 px-1.5 py-1 text-xs border border-amber-300 rounded text-right font-mono bg-white"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          step="0.001"
                          value={inlineData.breadth}
                          onChange={(e) =>
                            setInlineData({ ...inlineData, breadth: parseFloat(e.target.value) || 0 })
                          }
                          className="w-20 px-1.5 py-1 text-xs border border-amber-300 rounded text-right font-mono bg-white"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={inlineData.height}
                          onChange={(e) =>
                            setInlineData({ ...inlineData, height: parseFloat(e.target.value) || 3.05 })
                          }
                          className="w-20 px-1.5 py-1 text-xs border border-amber-300 rounded text-right font-mono bg-white"
                        />
                      </td>
                      {/* Live Calculated Perimeter */}
                      <td className="py-2 px-3 text-right font-mono font-bold text-blue-900 bg-blue-50/70">
                        {formatNumber(roundTo(2 * (inlineData.length + inlineData.breadth), 3), 3)}m
                      </td>
                      {/* Live Calculated Carpet Area */}
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-900 bg-emerald-50/70">
                        {formatNumber(roundTo(inlineData.length * inlineData.breadth, 2), 2)} m²
                      </td>
                      <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">
                        {totalOpeningsInRoom} Openings
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => saveInlineEdit(room.id)}
                            className="p-1 text-emerald-700 hover:bg-emerald-100 rounded"
                            title="Save changes"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelInlineEdit}
                            className="p-1 text-slate-400 hover:bg-slate-200 rounded"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={room.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{room.name}</span>
                        {room.notes && (
                          <span
                            title={room.notes}
                            className="text-[10px] text-slate-400 cursor-help underline decoration-dotted"
                          >
                            info
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {room.room_type || 'Bed Room'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                      {room.length.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                      {room.breadth.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {room.height.toFixed(2)}
                    </td>

                    {/* Calculated Perimeter 2*(L+B) */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-900 bg-blue-50/40">
                      {perimeterVal.toFixed(3)}
                    </td>

                    {/* Calculated Carpet Area L*B */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-900 bg-emerald-50/40">
                      {carpetAreaVal.toFixed(2)}
                    </td>

                    {/* Openings Schedule Preview Badge */}
                    <td className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() => onManageOpenings(room)}
                        className="group/btn inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 transition-colors"
                        title="Click to view and edit door, window, and ventilator schedule"
                      >
                        <DoorClosed className="w-3.5 h-3.5 text-slate-500 group-hover/btn:text-emerald-600" />
                        <span className="font-semibold font-mono text-[11px]">
                          {totalOpeningsInRoom} {totalOpeningsInRoom === 1 ? 'Opening' : 'Openings'}
                        </span>
                        {roomOpenings.length > 0 && (
                          <span className="text-[10px] text-slate-500 font-mono ml-0.5 truncate max-w-[120px]">
                            ({roomOpenings.map((o) => `${o.quantity}×${o.mark}`).join(', ')})
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Row Actions */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onManageOpenings(room)}
                          title="Manage doors and windows"
                          className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                        >
                          <DoorClosed className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => startInlineEdit(room)}
                          title="Inline edit dimensions"
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicateRoom(room.id)}
                          title="Duplicate room & openings"
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRoom(room.id)}
                          title="Delete room"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Grand Totals Footer Row */}
          {rooms.length > 0 && (
            <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900">
              <tr>
                <td className="py-3 px-3 text-center text-slate-500 font-mono">∑</td>
                <td className="py-3 px-3">
                  Building Total ({rooms.length} {rooms.length === 1 ? 'Room' : 'Rooms'})
                </td>
                <td className="py-3 px-3 text-slate-500 font-normal text-[11px]">—</td>
                <td className="py-3 px-3 text-right font-mono text-slate-600 font-normal">
                  {totalLength.toFixed(2)}m
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-500 font-normal">—</td>
                <td className="py-3 px-3 text-right font-mono text-slate-600 font-normal">
                  Avg {building.height?.toFixed(2) ?? '3.05'}m
                </td>
                {/* Total Perimeter */}
                <td className="py-3 px-3 text-right font-mono text-blue-900 bg-blue-100/60">
                  {totalPerimeter.toFixed(3)} m
                </td>
                {/* Total Carpet Area */}
                <td className="py-3 px-3 text-right font-mono text-emerald-900 bg-emerald-100/60 text-sm">
                  {totalCarpetArea.toFixed(2)} m²
                </td>
                <td className="py-3 px-3 font-mono text-slate-800 text-[11px]">
                  {totalOpeningsCount} Total Openings
                </td>
                <td className="py-3 px-3"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Add Room Modal Dialog */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Table2 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-semibold text-sm">Add Room to {building.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleModalAddSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Room Name / Tag <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Room 1 (Bed Room)"
                    value={modalForm.name}
                    onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room Type</label>
                  <select
                    value={modalForm.room_type}
                    onChange={(e) => setModalForm({ ...modalForm, room_type: e.target.value })}
                    className="w-full px-2.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Bed Room">Bed Room</option>
                    <option value="Suite">Suite / Lounge</option>
                    <option value="Corridor">Corridor</option>
                    <option value="Hall">Hall</option>
                    <option value="Toilet Block">Washroom</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Store">Store Room</option>
                    <option value="Verandah">Verandah</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Length L (m) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="e.g. 5.644"
                    value={modalForm.length}
                    onChange={(e) => setModalForm({ ...modalForm, length: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Breadth B (m) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="e.g. 5.508"
                    value={modalForm.breadth}
                    onChange={(e) => setModalForm({ ...modalForm, breadth: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Height H (m) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={modalForm.height}
                    onChange={(e) => setModalForm({ ...modalForm, height: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block">Calculated Perimeter 2(L+B):</span>
                  <span className="font-bold text-blue-900 font-mono text-sm">
                    {modalForm.length && modalForm.breadth
                      ? `${roundTo(2 * (parseFloat(modalForm.length) + parseFloat(modalForm.breadth)), 3)} m`
                      : '0.000 m'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Calculated Carpet Area (L×B):</span>
                  <span className="font-bold text-emerald-900 font-mono text-sm">
                    {modalForm.length && modalForm.breadth
                      ? `${roundTo(parseFloat(modalForm.length) * parseFloat(modalForm.breadth), 2)} m²`
                      : '0.00 m²'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Engineering Notes / Description (optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Master suite with east facade windows and corridor access"
                  value={modalForm.notes}
                  onChange={(e) => setModalForm({ ...modalForm, notes: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Room</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
