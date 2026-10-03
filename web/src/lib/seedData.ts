/**
 * Online Measurement Maker - Benchmark Seed Data
 * Source: FULL CIRCUIT HOUSE ESTIMATE.xlsx
 * Project: Repairing and Renovation of Circuit House at Bokakhat
 * Division: Bokakhat PWD Division, Golaghat District, Assam
 * Standard: DSR 2021 (Civil)
 */

export interface BOQItem {
  itemNo: number;
  dsrCode: string;
  description: string;
  boqQty: number;
  measuredQty: number;
  difference: number;
  unit: string;
  rate: number;
  boqAmount: number;
  measuredAmount: number;
  varianceAmount: number;
  status: 'MATCH' | 'OVERRUN' | 'UNDER';
}

export interface Opening {
  id: string;
  type: 'DOOR' | 'WINDOW' | 'VENTILATOR' | 'OTHER';
  code: string;
  description: string;
  count: number;
  width: number;
  height: number;
  area: number;
}

export interface Room {
  id: string;
  buildingId: string;
  buildingName: string;
  floor: string;
  name: string;
  length: number;
  breadth: number;
  height: number;
  perimeter: number;
  carpetArea: number;
  wallArea: number;
  openings: Opening[];
}

export interface Building {
  id: string;
  code: string;
  name: string;
  description: string;
  ceilingHeight: number;
  floorCount: number;
  roomCount: number;
  totalCarpetArea: number;
}

export interface MeasurementLine {
  id: string;
  itemNo: number;
  particulars: string;
  nos?: number | null;
  length?: number | null;
  breadth?: number | null;
  height?: number | null;
  quantity: number;
  unit: string;
  rate?: number | null;
  amount?: number | null;
  isDeduction?: boolean;
  isSubtotal?: boolean;
  isHeader?: boolean;
  codeNo?: string;
}

export interface ProjectMetadata {
  id: string;
  name: string;
  subTitle: string;
  authority: string;
  division: string;
  circle: string;
  district: string;
  state: string;
  dsrYear: string;
  sanctionedAmount: number;
  measuredAmount: number;
  netVariance: number;
  complianceRate: number;
  itemCount: number;
}

export const BENCHMARK_PROJECT: ProjectMetadata = {
  id: 'proj-circuit-house-bokakhat',
  name: 'Repairing and Renovation of Circuit House at Bokakhat',
  subTitle: 'Public Works Department (PWD) Civil Works • DSR 2021 Rates',
  authority: 'Government of Assam, Public Works (Building) Department',
  division: 'Bokakhat PWD Division',
  circle: 'Golaghat Building Circle',
  district: 'Golaghat',
  state: 'Assam',
  dsrYear: 'DSR 2021',
  sanctionedAmount: 2178137,
  measuredAmount: 2178131,
  netVariance: -3.92,
  complianceRate: 100,
  itemCount: 29,
};

export const BENCHMARK_SUMMARY = {
  totalSanctionedBOQ: 2178137,
  totalMeasuredAmount: 2178131,
  netVariance: -3.92,
  complianceRate: 100,
  totalItems: 29,
  matchedItems: 29,
  overrunItems: 0,
  underItems: 0,
};

export const BENCHMARK_BUILDINGS: Building[] = [
  {
    "id": "b-1",
    "code": "PLAN-1",
    "name": "Plan 1: Main Building (G+1)",
    "description": "Main Administrative and VIP Suite Block with Ground and First Floor (identical layout, 11 primary rooms, corridor, staircase)",
    "ceilingHeight": 3.05,
    "floorCount": 2,
    "roomCount": 11,
    "totalCarpetArea": 275.98
  },
  {
    "id": "b-2",
    "code": "PLAN-2",
    "name": "Plan 2: Dormitory Block",
    "description": "Dormitory accommodation block with central hall, 4-cubicle sanitary block, access lobby, and front verandah",
    "ceilingHeight": 3.05,
    "floorCount": 1,
    "roomCount": 4,
    "totalCarpetArea": 80.35
  },
  {
    "id": "b-3",
    "code": "PLAN-3",
    "name": "Plan 3: A-Type Cottage Suite",
    "description": "Independent VIP Cottage unit with primary bedroom suite, rear annex / dressing / toilet, and front verandah",
    "ceilingHeight": 3.05,
    "floorCount": 1,
    "roomCount": 3,
    "totalCarpetArea": 58.0
  }
];

export const BENCHMARK_OPENINGS_CATALOG = [
  {
    "code": "D1",
    "type": "DOOR",
    "name": "Main Door (Corridor/Verandah)",
    "width": 1.2,
    "height": 2.1,
    "area": 2.52
  },
  {
    "code": "D2",
    "type": "DOOR",
    "name": "Double Entrance Door",
    "width": 1.5,
    "height": 2.1,
    "area": 3.15
  },
  {
    "code": "D3",
    "type": "DOOR",
    "name": "Toilet / Partition Door",
    "width": 0.9,
    "height": 2.1,
    "area": 1.89
  },
  {
    "code": "D_ANNEX",
    "type": "DOOR",
    "name": "Annex Pass Door",
    "width": 1.05,
    "height": 2.1,
    "area": 2.205
  },
  {
    "code": "D_CUB",
    "type": "DOOR",
    "name": "Toilet Cubicle Door",
    "width": 0.75,
    "height": 2.1,
    "area": 1.575
  },
  {
    "code": "W1",
    "type": "WINDOW",
    "name": "Standard Casement Window",
    "width": 1.5,
    "height": 1.8,
    "area": 2.7
  },
  {
    "code": "W2",
    "type": "WINDOW",
    "name": "Narrow / Flanking Window",
    "width": 1.2,
    "height": 1.8,
    "area": 2.16
  },
  {
    "code": "W_DORM",
    "type": "WINDOW",
    "name": "Dormitory Hall Window",
    "width": 1.8,
    "height": 1.35,
    "area": 2.43
  },
  {
    "code": "W_EAST",
    "type": "WINDOW",
    "name": "East Wall Window",
    "width": 1.2,
    "height": 1.35,
    "area": 1.62
  },
  {
    "code": "V",
    "type": "VENTILATOR",
    "name": "Sanitary Ventilator",
    "width": 0.6,
    "height": 0.6,
    "area": 0.36
  }
];

export const BENCHMARK_ROOMS: Room[] = [
  {
    "id": "r-101",
    "buildingId": "b-1",
    "buildingName": "Plan 1: Main Building (G+1)",
    "floor": "First Floor",
    "name": "Room 1 (Bed Room)",
    "length": 5.644,
    "breadth": 5.508,
    "height": 3.05,
    "perimeter": 22.304,
    "carpetArea": 31.09,
    "wallArea": 68.03,
    "openings": [
      {
        "id": "op-101-1",
        "code": "D1",
        "type": "DOOR",
        "description": "Door to corridor (D1)",
        "count": 1,
        "width": 1.2,
        "height": 2.1,
        "area": 2.52
      },
      {
        "id": "op-101-2",
        "code": "W1",
        "type": "WINDOW",
        "description": "Windows (W1 - 2 nos)",
        "count": 2,
        "width": 1.5,
        "height": 1.8,
        "area": 5.4
      }
    ]
  },
  {
    "id": "r-102",
    "buildingId": "b-1",
    "buildingName": "Plan 1: Main Building (G+1)",
    "floor": "First Floor",
    "name": "Room 2 (Large Suite)",
    "length": 6.5,
    "breadth": 5.508,
    "height": 3.05,
    "perimeter": 24.016,
    "carpetArea": 35.8,
    "wallArea": 73.25,
    "openings": [
      {
        "id": "op-102-1",
        "code": "D1",
        "type": "DOOR",
        "description": "Door to corridor (D1)",
        "count": 1,
        "width": 1.2,
        "height": 2.1,
        "area": 2.52
      },
      {
        "id": "op-102-2",
        "code": "W1",
        "type": "WINDOW",
        "description": "Windows (W1 - 3 nos)",
        "count": 3,
        "width": 1.5,
        "height": 1.8,
        "area": 8.1
      }
    ]
  },
  {
    "id": "r-103",
    "buildingId": "b-1",
    "buildingName": "Plan 1: Main Building (G+1)",
    "floor": "First Floor",
    "name": "Room 3 (Bed Room)",
    "length": 5.644,
    "breadth": 4.512,
    "height": 3.05,
    "perimeter": 20.312,
    "carpetArea": 25.47,
    "wallArea": 61.95,
    "openings": [
      {
        "id": "op-103-1",
        "code": "D1",
        "type": "DOOR",
        "description": "Door to corridor (D1)",
        "count": 1,
        "width": 1.2,
        "height": 2.1,
        "area": 2.52
      },
      {
        "id": "op-103-2",
        "code": "W1",
        "type": "WINDOW",
        "description": "Window (W1 - left wall)",
        "count": 1,
        "width": 1.5,
        "height": 1.8,
        "area": 2.7
      }
    ]
  },
  {
    "id": "r-104",
    "buildingId": "b-1",
    "buildingName": "Plan 1: Main Building (G+1)",
    "floor": "First Floor",
    "name": "Room 4 (Bed Room)",
    "length": 5.644,
    "breadth": 3.912,
    "height": 3.05,
    "perimeter": 19.112,
    "carpetArea": 22.08,
    "wallArea": 58.29,
    "openings": [
      {
        "id": "op-104-1",
        "code": "D1",
        "type": "DOOR",
        "description": "Door to corridor (D1)",
        "count": 1,
        "width": 1.2,
        "height": 2.1,
        "area": 2.52
      },
      {
        "id": "op-104-2",
        "code": "W1",
        "type": "WINDOW",
        "description": "Window (W1 - left wall)",
        "count": 1,
        "width": 1.5,
        "height": 1.8,
        "area": 2.7
      }
    ]
  },
  {
    "id": "r-105",
    "buildingId": "b-1",
    "buildingName": "Plan 1: Main Building (G+1)",
    "floor": "First Floor",
    "name": "Room 5 (Bed Room)",
    "length": 5.644,
    "breadth": 4.512,
    "height": 3.05,
    "perimeter": 20.312,
    "carpetArea": 25.47,
    "wallArea": 61.95,
    "openings": [
      {
        "id": "op-105-1",
        "code": "D1",
        "type": "DOOR",
        "description": "Door to corridor (D1)",
        "count": 1,
        "width": 1.2,
        "height": 2.1,
        "area": 2.52
      },
      {
        "id": "op-105-2",
        "code": "W1",
        "type": "WINDOW",
        "description": "Window (W1 - left wall)",
        "count": 1,
        "width": 1.5,
        "height": 1.8,
        "area": 2.7
      }
    ]
  },
  {
    "id": "r-106",
    "buildingId": "b-1",
    "buildingName": "Plan 1: Main Building (G+1)",
    "floor": "First Floor",
    "name": "Room 6 (Meeting / Living Hall)",
    "length": 7.944,
    "breadth": 2.944,
    "height": 3.05,
    "perimeter": 21.776,
    "carpetArea": 23.39,
    "wallArea": 66.42,
    "openings": [
      {
        "id": "op-106-1",
        "code": "D2",
        "type": "DOOR",
        "description": "Double Door to corridor",
        "count": 1,
        "width": 1.5,
        "height": 2.1,
        "area": 3.15
      },
      {
        "id": "op-106-2",
        "code": "W1",
        "type": "WINDOW",
        "description": "Window (W1 - west wall)",
        "count": 1,
        "width": 1.5,
        "height": 1.8,
        "area": 2.7
      }
    ]
  },
  {
    "id": "r-107",
    "buildingId": "b-1",
    "buildingName": "Plan 1: Main Building (G+1)",
    "floor": "First Floor",
    "name": "Room 7 (Attached Room / Toilet)",
    "length": 2.3,
    "breadth": 3.228,
    "height": 3.05,
    "perimeter": 11.056,
    "carpetArea": 7.42,
    "wallArea": 33.72,
    "openings": [
      {
        "id": "op-107-1",
        "code": "D3",
        "type": "DOOR",
        "description": "Door (D3)",
        "count": 1,
        "width": 0.9,
        "height": 2.1,
        "area": 1.89
      },
      {
        "id": "op-107-2",
        "code": "V",
        "type": "VENTILATOR",
        "description": "Ventilator (V)",
        "count": 1,
        "width": 0.6,
        "height": 0.6,
        "area": 0.36
      }
    ]
  },
  {
    "id": "r-108",
    "buildingId": "b-1",
    "buildingName": "Plan 1: Main Building (G+1)",
    "floor": "First Floor",
    "name": "Room 8 (Left Wing Suite)",
    "length": 5.131,
    "breadth": 4.61,
    "height": 3.05,
    "perimeter": 19.482,
    "carpetArea": 23.65,
    "wallArea": 59.42,
    "openings": [
      {
        "id": "op-108-1",
        "code": "D1",
        "type": "DOOR",
        "description": "Entrance door to verandah",
        "count": 1,
        "width": 1.2,
        "height": 2.1,
        "area": 2.52
      },
      {
        "id": "op-108-2",
        "code": "D3",
        "type": "DOOR",
        "description": "Internal partition door",
        "count": 1,
        "width": 0.9,
        "height": 2.1,
        "area": 1.89
      },
      {
        "id": "op-108-3",
        "code": "W1",
        "type": "WINDOW",
        "description": "Windows (W1 - 2 nos)",
        "count": 2,
        "width": 1.5,
        "height": 1.8,
        "area": 5.4
      }
    ]
  },
  {
    "id": "r-109",
    "buildingId": "b-1",
    "buildingName": "Plan 1: Main Building (G+1)",
    "floor": "First Floor",
    "name": "Room 9 (Left Wing Room)",
    "length": 5.131,
    "breadth": 3.16,
    "height": 3.05,
    "perimeter": 16.582,
    "carpetArea": 16.21,
    "wallArea": 50.58,
    "openings": [
      {
        "id": "op-109-1",
        "code": "D1",
        "type": "DOOR",
        "description": "Entrance door to verandah",
        "count": 1,
        "width": 1.2,
        "height": 2.1,
        "area": 2.52
      },
      {
        "id": "op-109-2",
        "code": "W1",
        "type": "WINDOW",
        "description": "Window (W1)",
        "count": 1,
        "width": 1.5,
        "height": 1.8,
        "area": 2.7
      }
    ]
  },
  {
    "id": "r-110",
    "buildingId": "b-1",
    "buildingName": "Plan 1: Main Building (G+1)",
    "floor": "First Floor",
    "name": "Room 10 (Office / Guard Room)",
    "length": 3.126,
    "breadth": 3.154,
    "height": 3.05,
    "perimeter": 12.56,
    "carpetArea": 9.86,
    "wallArea": 38.31,
    "openings": [
      {
        "id": "op-110-1",
        "code": "D2",
        "type": "DOOR",
        "description": "Double Door to corridor",
        "count": 1,
        "width": 1.5,
        "height": 2.1,
        "area": 3.15
      },
      {
        "id": "op-110-2",
        "code": "W1",
        "type": "WINDOW",
        "description": "Window (W1)",
        "count": 1,
        "width": 1.5,
        "height": 1.8,
        "area": 2.7
      }
    ]
  },
  {
    "id": "r-111",
    "buildingId": "b-1",
    "buildingName": "Plan 1: Main Building (G+1)",
    "floor": "First Floor",
    "name": "Staircase Well",
    "length": 5.644,
    "breadth": 3.228,
    "height": 3.05,
    "perimeter": 17.744,
    "carpetArea": 18.22,
    "wallArea": 54.12,
    "openings": [
      {
        "id": "op-111-1",
        "code": "W1",
        "type": "WINDOW",
        "description": "Staircase landing window",
        "count": 1,
        "width": 1.5,
        "height": 1.8,
        "area": 2.7
      }
    ]
  },
  {
    "id": "r-112",
    "buildingId": "b-1",
    "buildingName": "Plan 1: Main Building (G+1)",
    "floor": "First Floor",
    "name": "Room 11 (Main Corridor)",
    "length": 22.616,
    "breadth": 2.0,
    "height": 3.05,
    "perimeter": 45.232,
    "carpetArea": 45.23,
    "wallArea": 137.96,
    "openings": [
      {
        "id": "op-112-1",
        "code": "D1",
        "type": "DOOR",
        "description": "Room doors opening onto corridor",
        "count": 6,
        "width": 1.2,
        "height": 2.1,
        "area": 15.12
      },
      {
        "id": "op-112-2",
        "code": "D2",
        "type": "DOOR",
        "description": "Double doors (Rooms 6 & 10)",
        "count": 2,
        "width": 1.5,
        "height": 2.1,
        "area": 6.3
      }
    ]
  },
  {
    "id": "r-201",
    "buildingId": "b-2",
    "buildingName": "Plan 2: Dormitory Block",
    "floor": "Ground Floor",
    "name": "Dormitory Hall",
    "length": 9.292,
    "breadth": 6.1,
    "height": 3.05,
    "perimeter": 30.784,
    "carpetArea": 56.68,
    "wallArea": 93.89,
    "openings": [
      {
        "id": "op-201-1",
        "code": "W_DORM",
        "type": "WINDOW",
        "description": "North wall windows",
        "count": 2,
        "width": 1.8,
        "height": 1.35,
        "area": 4.86
      },
      {
        "id": "op-201-2",
        "code": "W_DORM",
        "type": "WINDOW",
        "description": "South wall windows",
        "count": 2,
        "width": 1.8,
        "height": 1.35,
        "area": 4.86
      },
      {
        "id": "op-201-3",
        "code": "D1",
        "type": "DOOR",
        "description": "Main entrance door to verandah",
        "count": 1,
        "width": 1.2,
        "height": 2.1,
        "area": 2.52
      },
      {
        "id": "op-201-4",
        "code": "W_EAST",
        "type": "WINDOW",
        "description": "East wall window",
        "count": 1,
        "width": 1.2,
        "height": 1.35,
        "area": 1.62
      },
      {
        "id": "op-201-5",
        "code": "D_ANNEX",
        "type": "DOOR",
        "description": "Door to toilet access lobby",
        "count": 1,
        "width": 1.05,
        "height": 2.1,
        "area": 2.205
      }
    ]
  },
  {
    "id": "r-202",
    "buildingId": "b-2",
    "buildingName": "Plan 2: Dormitory Block",
    "floor": "Ground Floor",
    "name": "Toilet Block (4 Cubicles)",
    "length": 3.639,
    "breadth": 1.82,
    "height": 3.05,
    "perimeter": 6.64,
    "carpetArea": 6.62,
    "wallArea": 25.23,
    "openings": [
      {
        "id": "op-202-1",
        "code": "V",
        "type": "VENTILATOR",
        "description": "Sanitary Ventilators (4 nos)",
        "count": 4,
        "width": 0.6,
        "height": 0.6,
        "area": 1.44
      }
    ]
  },
  {
    "id": "r-203",
    "buildingId": "b-2",
    "buildingName": "Plan 2: Dormitory Block",
    "floor": "Ground Floor",
    "name": "Toilet Access Lobby",
    "length": 3.639,
    "breadth": 1.2,
    "height": 3.05,
    "perimeter": 9.678,
    "carpetArea": 4.37,
    "wallArea": 29.52,
    "openings": [
      {
        "id": "op-203-1",
        "code": "D_CUB",
        "type": "DOOR",
        "description": "Cubicle doors (4 nos)",
        "count": 4,
        "width": 0.75,
        "height": 2.1,
        "area": 6.3
      }
    ]
  },
  {
    "id": "r-204",
    "buildingId": "b-2",
    "buildingName": "Plan 2: Dormitory Block",
    "floor": "Ground Floor",
    "name": "Front Verandah",
    "length": 6.1,
    "breadth": 2.4,
    "height": 3.05,
    "perimeter": 17.0,
    "carpetArea": 14.64,
    "wallArea": 18.61,
    "openings": [
      {
        "id": "op-204-1",
        "code": "D1",
        "type": "DOOR",
        "description": "Main door opening",
        "count": 1,
        "width": 1.2,
        "height": 2.1,
        "area": 2.52
      },
      {
        "id": "op-204-2",
        "code": "W_EAST",
        "type": "WINDOW",
        "description": "Front window opening",
        "count": 1,
        "width": 1.2,
        "height": 1.35,
        "area": 1.62
      }
    ]
  },
  {
    "id": "r-301",
    "buildingId": "b-3",
    "buildingName": "Plan 3: A-Type Cottage Suite",
    "floor": "Ground Floor",
    "name": "Cottage Main Room",
    "length": 6.008,
    "breadth": 6.6,
    "height": 3.05,
    "perimeter": 25.216,
    "carpetArea": 39.65,
    "wallArea": 76.91,
    "openings": [
      {
        "id": "op-301-1",
        "code": "D1",
        "type": "DOOR",
        "description": "Main Double Door to verandah",
        "count": 1,
        "width": 1.2,
        "height": 2.1,
        "area": 2.52
      },
      {
        "id": "op-301-2",
        "code": "W1",
        "type": "WINDOW",
        "description": "Side windows (W1 - 4 nos)",
        "count": 4,
        "width": 1.5,
        "height": 1.8,
        "area": 10.8
      },
      {
        "id": "op-301-3",
        "code": "W2",
        "type": "WINDOW",
        "description": "Front flanking windows (2 nos)",
        "count": 2,
        "width": 1.2,
        "height": 1.8,
        "area": 4.32
      },
      {
        "id": "op-301-4",
        "code": "D_ANNEX",
        "type": "DOOR",
        "description": "Door to rear annex",
        "count": 1,
        "width": 1.05,
        "height": 2.1,
        "area": 2.205
      }
    ]
  },
  {
    "id": "r-302",
    "buildingId": "b-3",
    "buildingName": "Plan 3: A-Type Cottage Suite",
    "floor": "Ground Floor",
    "name": "Rear Annex / Toilet / Dressing",
    "length": 2.3,
    "breadth": 2.231,
    "height": 3.05,
    "perimeter": 9.062,
    "carpetArea": 5.13,
    "wallArea": 27.64,
    "openings": [
      {
        "id": "op-302-1",
        "code": "D3",
        "type": "DOOR",
        "description": "Door (D3)",
        "count": 1,
        "width": 0.9,
        "height": 2.1,
        "area": 1.89
      },
      {
        "id": "op-302-2",
        "code": "V",
        "type": "VENTILATOR",
        "description": "Ventilator (V)",
        "count": 1,
        "width": 0.6,
        "height": 0.6,
        "area": 0.36
      }
    ]
  },
  {
    "id": "r-303",
    "buildingId": "b-3",
    "buildingName": "Plan 3: A-Type Cottage Suite",
    "floor": "Ground Floor",
    "name": "Front Verandah",
    "length": 6.6,
    "breadth": 2.0,
    "height": 3.05,
    "perimeter": 17.2,
    "carpetArea": 13.2,
    "wallArea": 20.13,
    "openings": [
      {
        "id": "op-303-1",
        "code": "D1",
        "type": "DOOR",
        "description": "Main door opening",
        "count": 1,
        "width": 1.2,
        "height": 2.1,
        "area": 2.52
      },
      {
        "id": "op-303-2",
        "code": "W2",
        "type": "WINDOW",
        "description": "Front flanking windows (2 nos)",
        "count": 2,
        "width": 1.2,
        "height": 1.8,
        "area": 4.32
      }
    ]
  }
];

export const BENCHMARK_29_ITEMS: BOQItem[] = [
  {
    "itemNo": 1,
    "dsrCode": "15.7",
    "description": "Demolishing brick work manually/ by mechanical means including stacking of serviceable material and disposal of unserviceable material within 50 metres lead as per direction of Engineer-in-charge.15.7.4 in cement mortar",
    "boqQty": 1.58,
    "measuredQty": 1.58,
    "difference": 0.0,
    "unit": "Cum",
    "rate": 1698.45,
    "boqAmount": 2684,
    "measuredAmount": 2683.55,
    "varianceAmount": -0.45,
    "status": "MATCH"
  },
  {
    "itemNo": 2,
    "dsrCode": "15.23.1",
    "description": "Dismantling tile work in floors and roofs laid in cement mortar including  stacking material within 50 metres lead.\n 15.23.1 For thickness of tiles 10 mm to 25 mm",
    "boqQty": 237.21,
    "measuredQty": 237.21,
    "difference": 0.0,
    "unit": "Sqm",
    "rate": 60.5,
    "boqAmount": 14351,
    "measuredAmount": 14351.2,
    "varianceAmount": 0.2,
    "status": "MATCH"
  },
  {
    "itemNo": 3,
    "dsrCode": "15.28",
    "description": "Dismantling roofing including ridges, hips, valleys and gutters etc.,  and stacking the material within 50 metres lead of:\n15.28.1G.S. Sheet",
    "boqQty": 3.57,
    "measuredQty": 3.57,
    "difference": 0.0,
    "unit": "Sqm",
    "rate": 136.0,
    "boqAmount": 486,
    "measuredAmount": 485.52,
    "varianceAmount": -0.48,
    "status": "MATCH"
  },
  {
    "itemNo": 4,
    "dsrCode": "2.25",
    "description": "Filling available excavated earth (excluding rock) in trenches, plinth, sides of foundations etc. in layers not exceeding 20cm in depth, consolidating each deposited layer by ramming and watering, lead up to 50 m and lift upto 1.5 m.",
    "boqQty": 13.01,
    "measuredQty": 13.01,
    "difference": 0.0,
    "unit": "Cum",
    "rate": 253.95,
    "boqAmount": 3304,
    "measuredAmount": 3303.89,
    "varianceAmount": -0.11,
    "status": "MATCH"
  },
  {
    "itemNo": 5,
    "dsrCode": "11.2",
    "description": "Dry brick on edge flooring in required pattern with bricks of class designation 7.5 on a bed of 12 mm mud mortar, including filling joints with Jamuna sand, with common burnt clay non modular bricks.",
    "boqQty": 9.9,
    "measuredQty": 9.9,
    "difference": 0.0,
    "unit": "Sqm",
    "rate": 733.3,
    "boqAmount": 7260,
    "measuredAmount": 7259.67,
    "varianceAmount": -0.33,
    "status": "MATCH"
  },
  {
    "itemNo": 6,
    "dsrCode": "11.5",
    "description": "62 mm thick cement concrete flooring with concrete hardener topping, under layer 50 mm thick cement concrete 1:2:4 (1 cement : 2 coarse sand : 4 graded stone aggregate 20mm nominal size) and top layer 12mm thick cement hardener consisting of mix 1:2 (1 cement hardener mix : 2 graded stone aggregate, 6mm nominal size) by volume, hardening compound mixed @ 2 litre per 50 kg of cement or as per manufacture\u2019s specifications. This includes cost of cement slurry, but excluding the cost of nosing of steps etc. complete.",
    "boqQty": 9.9,
    "measuredQty": 9.9,
    "difference": 0.0,
    "unit": "Sqm",
    "rate": 928.65,
    "boqAmount": 9194,
    "measuredAmount": 9193.64,
    "varianceAmount": -0.36,
    "status": "MATCH"
  },
  {
    "itemNo": 7,
    "dsrCode": "11.41",
    "description": "Providing and laying vitrified floor tiles in different sizes (thickness to be specified by the manufacturer) with water absorption less than 0.08% and conforming to IS: 15622, of approved make, in all colours and shades, laid on 20mm thick cement mortar 1:4 (1 cement : 4 coarse sand), jointing with grey cement slurry @ 3.3 kg/ sqm including grouting the joints with white cement and matching pigments etc., complete. \n11.41.2 Size of Tile 600x600 mm.",
    "boqQty": 246.7,
    "measuredQty": 246.7,
    "difference": 0.0,
    "unit": "Sqm",
    "rate": 1416.65,
    "boqAmount": 349488,
    "measuredAmount": 349487.55,
    "varianceAmount": -0.45,
    "status": "MATCH"
  },
  {
    "itemNo": 8,
    "dsrCode": "8.31",
    "description": "Providing and fixing Ist quality ceramic glazed wall tiles conforming to  IS: 15622 (thickness to be specified by the manufacturer), of approved  make, in all colours, shades except burgundy, bottle green, black of  any size as approved by Engineer-in-Charge, in skirting, risers of steps  and dados, over 12 mm thick bed of cement mortar 1:3 (1 cement : 3  coarse sand) and jointing with grey cement slurry @ 3.3kg per sqm,  including pointing in white cement mixed with pigment of matching shade complete.",
    "boqQty": 220.14,
    "measuredQty": 220.14,
    "difference": 0.0,
    "unit": "Sqm",
    "rate": 1063.45,
    "boqAmount": 234108,
    "measuredAmount": 234107.88,
    "varianceAmount": -0.12,
    "status": "MATCH"
  },
  {
    "itemNo": 9,
    "dsrCode": "13.26",
    "description": "Providing and applying plaster of paris putty of 2 mm thickness over  plastered surface to prepare the surface even and smooth complete.",
    "boqQty": 559.89,
    "measuredQty": 559.89,
    "difference": 0.0,
    "unit": "Sqm",
    "rate": 214.3,
    "boqAmount": 119984,
    "measuredAmount": 119984.43,
    "varianceAmount": 0.43,
    "status": "MATCH"
  },
  {
    "itemNo": 10,
    "dsrCode": "13.85",
    "description": "Applying priming coats with primer of approved brand and manufacture, having low VOC (Volatile Organic Compound ) content 13.85.3 With water thinnable cement primer on wall surface having VOC content less than 50 grams/litre",
    "boqQty": 2400.0,
    "measuredQty": 2400.0,
    "difference": 0.0,
    "unit": "Sqm",
    "rate": 64.45,
    "boqAmount": 154680,
    "measuredAmount": 154680.0,
    "varianceAmount": 0.0,
    "status": "MATCH"
  },
  {
    "itemNo": 11,
    "dsrCode": "13.83",
    "description": "Wall painting with premium acrylic emulsion paint of interior grade, having VOC (Volatile Organic Compound ) content less than 50 grams/ litre of approved brand and manufacture, including applying additional coats wherever required to achieve even shade and colour.\n13.83.2 Two coats",
    "boqQty": 1768.2,
    "measuredQty": 1768.2,
    "difference": 0.0,
    "unit": "Sqm",
    "rate": 121.55,
    "boqAmount": 214925,
    "measuredAmount": 214924.71,
    "varianceAmount": -0.29,
    "status": "MATCH"
  },
  {
    "itemNo": 12,
    "dsrCode": "13.48A",
    "description": "Finishing walls with 100% Premium acrylic emulsion paint having  VOC less than 50 gm/litre and UV resistance as per IS 15489:2004,  Alkali & fungal resistance, dirt resistance exterior paint of required  shade  (Company Depot Tinted) with silicon additives.  \n13.48A.1 New work (Two or more coats applied @ 1.43 litre/ 10  sqm. Over and including priming coat of exterior primer\n applied @ 0.90 litre/10 sqm.",
    "boqQty": 631.8,
    "measuredQty": 631.8,
    "difference": 0.0,
    "unit": "Sqm",
    "rate": 154.45,
    "boqAmount": 97582,
    "measuredAmount": 97581.51,
    "varianceAmount": -0.49,
    "status": "MATCH"
  },
  {
    "itemNo": 13,
    "dsrCode": "15.12.1",
    "description": "Dismantling doors, windows and clerestory windows (steel or wood) shutter including chowkhats, architrave, holdfasts etc. complete and stacking within 50 metres lead: 15.12.1 Of area 3 sq. metres and below",
    "boqQty": 11.0,
    "measuredQty": 11.0,
    "difference": 0.0,
    "unit": "Each",
    "rate": 302.7,
    "boqAmount": 3330,
    "measuredAmount": 3329.7,
    "varianceAmount": -0.3,
    "status": "MATCH"
  },
  {
    "itemNo": 14,
    "dsrCode": "9.1.3",
    "description": "Providing wood work in frames of doors, windows, clerestory windows and other frames, wrought framed and fixed in position with hold fast lugs or with dash fasteners: 9.1.3 Kiln seasoned and chemically treated hollock wood",
    "boqQty": 0.36,
    "measuredQty": 0.36,
    "difference": 0.0,
    "unit": "Cum",
    "rate": 74199.7,
    "boqAmount": 26712,
    "measuredAmount": 26711.89,
    "varianceAmount": -0.11,
    "status": "MATCH"
  },
  {
    "itemNo": 15,
    "dsrCode": "9.5.2.1",
    "description": "Providing and fixing panelled or panelled and glazed shutters for doors, windows and clerestory windows, fixing with butt hinges of required size: 9.5.2.1 35 mm thick shutters",
    "boqQty": 16.7,
    "measuredQty": 16.7,
    "difference": 0.0,
    "unit": "Sqm",
    "rate": 2511.95,
    "boqAmount": 41950,
    "measuredAmount": 41949.56,
    "varianceAmount": -0.44,
    "status": "MATCH"
  },
  {
    "itemNo": 16,
    "dsrCode": "10.17",
    "description": "Providing and fixing M.S. fan clamp type I or II of 16 mm dia M.S. bar, bent to shape with hooked ends in R.C.C. slabs or beams during laying,  including painting the exposed portion of loop, all as per standard design  complete.",
    "boqQty": 2.0,
    "measuredQty": 2.0,
    "difference": 0.0,
    "unit": "Each",
    "rate": 185.95,
    "boqAmount": 372,
    "measuredAmount": 371.9,
    "varianceAmount": -0.1,
    "status": "MATCH"
  },
  {
    "itemNo": 17,
    "dsrCode": "10.14",
    "description": "Providing and fixing pressed steel door frames conforming to IS: 4351,  manufactured from commercial mild steel sheet of 1.60 mm thickness,  including hinges, jamb, lock jamb, bead and if required angle threshold  of mild steel angle of section 50x25 mm, or base ties of 1.60 mm,  pressed mild steel welded or rigidly fixed together by mechanical means,  including M.S. pressed butt hinges 2.5 mm thick with mortar guards,  lock strike-plate and shock absorbers as specified and applying a coat  of approved steel primer after pre-treatment of the surface as directed  by Engineer-in-charge:\n10.14.1.1  Fixing with adjustable lugs with split end tail to  each jamb",
    "boqQty": 10.5,
    "measuredQty": 10.5,
    "difference": 0.0,
    "unit": "Rm",
    "rate": 444.5,
    "boqAmount": 4667,
    "measuredAmount": 4667.25,
    "varianceAmount": 0.25,
    "status": "MATCH"
  },
  {
    "itemNo": 18,
    "dsrCode": "9.2",
    "description": "Providing and fixing ISI marked flush door shutters conforming to IS :  2202 (Part I) decorative type, core of block board construction with  frame of 1st class hard wood and well matched teak 3 ply veneering  with vertical grains or cross bands and face veneers on both faces of  shutters.    \n9.20.1  35 mm thick including ISI marked Stainless Steel butt hinges  with necessary screws.",
    "boqQty": 4.2,
    "measuredQty": 4.2,
    "difference": 0.0,
    "unit": "Sqm",
    "rate": 3086.1,
    "boqAmount": 12962,
    "measuredAmount": 12961.62,
    "varianceAmount": -0.38,
    "status": "MATCH"
  },
  {
    "itemNo": 19,
    "dsrCode": "9.96",
    "description": "Providing and fixing aluminium sliding door bolts, ISI marked anodised  (anodic coating not less than grade AC 10 as per IS : 1868),  transparent or dyed to required colour or shade, with nuts and screws  etc. complete  9.96.1 300x16 mm",
    "boqQty": 4.0,
    "measuredQty": 4.0,
    "difference": 0.0,
    "unit": "Each",
    "rate": 260.3,
    "boqAmount": 1041,
    "measuredAmount": 1041.2,
    "varianceAmount": 0.2,
    "status": "MATCH"
  },
  {
    "itemNo": 20,
    "dsrCode": "9.97",
    "description": "Providing and fixing aluminium tower bolts, ISI marked, anodised (anodic  coating not less than grade AC 10 as per IS : 1868 ) transparent or dyed  to required colour or shade, with necessary screws etc. complete :\n 9.97.1 300x10 mm",
    "boqQty": 2.0,
    "measuredQty": 2.0,
    "difference": 0.0,
    "unit": "Each",
    "rate": 117.65,
    "boqAmount": 235,
    "measuredAmount": 235.3,
    "varianceAmount": 0.3,
    "status": "MATCH"
  },
  {
    "itemNo": 21,
    "dsrCode": "9.1",
    "description": "Providing and fixing aluminium handles, ISI marked, anodised (anodic  coating not less than grade AC 10 as per IS : 1868) transparent or dyed  to required colour or shade, with necessary screws etc. complete  \n9.100.1 125 mm",
    "boqQty": 2.0,
    "measuredQty": 2.0,
    "difference": 0.0,
    "unit": "Each",
    "rate": 60.05,
    "boqAmount": 120,
    "measuredAmount": 120.1,
    "varianceAmount": 0.1,
    "status": "MATCH"
  },
  {
    "itemNo": 22,
    "dsrCode": "9.119",
    "description": "Providing and fixing factory made P.V.C. door frame of size 50x47 mm with awall thickness of 5 mm, made out of extruded 5mm rigid PVC foam sheet, mitred at corners and joined with 2 Nos of 150 mm long brackets of 15x15 mm M.S. square tube, the vertical door frame profiles to be reinforced with 19x19 mm M.S. square tube of 19 gauge, EPDM rubber gasket weather seal to be provided through out the frame. The door frame to be fixed to the wall using M.S. screws of 65/100 mm size, complete as per manufacturer\u2019s specification and direction of Engineerin- Charge.",
    "boqQty": 69.3,
    "measuredQty": 69.3,
    "difference": 0.0,
    "unit": "Rm",
    "rate": 408.25,
    "boqAmount": 28292,
    "measuredAmount": 28291.72,
    "varianceAmount": -0.28,
    "status": "MATCH"
  },
  {
    "itemNo": 23,
    "dsrCode": "9.12",
    "description": "Providing and fixing factory made panel PVC door shutter consisting of frame made out of M.S. tubes of 19 gauge thickness and size of 19 mm x 19 mm for styles and 15x15 mm for top & bottom rails. M.S. frame shall have a coat of steel primers of approved make and manufacture.M.S. frame covered with 5 mm thick heat moulded PVC 'C' channel of size 30 mm thickness, 70 mm width out of which 50 mm shall be flat and 20 mm shall be tapered in 45 degree angle on both side forming styles and 5 mm thick, 95 mm wide PVC sheet out of which 75mm shall be flat and 20 mm shall be tapered in 45 degree on the inner side to form top and bottom rail and 115 mm wide PVC sheet out of which 75 mm shall be flat and 20 mm shall be tapered on both sides to form lock rail. Top, bottom and lock rails shall be provided both side of the panel. 10 mm (5 mm x 2 ) thick, 20 mm wide cross PVC sheet be provided as gap insert for top rail & bottom rail, paneling of 5 mm thick both side PVC sheet to be fitted in the M.S. frame welded/ sealed to the styles & rails with 7 mm (5 mm+2 mm) thick x 15 mm wide PVC sheet beading on inner side, and joined together with solvent cement adhesive. An additional 5 mm thick PVC strip of 20 mm width is to be stuck on the interior side of the 'C' Channel using PVC solvent adhesive etc. complete as per direction of Engineer-in-charge, manufacturer's specification & drawing. 9.120.1 30 mm thick plain PVC door shutters",
    "boqQty": 22.05,
    "measuredQty": 22.05,
    "difference": 0.0,
    "unit": "Sqm",
    "rate": 2455.1,
    "boqAmount": 54135,
    "measuredAmount": 54134.96,
    "varianceAmount": -0.04,
    "status": "MATCH"
  },
  {
    "itemNo": 24,
    "dsrCode": "10.16",
    "description": "Steel work in built up tubular (round, square or rectangular hollow tubes etc.) trusses etc., including cutting, hoisting, fixing in position and applying a priming coat of approved steel primer, including welding and bolted with special shaped washers etc. complete.\n10.16.2 Hot finished seamless type tubes (60x60x3.2)",
    "boqQty": 281.0,
    "measuredQty": 281.0,
    "difference": 0.0,
    "unit": "Kg",
    "rate": 168.95,
    "boqAmount": 47475,
    "measuredAmount": 47474.95,
    "varianceAmount": -0.05,
    "status": "MATCH"
  },
  {
    "itemNo": 25,
    "dsrCode": "12.50",
    "description": "Providing and fixing precoated galvanised iron profile sheets (size, shape and pitch of corrugation as approved by Engineer-in-charge) 0.50 mm (+ 0.05 %) total coated thickness with zinc coating 120 grams per sqm as per IS: 277, in 240 mpa steel grade, 5-7 microns epoxy primer on both side of the sheet and polyester top coat 15-18 microns. Sheet should have protective guard film of 25 microns minimum to avoid scratches during transportation and should be supplied in single length upto 12 metre or as desired by Engineer in-charge. The sheet shall be fixed using self drilling /self tapping screws of size (5.5x 55 mm) with EPDM seal, complete upto any pitch in horizontal/ vertical or curved surfaces, excluding the cost of purlins, rafters and trusses and including cutting to size and shape wherever required.",
    "boqQty": 237.2,
    "measuredQty": 237.2,
    "difference": 0.0,
    "unit": "Sqm",
    "rate": 671.55,
    "boqAmount": 159292,
    "measuredAmount": 159291.66,
    "varianceAmount": -0.34,
    "status": "MATCH"
  },
  {
    "itemNo": 26,
    "dsrCode": "12.4.2",
    "description": "Providing ridges or hips of width 60 cm overall width plain G.S. sheet fixed with polymer coated J or L hooks, bolts and nuts 8 mm dia G.I. limpet and bitumen washers complete. 12.4.2 / 0.63 mm thick with zinc coating not less than 275 gm/m2",
    "boqQty": 20.5,
    "measuredQty": 20.5,
    "difference": 0.0,
    "unit": "Rm",
    "rate": 750.85,
    "boqAmount": 15392,
    "measuredAmount": 15392.43,
    "varianceAmount": 0.43,
    "status": "MATCH"
  },
  {
    "itemNo": 27,
    "dsrCode": "12.52",
    "description": "Providing and fixing tiled false ceiling of specified materials of size 595x595 mm in true horizontal level, suspended on inter locking metal grid of hot dipped galvanized steel sections ( galvanized @ 120 grams/ sqm, both side inclusive) consisting of main \"T\" runner with suitably spaced joints to get required length and of size 24x38 mm made from 0.30 mm thick (minimum) sheet, spaced at 1200 mm center to center and cross \"T\" of size 24x25 mm made of 0.30 mm thick (minimum) sheet, 1200 mm long spaced between main \"T\" at 600 mm center to center to form a grid of 1200x600 mm and secondary cross \"T\" of length 600 mm and size 24x25 mm made of 0.30 mm thick (minimum) sheet to be interlocked at middle of the 1200x600 mm panel to form grids of 600x600 mm and wall angle of size 24x24x0.3 mm and laying false ceiling tiles of approved texture in the grid including, required cutting/making, opening for services like diffusers, grills, light fittings, fixtures, smoke detectors etc. Main\"T\" runners to be suspended from ceiling using GI slotted cleats ofsize 27 x 37 x 25 x1.6 mm fixed to ceiling with 12.5 mm dia and 50mm long dash fasteners, 4 mm GI adjustable rods with galvanisedbutterfly level clips of size 85 x 30 x 0.8 mm spaced at 1200 mmcenter to center along main T, bottom exposed width of 24 mm of allT-sections shall be pre-painted with polyester paint, all complete forall heights as per specifications, drawings and as rected byEngineer-in-charge.\n12.52.3  12.5 mm thick square edge PVC Laminated Gypsum Tile of size 595x595 mm, made of Gypsum plasterboard, manufactured from natural gypsum as per IS 2095 part I and laminated with white 0.16mm thick fire retardant PVC film on the face side and 12micron metalized polyester on the back side with all edges sealed with",
    "boqQty": 146.92,
    "measuredQty": 146.92,
    "difference": 0.0,
    "unit": "Sqm",
    "rate": 1948.95,
    "boqAmount": 286340,
    "measuredAmount": 286339.73,
    "varianceAmount": -0.27,
    "status": "MATCH"
  },
  {
    "itemNo": 28,
    "dsrCode": "16.78",
    "description": "Construction of granular sub-base by providing close graded Material  conforming to specifications, mixing in a mechanical mix plant at  OMC, carriage of mixed material by tippers to work site, for all leads  & lifts, spreading in uniform layers of specified thickness with motor  grader on prepared surface and compacting with vibratory power roller  to achieve the desired density, complete as per specifications and  directions of Engineer-in-Charge.\n 16.78.1 With material conforming to Grade-I (size range 75 mm to  0.075 mm) having CBR Value-30",
    "boqQty": 23.65,
    "measuredQty": 23.65,
    "difference": 0.0,
    "unit": "Cum",
    "rate": 2658.1,
    "boqAmount": 62864,
    "measuredAmount": 62864.06,
    "varianceAmount": 0.06,
    "status": "MATCH"
  },
  {
    "itemNo": 29,
    "dsrCode": "16.68",
    "description": "Providing and laying 60mm thick factory made cement concrete  interlocking paver block of M -30 grade made by block making  machine with strong vibratory compaction, of approved size, design  & shape, laid in required colour and pattern over and including 50mm  thick compacted bed of coarse sand, filling the joints with line sand  etc. all complete as per the direction of Engineer-in-charge.",
    "boqQty": 236.5,
    "measuredQty": 236.5,
    "difference": 0.0,
    "unit": "Sqm",
    "rate": 951.0,
    "boqAmount": 224912,
    "measuredAmount": 224911.5,
    "varianceAmount": -0.5,
    "status": "MATCH"
  }
];
