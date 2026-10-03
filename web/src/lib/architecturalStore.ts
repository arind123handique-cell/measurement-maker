import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from './supabaseClient';
import type { Building, Floor, Room, Opening, SyncStatus, BuildingType, OpeningType } from '../types/architectural';
import {
  DEFAULT_PROJECT_ID,
  INITIAL_BUILDINGS,
  INITIAL_FLOORS,
  INITIAL_ROOMS,
  INITIAL_OPENINGS,
} from './mockData';
import { roundTo } from './utils';

const STORAGE_KEYS = {
  BUILDINGS: 'mm_buildings',
  FLOORS: 'mm_floors',
  ROOMS: 'mm_rooms',
  OPENINGS: 'mm_openings',
  ACTIVE_BUILDING: 'mm_active_building_id',
};

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Local Storage Helpers
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    return JSON.parse(stored);
  } catch (err) {
    console.warn(`Error loading ${key} from storage:`, err);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error saving ${key} to storage:`, err);
  }
}

export function useArchitecturalStore() {
  const [buildings, setBuildings] = useState<Building[]>(() =>
    loadFromStorage(STORAGE_KEYS.BUILDINGS, INITIAL_BUILDINGS)
  );
  const [floors, setFloors] = useState<Floor[]>(() =>
    loadFromStorage(STORAGE_KEYS.FLOORS, INITIAL_FLOORS)
  );
  const [rooms, setRooms] = useState<Room[]>(() =>
    loadFromStorage(STORAGE_KEYS.ROOMS, INITIAL_ROOMS)
  );
  const [openings, setOpenings] = useState<Opening[]>(() =>
    loadFromStorage(STORAGE_KEYS.OPENINGS, INITIAL_OPENINGS)
  );
  const [activeBuildingId, setActiveBuildingIdState] = useState<string | null>(() => {
    const stored = loadFromStorage<string | null>(STORAGE_KEYS.ACTIVE_BUILDING, null);
    if (stored && INITIAL_BUILDINGS.some((b) => b.id === stored)) return stored;
    return INITIAL_BUILDINGS[0]?.id || null;
  });

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('syncing');
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Monitor browser online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('local');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save to local storage whenever state changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.BUILDINGS, buildings);
  }, [buildings]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.FLOORS, floors);
  }, [floors]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ROOMS, rooms);
  }, [rooms]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.OPENINGS, openings);
  }, [openings]);

  useEffect(() => {
    if (activeBuildingId) {
      saveToStorage(STORAGE_KEYS.ACTIVE_BUILDING, activeBuildingId);
    }
  }, [activeBuildingId]);

  const setActiveBuildingId = useCallback((id: string) => {
    setActiveBuildingIdState(id);
    setSelectedRoomId(null);
  }, []);

  // Sync / Hydrate with Supabase
  const syncWithSupabase = useCallback(async () => {
    setSyncStatus('syncing');
    setLastSyncError(null);

    try {
      // 1. Fetch buildings from Supabase
      const { data: cloudBuildings, error: bErr } = await supabase
        .from('buildings')
        .select('*')
        .order('created_at', { ascending: true });

      if (bErr) throw bErr;

      // If remote database has buildings, pull full state
      if (cloudBuildings && cloudBuildings.length > 0) {
        const mappedBuildings: Building[] = cloudBuildings.map((b) => ({
          id: b.id,
          project_id: b.project_id,
          name: b.name,
          type: b.type,
          num_floors: b.num_floors || 1,
          height: b.height || 3.05,
          length: b.length,
          breadth: b.breadth,
          carpet_area: b.carpet_area,
          plinth_area: b.plinth_area,
          total_built_up_area: b.total_built_up_area,
          wall_thickness: b.wall_thickness,
          created_at: b.created_at,
          updated_at: b.updated_at,
        }));

        const { data: cloudFloors } = await supabase.from('floors').select('*');
        const { data: cloudRooms } = await supabase.from('rooms').select('*');
        const { data: cloudOpenings } = await supabase.from('openings').select('*');

        const mappedFloors: Floor[] = (cloudFloors || []).map((f) => ({
          id: f.id,
          building_id: f.building_id,
          floor_number: f.floor_number,
          floor_name: f.floor_name || `Floor ${f.floor_number}`,
          height: f.height,
        }));

        const mappedRooms: Room[] = (cloudRooms || []).map((r) => {
          const l = r.length || 0;
          const b = r.breadth || 0;
          return {
            id: r.id,
            building_id: r.building_id,
            floor_id: r.floor_id,
            name: r.name,
            room_type: r.room_type,
            length: l,
            breadth: b,
            height: r.height || 3.05,
            carpet_area: r.carpet_area || roundTo(l * b, 2),
            perimeter: roundTo(2 * (l + b), 3),
            notes: r.notes,
            created_at: r.created_at,
          };
        });

        const mappedOpenings: Opening[] = (cloudOpenings || []).map((o) => ({
          id: o.id,
          building_id: o.building_id,
          room_id: o.room_id || '',
          floor_id: o.floor_id,
          opening_type: (o.opening_type as OpeningType) || 'Door',
          mark: o.mark || 'D1',
          quantity: o.quantity || 1,
          width: o.width,
          height: o.height,
          thickness: o.thickness,
          frame_material: o.frame_material,
          shutter_material: o.shutter_material,
          notes: o.notes,
          created_at: o.created_at,
        }));

        setBuildings(mappedBuildings);
        setFloors(mappedFloors);
        setRooms(mappedRooms);
        setOpenings(mappedOpenings);

        if (!activeBuildingId || !mappedBuildings.some((b) => b.id === activeBuildingId)) {
          setActiveBuildingIdState(mappedBuildings[0]?.id || null);
        }

        setSyncStatus('synced');
      } else {
        // Cloud is empty, seed initial Assam Type templates into Supabase
        const currentB = buildings.length > 0 ? buildings : INITIAL_BUILDINGS;
        const currentF = floors.length > 0 ? floors : INITIAL_FLOORS;
        const currentR = rooms.length > 0 ? rooms : INITIAL_ROOMS;
        const currentO = openings.length > 0 ? openings : INITIAL_OPENINGS;

        for (const b of currentB) {
          await supabase.from('buildings').upsert({
            id: b.id,
            project_id: b.project_id || DEFAULT_PROJECT_ID,
            name: b.name,
            type: b.type,
            num_floors: b.num_floors,
            height: b.height,
            length: b.length,
            breadth: b.breadth,
            carpet_area: b.carpet_area,
            plinth_area: b.plinth_area,
            total_built_up_area: b.total_built_up_area,
            wall_thickness: b.wall_thickness,
          });
        }

        for (const f of currentF) {
          await supabase.from('floors').upsert({
            id: f.id,
            building_id: f.building_id,
            floor_number: f.floor_number,
            floor_name: f.floor_name,
            height: f.height,
          });
        }

        for (const r of currentR) {
          await supabase.from('rooms').upsert({
            id: r.id,
            building_id: r.building_id,
            floor_id: r.floor_id,
            name: r.name,
            room_type: r.room_type,
            length: r.length,
            breadth: r.breadth,
            height: r.height,
            carpet_area: r.carpet_area,
            notes: r.notes,
          });
        }

        for (const o of currentO) {
          await supabase.from('openings').upsert({
            id: o.id,
            building_id: o.building_id,
            room_id: o.room_id,
            floor_id: o.floor_id,
            opening_type: o.opening_type,
            mark: o.mark,
            quantity: o.quantity,
            width: o.width,
            height: o.height,
            frame_material: o.frame_material,
            shutter_material: o.shutter_material,
            notes: o.notes,
          });
        }

        setBuildings(currentB);
        setFloors(currentF);
        setRooms(currentR);
        setOpenings(currentO);
        if (!activeBuildingId) {
          setActiveBuildingIdState(currentB[0]?.id || null);
        }

        setSyncStatus('synced');
      }
    } catch (err: unknown) {
      console.warn('Supabase sync warning (operating in local fallback mode):', err);
      setSyncStatus('local');
      setLastSyncError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsInitializing(false);
    }
  }, [activeBuildingId, buildings, floors, rooms, openings]);

  // Initial sync on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        await syncWithSupabase();
      } catch {
        if (isMounted) {
          // Handled inside syncWithSupabase
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Building Actions
  const addBuilding = useCallback(
    async (data: {
      name: string;
      type: BuildingType;
      num_floors: number;
      height: number;
      length?: number;
      breadth?: number;
    }) => {
      const newBuildingId = generateUUID();
      const newFloorId = generateUUID();

      const newBuilding: Building = {
        id: newBuildingId,
        project_id: DEFAULT_PROJECT_ID,
        name: data.name.trim(),
        type: data.type,
        num_floors: data.num_floors || 1,
        height: data.height || 3.05,
        length: data.length ?? null,
        breadth: data.breadth ?? null,
        carpet_area: data.length && data.breadth ? roundTo(data.length * data.breadth, 2) : null,
        plinth_area: null,
        total_built_up_area: null,
        wall_thickness: 0.25,
        created_at: new Date().toISOString(),
      };

      const newFloor: Floor = {
        id: newFloorId,
        building_id: newBuildingId,
        floor_number: 0,
        floor_name: 'Ground Floor',
        height: data.height || 3.05,
      };

      setBuildings((prev) => [newBuilding, ...prev]);
      setFloors((prev) => [...prev, newFloor]);
      setActiveBuildingIdState(newBuildingId);

      // Async cloud sync
      try {
        await supabase.from('buildings').insert({
          id: newBuilding.id,
          project_id: newBuilding.project_id,
          name: newBuilding.name,
          type: newBuilding.type,
          num_floors: newBuilding.num_floors,
          height: newBuilding.height,
          length: newBuilding.length,
          breadth: newBuilding.breadth,
          carpet_area: newBuilding.carpet_area,
          wall_thickness: newBuilding.wall_thickness,
        });

        await supabase.from('floors').insert({
          id: newFloor.id,
          building_id: newFloor.building_id,
          floor_number: newFloor.floor_number,
          floor_name: newFloor.floor_name,
          height: newFloor.height,
        });

        setSyncStatus('synced');
      } catch (err: unknown) {
        console.warn('Failed to sync new building to Supabase:', err);
        setSyncStatus('local');
      }

      return newBuilding;
    },
    []
  );

  const updateBuilding = useCallback(
    async (id: string, updates: Partial<Building>) => {
      setBuildings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...updates, updated_at: new Date().toISOString() } : b))
      );

      try {
        await supabase
          .from('buildings')
          .update({
            name: updates.name,
            type: updates.type,
            num_floors: updates.num_floors,
            height: updates.height,
            length: updates.length,
            breadth: updates.breadth,
            carpet_area: updates.carpet_area,
            plinth_area: updates.plinth_area,
            total_built_up_area: updates.total_built_up_area,
            wall_thickness: updates.wall_thickness,
          })
          .eq('id', id);

        setSyncStatus('synced');
      } catch (err: unknown) {
        console.warn('Failed to sync updated building to Supabase:', err);
        setSyncStatus('local');
      }
    },
    []
  );

  const deleteBuilding = useCallback(
    async (id: string) => {
      setBuildings((prev) => {
        const remaining = prev.filter((b) => b.id !== id);
        if (activeBuildingId === id) {
          setActiveBuildingIdState(remaining[0]?.id || null);
        }
        return remaining;
      });
      setFloors((prev) => prev.filter((f) => f.building_id !== id));
      setRooms((prev) => prev.filter((r) => r.building_id !== id));
      setOpenings((prev) => prev.filter((o) => o.building_id !== id));

      try {
        await supabase.from('buildings').delete().eq('id', id);
        setSyncStatus('synced');
      } catch (err: unknown) {
        console.warn('Failed to delete building from Supabase:', err);
        setSyncStatus('local');
      }
    },
    [activeBuildingId]
  );

  // Room Actions
  const addRoom = useCallback(
    async (data: {
      building_id: string;
      floor_id?: string;
      name: string;
      length: number;
      breadth: number;
      height?: number;
      room_type?: string;
      notes?: string;
    }) => {
      const activeBuilding = buildings.find((b) => b.id === data.building_id);
      const bHeight = activeBuilding?.height || 3.05;
      const roomHeight = data.height ?? bHeight;

      // Find or assign floor
      let floorId = data.floor_id;
      if (!floorId) {
        const existingFloor = floors.find((f) => f.building_id === data.building_id);
        if (existingFloor) {
          floorId = existingFloor.id;
        } else {
          floorId = generateUUID();
          const newFloor: Floor = {
            id: floorId,
            building_id: data.building_id,
            floor_number: 0,
            floor_name: 'Ground Floor',
            height: roomHeight,
          };
          setFloors((prev) => [...prev, newFloor]);
          // Sync floor if needed
          try {
            await supabase.from('floors').insert({
              id: newFloor.id,
              building_id: newFloor.building_id,
              floor_number: newFloor.floor_number,
              floor_name: newFloor.floor_name,
              height: newFloor.height,
            });
          } catch (e) {
            console.warn(e);
          }
        }
      }

      const l = roundTo(data.length, 3);
      const b = roundTo(data.breadth, 3);
      const carpetArea = roundTo(l * b, 2);
      const perimeter = roundTo(2 * (l + b), 3);

      const newRoom: Room = {
        id: generateUUID(),
        building_id: data.building_id,
        floor_id: floorId,
        name: data.name.trim(),
        room_type: data.room_type || 'Bed Room',
        length: l,
        breadth: b,
        height: roundTo(roomHeight, 2),
        carpet_area: carpetArea,
        perimeter: perimeter,
        notes: data.notes || '',
        created_at: new Date().toISOString(),
      };

      setRooms((prev) => [newRoom, ...prev]);

      try {
        await supabase.from('rooms').insert({
          id: newRoom.id,
          building_id: newRoom.building_id,
          floor_id: newRoom.floor_id,
          name: newRoom.name,
          room_type: newRoom.room_type,
          length: newRoom.length,
          breadth: newRoom.breadth,
          height: newRoom.height,
          carpet_area: newRoom.carpet_area,
          notes: newRoom.notes,
        });

        setSyncStatus('synced');
      } catch (err: unknown) {
        console.warn('Failed to sync new room to Supabase:', err);
        setSyncStatus('local');
      }

      return newRoom;
    },
    [buildings, floors]
  );

  const updateRoom = useCallback(
    async (roomId: string, updates: Partial<Room>) => {
      setRooms((prev) =>
        prev.map((r) => {
          if (r.id !== roomId) return r;

          const length = updates.length !== undefined ? updates.length : r.length;
          const breadth = updates.breadth !== undefined ? updates.breadth : r.breadth;
          const height = updates.height !== undefined ? updates.height : r.height;
          const carpetArea = roundTo(length * breadth, 2);
          const perimeter = roundTo(2 * (length + breadth), 3);

          return {
            ...r,
            ...updates,
            length,
            breadth,
            height,
            carpet_area: carpetArea,
            perimeter: perimeter,
          };
        })
      );

      try {
        const roomToUpdate = rooms.find((r) => r.id === roomId);
        if (!roomToUpdate) return;

        const newL = updates.length ?? roomToUpdate.length;
        const newB = updates.breadth ?? roomToUpdate.breadth;
        const newH = updates.height ?? roomToUpdate.height;

        await supabase
          .from('rooms')
          .update({
            name: updates.name ?? roomToUpdate.name,
            room_type: updates.room_type !== undefined ? updates.room_type : roomToUpdate.room_type,
            length: newL,
            breadth: newB,
            height: newH,
            carpet_area: roundTo(newL * newB, 2),
            notes: updates.notes !== undefined ? updates.notes : roomToUpdate.notes,
          })
          .eq('id', roomId);

        setSyncStatus('synced');
      } catch (err: unknown) {
        console.warn('Failed to sync updated room to Supabase:', err);
        setSyncStatus('local');
      }
    },
    [rooms]
  );

  const deleteRoom = useCallback(
    async (roomId: string) => {
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
      setOpenings((prev) => prev.filter((o) => o.room_id !== roomId));
      if (selectedRoomId === roomId) {
        setSelectedRoomId(null);
      }

      try {
        await supabase.from('rooms').delete().eq('id', roomId);
        setSyncStatus('synced');
      } catch (err: unknown) {
        console.warn('Failed to delete room from Supabase:', err);
        setSyncStatus('local');
      }
    },
    [selectedRoomId]
  );

  const duplicateRoom = useCallback(
    async (roomId: string) => {
      const source = rooms.find((r) => r.id === roomId);
      if (!source) return;

      const newRoomId = generateUUID();
      const clonedRoom: Room = {
        ...source,
        id: newRoomId,
        name: `${source.name} (Copy)`,
        created_at: new Date().toISOString(),
      };

      const sourceOpenings = openings.filter((o) => o.room_id === roomId);
      const clonedOpenings: Opening[] = sourceOpenings.map((o) => ({
        ...o,
        id: generateUUID(),
        room_id: newRoomId,
        created_at: new Date().toISOString(),
      }));

      setRooms((prev) => [clonedRoom, ...prev]);
      setOpenings((prev) => [...prev, ...clonedOpenings]);

      try {
        await supabase.from('rooms').insert({
          id: clonedRoom.id,
          building_id: clonedRoom.building_id,
          floor_id: clonedRoom.floor_id,
          name: clonedRoom.name,
          room_type: clonedRoom.room_type,
          length: clonedRoom.length,
          breadth: clonedRoom.breadth,
          height: clonedRoom.height,
          carpet_area: clonedRoom.carpet_area,
          notes: clonedRoom.notes,
        });

        for (const o of clonedOpenings) {
          await supabase.from('openings').insert({
            id: o.id,
            building_id: o.building_id,
            room_id: o.room_id,
            floor_id: o.floor_id,
            opening_type: o.opening_type,
            mark: o.mark,
            quantity: o.quantity,
            width: o.width,
            height: o.height,
            frame_material: o.frame_material,
            shutter_material: o.shutter_material,
            notes: o.notes,
          });
        }

        setSyncStatus('synced');
      } catch (err: unknown) {
        console.warn('Failed to sync duplicated room to Supabase:', err);
        setSyncStatus('local');
      }

      return clonedRoom;
    },
    [rooms, openings]
  );

  // Opening Actions
  const addOpening = useCallback(
    async (
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
    ) => {
      const room = rooms.find((r) => r.id === roomId);
      if (!room) return;

      const newOpening: Opening = {
        id: generateUUID(),
        building_id: room.building_id,
        room_id: roomId,
        floor_id: room.floor_id,
        opening_type: data.opening_type,
        mark: data.mark.trim() || (data.opening_type === 'Door' ? 'D1' : data.opening_type === 'Window' ? 'W1' : 'V1'),
        quantity: Number(data.quantity) || 1,
        width: roundTo(Number(data.width), 3),
        height: roundTo(Number(data.height), 3),
        thickness: data.thickness ?? null,
        frame_material: data.frame_material || null,
        shutter_material: data.shutter_material || null,
        notes: data.notes || '',
        created_at: new Date().toISOString(),
      };

      setOpenings((prev) => [...prev, newOpening]);

      try {
        await supabase.from('openings').insert({
          id: newOpening.id,
          building_id: newOpening.building_id,
          room_id: newOpening.room_id,
          floor_id: newOpening.floor_id,
          opening_type: newOpening.opening_type,
          mark: newOpening.mark,
          quantity: newOpening.quantity,
          width: newOpening.width,
          height: newOpening.height,
          thickness: newOpening.thickness,
          frame_material: newOpening.frame_material,
          shutter_material: newOpening.shutter_material,
          notes: newOpening.notes,
        });

        setSyncStatus('synced');
      } catch (err: unknown) {
        console.warn('Failed to sync new opening to Supabase:', err);
        setSyncStatus('local');
      }

      return newOpening;
    },
    [rooms]
  );

  const updateOpening = useCallback(
    async (openingId: string, updates: Partial<Opening>) => {
      setOpenings((prev) =>
        prev.map((o) => (o.id === openingId ? { ...o, ...updates } : o))
      );

      try {
        await supabase
          .from('openings')
          .update({
            opening_type: updates.opening_type,
            mark: updates.mark,
            quantity: updates.quantity,
            width: updates.width,
            height: updates.height,
            frame_material: updates.frame_material,
            shutter_material: updates.shutter_material,
            notes: updates.notes,
          })
          .eq('id', openingId);

        setSyncStatus('synced');
      } catch (err: unknown) {
        console.warn('Failed to sync updated opening to Supabase:', err);
        setSyncStatus('local');
      }
    },
    []
  );

  const deleteOpening = useCallback(
    async (openingId: string) => {
      setOpenings((prev) => prev.filter((o) => o.id !== openingId));

      try {
        await supabase.from('openings').delete().eq('id', openingId);
        setSyncStatus('synced');
      } catch (err: unknown) {
        console.warn('Failed to delete opening from Supabase:', err);
        setSyncStatus('local');
      }
    },
    []
  );

  const resetToTemplates = useCallback(async () => {
    setBuildings(INITIAL_BUILDINGS);
    setFloors(INITIAL_FLOORS);
    setRooms(INITIAL_ROOMS);
    setOpenings(INITIAL_OPENINGS);
    setActiveBuildingIdState(INITIAL_BUILDINGS[0].id);
    setSelectedRoomId(null);
    saveToStorage(STORAGE_KEYS.BUILDINGS, INITIAL_BUILDINGS);
    saveToStorage(STORAGE_KEYS.FLOORS, INITIAL_FLOORS);
    saveToStorage(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
    saveToStorage(STORAGE_KEYS.OPENINGS, INITIAL_OPENINGS);
    saveToStorage(STORAGE_KEYS.ACTIVE_BUILDING, INITIAL_BUILDINGS[0].id);

    // Sync template into Supabase
    try {
      setSyncStatus('syncing');
      for (const b of INITIAL_BUILDINGS) {
        await supabase.from('buildings').upsert({
          id: b.id,
          project_id: b.project_id,
          name: b.name,
          type: b.type,
          num_floors: b.num_floors,
          height: b.height,
          length: b.length,
          breadth: b.breadth,
          carpet_area: b.carpet_area,
        });
      }
      for (const f of INITIAL_FLOORS) {
        await supabase.from('floors').upsert({
          id: f.id,
          building_id: f.building_id,
          floor_number: f.floor_number,
          floor_name: f.floor_name,
        });
      }
      for (const r of INITIAL_ROOMS) {
        await supabase.from('rooms').upsert({
          id: r.id,
          building_id: r.building_id,
          floor_id: r.floor_id,
          name: r.name,
          room_type: r.room_type,
          length: r.length,
          breadth: r.breadth,
          height: r.height,
          carpet_area: r.carpet_area,
          notes: r.notes,
        });
      }
      for (const o of INITIAL_OPENINGS) {
        await supabase.from('openings').upsert({
          id: o.id,
          building_id: o.building_id,
          room_id: o.room_id,
          floor_id: o.floor_id,
          opening_type: o.opening_type,
          mark: o.mark,
          quantity: o.quantity,
          width: o.width,
          height: o.height,
          frame_material: o.frame_material,
          shutter_material: o.shutter_material,
        });
      }
      setSyncStatus('synced');
    } catch {
      setSyncStatus('local');
    }
  }, []);

  // Computed values for current active building
  const activeBuilding = useMemo(
    () => buildings.find((b) => b.id === activeBuildingId) || buildings[0] || null,
    [buildings, activeBuildingId]
  );

  const activeRooms = useMemo(
    () => (activeBuilding ? rooms.filter((r) => r.building_id === activeBuilding.id) : []),
    [rooms, activeBuilding]
  );

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === selectedRoomId) || null,
    [rooms, selectedRoomId]
  );

  const selectedRoomOpenings = useMemo(
    () => (selectedRoomId ? openings.filter((o) => o.room_id === selectedRoomId) : []),
    [openings, selectedRoomId]
  );

  // Statistics across active building
  const activeBuildingStats = useMemo(() => {
    const totalRooms = activeRooms.length;
    const totalCarpetArea = roundTo(
      activeRooms.reduce((sum, r) => sum + (r.carpet_area || r.length * r.breadth), 0),
      2
    );
    const totalPerimeter = roundTo(
      activeRooms.reduce((sum, r) => sum + (r.perimeter || 2 * (r.length + r.breadth)), 0),
      3
    );

    const activeRoomIds = new Set(activeRooms.map((r) => r.id));
    const activeOpenings = openings.filter((o) => activeRoomIds.has(o.room_id));
    const totalOpeningsCount = activeOpenings.reduce((sum, o) => sum + (o.quantity || 1), 0);
    const totalOpeningArea = roundTo(
      activeOpenings.reduce((sum, o) => sum + (o.quantity || 1) * o.width * o.height, 0),
      2
    );

    return {
      totalRooms,
      totalCarpetArea,
      totalPerimeter,
      totalOpeningsCount,
      totalOpeningArea,
    };
  }, [activeRooms, openings]);

  return {
    buildings,
    floors,
    rooms,
    openings,
    activeBuilding,
    activeBuildingId: activeBuilding?.id || null,
    activeRooms,
    selectedRoom,
    selectedRoomId,
    selectedRoomOpenings,
    activeBuildingStats,
    syncStatus,
    lastSyncError,
    isOnline,
    isInitializing,
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
  };
}
