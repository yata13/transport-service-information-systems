import 'package:flutter/material.dart';
import '../models/bajaj_vehicle.dart';
import 'violation_report_screen.dart';

class VehicleNotFoundScreen extends StatelessWidget {
  final String searchedQuery;
  final String queryType;

  const VehicleNotFoundScreen({
    super.key,
    required this.searchedQuery,
    required this.queryType,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FB),
      appBar: AppBar(
        title: const Text('የፍተሻ ውጤት (Search Result)'),
        backgroundColor: const Color(0xFF0C355B),
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Warning Icon Box
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.red.shade300, width: 2),
                ),
                child: const Icon(Icons.search_off, size: 40, color: Colors.red),
              ),
              const SizedBox(height: 18),

              const Text(
                'ተሽከርካሪው በዳታቤዝ ውስጥ አልተገኘም',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF0C355B),
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Vehicle Not Found in Gondar Registry',
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),
              const SizedBox(height: 16),

              // Query Info Card
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: Column(
                  children: [
                    const Text('የተፈለገው መለያ (Searched Input):', style: TextStyle(fontSize: 11, color: Colors.grey)),
                    const SizedBox(height: 4),
                    SelectableText(
                      searchedQuery,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.red,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Explanation Box
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.amber.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.amber.shade300),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.info_outline, size: 16, color: Colors.amber.shade900),
                        const SizedBox(width: 6),
                        Text(
                          'ሊሆን የሚችል ምክንያት (Possible Reasons):',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.amber.shade900),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    const Text('1. ቁጥሩን በስህተት አስገብተዋል (Check typing errors)', style: TextStyle(fontSize: 11)),
                    const SizedBox(height: 4),
                    const Text('2. ተሽከርካሪው በጎንደር ከተማ ያልተመዘገበ ሕገ-ወጥ ባጃጅ ነው', style: TextStyle(fontSize: 11)),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Actions
              ElevatedButton.icon(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.arrow_back, size: 18),
                label: const Text('እንደገና ፈልግ (Try Another Search)'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0C355B),
                  foregroundColor: Colors.white,
                  minimumSize: const Size.fromHeight(46),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(height: 10),

              OutlinedButton.icon(
                onPressed: () {
                  final unregisteredVehicle = BajajVehicle(
                    id: 'unregistered-${DateTime.now().millisecondsSinceEpoch}',
                    digitalId: searchedQuery,
                    plateNumber: searchedQuery,
                    vin: 'VIN-UNREGISTERED',
                    vehicleType: 'Bajaj (ባጃጅ)',
                    bajajModel: 'ያልተመዘገበ ባጃጅ',
                    bajajAssociation: 'ያልተመዘገበ',
                    color: 'ያልታወቀ',
                    owner: 'ያልታወቀ ግለሰብ (Unknown)',
                    ownerPhone: '-',
                    driverName: 'ያልተመዘገበ አሽከርካሪ',
                    driverPhone: '-',
                    driverPhoto: '',
                    kebele: 'ያልታወቀ',
                    address: 'በጎንደር ከተማ መዝገብ ውስጥ የለም',
                    permitNo: 'NO-PERMIT',
                    issueDate: '2025-01-01',
                    expiryDate: '2025-01-01',
                    authorizedArea: 'ያልተፈቀደ (Illegal)',
                    status: 'ILLEGAL',
                    isBlacklisted: true,
                    blacklistReason: 'በጎንደር ትራንስፖርት ዳታቤዝ ውስጥ ያልተገኘ ህገወጥ ተሽከርካሪ',
                    qrCodeValue: searchedQuery,
                    registeredCity: 'Gondar / ጎንደር',
                  );

                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (_) => ViolationReportScreen(vehicle: unregisteredVehicle),
                    ),
                  );
                },
                icon: const Icon(Icons.report_problem, size: 16, color: Colors.red),
                label: const Text('ሕገ-ወጥ ተሽከርካሪ ሪፖርት አድርግ (Report)', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.red, width: 1.2),
                  minimumSize: const Size.fromHeight(46),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
