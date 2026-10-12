import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  fetchInspections,
  fetchOfficers,
  fetchReports,
  fetchVehicles,
  inspectionFromRow,
  reportFromRow,
  vehicleFromRow,
} from '../lib/api';
import { INITIAL_BAJAJ_DATABASE, INITIAL_REPORTS } from '../data/mockVehicles';
import { BajajVehicle, Inspection, Officer, SyncStatus, TrafficViolationReport } from '../types';

// Safety net in case the realtime socket is blocked by a proxy/firewall.
const POLL_INTERVAL_MS = 60_000;

interface Identified {
  id: string;
}

/** Insert-or-replace by id, newest first. */
function upsert<T extends Identified>(list: T[], item: T): T[] {
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx === -1) return [item, ...list];
  const next = list.slice();
  next[idx] = item;
  return next;
}

function remove<T extends Identified>(list: T[], id: string): T[] {
  return list.filter((x) => x.id !== id);
}

export interface LiveData {
  vehicles: BajajVehicle[];
  reports: TrafficViolationReport[];
  inspections: Inspection[];
  officers: Officer[];
  status: SyncStatus;
  error: string | null;
  lastSync: Date | null;
  refresh: () => Promise<void>;
  // Local patches so the UI updates instantly after our own writes
  // (realtime will deliver the same row; upsert-by-id de-duplicates it).
  applyVehicle: (v: BajajVehicle) => void;
  applyReport: (r: TrafficViolationReport) => void;
}

export function useLiveData(enabled: boolean): LiveData {
  const [vehicles, setVehicles] = useState<BajajVehicle[]>([]);
  const [reports, setReports] = useState<TrafficViolationReport[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [restOk, setRestOk] = useState<boolean | null>(null);
  const [realtimeOk, setRealtimeOk] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const loadedOnce = useRef(false);

  const status: SyncStatus =
    restOk === false ? 'offline' : restOk === null ? 'connecting' : realtimeOk ? 'live' : 'polling';

  const refresh = useCallback(async () => {
    try {
      const [v, r, i, o] = await Promise.all([
        fetchVehicles(),
        fetchReports(),
        // Inspections/officers need the shared-backend migration; don't let
        // a missing table take the whole dashboard offline.
        fetchInspections().catch((e) => {
          console.warn(e);
          return [] as Inspection[];
        }),
        fetchOfficers().catch((e) => {
          console.warn(e);
          return [] as Officer[];
        }),
      ]);
      setVehicles(v);
      setReports(r);
      setInspections(i);
      setOfficers(o);
      setError(null);
      setLastSync(new Date());
      loadedOnce.current = true;
      setRestOk(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(msg);
      setError(msg);
      setRestOk(false);
      // Never show an empty dashboard: fall back to demo data until we reconnect.
      if (!loadedOnce.current) {
        setVehicles(INITIAL_BAJAJ_DATABASE);
        setReports(INITIAL_REPORTS);
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    refresh();

    const channel = supabase
      .channel('erp-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bajaj_vehicles' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setVehicles((l) => remove(l, String((payload.old as Identified).id)));
        } else {
          setVehicles((l) => upsert(l, vehicleFromRow(payload.new)));
        }
        setLastSync(new Date());
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'violation_reports' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setReports((l) => remove(l, String((payload.old as Identified).id)));
        } else {
          setReports((l) => upsert(l, reportFromRow(payload.new)));
        }
        setLastSync(new Date());
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'inspections' }, (payload) => {
        setInspections((l) => upsert(l, inspectionFromRow(payload.new)));
        setLastSync(new Date());
      })
      .subscribe((state) => {
        if (state === 'SUBSCRIBED') {
          setRealtimeOk(true);
          // Catch up on anything missed while the socket was down.
          if (loadedOnce.current) refresh();
        } else if (state === 'CHANNEL_ERROR' || state === 'TIMED_OUT' || state === 'CLOSED') {
          setRealtimeOk(false);
        }
      });

    const poll = window.setInterval(refresh, POLL_INTERVAL_MS);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);

    return () => {
      window.clearInterval(poll);
      window.removeEventListener('focus', onFocus);
      supabase.removeChannel(channel);
    };
  }, [enabled, refresh]);

  const applyVehicle = useCallback((v: BajajVehicle) => setVehicles((l) => upsert(l, v)), []);
  const applyReport = useCallback((r: TrafficViolationReport) => setReports((l) => upsert(l, r)), []);

  return { vehicles, reports, inspections, officers, status, error, lastSync, refresh, applyVehicle, applyReport };
}
