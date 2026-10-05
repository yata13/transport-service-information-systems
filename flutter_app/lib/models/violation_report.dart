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
  });

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
      fineAmount: (json['fine_amount'] ?? json['fineAmount'] ?? 0).toDouble(),
      checkedOn: (json['checked_on'] ?? json['checkedOn'] ?? '').toString(),
      checkedBy: json['checked_by'] ?? json['checkedBy'] ?? '',
      notes: json['notes'] ?? '',
      status: json['status'] ?? 'SUBMITTED',
      location: json['location'] ?? '',
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
      'checked_by': checkedBy,
      'notes': notes,
      'status': status,
      'location': location,
    };
  }
}

final List<TrafficViolationReport> initialReports = [
  TrafficViolationReport(
    id: 'rep-1',
    reportNumber: 'RPT-GD-2025-091',
    digitalId: 'DID-25-000784521',
    vehiclePlate: 'AA-99999',
    registeredPlate: 'AA-12345',
    reason: 'Plate number does not match with registered vehicle.',
    reasonAm: 'የተሰቀለው የሰሌዳ ቁጥር ከተመዘገበው ጋር አይዛመድም (ሐሰተኛ ሰሌዳ)',
    actionTaken: 'ባጃጅ ወደ ጎንደር ትራፊክ መምሪያ እንዲቆም ተደርጓል (Impounded)',
    fineAmount: 2000,
    checkedOn: '2025-05-20 10:32:18',
    checkedBy: 'ኢንስፔክተር አበበ ተሰማ',
    notes: 'ተሽከርካሪው በፒያሳ አደባባይ ሲያሽከረክር ተይዟል:: የሰሌዳ ማጭበርበር ተረጋግጧል::',
    status: 'IMPOUNDED',
    location: 'ጎንደር ፒያሳ አደባባይ (Piassa Square)',
  ),
  TrafficViolationReport(
    id: 'rep-2',
    reportNumber: 'RPT-GD-2025-084',
    digitalId: 'DID-GD-0899211',
    vehiclePlate: '3-AM-99999',
    registeredPlate: '3-AM-99999',
    reason: 'Transport service operating with expired annual permit.',
    reasonAm: 'የአመቱ የስራ ፈቃድ ጊዜው ያለፈበት ሆኖ ሲያጓጉዝ ተገኝቷል',
    actionTaken: 'የትራፊክ ቅጣት 1,000 ብር ተጥሏል (Traffic Ticket)',
    fineAmount: 1000,
    checkedOn: '2025-05-18 14:15:00',
    checkedBy: 'ረዳት ኢንስፔክተር ሰለሞን አለሙ',
    notes: 'ባለቤቱ በ3 ቀን ውስጥ ፈቃድ እንዲያድስ ማስጠንቀቂያ ተሰጥቷል::',
    status: 'SUBMITTED',
    location: 'አዘዞ ማዞሪያ (Azezo Junction)',
  ),
];
