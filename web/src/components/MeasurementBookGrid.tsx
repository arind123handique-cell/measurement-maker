import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  RefreshCw,
  Building,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import {
  type EstimateItem,
  type Room,
  type Opening,
  type MeasurementRow,
  type GeneratedMeasurementBookItem,
  generateRoomMeasurements,
  calculateItemTotal,
  round2,
  formatIndianCurrency,
  numberToWordsINR,
  BENCHMARK_ITEMS,
  BENCHMARK_ROOMS,
  BENCHMARK_OPENINGS,
} from '../lib/measurementEngine';
import { exportToPWDExcel } from '../lib/excelExporter';

export interface MeasurementBookGridProps {
  initialItems?: EstimateItem[];
  rooms?: Room[];
  openings?: Opening[];
  projectName?: string;
  division?: string;
  dsrYear?: string;
}

export const MeasurementBookGrid: React.FC<MeasurementBookGridProps> = ({
  initialItems = BENCHMARK_ITEMS,
  rooms = BENCHMARK_ROOMS,
  openings = BENCHMARK_OPENINGS,
  projectName = 'Repairing and Renovation of Circuit House at Bokakhat Co District under Golaghat District',
  division = 'Golaghat Road Division, PWD (Civil)',
  dsrYear = '2021',
}) => {
  // State for items & their generated measurement rows
  const [itemsList] = useState<EstimateItem[]>(initialItems);
  const [selectedItemId, setSelectedItemId] = useState<string>('all');
  const [includeBeams, setIncludeBeams] = useState<boolean>(true);
  const [includeIdenticalFloors, setIncludeIdenticalFloors] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  // Generated measurements state per item (allows inline editing)
  const [generatedItemsMap, setGeneratedItemsMap] = useState<{
    [itemId: string]: GeneratedMeasurementBookItem;
  }>(() => {
    const map: { [itemId: string]: GeneratedMeasurementBookItem } = {};
    for (const it of initialItems) {
      map[it.id] = generateRoomMeasurements(it, rooms, openings, {
        includeBeams: true,
        includeIdenticalFloors: true,
      });
    }
    return map;
  });

  // State for row being inline-edited
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<{
    particulars: string;
    nos: number | null;
    length: number | null;
    breadth: number | null;
    height: number | null;
  }>({ particulars: '', nos: null, length: null, breadth: null, height: null });

  // State for adding a custom row modal/form
  const [isAddingRow, setIsAddingRow] = useState<boolean>(false);
  const [targetItemForAdd, setTargetItemForAdd] = useState<string>(initialItems[0]?.id || '');
  const [newRowData, setNewRowData] = useState<{
    particulars: string;
    nos: number;
    length: number;
    breadth: number | '';
    height: number | '';
    isDeduction: boolean;
  }>({
    particulars: '',
    nos: 1,
    length: 1,
    breadth: '',
    height: '',
    isDeduction: false,
  });

  // Re-generate measurements when beams or identical floor options change
  const handleRegenerateAll = () => {
    const newMap: { [itemId: string]: GeneratedMeasurementBookItem } = {};
    for (const it of itemsList) {
      newMap[it.id] = generateRoomMeasurements(it, rooms, openings, {
        includeBeams,
        includeIdenticalFloors,
      });
    }
    setGeneratedItemsMap(newMap);
  };

  // Inline Row Edit Start
  const startEditingRow = (row: MeasurementRow) => {
    setEditingRowId(row.id);
    setEditFields({
      particulars: row.particulars,
      nos: row.nos,
      length: row.length,
      breadth: row.breadth,
      height: row.height,
    });
  };

  // Inline Row Edit Save
  const saveEditingRow = (itemId: string, rowId: string) => {
    const currentItemData = generatedItemsMap[itemId];
    if (!currentItemData) return;

    const updatedRows = currentItemData.rows.map((r) => {
      if (r.id !== rowId) return r;

      const nos = editFields.nos;
      const l = editFields.length;
      const b = editFields.breadth;
      const h = editFields.height;

      // Recalculate quantity
      let qty = 0;
      if (nos !== null) {
        if (l !== null && b !== null && h !== null) {
          qty = round2(nos * l * b * h);
        } else if (l !== null && h !== null) {
          qty = round2(nos * l * h);
        } else if (l !== null && b !== null) {
          qty = round2(nos * l * b);
        } else if (l !== null) {
          qty = round2(nos * l);
        } else {
          qty = round2(nos);
        }
      }

      return {
        ...r,
        particulars: editFields.particulars,
        nos,
        length: l,
        breadth: b,
        height: h,
        quantity: qty,
      };
    });

    const { totalQuantity, amount } = calculateItemTotal(updatedRows, currentItemData.item.rate);

    // Update total row in the rows array
    const finalizedRows = updatedRows.map((r) =>
      r.is_total ? { ...r, quantity: totalQuantity, amount } : r
    );

    setGeneratedItemsMap((prev) => ({
      ...prev,
      [itemId]: {
        ...currentItemData,
        rows: finalizedRows,
        totalQuantity,
        amount,
      },
    }));

    setEditingRowId(null);
  };

  // Delete Row
  const deleteRow = (itemId: string, rowId: string) => {
    const currentItemData = generatedItemsMap[itemId];
    if (!currentItemData) return;

    const updatedRows = currentItemData.rows.filter((r) => r.id !== rowId);
    const { totalQuantity, amount } = calculateItemTotal(updatedRows, currentItemData.item.rate);

    const finalizedRows = updatedRows.map((r) =>
      r.is_total ? { ...r, quantity: totalQuantity, amount } : r
    );

    setGeneratedItemsMap((prev) => ({
      ...prev,
      [itemId]: {
        ...currentItemData,
        rows: finalizedRows,
        totalQuantity,
        amount,
      },
    }));
  };

  // Add Custom Row to Item
  const handleAddCustomRow = (e: React.FormEvent) => {
    e.preventDefault();
    const targetItem = generatedItemsMap[targetItemForAdd];
    if (!targetItem) return;

    const nos = newRowData.isDeduction
      ? -Math.abs(newRowData.nos)
      : Math.abs(newRowData.nos);
    const l = newRowData.length;
    const b = newRowData.breadth === '' ? null : Number(newRowData.breadth);
    const h = newRowData.height === '' ? null : Number(newRowData.height);

    let qty = 0;
    if (l !== null && b !== null && h !== null) {
      qty = round2(nos * l * b * h);
    } else if (l !== null && h !== null) {
      qty = round2(nos * l * h);
    } else if (l !== null && b !== null) {
      qty = round2(nos * l * b);
    } else if (l !== null) {
      qty = round2(nos * l);
    } else {
      qty = round2(nos);
    }

    const newRow: MeasurementRow = {
      id: `${targetItemForAdd}-custom-${Date.now()}`,
      item_id: targetItemForAdd,
      particulars: (newRowData.isDeduction ? '  Deduct : ' : '  ') + newRowData.particulars,
      nos,
      length: l,
      breadth: b,
      height: h,
      quantity: qty,
      unit: targetItem.item.unit,
      is_deduction: newRowData.isDeduction,
      formula_type: 'custom',
    };

    // Insert just before the total row
    const existingRows = [...targetItem.rows];
    const totalRowIndex = existingRows.findIndex((r) => r.is_total);
    if (totalRowIndex !== -1) {
      existingRows.splice(totalRowIndex, 0, newRow);
    } else {
      existingRows.push(newRow);
    }

    const { totalQuantity, amount } = calculateItemTotal(existingRows, targetItem.item.rate);
    const finalizedRows = existingRows.map((r) =>
      r.is_total ? { ...r, quantity: totalQuantity, amount } : r
    );

    setGeneratedItemsMap((prev) => ({
      ...prev,
      [targetItemForAdd]: {
        ...targetItem,
        rows: finalizedRows,
        totalQuantity,
        amount,
      },
    }));

    setIsAddingRow(false);
    setNewRowData({
      particulars: '',
      nos: 1,
      length: 1,
      breadth: '',
      height: '',
      isDeduction: false,
    });
  };

  // Filtered Items to Display
  const displayedItems = useMemo(() => {
    const list = Object.values(generatedItemsMap);
    if (selectedItemId !== 'all') {
      return list.filter((it) => it.item.id === selectedItemId);
    }
    return list;
  }, [generatedItemsMap, selectedItemId]);

  // Overall Statistics
  const civilGrandTotal = useMemo(() => {
    return round2(
      Object.values(generatedItemsMap).reduce((sum, it) => sum + it.amount, 0)
    );
  }, [generatedItemsMap]);

  const totalDeductionsCount = useMemo(() => {
    let count = 0;
    Object.values(generatedItemsMap).forEach((it) => {
      it.rows.forEach((r) => {
        if (r.is_deduction) count++;
      });
    });
    return count;
  }, [generatedItemsMap]);

  // Excel Export Handler
  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      setExportSuccess(false);

      const itemsToExport = Object.values(generatedItemsMap);
      await exportToPWDExcel(
        itemsToExport,
        {
          projectName,
          division,
          dsrYear,
          sheetTitle: 'DETAIL ESTIMATE',
          sheetName: 'AType Cottage',
        },
        `PWD_Measurement_Book_${new Date().toISOString().split('T')[0]}.xlsx`
      );

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to export Measurement Book to Excel:', err);
      alert('Error exporting to Excel. Please check console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* ------------------------------------------------------------- */}
      {/* 1. Project Header Banner (PWD Audit Standard) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 px-6 py-5 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[11px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 rounded">
                  IS:1200 / CPWD COMPLIANT
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  SOR / DSR: {dsrYear} (Civil)
                </span>
              </div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>{projectName}</span>
              </h1>
              <p className="text-xs text-slate-300 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{division}</span>
              </p>
            </div>

            {/* Main Action: Export to Excel */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExportExcel}
                disabled={isExporting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating Native Excel...</span>
                  </>
                ) : exportSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Downloaded (.xlsx)</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Export PWD Measurement Book (.xlsx)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 2. KPI Summary Bar */}
        {/* ------------------------------------------------------------- */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-200 bg-slate-50 border-b border-slate-200 text-slate-700">
          <div className="p-3.5 px-5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Estimate Items
            </div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              {itemsList.length} DSR Items
            </div>
          </div>
          <div className="p-3.5 px-5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Architectural Rooms
            </div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              {rooms.length} Rooms ({openings.length} Openings)
            </div>
          </div>
          <div className="p-3.5 px-5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              IS:1200 Deductions
            </div>
            <div className="text-lg font-bold text-rose-600 mt-0.5">
              {totalDeductionsCount} Deduction Lines
            </div>
          </div>
          <div className="p-3.5 px-5 bg-indigo-50/50">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700">
              Civil Works Grand Total
            </div>
            <div className="text-lg font-bold text-indigo-950 mt-0.5">
              {formatIndianCurrency(civilGrandTotal)}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 3. Controls & Filter Toolbar */}
        {/* ------------------------------------------------------------- */}
        <div className="p-4 bg-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-200">
          {/* Item Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Item:</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedItemId('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                selectedItemId === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Items ({itemsList.length})
            </button>
            {itemsList.map((it) => (
              <button
                key={it.id}
                type="button"
                onClick={() => setSelectedItemId(it.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  selectedItemId === it.id
                    ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Item {it.item_number}: {it.dsr_code}
              </button>
            ))}
          </div>

          {/* Action Tools: Toggles & Add Row */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Beam toggle */}
            <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={includeBeams}
                onChange={(e) => {
                  setIncludeBeams(e.target.checked);
                  setTimeout(handleRegenerateAll, 0);
                }}
                className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300"
              />
              <span>Tie Beams (0.73m)</span>
            </label>

            {/* Identical Floors toggle */}
            <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={includeIdenticalFloors}
                onChange={(e) => {
                  setIncludeIdenticalFloors(e.target.checked);
                  setTimeout(handleRegenerateAll, 0);
                }}
                className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300"
              />
              <span>G+1 Floors</span>
            </label>

            {/* Add Custom Row Button */}
            <button
              type="button"
              onClick={() => setIsAddingRow(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-300 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              <span>Add Line</span>
            </button>

            {/* Reset / Recalculate */}
            <button
              type="button"
              onClick={handleRegenerateAll}
              title="Recalculate measurements from room schedule"
              className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-300 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 4. Add Custom Row Modal / Inline Form */}
        {/* ------------------------------------------------------------- */}
        {isAddingRow && (
          <form
            onSubmit={handleAddCustomRow}
            className="p-4 bg-indigo-50/60 border-b border-indigo-200 flex flex-wrap items-end gap-3"
          >
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Target Item
              </label>
              <select
                value={targetItemForAdd}
                onChange={(e) => setTargetItemForAdd(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded font-medium text-slate-700"
              >
                {itemsList.map((it) => (
                  <option key={it.id} value={it.id}>
                    Item {it.item_number}: {it.dsr_code} ({it.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Particulars / Description
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Verandah corner wall or Special dado"
                value={newRowData.particulars}
                onChange={(e) =>
                  setNewRowData({ ...newRowData, particulars: e.target.value })
                }
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded text-slate-800"
              />
            </div>

            <div className="w-20">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Nos (Count)
              </label>
              <input
                type="number"
                step="any"
                required
                value={newRowData.nos}
                onChange={(e) =>
                  setNewRowData({ ...newRowData, nos: parseFloat(e.target.value) || 1 })
                }
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded font-mono text-right"
              />
            </div>

            <div className="w-24">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                L (m)
              </label>
              <input
                type="number"
                step="0.001"
                required
                value={newRowData.length}
                onChange={(e) =>
                  setNewRowData({
                    ...newRowData,
                    length: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded font-mono text-right"
              />
            </div>

            <div className="w-24">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                B (m) [opt]
              </label>
              <input
                type="number"
                step="0.001"
                placeholder="Optional"
                value={newRowData.breadth}
                onChange={(e) =>
                  setNewRowData({
                    ...newRowData,
                    breadth: e.target.value === '' ? '' : parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded font-mono text-right"
              />
            </div>

            <div className="w-24">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                H (m) [opt]
              </label>
              <input
                type="number"
                step="0.001"
                placeholder="Optional"
                value={newRowData.height}
                onChange={(e) =>
                  setNewRowData({
                    ...newRowData,
                    height: e.target.value === '' ? '' : parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded font-mono text-right"
              />
            </div>

            <label className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 pb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newRowData.isDeduction}
                onChange={(e) =>
                  setNewRowData({ ...newRowData, isDeduction: e.target.checked })
                }
                className="w-4 h-4 text-rose-600 rounded border-rose-300"
              />
              <span>Deduction (Negative Qty)</span>
            </label>

            <div className="flex items-center gap-2 pb-0.5">
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow-2xs cursor-pointer"
              >
                Insert Line
              </button>
              <button
                type="button"
                onClick={() => setIsAddingRow(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 5. Official PWD Spreadsheet Grid Table */}
        {/* ------------------------------------------------------------- */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1050px]">
            {/* Header Row 4 with #D9E1F2 Blue Fill */}
            <thead>
              <tr className="bg-[#D9E1F2] text-slate-900 border-y border-slate-300 text-xs font-bold uppercase tracking-wider select-none">
                <th className="py-2.5 px-3 text-center border-r border-slate-300 w-12">
                  SL. No.
                </th>
                <th className="py-2.5 px-3 text-center border-r border-slate-300 w-24">
                  CODE NO
                </th>
                <th className="py-2.5 px-4 border-r border-slate-300 min-w-[320px]">
                  PARTICULARS
                </th>
                <th className="py-2.5 px-2.5 text-right border-r border-slate-300 w-16">
                  No.
                </th>
                <th className="py-2.5 px-1 text-center border-r border-slate-300 w-6 text-slate-500">
                  x
                </th>
                <th className="py-2.5 px-2.5 text-right border-r border-slate-300 w-20">
                  L (m)
                </th>
                <th className="py-2.5 px-1 text-center border-r border-slate-300 w-6 text-slate-500">
                  x
                </th>
                <th className="py-2.5 px-2.5 text-right border-r border-slate-300 w-20">
                  B (m)
                </th>
                <th className="py-2.5 px-1 text-center border-r border-slate-300 w-6 text-slate-500">
                  x
                </th>
                <th className="py-2.5 px-2.5 text-right border-r border-slate-300 w-20">
                  H (m)
                </th>
                <th className="py-2.5 px-3 text-right border-r border-slate-300 w-28 bg-[#c9d4e8]">
                  QTY
                </th>
                <th className="py-2.5 px-2 text-center border-r border-slate-300 w-16">
                  Unit
                </th>
                <th className="py-2.5 px-3 text-right border-r border-slate-300 w-24">
                  RATE (₹)
                </th>
                <th className="py-2.5 px-3 text-right border-r border-slate-300 w-28 bg-[#c9d4e8]">
                  AMOUNT (₹)
                </th>
                <th className="py-2.5 px-2 text-center w-16 text-slate-500">
                  Act
                </th>
              </tr>
            </thead>

            <tbody className="text-xs text-slate-800 divide-y divide-slate-200">
              {displayedItems.map((itemBlock) => {
                const { item, rows } = itemBlock;
                const measurementLines = rows.filter((r) => !r.is_total);
                const totalRow = rows.find((r) => r.is_total);

                return (
                  <React.Fragment key={item.id}>
                    {/* Item Master Header Row */}
                    <tr className="bg-slate-100/90 font-semibold border-t-2 border-slate-300 hover:bg-slate-200/70 transition-colors">
                      <td className="py-2 px-3 text-center border-r border-slate-300 font-bold text-slate-900 align-top">
                        {item.item_number}
                      </td>
                      <td className="py-2 px-3 text-center border-r border-slate-300 font-mono font-bold text-indigo-900 align-top">
                        {item.dsr_code}
                      </td>
                      <td
                        colSpan={9}
                        className="py-2 px-4 border-r border-slate-300 text-slate-900 leading-relaxed"
                      >
                        <div className="font-semibold text-slate-900">
                          {item.description}
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center border-r border-slate-300 font-mono text-slate-700">
                        {item.unit}
                      </td>
                      <td className="py-2 px-3 text-right border-r border-slate-300 font-mono text-slate-700">
                        {item.rate.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right border-r border-slate-300 font-mono font-bold text-slate-900">
                        -
                      </td>
                      <td className="py-2 px-2 text-center text-slate-400">
                        -
                      </td>
                    </tr>

                    {/* Measurement Line Rows */}
                    {measurementLines.map((row) => {
                      const isEditing = editingRowId === row.id;

                      if (row.is_header) {
                        return (
                          <tr
                            key={row.id}
                            className="bg-slate-50 font-bold text-slate-800 hover:bg-slate-100 transition-colors"
                          >
                            <td className="border-r border-slate-200"></td>
                            <td className="border-r border-slate-200"></td>
                            <td
                              colSpan={12}
                              className="py-1.5 px-4 border-r border-slate-200 text-slate-900 flex items-center gap-2"
                            >
                              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full inline-block"></span>
                              <span>{row.particulars}</span>
                            </td>
                            <td className="border-slate-200"></td>
                          </tr>
                        );
                      }

                      if (row.is_subtotal) {
                        return (
                          <tr
                            key={row.id}
                            className="bg-indigo-50/60 font-semibold text-indigo-950 border-t border-indigo-200"
                          >
                            <td className="border-r border-slate-200"></td>
                            <td className="border-r border-slate-200"></td>
                            <td
                              colSpan={8}
                              className="py-1.5 px-4 border-r border-slate-200 font-bold text-indigo-900"
                            >
                              {row.particulars}
                            </td>
                            <td className="py-1.5 px-3 text-right border-r border-slate-200 font-mono font-bold text-indigo-950">
                              {row.quantity.toFixed(2)}
                            </td>
                            <td className="py-1.5 px-2 text-center border-r border-slate-200 font-mono">
                              {row.unit}
                            </td>
                            <td className="border-r border-slate-200"></td>
                            <td className="border-r border-slate-200"></td>
                            <td></td>
                          </tr>
                        );
                      }

                      if (row.is_multiplier) {
                        return (
                          <tr
                            key={row.id}
                            className="bg-slate-50/80 font-medium text-slate-700 italic border-t border-slate-200"
                          >
                            <td className="border-r border-slate-200"></td>
                            <td className="border-r border-slate-200"></td>
                            <td className="py-1.5 px-4 border-r border-slate-200">
                              {row.particulars}
                            </td>
                            <td className="py-1.5 px-2.5 text-right border-r border-slate-200 font-mono">
                              {row.nos}
                            </td>
                            <td className="border-r border-slate-200"></td>
                            <td className="border-r border-slate-200"></td>
                            <td className="border-r border-slate-200"></td>
                            <td className="border-r border-slate-200"></td>
                            <td className="border-r border-slate-200"></td>
                            <td className="border-r border-slate-200"></td>
                            <td className="py-1.5 px-3 text-right border-r border-slate-200 font-mono font-semibold text-slate-900">
                              {row.quantity.toFixed(2)}
                            </td>
                            <td className="py-1.5 px-2 text-center border-r border-slate-200 font-mono">
                              {row.unit}
                            </td>
                            <td className="border-r border-slate-200"></td>
                            <td className="border-r border-slate-200"></td>
                            <td></td>
                          </tr>
                        );
                      }

                      // Regular Measurement or Deduction Line
                      return (
                        <tr
                          key={row.id}
                          className={`transition-colors ${
                            row.is_deduction
                              ? 'bg-rose-50/50 hover:bg-rose-100/60 text-rose-900'
                              : 'hover:bg-blue-50/30 text-slate-800'
                          } ${isEditing ? 'bg-amber-50 ring-2 ring-amber-300' : ''}`}
                        >
                          <td className="border-r border-slate-200"></td>
                          <td className="border-r border-slate-200"></td>

                          {/* Particulars */}
                          <td className="py-1.5 px-4 border-r border-slate-200">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editFields.particulars}
                                onChange={(e) =>
                                  setEditFields({
                                    ...editFields,
                                    particulars: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-0.5 text-xs border border-amber-400 rounded bg-white"
                              />
                            ) : (
                              <span
                                className={`flex items-center gap-1.5 ${
                                  row.is_deduction ? 'font-medium text-rose-800' : ''
                                }`}
                              >
                                {row.is_deduction && (
                                  <span className="px-1.5 py-0.2 text-[9px] font-bold bg-rose-100 text-rose-700 border border-rose-300 rounded">
                                    DEDUCT
                                  </span>
                                )}
                                <span>{row.particulars}</span>
                              </span>
                            )}
                          </td>

                          {/* Nos */}
                          <td className="py-1.5 px-2.5 text-right border-r border-slate-200 font-mono">
                            {isEditing ? (
                              <input
                                type="number"
                                step="any"
                                value={editFields.nos ?? ''}
                                onChange={(e) =>
                                  setEditFields({
                                    ...editFields,
                                    nos:
                                      e.target.value === ''
                                        ? null
                                        : parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-full px-1 py-0.5 text-xs text-right border border-amber-400 rounded bg-white font-mono"
                              />
                            ) : (
                              <span
                                className={
                                  row.is_deduction
                                    ? 'text-rose-700 font-bold'
                                    : 'text-slate-800'
                                }
                              >
                                {row.nos !== null ? row.nos : '-'}
                              </span>
                            )}
                          </td>

                          {/* x */}
                          <td className="py-1.5 px-1 text-center border-r border-slate-200 text-slate-400 text-[11px]">
                            {row.length !== null ? 'x' : ''}
                          </td>

                          {/* L */}
                          <td className="py-1.5 px-2.5 text-right border-r border-slate-200 font-mono">
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.001"
                                value={editFields.length ?? ''}
                                onChange={(e) =>
                                  setEditFields({
                                    ...editFields,
                                    length:
                                      e.target.value === ''
                                        ? null
                                        : parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-full px-1 py-0.5 text-xs text-right border border-amber-400 rounded bg-white font-mono"
                              />
                            ) : row.length !== null ? (
                              row.length.toFixed(3)
                            ) : (
                              '-'
                            )}
                          </td>

                          {/* x */}
                          <td className="py-1.5 px-1 text-center border-r border-slate-200 text-slate-400 text-[11px]">
                            {row.breadth !== null ? 'x' : ''}
                          </td>

                          {/* B */}
                          <td className="py-1.5 px-2.5 text-right border-r border-slate-200 font-mono">
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.001"
                                value={editFields.breadth ?? ''}
                                onChange={(e) =>
                                  setEditFields({
                                    ...editFields,
                                    breadth:
                                      e.target.value === ''
                                        ? null
                                        : parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-full px-1 py-0.5 text-xs text-right border border-amber-400 rounded bg-white font-mono"
                              />
                            ) : row.breadth !== null ? (
                              row.breadth.toFixed(3)
                            ) : (
                              '-'
                            )}
                          </td>

                          {/* x */}
                          <td className="py-1.5 px-1 text-center border-r border-slate-200 text-slate-400 text-[11px]">
                            {row.height !== null ? 'x' : ''}
                          </td>

                          {/* H */}
                          <td className="py-1.5 px-2.5 text-right border-r border-slate-200 font-mono">
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.001"
                                value={editFields.height ?? ''}
                                onChange={(e) =>
                                  setEditFields({
                                    ...editFields,
                                    height:
                                      e.target.value === ''
                                        ? null
                                        : parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-full px-1 py-0.5 text-xs text-right border border-amber-400 rounded bg-white font-mono"
                              />
                            ) : row.height !== null ? (
                              row.height.toFixed(3)
                            ) : (
                              '-'
                            )}
                          </td>

                          {/* QTY */}
                          <td className="py-1.5 px-3 text-right border-r border-slate-200 font-mono font-semibold bg-slate-50/70">
                            {row.is_deduction ? (
                              <span className="text-rose-700 font-bold">
                                ({Math.abs(row.quantity).toFixed(2)})
                              </span>
                            ) : (
                              <span>{row.quantity.toFixed(2)}</span>
                            )}
                          </td>

                          {/* Unit */}
                          <td className="py-1.5 px-2 text-center border-r border-slate-200 font-mono text-slate-600">
                            {row.unit}
                          </td>

                          {/* Rate */}
                          <td className="py-1.5 px-3 text-right border-r border-slate-200 font-mono text-slate-400">
                            -
                          </td>

                          {/* Amount */}
                          <td className="py-1.5 px-3 text-right border-r border-slate-200 font-mono text-slate-400">
                            -
                          </td>

                          {/* Actions */}
                          <td className="py-1.5 px-2 text-center">
                            {isEditing ? (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => saveEditingRow(item.id, row.id)}
                                  className="p-1 text-emerald-600 hover:text-emerald-700 cursor-pointer"
                                  title="Save Changes"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingRowId(null)}
                                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => startEditingRow(row)}
                                  className="p-0.5 text-slate-500 hover:text-indigo-600 cursor-pointer"
                                  title="Edit Dimensions"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteRow(item.id, row.id)}
                                  className="p-0.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                                  title="Delete Line"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Item Total Row */}
                    {totalRow && (
                      <tr className="bg-[#f0f4fa] font-bold text-slate-900 border-t-2 border-b-2 border-slate-400">
                        <td className="border-r border-slate-300"></td>
                        <td className="border-r border-slate-300"></td>
                        <td
                          colSpan={8}
                          className="py-2.5 px-4 border-r border-slate-300 uppercase tracking-wide text-slate-900 font-black text-right"
                        >
                          Total (Item {item.item_number} - {item.dsr_code}):
                        </td>
                        <td className="py-2.5 px-3 text-right border-r border-slate-300 font-mono font-black text-indigo-950 text-sm bg-[#e2ecfa]">
                          {totalRow.quantity.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2 text-center border-r border-slate-300 font-mono font-bold">
                          {totalRow.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right border-r border-slate-300 font-mono font-bold text-slate-900">
                          {item.rate.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right border-r border-slate-300 font-mono font-black text-emerald-800 text-sm bg-[#e2ecfa]">
                          {formatIndianCurrency(totalRow.amount || 0)}
                        </td>
                        <td className="border-slate-300"></td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {/* --------------------------------------------------------- */}
              {/* Grand Total Summary Row of Civil Works */}
              {/* --------------------------------------------------------- */}
              <tr className="bg-[#D9E1F2] border-t-4 border-slate-600 text-slate-950 font-black text-sm">
                <td
                  colSpan={10}
                  className="py-3 px-6 text-right border-r border-slate-400 uppercase tracking-wider text-slate-900"
                >
                  TOTAL OF CIVIL WORKS (A) =
                </td>
                <td className="py-3 px-3 text-right border-r border-slate-400 font-mono text-slate-900 text-xs">
                  -
                </td>
                <td className="border-r border-slate-400"></td>
                <td className="border-r border-slate-400"></td>
                <td className="py-3 px-4 text-right border-r border-slate-400 font-mono font-black text-indigo-950 text-base">
                  {formatIndianCurrency(civilGrandTotal)}
                </td>
                <td></td>
              </tr>

              {/* Rounded Grand Total Row */}
              <tr className="bg-[#D9E1F2] border-t border-slate-300 font-bold text-slate-900 text-sm">
                <td
                  colSpan={13}
                  className="py-2 px-6 text-right border-r border-slate-400 uppercase"
                >
                  TOTAL =
                </td>
                <td className="py-2 px-4 text-right border-r border-slate-400 font-mono font-black text-slate-950">
                  {formatIndianCurrency(Math.round(civilGrandTotal))}
                </td>
                <td></td>
              </tr>

              {/* Amount in Words Row */}
              <tr className="bg-slate-50 font-semibold text-slate-700 border-b-2 border-slate-300">
                <td
                  colSpan={15}
                  className="py-3 px-6 text-center italic text-xs tracking-wide"
                >
                  ({numberToWordsINR(civilGrandTotal)})
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 6. Footer Audit & Signatures Block */}
        {/* ------------------------------------------------------------- */}
        <div className="p-6 bg-slate-50 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center pt-8 border-t border-dashed border-slate-300">
            <div className="space-y-1">
              <div className="h-10 border-b border-slate-400/60 w-3/4 mx-auto"></div>
              <div className="text-xs font-bold text-slate-800">Junior Engineer</div>
              <div className="text-[11px] text-slate-500">PWD (Civil) Sub-Division</div>
            </div>
            <div className="space-y-1">
              <div className="h-10 border-b border-slate-400/60 w-3/4 mx-auto"></div>
              <div className="text-xs font-bold text-slate-800">
                Assistant Executive Engineer
              </div>
              <div className="text-[11px] text-slate-500">PWD (Civil) Sub-Division</div>
            </div>
            <div className="space-y-1">
              <div className="h-10 border-b border-slate-400/60 w-3/4 mx-auto"></div>
              <div className="text-xs font-bold text-slate-800">Executive Engineer</div>
              <div className="text-[11px] text-slate-500">Golaghat Road Division, PWD (Civil)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
