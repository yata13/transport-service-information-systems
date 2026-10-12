class TrafficViolationReport {
  final String id;
  final String reportNumber;
  final String digitalId;
  final String vehiclePlate;
  final String? registeredPlate;
  final String reason;
  final String reasonAm;
  final String actionTaken;
  final double fineAmount;
  final String checkedOn;
  final String checkedBy;
  final String notes;
  final String status; // 'SUBMITTED' | 'PAID' | 'IMPOUNDED' | 'RESOLVED'
  final String location;

  /// True while the report is stored on the phone waiting for network.
  final bool isPending;

  TrafficViolationReport({
    required this.id,
    required this.reportNumber,
    required this.digitalId,
    required this.vehiclePlate,
    this.registeredPlate,
    required this.reason,
    required this.reasonAm,
    required this.actionTaken,
    required this.fineAmount,
    required this.checkedOn,
    required this.checkedBy,
    required this.notes,
    required this.status,
    required this.location,
    this.isPending = false,
  });

  /// Human friendly local time, e.g. "2026-10-12 09:41".
  String get checkedOnDisplay {
    final d = DateTime.tryParse(checkedOn);
    if (d == null) return checkedOn;
    final l = d.toLocal();
    String two(int n) => n.toString().padLeft(2, '0');
    return '${l.year}-${two(l.month)}-${two(l.day)} ${two(l.hour)}:${two(l.minute)}';
  }

  factory TrafficViolationReport.fromJson(Map<String, dynamic> json) {
    return TrafficViolationReport(
      id: json['id']?.toString() ?? '',
      reportNumber: json['report_number'] ?? json['reportNumber'] ?? '',
      digitalId: json['digital_id'] ?? json['digitalId'] ?? '',
      vehiclePlate: json['vehicle_plate'] ?? json['vehiclePlate'] ?? '',
      registeredPlate: json['registered_plate'] ?? json['registeredPlate'],
      reason: json['reason'] ?? '',
      reasonAm: json['reason_am'] ?? json['reasonAm'] ?? '',
      actionTaken: json['action_taken'] ?? json['actionTaken'] ?? '',
      fineAmount: num.tryParse((json['fine_amount'] ?? json['fineAmount'] ?? 0).toString())?.toDouble() ?? 0,
      checkedOn: (json['checked_on'] ?? json['created_at'] ?? json['checkedOn'] ?? '').toString(),
      checkedBy: json['checked_by'] ?? json['checkedBy'] ?? '',
      notes: json['notes'] ?? '',
      status: json['status'] ?? 'SUBMITTED',
      location: json['location'] ?? '',
      isPending: json['pending'] == true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'report_number': reportNumber,
      'digital_id': digitalId,
      'vehicle_plate': vehiclePlate,
      'registered_plate': registeredPlate,
      'reason': reason,
      'reason_am': reasonAm,
      'action_taken': actionTaken,
      'fine_amount': fineAmount,
      'checked_on': DateTime.tryParse(checkedOn)?.toUtc().toIso8601String() ?? DateTime.now().toUtc().toIso8601String(),
      'checked_by': checkedBy,
      'notes': notes,
      'status': status,
      'location': location,
    };
  }
}
