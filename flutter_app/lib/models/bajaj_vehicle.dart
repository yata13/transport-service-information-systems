class BajajVehicle {
  final String id;
  final String digitalId;
  final String plateNumber;
  final String vin;
  final String vehicleType;
  final String bajajModel;
  final String bajajAssociation;
  final String color;
  final String owner;
  final String ownerPhone;
  final String driverName;
  final String driverPhone;
  final String driverPhoto;
  final String kebele;
  final String address;
  final String permitNo;
  final String issueDate;
  final String expiryDate;
  final String authorizedArea;
  final String status; // 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'ILLEGAL' | 'MISMATCH'
  final bool isBlacklisted;
  final String? blacklistReason;
  final String? notes;
  final String qrCodeValue;
  final String registeredCity;

  BajajVehicle({
    required this.id,
    required this.digitalId,
    required this.plateNumber,
    required this.vin,
    required this.vehicleType,
    required this.bajajModel,
    required this.bajajAssociation,
    required this.color,
    required this.owner,
    required this.ownerPhone,
    required this.driverName,
    required this.driverPhone,
    required this.driverPhoto,
    required this.kebele,
    required this.address,
    required this.permitNo,
    required this.issueDate,
    required this.expiryDate,
    required this.authorizedArea,
    required this.status,
    required this.isBlacklisted,
    this.blacklistReason,
    this.notes,
    required this.qrCodeValue,
    required this.registeredCity,
  });

  /// A permit past its expiry date is expired, whatever the stored status says.
  static String effectiveStatus(String status, String expiryDate) {
    if (status == 'ACTIVE' && expiryDate.length >= 10) {
      final expiry = DateTime.tryParse(expiryDate.substring(0, 10));
      final now = DateTime.now();
      final today = DateTime(now.year, now.month, now.day);
      if (expiry != null && expiry.isBefore(today)) return 'EXPIRED';
    }
    return status;
  }

  factory BajajVehicle.fromJson(Map<String, dynamic> json) {
    final expiry = (json['expiry_date'] ?? json['expiryDate'] ?? '').toString().split('T')[0];
    return BajajVehicle(
      id: json['id']?.toString() ?? '',
      digitalId: json['digital_id'] ?? json['digitalId'] ?? '',
      plateNumber: json['plate_number'] ?? json['plateNumber'] ?? '',
      vin: json['vin_chassis'] ?? json['vin'] ?? '',
      vehicleType: json['vehicle_type'] ?? json['vehicleType'] ?? 'Bajaj (ባጃጅ)',
      bajajModel: json['bajaj_model'] ?? json['bajajModel'] ?? '',
      bajajAssociation: json['bajaj_association'] ?? json['bajajAssociation'] ?? '',
      color: json['color'] ?? '',
      owner: json['owner_name'] ?? json['owner'] ?? '',
      ownerPhone: json['owner_phone'] ?? json['ownerPhone'] ?? '',
      driverName: json['driver_name'] ?? json['driverName'] ?? '',
      driverPhone: json['driver_phone'] ?? json['driverPhone'] ?? '',
      driverPhoto: json['driver_photo'] ?? json['driverPhoto'] ?? '',
      kebele: json['kebele'] ?? 'ቀበሌ 03 (Kebele 03)',
      address: json['address'] ?? 'ጎንደር ከተማ',
      permitNo: json['permit_number'] ?? json['permitNo'] ?? '',
      issueDate: (json['issue_date'] ?? json['issueDate'] ?? '').toString().split('T')[0],
      expiryDate: expiry,
      authorizedArea: json['authorized_area'] ?? json['authorizedArea'] ?? '',
      status: effectiveStatus(json['status'] ?? 'ACTIVE', expiry),
      isBlacklisted: json['is_blacklisted'] == true,
      blacklistReason: json['blacklist_reason'],
      notes: json['notes'],
      qrCodeValue: json['qr_code_value'] ?? json['qrCodeValue'] ?? '',
      registeredCity: json['registered_city'] ?? json['registeredCity'] ?? 'Gondar / ጎንደር',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'digital_id': digitalId,
      'plate_number': plateNumber,
      'vin_chassis': vin,
      'vehicle_type': vehicleType,
      'bajaj_model': bajajModel,
      'bajaj_association': bajajAssociation,
      'color': color,
      'owner_name': owner,
      'owner_phone': ownerPhone,
      'driver_name': driverName,
      'driver_phone': driverPhone,
      'driver_photo': driverPhoto,
      'kebele': kebele,
      'address': address,
      'permit_number': permitNo,
      'issue_date': issueDate,
      'expiry_date': expiryDate,
      'authorized_area': authorizedArea,
      'status': status,
      'is_blacklisted': isBlacklisted,
      'blacklist_reason': blacklistReason,
      'notes': notes,
      'qr_code_value': qrCodeValue,
      'registered_city': registeredCity,
    };
  }
}

// Offline-only fallback registry, used before the phone has ever reached the
// server. Real data always comes from Supabase.
final List<BajajVehicle> initialBajajDatabase = [
  BajajVehicle(
    id: 'bajaj-1',
    digitalId: 'DID-25-000784521',
    plateNumber: 'AA-12345',
    vin: 'MBN12345678912345',
    vehicleType: 'Bajaj (ባጃጅ)',
    bajajModel: 'TVS King',
    bajajAssociation: 'Addis Bajaj Share Company',
    color: 'Red (ቀይ)',
    owner: 'አቶ ታምራት አለማየሁ',
    ownerPhone: '+251 91 876 5432',
    driverName: 'ዮሐንስ ጌታቸው',
    driverPhone: '+251 91 432 1098',
    driverPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    kebele: 'ቀበሌ 03 (Kebele 03)',
    address: 'አራዳ መንገድ፣ ቀበሌ 03፣ ጎንደር',
    permitNo: 'PRM-25-5566',
    issueDate: '2025-01-10',
    expiryDate: '2026-01-09',
    authorizedArea: 'ሰበሰተፖል (Sebastopol)',
    status: 'ACTIVE',
    isBlacklisted: false,
    qrCodeValue: 'DID-25-000784521|AA-12345|PRM-25-5566',
    registeredCity: 'Gondar / ጎንደር',
  ),
  BajajVehicle(
    id: 'bajaj-2',
    digitalId: 'DID-GD-0489120',
    plateNumber: '3-AM-04891',
    vin: 'TVS98234109482103',
    vehicleType: 'Bajaj (ባጃጅ)',
    bajajModel: 'TVS King Deluxe',
    bajajAssociation: 'ፋሲል የባጃጅ ማህበር (Fasil Bajaj Association)',
    color: 'Blue (ሰማያዊ)',
    owner: 'ወ/ሮ ሰላማዊት አሰፋ',
    ownerPhone: '+251 92 345 6789',
    driverName: 'ዳንኤል ብርሃኑ',
    driverPhone: '+251 92 888 1234',
    driverPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    kebele: 'ቀበሌ 01 (Kebele 01)',
    address: 'ፒያሳ - ፋሲል ግቢ ፊት ለፊት፣ ቀበሌ 01',
    permitNo: 'PRM-GD-2025-102',
    issueDate: '2025-02-15',
    expiryDate: '2026-02-14',
    authorizedArea: 'ዞን 1: አራዳ - ፒያሳ - ፋሲል ግቢ',
    status: 'ACTIVE',
    isBlacklisted: false,
    qrCodeValue: 'DID-GD-0489120|3-AM-04891|PRM-GD-2025-102',
    registeredCity: 'Gondar / ጎንደር',
  ),
  BajajVehicle(
    id: 'bajaj-3',
    digitalId: 'DID-GD-0899211',
    plateNumber: '3-AM-99999',
    vin: 'BAJ77341209845112',
    vehicleType: 'Bajaj (ባጃጅ)',
    bajajModel: 'Bajaj RE 4S',
    bajajAssociation: 'አዘዞ ማህበር (Azezo Bajaj Association)',
    color: 'Green (አረንጓዴ)',
    owner: 'አቶ ሙሉጌታ ካሳ',
    ownerPhone: '+251 91 112 3344',
    driverName: 'አበበ ተፈሪ',
    driverPhone: '+251 91 555 7788',
    driverPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    kebele: 'ቀበሌ 16 (Kebele 16)',
    address: 'አዘዞ ማዞሪያ፣ ቀበሌ 16፣ ጎንደር',
    permitNo: 'PRM-GD-2024-889',
    issueDate: '2024-03-01',
    expiryDate: '2025-02-28',
    authorizedArea: 'ዞን 2: ፒያሳ - አዘዞ - ጎንደር ኤርፖርት',
    status: 'EXPIRED',
    isBlacklisted: false,
    notes: 'የመንገድ ፈቃድ ጊዜው አልፏል (Permit Expired)',
    qrCodeValue: 'DID-GD-0899211|3-AM-99999|PRM-GD-2024-889',
    registeredCity: 'Gondar / ጎንደር',
  ),
  BajajVehicle(
    id: 'bajaj-4',
    digitalId: 'DID-GD-0033221',
    plateNumber: '3-AM-77214',
    vin: 'CHAS9921045812033',
    vehicleType: 'Bajaj (ባጃጅ)',
    bajajModel: 'Piaggio Ape City',
    bajajAssociation: 'ማራኪ ዩኒቨርሲቲ ማህበር (Maraki Campus Association)',
    color: 'White (ነጭ)',
    owner: 'አቶ ተስፋሁን ያሬድ',
    ownerPhone: '+251 93 456 7890',
    driverName: 'ካሳሁን ወርቁ',
    driverPhone: '+251 93 777 9900',
    driverPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    kebele: 'ቀበሌ 18 (Kebele 18)',
    address: 'ማራኪ ዩኒቨርሲቲ በር፣ ቀበሌ 18፣ ጎንደር',
    permitNo: 'PRM-GD-2025-331',
    issueDate: '2025-01-20',
    expiryDate: '2026-01-19',
    authorizedArea: 'ዞን 3: ማራኪ ዩኒቨርሲቲ - ሾንቃ - ቀበሌ 18',
    status: 'ACTIVE',
    isBlacklisted: false,
    qrCodeValue: 'DID-GD-0033221|3-AM-77214|PRM-GD-2025-331',
    registeredCity: 'Gondar / ጎንደር',
  ),
  BajajVehicle(
    id: 'bajaj-5',
    digitalId: 'DID-GD-0078900',
    plateNumber: '3-AM-11002',
    vin: 'VIN-STOLEN-998811',
    vehicleType: 'Bajaj (ባጃጅ)',
    bajajModel: 'Bajaj Maxima Z',
    bajajAssociation: 'አንገረብ ማህበር (Angereb Association)',
    color: 'Yellow (ቢጫ)',
    owner: 'ያልታወቀ (Unknown)',
    ownerPhone: '-',
    driverName: 'ያልተመዘገበ',
    driverPhone: '-',
    driverPhoto: '',
    kebele: 'ያልታወቀ (Unknown)',
    address: 'አንገረብ ወንዝ ዳርቻ',
    permitNo: 'PRM-SUSP-001',
    issueDate: '2023-11-10',
    expiryDate: '2024-11-09',
    authorizedArea: 'ያልተፈቀደ (Unauthorized)',
    status: 'SUSPENDED',
    isBlacklisted: true,
    blacklistReason: 'በጎንደር ፖሊስ መምሪያ የተፈለገ ተሽከርካሪ (Stolen / Blacklisted by Gondar Police)',
    qrCodeValue: 'DID-GD-0078900|3-AM-11002|PRM-SUSP-001',
    registeredCity: 'Gondar / ጎንደር',
  ),
];
