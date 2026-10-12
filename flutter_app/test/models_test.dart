import 'package:flutter_test/flutter_test.dart';
import 'package:gondar_traffic_bajaj/models/bajaj_vehicle.dart';
import 'package:gondar_traffic_bajaj/models/violation_report.dart';
import 'package:gondar_traffic_bajaj/services/supabase_service.dart';

void main() {
  group('BajajVehicle.effectiveStatus', () {
    test('active permit past its expiry date is expired', () {
      expect(BajajVehicle.effectiveStatus('ACTIVE', '2000-01-01'), 'EXPIRED');
    });

    test('active permit with a future expiry stays active', () {
      final future = DateTime.now().add(const Duration(days: 30)).toIso8601String().substring(0, 10);
      expect(BajajVehicle.effectiveStatus('ACTIVE', future), 'ACTIVE');
    });

    test('suspended stays suspended', () {
      expect(BajajVehicle.effectiveStatus('SUSPENDED', '2000-01-01'), 'SUSPENDED');
    });

    test('fromJson applies it and toJson never sends a client id', () {
      final v = BajajVehicle.fromJson({
        'id': 'abc',
        'digital_id': 'DID-1',
        'plate_number': '3-AM-1',
        'status': 'ACTIVE',
        'expiry_date': '2001-01-01',
      });
      expect(v.status, 'EXPIRED');
      expect(v.toJson().containsKey('id'), isFalse);
    });
  });

  group('TrafficViolationReport', () {
    test('round-trips through JSON and reads numeric strings', () {
      final r = TrafficViolationReport.fromJson({
        'id': '1',
        'report_number': 'RPT-GD-20261012-ABC123',
        'digital_id': 'DID-1',
        'vehicle_plate': '3-AM-1',
        'reason': 'r',
        'reason_am': 'ra',
        'action_taken': 'a',
        'fine_amount': '1500',
        'checked_on': '2026-10-12T07:00:00Z',
        'checked_by': 'Officer',
        'status': 'SUBMITTED',
        'location': 'Piassa',
      });
      expect(r.fineAmount, 1500);
      expect(r.isPending, isFalse);
      expect(r.toJson()['checked_by'], 'Officer');
      expect(r.toJson()['checked_on'], '2026-10-12T07:00:00.000Z');
    });
  });

  test('report numbers are unique and well formed', () {
    final numbers = List.generate(2000, (_) => SupabaseService.generateReportNumber());
    expect(numbers.toSet().length, numbers.length);
    expect(numbers.first, matches(RegExp(r'^RPT-GD-\d{8}-[A-Z0-9]{6}$')));
  });
}
