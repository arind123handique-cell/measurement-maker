import type { Database } from './database.types';

export type BuildingType = Database['public']['Enums']['building_type'];

export type OpeningType = 'Door' | 'Window' | 'Ventilator';

export interface Building {
  id: string;
  project_id: string;
  name: string;
  type: BuildingType;
  num_floors: number;
  height: number; // default ceiling height in meters (default 3.05m)
  length?: number | null;
  breadth?: number | null;
  carpet_area?: number | null;
  plinth_area?: number | null;
  total_built_up_area?: number | null;
  wall_thickness?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Floor {
  id: string;
  building_id: string;
  floor_number: number;
  floor_name: string;
  height?: number | null;
}

export interface Room {
  id: string;
  building_id: string;
  floor_id: string;
  name: string;
  room_type?: string | null;
  length: number; // meters (L)
  breadth: number; // meters (B)
  height: number; // meters (H)
  carpet_area?: number | null; // calculated L * B (sqm)
  perimeter?: number | null; // calculated 2 * (L + B) (m)
  notes?: string | null;
  created_at?: string | null;
}

export interface Opening {
  id: string;
  building_id: string;
  room_id: string;
  floor_id?: string | null;
  opening_type: OpeningType;
  mark: string; // e.g. D1, W1, V
  quantity: number; // Nos
  width: number; // meters (W)
  height: number; // meters (H)
  thickness?: number | null;
  frame_material?: string | null;
  shutter_material?: string | null;
  notes?: string | null;
  created_at?: string | null;
}

export interface RoomWithOpenings extends Room {
  openings?: Opening[];
}

export type SyncStatus = 'synced' | 'syncing' | 'local' | 'error';
