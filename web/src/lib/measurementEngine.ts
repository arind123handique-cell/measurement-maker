/**
 * Automated Measurement Book (MB) Calculation Engine
 * Conforms to Indian Standard (IS:1200) Quantity Surveying & PWD/CPWD Guidelines.
 */

export interface Room {
  id: string;
  name: string;
  building_id?: string;
  floor_id?: string;
  floor_name?: string;
  length: number;
  breadth: number;
  height: number;
  carpet_area?: number;
  perimeter?: number;
  dado_height?: number; // e.g. 2.10m for tiles dado in toilets
  notes?: string;
  beams?: BeamDefinition[];
}

export interface Opening {
  id?: string;
  room_id: string;
  mark: string; // e.g., 'D1', 'W1', 'V'
  opening_type: 'door' | 'window' | 'ventilator' | 'opening' | string;
  count: number; // positive count, e.g. 1, 2, 4
  width: number;
  height: number;
  notes?: string;
}

export interface BeamDefinition {
  name: string;
  nos: number;
  length: number;
  girth?: number; // default girth 0.73m (2 * 0.25 sides + 0.23 soffit)
  notes?: string;
}

export interface EstimateItem {
  id: string;
  item_number: number | string;
  dsr_code: string;
  description: string;
  unit: 'sqm' | 'cum' | 'm' | 'rmt' | 'each' | string;
  rate: number;
  item_type?: 'area' | 'cubic' | 'linear' | 'each';
  breadth?: number; // default breadth for linear or cubic items
  height?: number;  // default height for linear or cubic items
  beams?: BeamDefinition[];
  identical_floors_count?: number; // e.g. 2 for G+1 (Ground Floor identical layout)
}

export interface MeasurementRow {
  id: string;
  item_id: string;
  room_id?: string;
  particulars: string;
  nos: number | null;
  length: number | null;
  breadth: number | null;
  height: number | null;
  quantity: number;
  unit: string;
  is_header?: boolean;
  is_deduction?: boolean;
  is_subtotal?: boolean;
  is_total?: boolean;
  is_multiplier?: boolean;
  formula_type?: 'area_lh' | 'area_lb' | 'cubic' | 'linear' | 'each' | 'sum' | 'custom';
  formula_str?: string;
  rate?: number | null;
  amount?: number | null;
}

export interface GeneratedMeasurementBookItem {
  item: EstimateItem;
  rows: MeasurementRow[];
  totalQuantity: number;
  amount: number;
}

export interface MeasurementEngineOptions {
  includeBeams?: boolean;
  includeIdenticalFloors?: boolean;
  identicalFloorsMultiplier?: number;
  includeCeilings?: boolean;
  customDadoHeight?: number;
}

// -------------------------------------------------------------
// Math & Formatting Helpers
// -------------------------------------------------------------

/**
 * Rounds a number strictly to 2 decimal places.
 */
export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Rounds a number strictly to 3 decimal places (useful for cum volume).
 */
export function round3(num: number): number {
  return Math.round((num + Number.EPSILON) * 1000) / 1000;
}

/**
 * Calculates perimeter of a rectangular room: 2 * (L + B)
 */
export function calculatePerimeter(length: number, breadth: number): number {
  return round3(2 * (length + breadth));
}

/**
 * Calculates carpet area of a rectangular room: L * B
 */
export function calculateCarpetArea(length: number, breadth: number): number {
  return round2(length * breadth);
}

/**
 * Formats amount into Indian currency format (e.g. ₹ 1,23,456.78)
 */
export function formatIndianCurrency(amount: number): string {
  const rounded = round2(amount);
  const parts = rounded.toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  const isNegative = integerPart.startsWith('-');
  if (isNegative) {
    integerPart = integerPart.substring(1);
  }

  // Indian numbering: last 3 digits, then groups of 2 digits
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  return (isNegative ? '-₹ ' : '₹ ') + res + '.' + decimalPart;
}

/**
 * Converts numeric INR amount into official words format:
 * e.g., 1768.20 -> "Rupees One Thousand Seven Hundred Sixty Eight and Paise Twenty Only"
 */
export function numberToWordsINR(amount: number): string {
  if (isNaN(amount) || amount === 0) {
    return 'Rupees Zero Only';
  }

  const rounded = Math.abs(round2(amount));
  const whole = Math.floor(rounded);
  const paise = Math.round((rounded - whole) * 100);

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];

  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertTwoDigits(n: number): string {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    const t = tens[Math.floor(n / 10)];
    const u = ones[n % 10];
    return u ? `${t} ${u}` : t;
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let str = '';
    if (hundred > 0) {
      str += `${ones[hundred]} Hundred`;
    }
    if (rest > 0) {
      if (str !== '') str += ' ';
      str += convertTwoDigits(rest);
    }
    return str;
  }

  let crore = Math.floor(whole / 10000000);
  let rem = whole % 10000000;
  let lakh = Math.floor(rem / 100000);
  rem = rem % 100000;
  let thousand = Math.floor(rem / 1000);
  rem = rem % 1000;
  let hundred = rem;

  let words = '';

  if (crore > 0) {
    words += `${convertTwoDigits(crore)} Crore `;
  }
  if (lakh > 0) {
    words += `${convertTwoDigits(lakh)} Lakh `;
  }
  if (thousand > 0) {
    words += `${convertTwoDigits(thousand)} Thousand `;
  }
  if (hundred > 0) {
    words += `${convertThreeDigits(hundred)} `;
  }

  words = words.trim();
  if (!words) {
    words = 'Zero';
  }

  let result = `Rupees ${words}`;
  if (paise > 0) {
    result += ` and Paise ${convertTwoDigits(paise)}`;
  }
  result += ' Only';

  return result;
}

// -------------------------------------------------------------
// Core Calculation Engine
// -------------------------------------------------------------

/**
 * Detects whether an item is an area item, cubic item, or linear item based on unit and DSR code.
 */
function inferItemType(item: EstimateItem): 'area' | 'cubic' | 'linear' | 'each' {
  if (item.item_type) return item.item_type;

  const unitLower = item.unit.toLowerCase();
  if (unitLower === 'sqm' || unitLower === 'sq.m' || unitLower === 'sqmt') return 'area';
  if (unitLower === 'cum' || unitLower === 'cu.m' || unitLower === 'cumt') return 'cubic';
  if (unitLower === 'm' || unitLower === 'meter' || unitLower === 'metre' || unitLower === 'rmt') return 'linear';
  if (unitLower === 'each' || unitLower === 'nos' || unitLower === 'no') return 'each';

  // Fallback heuristic based on DSR code / description
  const descLower = item.description.toLowerCase();
  if (descLower.includes('paint') || descLower.includes('plaster') || descLower.includes('tile') || descLower.includes('flooring')) {
    return 'area';
  }
  if (descLower.includes('wood work') || descLower.includes('concrete') || descLower.includes('brick')) {
    return 'cubic';
  }

  return 'area';
}

/**
 * Calculates sum of rows and applies rate to generate total quantity and amount.
 */
export function calculateItemTotal(
  rows: MeasurementRow[],
  rate: number
): { totalQuantity: number; amount: number } {
  let sum = 0;
  for (const r of rows) {
    // Only accumulate measurement lines (skip headers, subtotal markers if multiplier handled, and totals)
    if (r.is_header || r.is_total || r.is_subtotal) {
      continue;
    }
    sum += r.quantity;
  }
  const totalQuantity = round2(sum);
  const amount = round2(totalQuantity * rate);
  return { totalQuantity, amount };
}

/**
 * Automatically expands an Estimate Item across all architectural rooms and openings
 * per IS:1200 measurement standards.
 *
 * - Area items (e.g. 13.83.2 Wall Painting, Plaster, Primer):
 *   - Perimeter walls: Nos = 1, L = 2*(room.length + room.breadth), H = room.height, Qty = Nos * L * H
 *   - Opening deductions: for each opening, Nos = -opening.count, L = opening.width, H = opening.height, Qty = Nos * L * H (negative)
 *   - RCC / Tie Beams: cross beams and spine beams with girth 0.73m (2*0.25 sides + 0.23 soffit)
 *   - Identical floor multipliers: for multi-floor buildings (e.g. G+1 Ground Floor identical layout)
 * - Cubic items: Nos * L * B * H
 * - Linear items: Nos * L
 *
 * Each row is rounded to 2 decimal places, and the total is rounded to 2 decimal places.
 */
export function generateRoomMeasurements(
  item: EstimateItem,
  rooms: Room[],
  openings: Opening[],
  options: MeasurementEngineOptions = {}
): GeneratedMeasurementBookItem {
  const itemType = inferItemType(item);
  const rows: MeasurementRow[] = [];
  const itemId = item.id || `item-${item.item_number}`;

  if (itemType === 'area') {
    // -------------------------------------------------------------
    // 1. AREA ITEMS: Perimeter Walls & Opening Deductions
    // -------------------------------------------------------------
    for (const room of rooms) {
      // 1a. Room Header line
      rows.push({
        id: `${itemId}-room-header-${room.id}`,
        item_id: itemId,
        room_id: room.id,
        particulars: `${room.name} (${room.length.toFixed(3)}m x ${room.breadth.toFixed(3)}m)`,
        nos: null,
        length: null,
        breadth: null,
        height: null,
        quantity: 0,
        unit: item.unit,
        is_header: true,
      });

      // 1b. Perimeter Walls
      const perimeter = calculatePerimeter(room.length, room.breadth);
      const effDado = room.dado_height ?? options.customDadoHeight ?? 0;
      const wallHeight = round3(Math.max(0, room.height - effDado));
      const wallNos = 1;
      const wallQty = round2(wallNos * perimeter * wallHeight);

      const wallParticular = effDado > 0
        ? `  Walls above ${effDado.toFixed(2)}m dado (Perimeter = 2*(${room.length}+${room.breadth})m)`
        : `  All round walls (Perimeter = 2*(${room.length}+${room.breadth})m)`;

      rows.push({
        id: `${itemId}-wall-${room.id}`,
        item_id: itemId,
        room_id: room.id,
        particulars: wallParticular,
        nos: wallNos,
        length: perimeter,
        breadth: null,
        height: wallHeight,
        quantity: wallQty,
        unit: item.unit,
        formula_type: 'area_lh',
        formula_str: `=D*F*J`,
      });

      // 1c. Opening Deductions (Doors, Windows, Ventilators)
      const roomOpenings = openings.filter((op) => op.room_id === room.id);
      for (let idx = 0; idx < roomOpenings.length; idx++) {
        const op = roomOpenings[idx];
        const count = op.count || 1;
        // Negative count per IS:1200
        const negNos = -Math.abs(count);
        const opW = round3(op.width);
        const opH = round3(op.height);
        const deductQty = round2(negNos * opW * opH);

        const label = op.mark ? op.mark : op.opening_type.toUpperCase();
        const countText = count > 1 ? ` (${count} nos)` : '';
        const opTitle = `  Deduct : ${op.opening_type.charAt(0).toUpperCase() + op.opening_type.slice(1)} (${label}${countText})`;

        rows.push({
          id: `${itemId}-deduct-${room.id}-${idx}`,
          item_id: itemId,
          room_id: room.id,
          particulars: opTitle,
          nos: negNos,
          length: opW,
          breadth: null,
          height: opH,
          quantity: deductQty,
          unit: item.unit,
          is_deduction: true,
          formula_type: 'area_lh',
          formula_str: `=D*F*J`,
        });
      }

      // 1d. Room-specific beams if attached
      if (room.beams && room.beams.length > 0 && options.includeBeams !== false) {
        for (let bIdx = 0; bIdx < room.beams.length; bIdx++) {
          const b = room.beams[bIdx];
          const girth = b.girth ?? 0.73; // 2 * 0.25 sides + 0.23 soffit
          const bQty = round2(b.nos * b.length * girth);

          rows.push({
            id: `${itemId}-room-beam-${room.id}-${bIdx}`,
            item_id: itemId,
            room_id: room.id,
            particulars: `  ${b.name}`,
            nos: b.nos,
            length: round3(b.length),
            breadth: null,
            height: round3(girth),
            quantity: bQty,
            unit: item.unit,
            formula_type: 'area_lh',
            formula_str: `=D*F*J`,
          });
        }
      }
    }

    // -------------------------------------------------------------
    // 2. RCC / TIE BEAMS (Building Level / Structural Beams)
    // -------------------------------------------------------------
    const beamsToProcess = item.beams || (options.includeBeams !== false ? getDefaultBeamsForRooms(rooms) : []);
    if (beamsToProcess.length > 0) {
      // Beam Section Header
      rows.push({
        id: `${itemId}-beam-section-header`,
        item_id: itemId,
        particulars: 'Internal RCC Beams (Sides & Soffits below ceiling, Girth=0.73m)',
        nos: null,
        length: null,
        breadth: null,
        height: null,
        quantity: 0,
        unit: item.unit,
        is_header: true,
      });

      for (let bIdx = 0; bIdx < beamsToProcess.length; bIdx++) {
        const beam = beamsToProcess[bIdx];
        const girth = beam.girth ?? 0.73; // Standard girth = 2*0.25 (sides) + 0.23 (soffit)
        const beamQty = round2(beam.nos * beam.length * girth);

        rows.push({
          id: `${itemId}-beam-${bIdx}`,
          item_id: itemId,
          particulars: `  ${beam.name}`,
          nos: beam.nos,
          length: round3(beam.length),
          breadth: null,
          height: round3(girth),
          quantity: beamQty,
          unit: item.unit,
          formula_type: 'area_lh',
          formula_str: `=D*F*J`,
        });
      }
    }

    // -------------------------------------------------------------
    // 3. IDENTICAL FLOOR MULTIPLIERS (e.g. G+1 Ground Floor identical layout)
    // -------------------------------------------------------------
    const floorsCount = item.identical_floors_count ?? options.identicalFloorsMultiplier ?? 1;
    if (floorsCount > 1 && options.includeIdenticalFloors !== false) {
      // Subtotal of the primary floor (e.g. First Floor)
      const primaryFloorSum = round2(
        rows.reduce((sum, r) => sum + (r.is_header ? 0 : r.quantity), 0)
      );

      rows.push({
        id: `${itemId}-subtotal-primary-floor`,
        item_id: itemId,
        particulars: 'Subtotal (First Floor Wall & Beam Painting)',
        nos: null,
        length: null,
        breadth: null,
        height: null,
        quantity: primaryFloorSum,
        unit: item.unit,
        is_subtotal: true,
        formula_type: 'sum',
      });

      // Identical Ground Floor row
      const identicalMultiplier = floorsCount - 1;
      const groundFloorQty = round2(primaryFloorSum * identicalMultiplier);

      rows.push({
        id: `${itemId}-ground-floor-multiplier`,
        item_id: itemId,
        particulars: '  Ground Floor (Identical Architectural Layout)',
        nos: identicalMultiplier,
        length: null,
        breadth: null,
        height: null,
        quantity: groundFloorQty,
        unit: item.unit,
        is_multiplier: true,
      });
    }

  } else if (itemType === 'cubic') {
    // -------------------------------------------------------------
    // CUBIC ITEMS: Nos * L * B * H (e.g., Concrete, Brickwork, Wood frames)
    // -------------------------------------------------------------
    for (const room of rooms) {
      const nos = 1;
      const l = round3(room.length);
      const b = round3(room.breadth);
      const h = round3(item.height ?? room.height);
      const qty = round2(nos * l * b * h);

      rows.push({
        id: `${itemId}-cubic-${room.id}`,
        item_id: itemId,
        room_id: room.id,
        particulars: `${room.name} (${l}m x ${b}m x ${h}m)`,
        nos: nos,
        length: l,
        breadth: b,
        height: h,
        quantity: qty,
        unit: item.unit,
        formula_type: 'cubic',
        formula_str: `=D*F*H*J`,
      });
    }
  } else if (itemType === 'linear') {
    // -------------------------------------------------------------
    // LINEAR ITEMS: Nos * L (e.g. Skirting, Cornice, Handrails)
    // -------------------------------------------------------------
    for (const room of rooms) {
      const perimeter = calculatePerimeter(room.length, room.breadth);
      const nos = 1;
      const qty = round2(nos * perimeter);

      rows.push({
        id: `${itemId}-linear-${room.id}`,
        item_id: itemId,
        room_id: room.id,
        particulars: `${room.name} Perimeter Skirting`,
        nos: nos,
        length: perimeter,
        breadth: null,
        height: null,
        quantity: qty,
        unit: item.unit,
        formula_type: 'linear',
        formula_str: `=D*F`,
      });

      // Deduct door widths from skirting
      const roomDoors = openings.filter(
        (op) => op.room_id === room.id && op.opening_type.toLowerCase().includes('door')
      );
      for (let idx = 0; idx < roomDoors.length; idx++) {
        const d = roomDoors[idx];
        const negNos = -Math.abs(d.count || 1);
        const w = round3(d.width);
        const deductQty = round2(negNos * w);

        rows.push({
          id: `${itemId}-linear-deduct-${room.id}-${idx}`,
          item_id: itemId,
          room_id: room.id,
          particulars: `  Deduct : Door Opening (${d.mark})`,
          nos: negNos,
          length: w,
          breadth: null,
          height: null,
          quantity: deductQty,
          unit: item.unit,
          is_deduction: true,
          formula_type: 'linear',
          formula_str: `=D*F`,
        });
      }
    }
  } else {
    // -------------------------------------------------------------
    // COUNT / EACH ITEMS (e.g. Dismantling, Fixtures)
    // -------------------------------------------------------------
    for (const room of rooms) {
      const nos = 1;
      rows.push({
        id: `${itemId}-each-${room.id}`,
        item_id: itemId,
        room_id: room.id,
        particulars: `${room.name} Fixture`,
        nos: nos,
        length: null,
        breadth: null,
        height: null,
        quantity: nos,
        unit: item.unit,
        formula_type: 'each',
        formula_str: `=D`,
      });
    }
  }

  // Calculate final item sum & amount
  const { totalQuantity, amount } = calculateItemTotal(rows, item.rate);

  // Append Total Row
  rows.push({
    id: `${itemId}-total-row`,
    item_id: itemId,
    particulars: 'Total',
    nos: null,
    length: null,
    breadth: null,
    height: null,
    quantity: totalQuantity,
    unit: item.unit,
    rate: item.rate,
    amount: amount,
    is_total: true,
    formula_type: 'sum',
  });

  return {
    item,
    rows,
    totalQuantity,
    amount,
  };
}

/**
 * Generates default structural RCC beams for standard room spans
 * Girth = 0.73m (2 * 0.25 sides + 0.23 soffit)
 */
function getDefaultBeamsForRooms(rooms: Room[]): BeamDefinition[] {
  const beams: BeamDefinition[] = [];
  if (rooms.length === 0) return beams;

  // Filter standard rooms that have spans >= 3.0m
  const spanRooms = rooms.filter((r) => r.length >= 3.0);
  if (spanRooms.length > 0) {
    const avgSpan = round3(spanRooms.reduce((sum, r) => sum + r.length, 0) / spanRooms.length);
    beams.push({
      name: `Cross beams over main rooms (${spanRooms.length} nos x ${avgSpan}m span, 2 sides + soffit)`,
      nos: spanRooms.length,
      length: avgSpan,
      girth: 0.73,
    });
  }

  // Add spine tie beam along building length if multiple rooms
  if (rooms.length >= 4) {
    const spineLength = round3(rooms.slice(0, 4).reduce((sum, r) => sum + r.breadth, 0));
    beams.push({
      name: `Corridor longitudinal spine tie beam (${spineLength}m)`,
      nos: 1,
      length: spineLength,
      girth: 0.73,
    });
  }

  return beams;
}

// -------------------------------------------------------------
// Benchmark Reference Dataset (from Circuit House Estimate)
// -------------------------------------------------------------

export const BENCHMARK_ROOMS: Room[] = [
  {
    id: 'room-1',
    name: 'Room 1 (Bed Room)',
    length: 5.644,
    breadth: 5.508,
    height: 3.05,
    carpet_area: 31.09,
    perimeter: 22.304,
  },
  {
    id: 'room-2',
    name: 'Room 2 (Large Room / Suite)',
    length: 6.500,
    breadth: 5.508,
    height: 3.05,
    carpet_area: 35.80,
    perimeter: 24.016,
  },
  {
    id: 'room-3',
    name: 'Room 3 (Bed Room)',
    length: 5.644,
    breadth: 4.512,
    height: 3.05,
    carpet_area: 25.47,
    perimeter: 20.312,
  },
  {
    id: 'room-4',
    name: 'Room 4 (Bed Room)',
    length: 5.644,
    breadth: 3.912,
    height: 3.05,
    carpet_area: 22.08,
    perimeter: 19.112,
  },
  {
    id: 'room-5',
    name: 'Room 5 (Bed Room)',
    length: 5.644,
    breadth: 4.512,
    height: 3.05,
    carpet_area: 25.47,
    perimeter: 20.312,
  },
  {
    id: 'room-6',
    name: 'Room 6 (Meeting / Living Hall with Annex)',
    length: 7.944,
    breadth: 2.944,
    height: 3.05,
    carpet_area: 23.39,
    perimeter: 21.776,
  },
  {
    id: 'room-7',
    name: 'Room 7 (Attached Room / Toilet)',
    length: 2.300,
    breadth: 3.228,
    height: 3.05,
    carpet_area: 7.42,
    perimeter: 11.056,
  },
  {
    id: 'room-8',
    name: 'Room 8 (Left Wing Suite)',
    length: 5.131,
    breadth: 4.610,
    height: 3.05,
    carpet_area: 23.65,
    perimeter: 19.482,
  },
  {
    id: 'room-9',
    name: 'Room 9 (Left Wing Room)',
    length: 5.131,
    breadth: 3.160,
    height: 3.05,
    carpet_area: 16.21,
    perimeter: 16.582,
  },
  {
    id: 'room-10',
    name: 'Room 10 (Office / Guard Room)',
    length: 3.126,
    breadth: 3.154,
    height: 3.05,
    carpet_area: 9.86,
    perimeter: 12.56,
  },
  {
    id: 'room-11',
    name: 'Staircase Well',
    length: 5.644,
    breadth: 3.228,
    height: 3.05,
    carpet_area: 18.22,
    perimeter: 17.744,
  },
  {
    id: 'room-12',
    name: 'Room 11 (Main Corridor / Passage Spine)',
    length: 21.088,
    breadth: 1.528,
    height: 3.05,
    carpet_area: 32.22,
    perimeter: 45.232,
  },
];

export const BENCHMARK_OPENINGS: Opening[] = [
  // Room 1
  { room_id: 'room-1', mark: 'D1', opening_type: 'door', count: 1, width: 1.2, height: 2.1 },
  { room_id: 'room-1', mark: 'W1', opening_type: 'window', count: 2, width: 1.5, height: 1.8 },
  // Room 2
  { room_id: 'room-2', mark: 'D1', opening_type: 'door', count: 1, width: 1.2, height: 2.1 },
  { room_id: 'room-2', mark: 'W1', opening_type: 'window', count: 3, width: 1.5, height: 1.8 },
  // Room 3
  { room_id: 'room-3', mark: 'D1', opening_type: 'door', count: 1, width: 1.2, height: 2.1 },
  { room_id: 'room-3', mark: 'W1', opening_type: 'window', count: 1, width: 1.5, height: 1.8 },
  // Room 4
  { room_id: 'room-4', mark: 'D1', opening_type: 'door', count: 1, width: 1.2, height: 2.1 },
  { room_id: 'room-4', mark: 'W1', opening_type: 'window', count: 1, width: 1.5, height: 1.8 },
  // Room 5
  { room_id: 'room-5', mark: 'D1', opening_type: 'door', count: 1, width: 1.2, height: 2.1 },
  { room_id: 'room-5', mark: 'W1', opening_type: 'window', count: 1, width: 1.5, height: 1.8 },
  // Room 6
  { room_id: 'room-6', mark: 'Double Door', opening_type: 'door', count: 1, width: 1.5, height: 2.1 },
  { room_id: 'room-6', mark: 'W1', opening_type: 'window', count: 1, width: 1.5, height: 1.8 },
  // Room 7
  { room_id: 'room-7', mark: 'D3', opening_type: 'door', count: 1, width: 0.9, height: 2.1 },
  { room_id: 'room-7', mark: 'V', opening_type: 'ventilator', count: 1, width: 0.6, height: 0.6 },
  // Room 8
  { room_id: 'room-8', mark: 'Entrance Door', opening_type: 'door', count: 1, width: 1.2, height: 2.1 },
  { room_id: 'room-8', mark: 'Internal Door', opening_type: 'door', count: 1, width: 0.9, height: 2.1 },
  { room_id: 'room-8', mark: 'W1', opening_type: 'window', count: 2, width: 1.5, height: 1.8 },
  // Room 9
  { room_id: 'room-9', mark: 'Entrance Door', opening_type: 'door', count: 1, width: 1.2, height: 2.1 },
  { room_id: 'room-9', mark: 'W1', opening_type: 'window', count: 1, width: 1.5, height: 1.8 },
  // Room 10
  { room_id: 'room-10', mark: 'Double Door', opening_type: 'door', count: 1, width: 1.5, height: 2.1 },
  { room_id: 'room-10', mark: 'W1', opening_type: 'window', count: 1, width: 1.5, height: 1.8 },
  // Staircase
  { room_id: 'room-11', mark: 'Landing Window', opening_type: 'window', count: 1, width: 1.5, height: 1.8 },
  // Corridor
  { room_id: 'room-12', mark: 'Room Doors', opening_type: 'door', count: 6, width: 1.2, height: 2.1 },
  { room_id: 'room-12', mark: 'Double Doors', opening_type: 'door', count: 2, width: 1.5, height: 2.1 },
];

export const BENCHMARK_BEAMS: BeamDefinition[] = [
  { name: 'Cross beams over Rooms 1, 3, 4, 5, 6 (2 sides + soffit)', nos: 5, length: 5.644, girth: 0.73 },
  { name: 'Cross beam over Room 2 (2 sides + soffit)', nos: 1, length: 6.500, girth: 0.73 },
  { name: 'Corridor cross tie beams at column grid lines', nos: 6, length: 3.056, girth: 0.73 },
  { name: 'Corridor longitudinal spine beam face', nos: 1, length: 21.088, girth: 0.25 },
  { name: 'Left wing cross beams (Rooms 8, 9)', nos: 2, length: 5.131, girth: 0.73 },
  { name: 'Staircase well landing beams', nos: 2, length: 3.228, girth: 0.73 },
];

export const BENCHMARK_ITEMS: EstimateItem[] = [
  {
    id: 'item-1',
    item_number: 1,
    dsr_code: '9.1',
    description: 'Providing wood work in frames of doors, windows, clerestory windows and other frames, wrought framed and fixed in position with hold fast lugs or with dash fasteners of required dia & length (hold fast lugs or dash fastener shall be paid for separately).\n9.1.3 Kiln seasoned and chemically treated hollock wood',
    unit: 'cum',
    rate: 74199.70,
    item_type: 'cubic',
  },
  {
    id: 'item-2',
    item_number: 2,
    dsr_code: '9.5',
    description: 'Providing and fixing panelled or panelled and glazed shutters for doors, windows and clerestory windows, fixing with butt hinges of required size with necessary screws, excluding panelling which will be paid for separately, all complete as per direction of Engineer-in-charge.\n9.5.2 Kiln seasoned and chemically treated hollock wood\n9.5.2.1 35 mm thick shutters',
    unit: 'sqm',
    rate: 2511.95,
    item_type: 'area',
  },
  {
    id: 'item-3',
    item_number: 3,
    dsr_code: '11.41',
    description: 'Providing and laying vitrified floor tiles in different sizes (thickness to be specified by the manufacturer) with water absorption less than 0.08% and conforming to IS: 15622, of approved make, in all colours and shades, laid on 20mm thick cement mortar 1:4 (1 cement : 4 coarse sand), jointing with grey cement slurry @ 3.3 kg/ sqm including grouting the joints with white cement and matching pigments etc., complete.\n11.41.2 Size of Tile 600x600 mm.',
    unit: 'sqm',
    rate: 1416.65,
    item_type: 'area',
  },
  {
    id: 'item-4',
    item_number: 4,
    dsr_code: '8.31',
    description: 'Providing and fixing Ist quality ceramic glazed wall tiles conforming to IS: 15622, of approved make, in all colours, shades except burgundy, bottle green, black of any size in skirting, risers of steps and dados over 12 mm thick bed of cement mortar 1:3.',
    unit: 'sqm',
    rate: 1063.45,
    item_type: 'area',
  },
  {
    id: 'item-11',
    item_number: 11,
    dsr_code: '13.83.2',
    description: 'Wall painting with premium acrylic emulsion paint of interior grade, having VOC content less than 50 gm/litre of approved brand and manufacture, including applying additional coats wherever required to achieve even shade and finish.\n13.83.2 Two or more coats on new work',
    unit: 'sqm',
    rate: 121.55,
    item_type: 'area',
    beams: BENCHMARK_BEAMS,
    identical_floors_count: 2, // G+1 First Floor + Ground Floor identical layout
  },
];
