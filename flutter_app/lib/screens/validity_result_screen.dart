import 'package:flutter/material.dart';
import '../models/bajaj_vehicle.dart';
import 'vehicle_details_screen.dart';
import 'violation_report_screen.dart';

class ValidityResultScreen extends StatelessWidget {
  final BajajVehicle vehicle;
  final Function(String screen)? onNavigate;

  const ValidityResultScreen({
    super.key,
    required this.vehicle,
    this.onNavigate,
  });

  @override
  Widget build(BuildContext context) {
    final isValid = vehicle.status == 'ACTIVE';
    final isExpired = vehicle.status == 'EXPIRED';

    final Color bannerColor = isValid
        ? const Color(0xFF15803D) // Emerald 700
        : isExpired
            ? const Color(0xFFD97706) // Amber 600
            : const Color(0xFFDC2626); // Red 600

    final String statusTextAm = isValid
        ? 'ሕጋዊ ፈቃድ ያለው (VALID)'
        : isExpired
            ? 'ጊዜው ያለፈበት (EXPIRED)'
            : 'ያልተፈቀደ / የታገደ (SUSPENDED)';

    final String statusDesc = isValid
        ? 'የመንገድ ፈቃዱ በጎንደር ከተማ አስተዳደር ትራፊክ ቁጥጥር የፀደቀ ነው'
        : isExpired
            ? 'የመንገድ ፈቃዱ ጊዜ ስላለፈበት ማደስ ይጠበቅበታል'
            : 'ይህ ተሽከርካሪ በጎንደር መዝገብ ውስጥ ያልተፈቀደ ወይም የታገደ ነው';

    final primaryPhone =
        vehicle.driverPhone.isNotEmpty && vehicle.driverPhone != '-' ? vehicle.driverPhone : vehicle.ownerPhone;

    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FB),
      appBar: AppBar(
        title: const Text('የፈቃድ ሁኔታ (Validity Result)'),
        backgroundColor: const Color(0xFF0C355B),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // BIG STATUS CARD
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              clipBehavior: Clip.antiAlias,
              child: Column(
                children: [
                  // Top Banner
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                    color: bannerColor,
                    child: Column(
                      children: [
                        Icon(
                          isValid
                              ? Icons.check_circle
                              : isExpired
                                  ? Icons.warning
                                  : Icons.cancel,
                          color: Colors.white,
                          size: 52,
                        ),
                        const SizedBox(height: 10),
                        Text(
                          statusTextAm,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          statusDesc,
                          style: const TextStyle(color: Colors.white70, fontSize: 11),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),

                  // Identity Summary
                  Padding(
                    padding: const EdgeInsets.all(18.0),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            // Driver Photo
                            ClipRRect(
                              borderRadius: BorderRadius.circular(14),
                              child: vehicle.driverPhoto.isNotEmpty
                                  ? Image.network(
                                      vehicle.driverPhoto,
                                      width: 68,
                                      height: 68,
                                      fit: BoxFit.cover,
                                      errorBuilder: (_, __, ___) => Container(
                                        width: 68,
                                        height: 68,
                                        color: Colors.grey.shade200,
                                        child: const Icon(Icons.person, size: 32, color: Colors.grey),
                                      ),
                                    )
                                  : Container(
                                      width: 68,
                                      height: 68,
                                      color: Colors.grey.shade200,
                                      child: const Icon(Icons.person, size: 32, color: Colors.grey),
                                    ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF0C355B),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      vehicle.plateNumber,
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    vehicle.driverName.isNotEmpty && vehicle.driverName != 'ያልተመዘገበ'
                                        ? vehicle.driverName
                                        : vehicle.owner,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 15,
                                    ),
                                  ),
                                  Text(
                                    'ባለቤት: ${vehicle.owner}',
                                    style: const TextStyle(color: Colors.grey, fontSize: 11),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 16),
                        const Divider(height: 1),
                        const SizedBox(height: 14),

                        // Chips: Plain Text Phone and Kebele
                        Row(
                          children: [
                            Expanded(
                              child: Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: Colors.grey.shade100,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Row(
                                      children: [
                                        Icon(Icons.phone, size: 12, color: Color(0xFF0C355B)),
                                        SizedBox(width: 4),
                                        Text('ስልክ (Phone)', style: TextStyle(fontSize: 10, color: Colors.grey)),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    SelectableText(
                                      primaryPhone,
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: Colors.grey.shade100,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Row(
                                      children: [
                                        Icon(Icons.location_on, size: 12, color: Colors.red),
                                        SizedBox(width: 4),
                                        Text('ቀበሌ (Kebele)', style: TextStyle(fontSize: 10, color: Colors.grey)),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      vehicle.kebele,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 11,
                                        color: Color(0xFF0C355B),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Action Buttons
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                    child: Column(
                      children: [
                        ElevatedButton.icon(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => VehicleDetailsScreen(vehicle: vehicle),
                              ),
                            );
                          },
                          icon: const Icon(Icons.description, size: 18),
                          label: const Text('ተጨማሪ ዝርዝር እይ (View Full Details)'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF0C355B),
                            foregroundColor: Colors.white,
                            minimumSize: const Size.fromHeight(46),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: () => Navigator.pop(context),
                                icon: const Icon(Icons.refresh, size: 16),
                                label: const Text('አዲስ ፍተሻ'),
                                style: OutlinedButton.styleFrom(
                                  minimumSize: const Size.fromHeight(42),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => ViolationReportScreen(vehicle: vehicle),
                                    ),
                                  );
                                },
                                icon: const Icon(Icons.warning_amber, size: 16, color: Colors.red),
                                label: const Text('የጥሰት ሪፖርት', style: TextStyle(color: Colors.red)),
                                style: OutlinedButton.styleFrom(
                                  side: const BorderSide(color: Colors.red, width: 1.2),
                                  minimumSize: const Size.fromHeight(42),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
