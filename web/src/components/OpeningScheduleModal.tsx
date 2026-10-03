import React, { useState } from 'react';
import {
  DoorClosed,
  AppWindow,
  Wind,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Sparkles,
  Info,
} from 'lucide-react';
import type { Opening, OpeningType, Room } from '../types/architectural';
import { roundTo, formatNumber } from '../lib/utils';

interface OpeningScheduleModalProps {
  room: Room;
  openings: Opening[];
  isOpen: boolean;
  onClose: () => void;
  onAddOpening: (
    roomId: string,
    data: {
      opening_type: OpeningType;
      mark: string;
      quantity: number;
      width: number;
      height: number;
      thickness?: number;
      frame_material?: string;
      shutter_material?: string;
      notes?: string;
    }
  ) => Promise<unknown>;
  onUpdateOpening: (openingId: string, updates: Partial<Opening>) => Promise<unknown>;
  onDeleteOpening: (openingId: string) => Promise<unknown>;
}

const OPENING_PRESETS = [
  { type: 'Door' as OpeningType, mark: 'D1', width: 1.20, height: 2.10, label: 'D1 Entrance Door (1.20m × 2.10m)' },
  { type: 'Door' as OpeningType, mark: 'D2', width: 1.00, height: 2.10, label: 'D2 Room Door (1.00m × 2.10m)' },
  { type: 'Door' as OpeningType, mark: 'D3', width: 0.80, height: 2.00, label: 'D3 Toilet Door (0.80m × 2.00m)' },
  { type: 'Window' as OpeningType, mark: 'W1', width: 1.50, height: 1.80, label: 'W1 Glazed Window (1.50m × 1.80m)' },
  { type: 'Window' as OpeningType, mark: 'W2', width: 1.20, height: 1.20, label: 'W2 Small Window (1.20m × 1.20m)' },
  { type: 'Ventilator' as OpeningType, mark: 'V1', width: 0.60, height: 0.45, label: 'V1 Louver Ventilator (0.60m × 0.45m)' },
];

export const OpeningScheduleModal: React.FC<OpeningScheduleModalProps> = ({
  room,
  openings,
  isOpen,
  onClose,
  onAddOpening,
  onUpdateOpening,
  onDeleteOpening,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  // New Opening Form
  const [newType, setNewType] = useState<OpeningType>('Door');
  const [newMark, setNewMark] = useState('D1');
  const [newQty, setNewQty] = useState(1);
  const [newWidth, setNewWidth] = useState(1.20);
  const [newHeight, setNewHeight] = useState(2.10);
  const [newFrame, setNewFrame] = useState('');
  const [newShutter, setNewShutter] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Inline edit state
  const [editFormData, setEditFormData] = useState<Partial<Opening>>({});

  if (!isOpen) return null;

  const applyPreset = (preset: typeof OPENING_PRESETS[0]) => {
    setNewType(preset.type);
    setNewMark(preset.mark);
    setNewWidth(preset.width);
    setNewHeight(preset.height);
    if (preset.type === 'Door') {
      setNewFrame('Sal Wood / Timber');
      setNewShutter('Flush Shutter 35mm');
    } else if (preset.type === 'Window') {
      setNewFrame('Aluminium Section');
      setNewShutter('Glazed Glass 4mm');
    } else {
      setNewFrame('Aluminium Section');
      setNewShutter('Fixed Louvers');
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddOpening(room.id, {
      opening_type: newType,
      mark: newMark.trim() || 'D1',
      quantity: Number(newQty) || 1,
      width: Number(newWidth) || 1.0,
      height: Number(newHeight) || 2.1,
      frame_material: newFrame.trim() || undefined,
      shutter_material: newShutter.trim() || undefined,
      notes: newNotes.trim() || undefined,
    });

    // Reset default for next item
    setNewMark(newType === 'Door' ? 'D1' : newType === 'Window' ? 'W1' : 'V1');
    setNewQty(1);
  };

  const startEdit = (o: Opening) => {
    setEditingId(o.id);
    setEditFormData({
      opening_type: o.opening_type,
      mark: o.mark,
      quantity: o.quantity,
      width: o.width,
      height: o.height,
      frame_material: o.frame_material,
      shutter_material: o.shutter_material,
      notes: o.notes,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const saveEdit = async (id: string) => {
    await onUpdateOpening(id, editFormData);
    setEditingId(null);
  };

  // Summary Calculations
  const doorOpenings = openings.filter((o) => o.opening_type === 'Door');
  const windowOpenings = openings.filter((o) => o.opening_type === 'Window');
  const ventOpenings = openings.filter((o) => o.opening_type === 'Ventilator');

  const totalDoorQty = doorOpenings.reduce((s, o) => s + (o.quantity || 1), 0);
  const totalDoorArea = roundTo(
    doorOpenings.reduce((s, o) => s + (o.quantity || 1) * o.width * o.height, 0),
    2
  );

  const totalWindowQty = windowOpenings.reduce((s, o) => s + (o.quantity || 1), 0);
  const totalWindowArea = roundTo(
    windowOpenings.reduce((s, o) => s + (o.quantity || 1) * o.width * o.height, 0),
    2
  );

  const totalVentQty = ventOpenings.reduce((s, o) => s + (o.quantity || 1), 0);
  const totalVentArea = roundTo(
    ventOpenings.reduce((s, o) => s + (o.quantity || 1) * o.width * o.height, 0),
    2
  );

  const grandTotalQty = totalDoorQty + totalWindowQty + totalVentQty;
  const grandTotalArea = roundTo(totalDoorArea + totalWindowArea + totalVentArea, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-md border border-emerald-500/30">
                <DoorClosed className="w-4 h-4" />
              </span>
              <h2 className="text-base font-semibold tracking-tight">
                Opening Schedule: <span className="text-emerald-400">{room.name}</span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
              <span>
                Dimensions: <strong className="text-slate-200 font-mono">{room.length.toFixed(3)}m (L)</strong> ×{' '}
                <strong className="text-slate-200 font-mono">{room.breadth.toFixed(3)}m (B)</strong> ×{' '}
                <strong className="text-slate-200 font-mono">{room.height.toFixed(2)}m (H)</strong>
              </span>
              <span>•</span>
              <span>
                Perimeter 2(L+B): <strong className="text-slate-200 font-mono">{(room.perimeter ?? 2 * (room.length + room.breadth)).toFixed(3)}m</strong>
              </span>
              <span>•</span>
              <span>
                Carpet Area: <strong className="text-slate-200 font-mono">{(room.carpet_area ?? room.length * room.breadth).toFixed(2)} m²</strong>
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Engineering Presets Selector */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Standard PWD Assam Type Opening Presets:</span>
              </span>
              <span className="text-[11px] text-slate-500">Click to autofill the form below</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {OPENING_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-2.5 py-1 text-xs bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded font-medium transition-colors shadow-2xs"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Add Opening Form */}
          <form
            onSubmit={handleAddSubmit}
            className="bg-slate-50/70 border border-slate-200 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                Add New Opening to Schedule
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Live Area Preview:{' '}
                <strong className="text-emerald-700 font-bold">
                  {formatNumber((Number(newQty) || 1) * (Number(newWidth) || 0) * (Number(newHeight) || 0))} m²
                </strong>
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newType}
                  onChange={(e) => {
                    const t = e.target.value as OpeningType;
                    setNewType(t);
                    setNewMark(t === 'Door' ? 'D1' : t === 'Window' ? 'W1' : 'V1');
                  }}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white font-medium"
                >
                  <option value="Door">Door</option>
                  <option value="Window">Window</option>
                  <option value="Ventilator">Ventilator</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Mark / Tag <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. D1"
                  value={newMark}
                  onChange={(e) => setNewMark(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Qty (Nos) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={newQty}
                  onChange={(e) => setNewQty(parseInt(e.target.value) || 1)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Width W (m) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="10"
                  required
                  value={newWidth}
                  onChange={(e) => setNewWidth(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Height H (m) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="10"
                  required
                  value={newHeight}
                  onChange={(e) => setNewHeight(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-mono"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded shadow-xs transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Opening</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-xs">
              <div>
                <input
                  type="text"
                  placeholder="Frame Material (e.g. Sal Wood, Aluminium Section)"
                  value={newFrame}
                  onChange={(e) => setNewFrame(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Shutter Specs (e.g. Flush Door 35mm, Glazed Glass 4mm)"
                  value={newShutter}
                  onChange={(e) => setNewShutter(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder="Additional Notes / Location Specs"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded"
                />
              </div>
            </div>
          </form>

          {/* High Density Table for Openings */}
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
            <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Configured Openings Schedule ({openings.length} {openings.length === 1 ? 'Item' : 'Items'})
              </span>
              <span className="text-[11px] text-slate-500">
                Used for IS:1200 deductions in wall plastering and interior painting
              </span>
            </div>

            {openings.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <DoorClosed className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-medium text-slate-600">No openings recorded for this room</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Click the presets above or use the form to add doors, windows, and ventilators.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3 w-28">Type</th>
                      <th className="py-2.5 px-3 w-20">Mark</th>
                      <th className="py-2.5 px-3 w-20 text-right">Qty (Nos)</th>
                      <th className="py-2.5 px-3 w-24 text-right">Width (m)</th>
                      <th className="py-2.5 px-3 w-24 text-right">Height (m)</th>
                      <th className="py-2.5 px-3 w-28 text-right bg-emerald-50/50 text-emerald-900 font-bold">
                        Area (m²)
                      </th>
                      <th className="py-2.5 px-3">Specs / Material</th>
                      <th className="py-2.5 px-3 w-20 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {openings.map((opening, idx) => {
                      const isEditing = editingId === opening.id;
                      const area = (opening.quantity || 1) * opening.width * opening.height;

                      if (isEditing) {
                        return (
                          <tr key={opening.id} className="bg-amber-50/60">
                            <td className="py-2 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                            <td className="py-2 px-3">
                              <select
                                value={editFormData.opening_type || opening.opening_type}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    opening_type: e.target.value as OpeningType,
                                  })
                                }
                                className="w-full px-1.5 py-1 text-xs border border-amber-300 rounded bg-white"
                              >
                                <option value="Door">Door</option>
                                <option value="Window">Window</option>
                                <option value="Ventilator">Ventilator</option>
                              </select>
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={editFormData.mark ?? opening.mark}
                                onChange={(e) => setEditFormData({ ...editFormData, mark: e.target.value })}
                                className="w-full px-1.5 py-1 text-xs border border-amber-300 rounded font-mono font-bold"
                              />
                            </td>
                            <td className="py-2 px-3 text-right">
                              <input
                                type="number"
                                min="1"
                                value={editFormData.quantity ?? opening.quantity ?? 1}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    quantity: parseInt(e.target.value) || 1,
                                  })
                                }
                                className="w-16 px-1.5 py-1 text-xs border border-amber-300 rounded text-right font-mono"
                              />
                            </td>
                            <td className="py-2 px-3 text-right">
                              <input
                                type="number"
                                step="0.01"
                                value={editFormData.width ?? opening.width}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    width: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-20 px-1.5 py-1 text-xs border border-amber-300 rounded text-right font-mono"
                              />
                            </td>
                            <td className="py-2 px-3 text-right">
                              <input
                                type="number"
                                step="0.01"
                                value={editFormData.height ?? opening.height}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    height: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-20 px-1.5 py-1 text-xs border border-amber-300 rounded text-right font-mono"
                              />
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-emerald-800 bg-emerald-50/50">
                              {formatNumber(
                                (Number(editFormData.quantity ?? opening.quantity) || 1) *
                                  (Number(editFormData.width ?? opening.width) || 0) *
                                  (Number(editFormData.height ?? opening.height) || 0)
                              )}
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                placeholder="Frame / Shutter"
                                value={editFormData.shutter_material ?? opening.shutter_material ?? ''}
                                onChange={(e) =>
                                  setEditFormData({ ...editFormData, shutter_material: e.target.value })
                                }
                                className="w-full px-1.5 py-1 text-xs border border-amber-300 rounded"
                              />
                            </td>
                            <td className="py-2 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => saveEdit(opening.id)}
                                  className="p-1 text-emerald-600 hover:bg-emerald-100 rounded"
                                  title="Save"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEdit}
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
                        <tr key={opening.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                                opening.opening_type === 'Door'
                                  ? 'bg-blue-100 text-blue-800'
                                  : opening.opening_type === 'Window'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {opening.opening_type === 'Door' ? (
                                <DoorClosed className="w-3 h-3" />
                              ) : opening.opening_type === 'Window' ? (
                                <AppWindow className="w-3 h-3" />
                              ) : (
                                <Wind className="w-3 h-3" />
                              )}
                              <span>{opening.opening_type}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{opening.mark}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800">
                            {opening.quantity || 1}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                            {opening.width.toFixed(2)}m
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                            {opening.height.toFixed(2)}m
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 bg-emerald-50/50">
                            {formatNumber(area)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                            {opening.shutter_material || opening.frame_material || (
                              <span className="text-slate-300 italic">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => startEdit(opening)}
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteOpening(opening.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* IS:1200 Civil Engineering Notice */}
          <div className="flex items-start gap-2.5 p-3 bg-blue-50/60 rounded-lg border border-blue-200 text-xs text-blue-900">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">IS:1200 Method of Measurement Rule:</strong> Deductions for doors and
              windows are calculated per opening area ($Nos \times W \times H$). For area items like Acrylic Emulsion
              Painting or Wall Plaster, openings are subtracted from the perimeter wall area ($2(L+B) \times H$) in the
              measurement sheet.
            </div>
          </div>
        </div>

        {/* Modal Footer with Grand Totals */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-500">Doors:</span>{' '}
              <strong className="text-slate-800 font-mono">{totalDoorQty} nos</strong>{' '}
              <span className="text-slate-400">({totalDoorArea.toFixed(2)} m²)</span>
            </div>
            <div>
              <span className="text-slate-500">Windows:</span>{' '}
              <strong className="text-slate-800 font-mono">{totalWindowQty} nos</strong>{' '}
              <span className="text-slate-400">({totalWindowArea.toFixed(2)} m²)</span>
            </div>
            <div>
              <span className="text-slate-500">Ventilators:</span>{' '}
              <strong className="text-slate-800 font-mono">{totalVentQty} nos</strong>{' '}
              <span className="text-slate-400">({totalVentArea.toFixed(2)} m²)</span>
            </div>
            <div className="pl-3 border-l border-slate-200">
              <span className="text-slate-700 font-semibold">Total Deduction:</span>{' '}
              <strong className="text-emerald-700 font-bold font-mono text-sm">
                {grandTotalArea.toFixed(2)} m²
              </strong>{' '}
              <span className="text-slate-500">({grandTotalQty} Openings)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              Done & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
