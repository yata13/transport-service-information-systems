import { supabase } from './supabase';
import {
  BajajVehicle,
  Inspection,
  InspectionResult,
  Officer,
  ReportStatus,
  SessionUser,
  TrafficViolationReport,
} from '../types';

// Column list for officers: password_hash is not readable by the public API.
const OFFICER_COLUMNS =
  'id, username, full_name, badge_number, role, phone_number, assigned_zone, is_active, is_admin, created_at';

type Row = Record<string, any>;

const str = (v: unknown, fallback = ''): string => (v === null || v === undefined ? fallback : String(v));

export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ---------- Row <-> model mappers ----------

/** A permit past its expiry date is expired, whatever the stored status says. */
export function effectiveStatus(status: BajajVehicle['status'], expiryDate: string): BajajVehicle['status'] {
  if (status === 'ACTIVE' && expiryDate) {
    const today = new Date().toISOString().slice(0, 10);
    if (expiryDate < today) return 'EXPIRED';
  }
  return status;
}

export function vehicleFromRow(r: Row): BajajVehicle {
  return {
    id: str(r.id),
    digitalId: str(r.digital_id),
    plateNumber: str(r.plate_number),
    vin: str(r.vin_chassis),
    vehicleType: str(r.vehicle_type, 'Bajaj (ባጃጅ)'),
    bajajModel: str(r.bajaj_model),
    bajajAssociation: str(r.bajaj_association),
    color: str(r.color),
    owner: str(r.owner_name),
    ownerPhone: str(r.owner_phone),
    driverName: str(r.driver_name),
    driverPhone: str(r.driver_phone),
    driverPhoto: str(r.driver_photo),
    kebele: str(r.kebele),
    address: str(r.address),
    permitNo: str(r.permit_number),
    issueDate: str(r.issue_date).slice(0, 10),
    expiryDate: str(r.expiry_date).slice(0, 10),
    authorizedArea: str(r.authorized_area),
    status: effectiveStatus((r.status || 'ACTIVE') as BajajVehicle['status'], str(r.expiry_date).slice(0, 10)),
    isBlacklisted: Boolean(r.is_blacklisted),
    blacklistReason: r.blacklist_reason ?? undefined,
    notes: r.notes ?? undefined,
    qrCodeValue: str(r.qr_code_value),
    registeredCity: str(r.registered_city, 'Gondar / ጎንደር'),
    createdAt: r.created_at ?? undefined,
  };
}

function vehicleToRow(v: BajajVehicle): Row {
  return {
    digital_id: v.digitalId,
    plate_number: v.plateNumber,
    vin_chassis: v.vin,
    vehicle_type: v.vehicleType,
    bajaj_model: v.bajajModel,
    bajaj_association: v.bajajAssociation,
    color: v.color,
    owner_name: v.owner,
    owner_phone: v.ownerPhone || null,
    driver_name: v.driverName,
    driver_phone: v.driverPhone || null,
    driver_photo: v.driverPhoto || null,
    kebele: v.kebele || null,
    address: v.address || null,
    permit_number: v.permitNo,
    issue_date: v.issueDate,
    expiry_date: v.expiryDate,
    authorized_area: v.authorizedArea,
    status: v.status,
    is_blacklisted: v.isBlacklisted,
    blacklist_reason: v.blacklistReason || null,
    notes: v.notes || null,
    qr_code_value: v.qrCodeValue,
    registered_city: v.registeredCity,
  };
}

export function reportFromRow(r: Row): TrafficViolationReport {
  const createdAt = str(r.checked_on || r.created_at);
  return {
    id: str(r.id),
    reportNumber: str(r.report_number),
    digitalId: str(r.digital_id),
    vehiclePlate: str(r.vehicle_plate),
    registeredPlate: r.registered_plate ?? undefined,
    reason: str(r.reason),
    reasonAm: str(r.reason_am),
    actionTaken: str(r.action_taken),
    fineAmount: Number(r.fine_amount) || 0,
    checkedOn: createdAt ? formatTimestamp(createdAt) : '',
    checkedBy: str(r.checked_by),
    notes: str(r.notes),
    status: (r.status || 'SUBMITTED') as ReportStatus,
    location: str(r.location),
    createdAt,
  };
}

function reportToRow(r: TrafficViolationReport): Row {
  return {
    report_number: r.reportNumber,
    digital_id: r.digitalId || '-',
    vehicle_plate: r.vehiclePlate,
    registered_plate: r.registeredPlate || null,
    reason: r.reason,
    reason_am: r.reasonAm,
    action_taken: r.actionTaken,
    fine_amount: r.fineAmount || 0,
    checked_by: r.checkedBy,
    notes: r.notes,
    status: r.status,
    location: r.location,
  };
}

export function inspectionFromRow(r: Row): Inspection {
  return {
    id: str(r.id),
    digitalId: str(r.digital_id),
    plateChecked: str(r.plate_checked),
    registeredPlate: str(r.registered_plate),
    result: r.result as InspectionResult,
    officerName: str(r.officer_name),
    badgeNumber: str(r.badge_number),
    location: str(r.location),
    source: r.source === 'web' ? 'web' : 'mobile',
    createdAt: str(r.created_at),
  };
}

export function officerFromRow(r: Row): Officer {
  return {
    id: str(r.id),
    username: str(r.username),
    fullName: str(r.full_name),
    badgeNumber: str(r.badge_number),
    role: str(r.role),
    phoneNumber: str(r.phone_number),
    assignedZone: str(r.assigned_zone),
    isActive: r.is_active !== false,
    isAdmin: r.is_admin === true,
    createdAt: r.created_at ?? undefined,
  };
}

// ---------- Helpers ----------

/** Collision-resistant report number, shared format with the mobile app. */
export function generateReportNumber(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, '0');
  return `RPT-GD-${ymd}-${rand}`;
}

function fail(error: { message: string } | null, context: string): void {
  if (error) throw new Error(`${context}: ${error.message}`);
}

// ---------- Reads ----------

export async function fetchVehicles(): Promise<BajajVehicle[]> {
  const { data, error } = await supabase.from('bajaj_vehicles').select('*').order('created_at', { ascending: false });
  fail(error, 'Loading vehicles failed');
  return (data || []).map(vehicleFromRow);
}

export async function fetchReports(): Promise<TrafficViolationReport[]> {
  const { data, error } = await supabase.from('violation_reports').select('*').order('created_at', { ascending: false });
  fail(error, 'Loading reports failed');
  return (data || []).map(reportFromRow);
}

/** Inspections from the last `days` days (the dashboard never needs more). */
export async function fetchInspections(days = 30): Promise<Inspection[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(5000);
  fail(error, 'Loading inspections failed');
  return (data || []).map(inspectionFromRow);
}

export async function fetchOfficers(): Promise<Officer[]> {
  const { data, error } = await supabase.from('officers').select(OFFICER_COLUMNS).order('full_name');
  fail(error, 'Loading officers failed');
  return (data || []).map(officerFromRow);
}

// ---------- Writes ----------

export async function insertVehicle(v: BajajVehicle): Promise<BajajVehicle> {
  const { data, error } = await supabase.from('bajaj_vehicles').insert(vehicleToRow(v)).select().single();
  fail(error, 'Saving vehicle failed');
  return vehicleFromRow(data!);
}

export async function insertReport(r: TrafficViolationReport): Promise<TrafficViolationReport> {
  const { data, error } = await supabase.from('violation_reports').insert(reportToRow(r)).select().single();
  fail(error, 'Saving report failed');
  return reportFromRow(data!);
}

export async function updateReportStatus(id: string, status: ReportStatus): Promise<void> {
  const { error } = await supabase.from('violation_reports').update({ status }).eq('id', id);
  fail(error, 'Updating report failed');
}

export async function insertInspection(i: Omit<Inspection, 'id' | 'createdAt'>): Promise<void> {
  const { error } = await supabase.from('inspections').insert({
    digital_id: i.digitalId || null,
    plate_checked: i.plateChecked || null,
    registered_plate: i.registeredPlate || null,
    result: i.result,
    officer_name: i.officerName,
    badge_number: i.badgeNumber || null,
    location: i.location || null,
    source: i.source,
  });
  fail(error, 'Logging inspection failed');
}

/** Website sign-in: only active admins get a session. */
export async function loginAdmin(username: string, password: string): Promise<SessionUser | null> {
  const { data, error } = await supabase.rpc('login_admin', {
    p_username: username.trim(),
    p_password: password,
  });
  fail(error, 'Login failed');
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.token) return null;
  return { name: row.full_name, badge: row.badge_number, role: row.role, token: row.token };
}

export async function checkAdminSession(token: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_admin_session', { p_token: token });
  fail(error, 'Session check failed');
  return data === true;
}

export async function logoutAdmin(token: string): Promise<void> {
  const { error } = await supabase.rpc('logout_admin', { p_token: token });
  fail(error, 'Logout failed');
}

export async function createOfficer(
  token: string,
  input: {
    username: string;
    password: string;
    fullName: string;
    badgeNumber: string;
    role: string;
    phoneNumber: string;
    assignedZone: string;
    isAdmin: boolean;
  }
): Promise<void> {
  const { error } = await supabase.rpc('create_officer', {
    p_token: token,
    p_username: input.username,
    p_password: input.password,
    p_full_name: input.fullName,
    p_badge_number: input.badgeNumber,
    p_role: input.role,
    p_phone_number: input.phoneNumber,
    p_assigned_zone: input.assignedZone,
    p_is_admin: input.isAdmin,
  });
  fail(error, 'Creating officer failed');
}

export async function setOfficerActive(token: string, id: string, active: boolean): Promise<void> {
  const { error } = await supabase.rpc('set_officer_active', { p_token: token, p_id: id, p_active: active });
  fail(error, 'Updating officer failed');
}

export async function changeOfficerPassword(token: string, id: string, newPassword: string): Promise<void> {
  const { error } = await supabase.rpc('change_officer_password', {
    p_token: token,
    p_id: id,
    p_new_password: newPassword,
  });
  fail(error, 'Changing password failed');
}
