/**
 * Parametric Auto-Estimation Engine based on Form Query & Natural Language
 * Conforms to Indian Standard (IS:1200) and CPWD / PWD Assam Schedule of Rates (DSR 2021).
 */

import {
  type EstimateItem,
  type Room,
  type Opening,
  type GeneratedMeasurementBookItem,
  generateRoomMeasurements,
  round2,
  round3,
} from './measurementEngine';

export type BuildingTypology =
  | 'circuit_house'
  | 'office'
  | 'dormitory'
  | 'cottage'
  | 'residential';

export interface FormQueryInput {
  queryText?: string;
  projectName: string;
  authority: string;
  division: string;
  dsrYear: string;
  buildingType: BuildingTypology;
  plinthArea: number; // in Sqm
  floorsCount: number; // 1, 2, 3
  ceilingHeight: number; // default 3.05m
  workScope: 'renovation' | 'new_construction';
  specs: {
    interiorPaint: boolean; // DSR 13.83.2
    primer: boolean; // DSR 13.85.3
    scrapingOldPaint: boolean; // DSR 15.57.1
    vitrifiedFlooring: boolean; // DSR 11.41.2
    skirting: boolean; // DSR 11.41.2
    toiletWallDado: boolean; // DSR 11.37
    toiletFloorTiles: boolean; // DSR 11.38
    pvcDoors: boolean; // DSR 9.120.1
    giRoofing: boolean; // DSR 12.50
    steelTrusses: boolean; // DSR 10.16.2
    falseCeiling: boolean; // DSR 12.52.3
    paverBlocks: boolean; // DSR 16.68
    granularSubBase: boolean; // DSR 16.78.1
    sanitaryFittings: boolean; // WC, Wash Basin, CP Cocks
  };
}

export interface AutoEstimateResult {
  metadata: {
    projectName: string;
    division: string;
    authority: string;
    dsrYear: string;
    buildingType: string;
    plinthArea: number;
    floorsCount: number;
    totalCarpetArea: number;
    totalEstimatedCost: number;
    costPerSqm: number;
    costPerSqft: number;
    itemCount: number;
  };
  rooms: Room[];
  openings: Opening[];
  boqItems: Array<{
    itemNo: number;
    dsrCode: string;
    description: string;
    unit: string;
    rate: number;
    quantity: number;
    amount: number;
    category: 'finishes' | 'flooring' | 'roofing' | 'doors' | 'site_work' | 'dismantling' | 'civil';
  }>;
  categoryBreakdown: {
    finishes: number;
    flooring: number;
    roofing: number;
    doors: number;
    site_work: number;
    dismantling: number;
    civil: number;
  };
  measurementBookItems: GeneratedMeasurementBookItem[];
}

/**
 * Standard Presets for 1-Click Form Queries
 */
export const FORM_QUERY_PRESETS: Array<{
  id: string;
  name: string;
  description: string;
  badge: string;
  query: FormQueryInput;
}> = [
  {
    id: 'preset-bokakhat',
    name: 'Bokakhat Circuit House Benchmark',
    description: 'Renovation of Circuit House (G+1 Main, Dormitory, VIP Cottage) under DSR 2021',
    badge: '₹21.78 L • 29 Items',
    query: {
      queryText: 'Renovation of Circuit House at Bokakhat G+1 with acrylic emulsion paint, vitrified tiles, CGI roof and paver blocks',
      projectName: 'Repairing and Renovation of Circuit House at Bokakhat',
      authority: 'Government of Assam, Public Works (Building) Department',
      division: 'Golaghat Road Division, PWD (Civil)',
      dsrYear: '2021',
      buildingType: 'circuit_house',
      plinthArea: 414.33,
      floorsCount: 2,
      ceilingHeight: 3.05,
      workScope: 'renovation',
      specs: {
        interiorPaint: true,
        primer: true,
        scrapingOldPaint: true,
        vitrifiedFlooring: true,
        skirting: true,
        toiletWallDado: true,
        toiletFloorTiles: true,
        pvcDoors: true,
        giRoofing: true,
        steelTrusses: true,
        falseCeiling: true,
        paverBlocks: true,
        granularSubBase: true,
        sanitaryFittings: true,
      },
    },
  },
  {
    id: 'preset-office-g1',
    name: 'PWD Sub-Divisional Office (G+1)',
    description: 'Administrative office block (500 sqm) with executive chambers, record room, and staff hall',
    badge: '₹35.50 L • Standard PWD',
    query: {
      queryText: 'Construction of G+1 PWD Sub-Divisional Office building 500 sqm with vitrified tiles, acrylic paint, false ceiling and CGI roof',
      projectName: 'Construction of Sub-Divisional Officer PWD (Civil) Office Building',
      authority: 'Public Works (Building) Department',
      division: 'Civil Construction Division',
      dsrYear: '2021',
      buildingType: 'office',
      plinthArea: 500,
      floorsCount: 2,
      ceilingHeight: 3.35,
      workScope: 'new_construction',
      specs: {
        interiorPaint: true,
        primer: true,
        scrapingOldPaint: false,
        vitrifiedFlooring: true,
        skirting: true,
        toiletWallDado: true,
        toiletFloorTiles: true,
        pvcDoors: true,
        giRoofing: true,
        steelTrusses: true,
        falseCeiling: true,
        paverBlocks: true,
        granularSubBase: true,
        sanitaryFittings: true,
      },
    },
  },
  {
    id: 'preset-dormitory',
    name: 'Assam Type 40-Bed Dormitory / Barrack',
    description: 'Single-storey barrack block (280 sqm) with 6-cubicle sanitary annex and front verandah',
    badge: '₹18.20 L • Barracks',
    query: {
      queryText: 'Assam Type Dormitory block 280 sqm with hall, sanitary cubicles, tile dado 2.1m, CGI roofing and paver approach',
      projectName: 'Construction of 40-Bedded Dormitory Block at District Police Reserve',
      authority: 'Assam Police Housing / PWD Building',
      division: 'Police Housing Sub-Division',
      dsrYear: '2021',
      buildingType: 'dormitory',
      plinthArea: 280,
      floorsCount: 1,
      ceilingHeight: 3.05,
      workScope: 'new_construction',
      specs: {
        interiorPaint: true,
        primer: true,
        scrapingOldPaint: false,
        vitrifiedFlooring: false,
        skirting: true,
        toiletWallDado: true,
        toiletFloorTiles: true,
        pvcDoors: true,
        giRoofing: true,
        steelTrusses: true,
        falseCeiling: false,
        paverBlocks: true,
        granularSubBase: true,
        sanitaryFittings: true,
      },
    },
  },
  {
    id: 'preset-vip-cottage',
    name: 'VIP Inspection Bungalow / Cottage Suite',
    description: 'Executive VIP suite cottage (120 sqm) with bedroom, attached luxury bath, and wide verandah',
    badge: '₹12.40 L • VIP Suite',
    query: {
      queryText: 'Executive VIP Inspection Suite Cottage 120 sqm with bedroom, dressing toilet, front verandah, false ceiling and premium emulsion',
      projectName: 'Construction of VIP Inspection Cottage Suite at Circuit House',
      authority: 'PWD (Building) Division',
      division: 'Special Project Division',
      dsrYear: '2021',
      buildingType: 'cottage',
      plinthArea: 120,
      floorsCount: 1,
      ceilingHeight: 3.20,
      workScope: 'new_construction',
      specs: {
        interiorPaint: true,
        primer: true,
        scrapingOldPaint: false,
        vitrifiedFlooring: true,
        skirting: true,
        toiletWallDado: true,
        toiletFloorTiles: true,
        pvcDoors: true,
        giRoofing: true,
        steelTrusses: true,
        falseCeiling: true,
        paverBlocks: true,
        granularSubBase: true,
        sanitaryFittings: true,
      },
    },
  },
];

/**
 * Synthesizes an architectural room schedule from typology and plinth area.
 */
function synthesizeRoomsAndOpenings(
  buildingType: BuildingTypology,
  plinthArea: number,
  ceilingHeight: number,
  floorsCount: number
): { rooms: Room[]; openings: Opening[] } {
  const rooms: Room[] = [];
  const openings: Opening[] = [];

  // Effective carpet area factor is ~80% of plinth area
  const totalUsableCarpet = plinthArea * 0.80;
  const areaPerFloor = totalUsableCarpet / floorsCount;

  if (buildingType === 'circuit_house' || buildingType === 'cottage') {
    // Modular breakdown: Suites, Lounge, Corridor, Toilets, Verandah
    const suiteCount = Math.max(2, Math.round(areaPerFloor / 45));
    const suiteCarpet = (areaPerFloor * 0.55) / suiteCount;
    const roomSide = Math.sqrt(suiteCarpet);
    const length = round3(roomSide * 1.1);
    const breadth = round3(roomSide / 1.1);

    for (let f = 1; f <= floorsCount; f++) {
      const floorName = f === 1 ? 'Ground Floor' : `Floor ${f}`;

      // Suites
      for (let s = 1; s <= suiteCount; s++) {
        const roomId = `r-f${f}-suite-${s}`;
        const roomName = `Suite ${s} (${floorName})`;
        rooms.push({
          id: roomId,
          name: roomName,
          floor_name: floorName,
          length,
          breadth,
          height: ceilingHeight,
          dado_height: 0,
        });

        // Openings: 1 D1 (1.2x2.1), 2 W1 (1.5x1.8)
        openings.push(
          {
            id: `op-${roomId}-d1`,
            room_id: roomId,
            mark: 'D1',
            opening_type: 'door',
            count: 1,
            width: 1.2,
            height: 2.1,
          },
          {
            id: `op-${roomId}-w1`,
            room_id: roomId,
            mark: 'W1',
            opening_type: 'window',
            count: 2,
            width: 1.5,
            height: 1.8,
          }
        );

        // Attached Toilet
        const toiletId = `r-f${f}-toilet-${s}`;
        rooms.push({
          id: toiletId,
          name: `Toilet ${s} (${floorName})`,
          floor_name: floorName,
          length: 2.4,
          breadth: 1.8,
          height: ceilingHeight,
          dado_height: 2.10, // Tile dado up to 2.10m
        });

        openings.push(
          {
            id: `op-${toiletId}-d3`,
            room_id: toiletId,
            mark: 'D3',
            opening_type: 'door',
            count: 1,
            width: 0.9,
            height: 2.1,
          },
          {
            id: `op-${toiletId}-v`,
            room_id: toiletId,
            mark: 'V',
            opening_type: 'ventilator',
            count: 1,
            width: 0.6,
            height: 0.6,
          }
        );
      }

      // Central Corridor / Lounge
      const corridorId = `r-f${f}-corridor`;
      const corridorLength = round3(suiteCount * length * 0.7);
      rooms.push({
        id: corridorId,
        name: `Lounge & Corridor (${floorName})`,
        floor_name: floorName,
        length: corridorLength,
        breadth: 2.4,
        height: ceilingHeight,
        dado_height: 0,
      });

      openings.push({
        id: `op-${corridorId}-doors`,
        room_id: corridorId,
        mark: 'D1',
        opening_type: 'door',
        count: suiteCount,
        width: 1.2,
        height: 2.1,
      });
    }
  } else if (buildingType === 'dormitory') {
    // Big accommodation hall + sanitary block + verandah
    const hallLength = round3(Math.sqrt(areaPerFloor * 0.65) * 1.5);
    const hallBreadth = round3((areaPerFloor * 0.65) / hallLength);

    const hallId = 'r-dorm-hall';
    rooms.push({
      id: hallId,
      name: 'Main Dormitory Hall',
      floor_name: 'Ground Floor',
      length: hallLength,
      breadth: hallBreadth,
      height: ceilingHeight,
      dado_height: 0,
    });

    openings.push(
      {
        id: `op-${hallId}-d1`,
        room_id: hallId,
        mark: 'D1',
        opening_type: 'door',
        count: 2,
        width: 1.2,
        height: 2.1,
      },
      {
        id: `op-${hallId}-wdorm`,
        room_id: hallId,
        mark: 'W_Dorm',
        opening_type: 'window',
        count: 6,
        width: 1.8,
        height: 1.35,
      }
    );

    // Sanitary Cubicles (4 cubicles)
    const toiletId = 'r-dorm-sanitary';
    rooms.push({
      id: toiletId,
      name: 'Sanitary Block (4 Cubicles)',
      floor_name: 'Ground Floor',
      length: 8.0,
      breadth: 2.0,
      height: ceilingHeight,
      dado_height: 2.10, // Paint above dado only
    });

    openings.push(
      {
        id: `op-${toiletId}-d3`,
        room_id: toiletId,
        mark: 'D3',
        opening_type: 'door',
        count: 4,
        width: 0.75,
        height: 2.1,
      },
      {
        id: `op-${toiletId}-v`,
        room_id: toiletId,
        mark: 'V',
        opening_type: 'ventilator',
        count: 4,
        width: 0.6,
        height: 0.45,
      }
    );

    // Front Verandah
    const verandahId = 'r-dorm-verandah';
    rooms.push({
      id: verandahId,
      name: 'Front Verandah',
      floor_name: 'Ground Floor',
      length: hallLength,
      breadth: 2.2,
      height: ceilingHeight,
      dado_height: 0,
    });
  } else {
    // Office / Residential / General
    const roomCount = Math.max(3, Math.round(areaPerFloor / 30));
    const avgCarpet = (areaPerFloor * 0.75) / roomCount;
    const side = Math.sqrt(avgCarpet);
    const l = round3(side * 1.2);
    const b = round3(side / 1.2);

    for (let f = 1; f <= floorsCount; f++) {
      const flName = f === 1 ? 'Ground Floor' : `Floor ${f}`;
      for (let r = 1; r <= roomCount; r++) {
        const id = `r-f${f}-off-${r}`;
        rooms.push({
          id,
          name: `Chamber / Room ${r} (${flName})`,
          floor_name: flName,
          length: l,
          breadth: b,
          height: ceilingHeight,
          dado_height: 0,
        });

        openings.push(
          {
            id: `op-${id}-d1`,
            room_id: id,
            mark: 'D1',
            opening_type: 'door',
            count: 1,
            width: 1.2,
            height: 2.1,
          },
          {
            id: `op-${id}-w1`,
            room_id: id,
            mark: 'W1',
            opening_type: 'window',
            count: 2,
            width: 1.5,
            height: 1.5,
          }
        );
      }

      // Toilets
      const tId = `r-f${f}-toilet-common`;
      rooms.push({
        id: tId,
        name: `Executive Washroom (${flName})`,
        floor_name: flName,
        length: 3.5,
        breadth: 2.5,
        height: ceilingHeight,
        dado_height: 2.10,
      });

      openings.push(
        {
          id: `op-${tId}-d3`,
          room_id: tId,
          mark: 'D3',
          opening_type: 'door',
          count: 2,
          width: 0.9,
          height: 2.1,
        },
        {
          id: `op-${tId}-v`,
          room_id: tId,
          mark: 'V',
          opening_type: 'ventilator',
          count: 2,
          width: 0.6,
          height: 0.6,
        }
      );
    }
  }

  return { rooms, openings };
}

/**
 * Natural Language Parser for Form Query Text
 * Extracts key numbers and specs if user types freeform.
 */
export function parseNaturalLanguageQuery(text: string, baseInput: FormQueryInput): FormQueryInput {
  const updated = { ...baseInput, queryText: text };
  const lower = text.toLowerCase();

  // 1. Detect Plinth Area
  const areaMatch = lower.match(/(\d+)\s*(sqm|sq\.m|sq mt|sqft|sq ft)/);
  if (areaMatch) {
    const val = parseFloat(areaMatch[1]);
    if (areaMatch[2].includes('ft')) {
      updated.plinthArea = round2(val / 10.764); // Convert sqft to sqm
    } else {
      updated.plinthArea = val;
    }
  }

  // 2. Detect Floors
  if (lower.includes('g+2') || lower.includes('3 store') || lower.includes('three floor')) {
    updated.floorsCount = 3;
  } else if (lower.includes('g+1') || lower.includes('2 store') || lower.includes('two floor') || lower.includes('double')) {
    updated.floorsCount = 2;
  } else if (lower.includes('single') || lower.includes('ground only') || lower.includes('1 store')) {
    updated.floorsCount = 1;
  }

  // 3. Detect Typology
  if (lower.includes('dormitory') || lower.includes('barrack')) {
    updated.buildingType = 'dormitory';
  } else if (lower.includes('cottage') || lower.includes('vip suite')) {
    updated.buildingType = 'cottage';
  } else if (lower.includes('office') || lower.includes('administrative')) {
    updated.buildingType = 'office';
  } else if (lower.includes('circuit house') || lower.includes('inspection')) {
    updated.buildingType = 'circuit_house';
  }

  // 4. Detect Specs
  if (lower.includes('renov') || lower.includes('repair')) {
    updated.workScope = 'renovation';
  } else if (lower.includes('construct') || lower.includes('new build')) {
    updated.workScope = 'new_construction';
  }

  if (lower.includes('false ceiling') || lower.includes('gypsum')) {
    updated.specs.falseCeiling = true;
  }
  if (lower.includes('paver') || lower.includes('interlocking')) {
    updated.specs.paverBlocks = true;
    updated.specs.granularSubBase = true;
  }
  if (lower.includes('cgi') || lower.includes('gi sheet') || lower.includes('roof')) {
    updated.specs.giRoofing = true;
    updated.specs.steelTrusses = true;
  }

  return updated;
}

/**
 * Main Parametric Auto-Estimation Synthesis Function
 */
export function synthesizeEstimateFromQuery(input: FormQueryInput): AutoEstimateResult {
  // 1. Synthesize Room Schedule and Openings
  const { rooms, openings } = synthesizeRoomsAndOpenings(
    input.buildingType,
    input.plinthArea,
    input.ceilingHeight,
    input.floorsCount
  );

  // 2. Compute Raw Geometric Quantities
  let totalCarpetArea = 0;
  let totalWallAreaGross = 0;
  let totalDeductionsArea = 0;
  let totalToiletCarpet = 0;
  let totalToiletDadoWallArea = 0;
  let totalDoorLeafArea = 0;

  for (const r of rooms) {
    const carpet = r.length * r.breadth;
    totalCarpetArea += carpet;
    const perim = 2 * (r.length + r.breadth);
    const effH = Math.max(0, r.height - (r.dado_height || 0));
    totalWallAreaGross += perim * effH;

    if (r.dado_height && r.dado_height > 0) {
      totalToiletCarpet += carpet;
      totalToiletDadoWallArea += perim * r.dado_height;
    }

    const roomOps = openings.filter((op) => op.room_id === r.id);
    for (const op of roomOps) {
      const opArea = op.count * op.width * op.height;
      totalDeductionsArea += opArea;
      if (op.opening_type === 'door') {
        totalDoorLeafArea += opArea;
      }
    }
  }

  const netWallPaintArea = Math.max(0, round2(totalWallAreaGross - totalDeductionsArea * 0.75));
  const primerArea = round2(netWallPaintArea * 1.35); // Wall paint + extra margins & reveals
  const floorTilingArea = round2(totalCarpetArea * 0.95);
  const skirtingLength = round2(totalCarpetArea * 0.35);
  const falseCeilingArea = input.specs.falseCeiling ? round2(totalCarpetArea * 0.40) : 0;
  const roofingArea = input.specs.giRoofing ? round2(input.plinthArea * 1.15) : 0;
  const steelTrussWeight = input.specs.steelTrusses ? round2(roofingArea * 9.5) : 0; // 9.5 kg/sqm
  const paverArea = input.specs.paverBlocks ? round2(input.plinthArea * 0.65) : 0;
  const gsbVolume = input.specs.granularSubBase ? round2(paverArea * 0.10) : 0; // 100mm compacted bed
  const doorShutterArea = round2(totalDoorLeafArea);

  // 3. Assemble BOQ Items with DSR 2021 Rates
  const boqItems: AutoEstimateResult['boqItems'] = [];
  let itemCounter = 1;

  // Dismantling (if Renovation)
  if (input.workScope === 'renovation') {
    if (input.specs.scrapingOldPaint) {
      boqItems.push({
        itemNo: itemCounter++,
        dsrCode: '15.57.1',
        description: 'Scraping, washing and cleaning the surface of old plaster/wall painting',
        unit: 'Sqm',
        rate: 21.75,
        quantity: netWallPaintArea,
        amount: round2(netWallPaintArea * 21.75),
        category: 'dismantling',
      });
    }
    boqItems.push({
      itemNo: itemCounter++,
      dsrCode: '15.60',
      description: 'Dismantling tile work in floors and walls laid in mortar including stacking',
      unit: 'Sqm',
      rate: 36.00,
      quantity: round2(totalToiletCarpet * 1.2),
      amount: round2(totalToiletCarpet * 1.2 * 36.00),
      category: 'dismantling',
    });
  } else {
    // Civil works for New Construction
    boqItems.push(
      {
        itemNo: itemCounter++,
        dsrCode: '6.1.1',
        description: 'Brick work with common burnt clay F.P.S. (non modular) bricks of class designation 7.5 in foundation and plinth in cement mortar 1:4',
        unit: 'Cum',
        rate: 6385.75,
        quantity: round2(input.plinthArea * 0.18),
        amount: round2(input.plinthArea * 0.18 * 6385.75),
        category: 'civil',
      },
      {
        itemNo: itemCounter++,
        dsrCode: '13.1.2',
        description: '12 mm cement plaster of mix : 1:4 (1 cement: 4 fine sand) on walls and ceiling',
        unit: 'Sqm',
        rate: 269.15,
        quantity: netWallPaintArea,
        amount: round2(netWallPaintArea * 269.15),
        category: 'civil',
      }
    );
  }

  // Wall Finishes & Paint
  if (input.specs.primer) {
    boqItems.push({
      itemNo: itemCounter++,
      dsrCode: '13.85.3',
      description: 'Applying one coat of water thinnable cement primer of approved brand on wall surface',
      unit: 'Sqm',
      rate: 64.45,
      quantity: primerArea,
      amount: round2(primerArea * 64.45),
      category: 'finishes',
    });
  }

  if (input.specs.interiorPaint) {
    boqItems.push({
      itemNo: itemCounter++,
      dsrCode: '13.83.2',
      description: 'Wall painting with premium acrylic emulsion paint of approved brand (two or more coats) on interior wall surfaces',
      unit: 'Sqm',
      rate: 121.55,
      quantity: netWallPaintArea,
      amount: round2(netWallPaintArea * 121.55),
      category: 'finishes',
    });
  }

  // Flooring & Tiling
  if (input.specs.vitrifiedFlooring) {
    boqItems.push({
      itemNo: itemCounter++,
      dsrCode: '11.41.2',
      description: 'Providing and laying vitrified floor tiles in different sizes (thickness 8-10 mm) of size 600x600 mm laid on cement mortar',
      unit: 'Sqm',
      rate: 1126.85,
      quantity: floorTilingArea,
      amount: round2(floorTilingArea * 1126.85),
      category: 'flooring',
    });
  }

  if (input.specs.skirting) {
    boqItems.push({
      itemNo: itemCounter++,
      dsrCode: '11.41.2',
      description: 'Providing and fixing vitrified tile skirting (100mm to 150mm height) matching floor tiles',
      unit: 'Sqm',
      rate: 1126.85,
      quantity: round2(skirtingLength * 0.12), // 120mm skirting height
      amount: round2(skirtingLength * 0.12 * 1126.85),
      category: 'flooring',
    });
  }

  if (input.specs.toiletWallDado && totalToiletDadoWallArea > 0) {
    boqItems.push({
      itemNo: itemCounter++,
      dsrCode: '11.37',
      description: 'Providing and fixing 1st quality ceramic glazed wall tiles conforming to IS: 15622 in colors / patterns on wall dado',
      unit: 'Sqm',
      rate: 920.40,
      quantity: round2(totalToiletDadoWallArea),
      amount: round2(totalToiletDadoWallArea * 920.40),
      category: 'flooring',
    });
  }

  if (input.specs.toiletFloorTiles && totalToiletCarpet > 0) {
    boqItems.push({
      itemNo: itemCounter++,
      dsrCode: '11.38',
      description: 'Providing and laying ceramic glazed floor tiles 300x300 mm (non-skid) in toilets and bathrooms',
      unit: 'Sqm',
      rate: 875.25,
      quantity: round2(totalToiletCarpet),
      amount: round2(totalToiletCarpet * 875.25),
      category: 'flooring',
    });
  }

  // Doors
  if (input.specs.pvcDoors && doorShutterArea > 0) {
    boqItems.push({
      itemNo: itemCounter++,
      dsrCode: '9.120.1',
      description: 'Providing and fixing factory made panel PVC door shutter 30 mm thick consisting of M.S. tube frame with styles and rails',
      unit: 'Sqm',
      rate: 2455.10,
      quantity: doorShutterArea,
      amount: round2(doorShutterArea * 2455.10),
      category: 'doors',
    });
  }

  // Roofing & Trusses
  if (input.specs.steelTrusses && steelTrussWeight > 0) {
    boqItems.push({
      itemNo: itemCounter++,
      dsrCode: '10.16.2',
      description: 'Steel work in built up tubular (round, square or rectangular hollow tubes) trusses including cutting, hoisting, fixing with steel primer',
      unit: 'Kg',
      rate: 168.95,
      quantity: steelTrussWeight,
      amount: round2(steelTrussWeight * 168.95),
      category: 'roofing',
    });
  }

  if (input.specs.giRoofing && roofingArea > 0) {
    boqItems.push(
      {
        itemNo: itemCounter++,
        dsrCode: '12.50',
        description: 'Providing and fixing precoated galvanised iron profile sheets 0.50 mm total coated thickness 120 g/sqm zinc coating with EPDM seal screws',
        unit: 'Sqm',
        rate: 671.55,
        quantity: roofingArea,
        amount: round2(roofingArea * 671.55),
        category: 'roofing',
      },
      {
        itemNo: itemCounter++,
        dsrCode: '12.4.2',
        description: 'Providing ridges or hips of width 60 cm overall width plain G.S. sheet 0.63 mm thick with polymer coated hooks and bitumen washers',
        unit: 'Rm',
        rate: 750.85,
        quantity: round2(Math.sqrt(roofingArea) * 1.5),
        amount: round2(Math.sqrt(roofingArea) * 1.5 * 750.85),
        category: 'roofing',
      }
    );
  }

  // False Ceiling
  if (input.specs.falseCeiling && falseCeilingArea > 0) {
    boqItems.push({
      itemNo: itemCounter++,
      dsrCode: '12.52.3',
      description: 'Providing and fixing tiled false ceiling of size 595x595 mm PVC Laminated Gypsum Tile 12.5 mm thick on GI interlocking grid',
      unit: 'Sqm',
      rate: 1948.95,
      quantity: falseCeilingArea,
      amount: round2(falseCeilingArea * 1948.95),
      category: 'finishes',
    });
  }

  // Site Work / Interlocking Pavers
  if (input.specs.granularSubBase && gsbVolume > 0) {
    boqItems.push({
      itemNo: itemCounter++,
      dsrCode: '16.78.1',
      description: 'Construction of granular sub-base (GSB) with close graded material Grade-I CBR-30 including spreading and vibratory rolling',
      unit: 'Cum',
      rate: 2658.10,
      quantity: gsbVolume,
      amount: round2(gsbVolume * 2658.10),
      category: 'site_work',
    });
  }

  if (input.specs.paverBlocks && paverArea > 0) {
    boqItems.push({
      itemNo: itemCounter++,
      dsrCode: '16.68',
      description: 'Providing and laying 60 mm thick factory made cement concrete interlocking paver block M-30 grade over 50 mm sand bed',
      unit: 'Sqm',
      rate: 951.00,
      quantity: paverArea,
      amount: round2(paverArea * 951.00),
      category: 'site_work',
    });
  }

  // 4. Compute Totals & Category Breakdown
  let totalEstimatedCost = 0;
  const categoryBreakdown = {
    finishes: 0,
    flooring: 0,
    roofing: 0,
    doors: 0,
    site_work: 0,
    dismantling: 0,
    civil: 0,
  };

  for (const item of boqItems) {
    totalEstimatedCost += item.amount;
    categoryBreakdown[item.category] += item.amount;
  }

  totalEstimatedCost = round2(totalEstimatedCost);
  const costPerSqm = round2(totalEstimatedCost / input.plinthArea);
  const costPerSqft = round2(costPerSqm / 10.764);

  // 5. Generate Measurement Book items using the IS:1200 engine
  const measurementBookItems: GeneratedMeasurementBookItem[] = boqItems.map((boq) => {
    const estItem: EstimateItem = {
      id: `item-${boq.itemNo}`,
      item_number: boq.itemNo,
      dsr_code: boq.dsrCode,
      description: boq.description,
      unit: boq.unit,
      rate: boq.rate,
    };
    return generateRoomMeasurements(estItem, rooms, openings, {
      includeBeams: true,
      includeIdenticalFloors: input.floorsCount > 1,
      identicalFloorsMultiplier: input.floorsCount,
    });
  });

  return {
    metadata: {
      projectName: input.projectName,
      division: input.division,
      authority: input.authority,
      dsrYear: input.dsrYear,
      buildingType: input.buildingType,
      plinthArea: input.plinthArea,
      floorsCount: input.floorsCount,
      totalCarpetArea: round2(totalCarpetArea),
      totalEstimatedCost,
      costPerSqm,
      costPerSqft,
      itemCount: boqItems.length,
    },
    rooms,
    openings,
    boqItems,
    categoryBreakdown,
    measurementBookItems,
  };
}
