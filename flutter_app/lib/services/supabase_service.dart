import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/bajaj_vehicle.dart';
import '../models/violation_report.dart';

/// Result of saving a violation report.
class SubmitResult {
  /// True when the report reached the central database.
  final bool synced;

  /// True when the report was kept on the phone to be sent later (no network).
  final bool queued;

  /// Human readable reason when the report could not be saved at all.
  final String? error;

  const SubmitResult._({this.synced = false, this.queued = false, this.error});

  factory SubmitResult.synced() => const SubmitResult._(synced: true);
  factory SubmitResult.queued() => const SubmitResult._(queued: true);
  factory SubmitResult.failed(String error) => SubmitResult._(error: error);

  bool get ok => synced || queued;
}

/// The officer signed in on this phone. Every report and inspection is
/// attributed to them, so the ERP website can show who did what.
class OfficerSession {
  final String fullName;
  final String badgeNumber;
  final String role;
  final String assignedZone;

  const OfficerSession({
    required this.fullName,
    required this.badgeNumber,
    required this.role,
    this.assignedZone = '',
  });
}

class SupabaseService {
  // Last data received from the server, used only when the phone is offline.
  static final List<BajajVehicle> _cachedVehicles = List.from(initialBajajDatabase);
  static final List<TrafficViolationReport> _cachedReports = [];

  static bool isConfigured = false;
  static OfficerSession? currentOfficer;

  static const _outboxReportsKey = 'outbox_violation_reports';
  static const _outboxInspectionsKey = 'outbox_inspections';

  static SupabaseClient? get _client {
    try {
      if (isConfigured) {
        return Supabase.instance.client;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  /// Check if Supabase connection is active
  static bool get isConnected => isConfigured && _client != null;

  /// Clean string of non-alphanumeric characters for exact matching
  static String _normalize(String s) {
    return s.toUpperCase().replaceAll(RegExp(r'[^A-Z0-9]'), '');
  }

  /// Collision-resistant report number, same format as the ERP website.
  static String generateReportNumber() {
    final now = DateTime.now();
    final ymd = '${now.year}${now.month.toString().padLeft(2, '0')}${now.day.toString().padLeft(2, '0')}';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    final rnd = Random.secure();
    final suffix = List.generate(6, (_) => chars[rnd.nextInt(chars.length)]).join();
    return 'RPT-GD-$ymd-$suffix';
  }

  /// Network problems are worth retrying later; anything else is a real error.
  static bool _isNetworkError(Object e) {
    final msg = e.toString().toLowerCase();
    return e is TimeoutException ||
        msg.contains('socketexception') ||
        msg.contains('failed host lookup') ||
        msg.contains('connection') ||
        msg.contains('network') ||
        msg.contains('timed out') ||
        msg.contains('clientexception');
  }

  // ---------------------------------------------------------------------------
  // Vehicles
  // ---------------------------------------------------------------------------

  /// Get all vehicles
  static Future<List<BajajVehicle>> getAllVehicles() async {
    try {
      if (isConnected) {
        final res = await _client!.from('bajaj_vehicles').select().order('created_at', ascending: false);
        final list = res.map((item) => BajajVehicle.fromJson(item)).toList();
        _cachedVehicles
          ..clear()
          ..addAll(list);
        return list;
      }
    } catch (e) {
      debugPrint('Error fetching vehicles from Supabase: $e');
    }
    return List.unmodifiable(_cachedVehicles);
  }

  /// Verify a vehicle by Digital ID, scanned QR payload ("DID|PLATE|PERMIT"),
  /// plate, VIN or permit number. Matching is exact (case/spacing-insensitive)
  /// so a partial input can never return the wrong vehicle.
  static Future<BajajVehicle?> verifyVehicle({
    required String query,
    required String type,
  }) async {
    final raw = query.trim();
    if (raw.isEmpty) return null;

    // A scanned QR sticker carries "DID|PLATE|PERMIT": the DID is the identity.
    final did = raw.split('|').first.trim();
    final key = _normalize(did);
    if (key.isEmpty) return null;

    // 1. Central database
    try {
      if (isConnected) {
        // Strip characters that have meaning in PostgREST filter syntax.
        final safe = did.replaceAll(RegExp(r'[,()%*\\]'), '');
        final res = await _client!
            .from('bajaj_vehicles')
            .select()
            .or('digital_id.ilike.$safe,plate_number.ilike.$safe,vin_chassis.ilike.$safe,permit_number.ilike.$safe')
            .limit(5);

        final rows = res.map((item) => BajajVehicle.fromJson(item)).toList();
        final exact = _findExact(rows, key, raw);
        if (exact != null) return exact;

        // Fall through to a normalized comparison against the full registry,
        // which handles e.g. "3 AM 04891" vs "3-AM-04891".
        final all = await getAllVehicles();
        return _findExact(all, key, raw);
      }
    } catch (e) {
      debugPrint('Supabase query error: $e');
    }

    // 2. Offline: last known registry
    return _findExact(_cachedVehicles, key, raw);
  }

  static BajajVehicle? _findExact(List<BajajVehicle> list, String key, String raw) {
    for (final v in list) {
      if (_normalize(v.digitalId) == key) return v;
    }
    for (final v in list) {
      if (v.qrCodeValue.isNotEmpty && v.qrCodeValue.trim().toUpperCase() == raw.toUpperCase()) return v;
    }
    for (final v in list) {
      if (_normalize(v.plateNumber) == key || _normalize(v.vin) == key || _normalize(v.permitNo) == key) return v;
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // Violation reports
  // ---------------------------------------------------------------------------

  /// Get all violation reports (pending offline reports are listed first).
  static Future<List<TrafficViolationReport>> getAllReports() async {
    await flushOutbox();
    final pending = await pendingReports();
    try {
      if (isConnected) {
        final res = await _client!.from('violation_reports').select().order('created_at', ascending: false);
        final list = res.map((item) => TrafficViolationReport.fromJson(item)).toList();
        _cachedReports
          ..clear()
          ..addAll(list);
        return [...pending, ...list];
      }
    } catch (e) {
      debugPrint('Error fetching reports from Supabase: $e');
    }
    return [...pending, ..._cachedReports];
  }

  /// Live stream of reports from every phone and the ERP website.
  /// Requires Realtime to be enabled on `violation_reports` (see migration).
  static Stream<List<TrafficViolationReport>> reportsStream() {
    if (!isConnected) {
      return Stream.fromFuture(getAllReports());
    }
    return _client!
        .from('violation_reports')
        .stream(primaryKey: ['id'])
        .order('created_at', ascending: false)
        .asyncMap((rows) async {
      final list = rows.map((item) => TrafficViolationReport.fromJson(item)).toList();
      _cachedReports
        ..clear()
        ..addAll(list);
      return [...await pendingReports(), ...list];
    });
  }

  /// Submit a new traffic violation report.
  static Future<SubmitResult> submitViolationReport(TrafficViolationReport report) async {
    if (!isConnected) {
      await _enqueue(_outboxReportsKey, report.toJson());
      return SubmitResult.queued();
    }
    try {
      await _client!.from('violation_reports').insert(report.toJson());
      return SubmitResult.synced();
    } catch (e) {
      debugPrint('Error inserting report to Supabase: $e');
      if (_isNetworkError(e)) {
        await _enqueue(_outboxReportsKey, report.toJson());
        return SubmitResult.queued();
      }
      return SubmitResult.failed(e is PostgrestException ? e.message : e.toString());
    }
  }

  // ---------------------------------------------------------------------------
  // Inspections log (feeds the live dashboard on the ERP website)
  // ---------------------------------------------------------------------------

  /// result: VALID | EXPIRED | SUSPENDED | MISMATCH | NOT_FOUND
  static Future<void> logInspection({
    required String digitalId,
    required String plateChecked,
    String? registeredPlate,
    required String result,
    String? location,
  }) async {
    final officer = currentOfficer;
    final row = <String, dynamic>{
      'digital_id': digitalId,
      'plate_checked': plateChecked,
      'registered_plate': registeredPlate,
      'result': result,
      'officer_name': officer?.fullName ?? 'Unknown officer',
      'badge_number': officer?.badgeNumber,
      'location': location ?? officer?.assignedZone,
      'source': 'mobile',
      'created_at': DateTime.now().toUtc().toIso8601String(),
    };
    if (!isConnected) {
      await _enqueue(_outboxInspectionsKey, row);
      return;
    }
    try {
      await _client!.from('inspections').insert(row);
    } catch (e) {
      debugPrint('Error logging inspection: $e');
      if (_isNetworkError(e)) await _enqueue(_outboxInspectionsKey, row);
    }
  }

  // ---------------------------------------------------------------------------
  // Offline outbox: nothing an officer records is lost on a bad connection
  // ---------------------------------------------------------------------------

  static Future<List<Map<String, dynamic>>> _readQueue(String key) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getStringList(key) ?? const [];
    return raw.map((s) => Map<String, dynamic>.from(jsonDecode(s) as Map)).toList();
  }

  static Future<void> _writeQueue(String key, List<Map<String, dynamic>> items) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(key, items.map(jsonEncode).toList());
  }

  static Future<void> _enqueue(String key, Map<String, dynamic> row) async {
    final items = await _readQueue(key);
    items.add(row);
    await _writeQueue(key, items);
  }

  /// Reports saved on this phone that have not reached the server yet.
  static Future<List<TrafficViolationReport>> pendingReports() async {
    final items = await _readQueue(_outboxReportsKey);
    return items
        .map((row) => TrafficViolationReport.fromJson({...row, 'id': 'pending-${row['report_number']}', 'pending': true}))
        .toList();
  }

  static bool _flushing = false;

  /// Try to send everything waiting in the outbox. Safe to call often.
  static Future<void> flushOutbox() async {
    if (!isConnected || _flushing) return;
    _flushing = true;
    try {
      await _flushQueue(_outboxReportsKey, 'violation_reports');
      await _flushQueue(_outboxInspectionsKey, 'inspections');
    } finally {
      _flushing = false;
    }
  }

  static Future<void> _flushQueue(String key, String table) async {
    final items = await _readQueue(key);
    if (items.isEmpty) return;
    final remaining = <Map<String, dynamic>>[];
    for (final row in items) {
      try {
        await _client!.from(table).insert(row);
      } on PostgrestException catch (e) {
        // 23505 = already uploaded (duplicate report number): drop it.
        if (e.code != '23505') {
          debugPrint('Outbox $table rejected: ${e.message}');
          remaining.add(row);
        }
      } catch (e) {
        remaining.add(row);
        if (_isNetworkError(e)) {
          // Still offline: keep the rest for next time.
          remaining.addAll(items.skip(items.indexOf(row) + 1));
          break;
        }
      }
    }
    await _writeQueue(key, remaining);
  }

  // ---------------------------------------------------------------------------
  // Authentication
  // ---------------------------------------------------------------------------

  /// Officer login. Passwords are checked server-side by the `login_officer`
  /// RPC (bcrypt); the hash never leaves the database.
  /// Returns null for wrong credentials; throws when the server is unreachable.
  static Future<OfficerSession?> loginOfficer(String username, String password) async {
    final u = username.trim();
    if (u.isEmpty || password.isEmpty) return null;
    if (!isConnected) {
      throw Exception('Supabase is not configured');
    }

    final res = await _client!.rpc('login_officer', params: {
      'p_username': u,
      'p_password': password,
    });

    final rows = res is List ? res : (res == null ? const [] : [res]);
    if (rows.isEmpty) return null;
    final officer = Map<String, dynamic>.from(rows.first as Map);
    final session = OfficerSession(
      fullName: officer['full_name']?.toString() ?? u,
      badgeNumber: officer['badge_number']?.toString() ?? '',
      role: officer['role']?.toString() ?? 'Field Traffic Inspector',
      assignedZone: officer['assigned_zone']?.toString() ?? '',
    );
    currentOfficer = session;
    unawaited(flushOutbox());
    return session;
  }

  static void logout() {
    currentOfficer = null;
  }
}
