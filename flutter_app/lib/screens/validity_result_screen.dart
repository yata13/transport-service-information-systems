import 'package:flutter/material.dart';
import '../models/bajaj_vehicle.dart';
import 'vehicle_details_screen.dart';
import 'violation_report_screen.dart';

class ValidityResultScreen extends StatefulWidget {
  final BajajVehicle vehicle;
  final Function(String screen)? onNavigate;
  final String? physicalPlateChecked;
  final bool isPlateMismatch;

  const ValidityResultScreen({
    super.key,
    required this.vehicle,
    this.onNavigate,
    this.physicalPlateChecked,
    this.isPlateMismatch = false,
  });

  @override
  State<ValidityResultScreen> createState() => _ValidityResultScreenState();
}

class _ValidityResultScreenState extends State<ValidityResultScreen> {
  late TextEditingController _targaCheckController;
  bool _hasCheckedTarga = false;
  bool _targaMatches = false;
  String _checkedTarga = '';

  @override
  void initState() {
    super.initState();
    _targaCheckController = TextEditingController();
    if (widget.physicalPlateChecked != null && widget.physicalPlateChecked!.isNotEmpty) {
      _hasCheckedTarga = true;
      _checkedTarga = widget.physicalPlateChecked!;
      _targaMatches = !widget.isPlateMismatch;
    }
  }

  void _verifyPhysicalTarga() {
    final input = _targaCheckController.text.trim().toUpperCase().replaceAll(RegExp(r'[^A-Z0-9]'), '');
    final reg = widget.vehicle.plateNumber.toUpperCase().replaceAll(RegExp(r'[^A-Z0-9]'), '');

    if (input.isEmpty) return;

    setState(() {
      _hasCheckedTarga = true;
      _checkedTarga = _targaCheckController.text.trim().toUpperCase();
      _targaMatches = (input == reg);
    });
  }

  @override
  Widget build(BuildContext context) {
    final isMismatch = widget.isPlateMismatch || (_hasCheckedTarga && !_targaMatches);
    final isValid = widget.vehicle.status == 'ACTIVE' && !isMismatch;
    final isExpired = widget.vehicle.status == 'EXPIRED' && !isMismatch;

    final Color bannerColor = isMismatch
        ? const Color(0xFF991B1B) // Deep Red 800 for Critical Mismatch
        : isValid
            ? const Color(0xFF15803D) // Emerald 700
            : isExpired
                ? const Color(0xFFD97706) // Amber 600
                : const Color(0xFFDC2626); // Red 600

    final String statusTextAm = isMismatch
        ? 'አስጊ የሰሌዳ አለመዛመድ (PLATE MISMATCH)!'
        : isValid
            ? 'ሕጋዊ ፈቃድ ያለው (VALID)'
            : isExpired
                ? 'ጊዜው ያለፈበት (EXPIRED)'
                : 'ያልተፈቀደ / የታገደ (SUSPENDED)';

    final String statusDesc = isMismatch
        ? 'በተሽከርካሪው ላይ የተለጠፈው ታርጋ ከመዝገቡ ጋር አይዛመድም! ፈቃዱ የሌላ ባጃጅ ነው'
        : isValid
            ? 'የመንገድ ፈቃዱ በጎንደር ከተማ አስተዳደር ትራፊክ ቁጥጥር የፀደቀ ነው'
            : isExpired
                ? 'የመንገድ ፈቃዱ ጊዜ ስላለፈበት ማደስ ይጠበቅበታል'
                : 'ይህ ተሽከርካሪ በጎንደር መዝገብ ውስጥ ያልተፈቀደ ወይም የታገደ ነው';

    final primaryPhone = widget.vehicle.driverPhone.isNotEmpty && widget.vehicle.driverPhone != '-'
        ? widget.vehicle.driverPhone
        : widget.vehicle.ownerPhone;

    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FB),
      appBar: AppBar(
        title: const Text('የፈቃድ እና የታርጋ ፍተሻ ውጤት'),
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
                    padding: const EdgeInsets.symmetric(vertical: 22, horizontal: 16),
                    color: bannerColor,
                    child: Column(
                      children: [
                        Icon(
                          isMismatch
                              ? Icons.error
                              : isValid
                                  ? Icons.check_circle
                                  : isExpired
                                      ? Icons.warning
                                      : Icons.cancel,
                          color: Colors.white,
                          size: 50,
                        ),
                        const SizedBox(height: 10),
                        Text(
                          statusTextAm,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
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

                  // Mismatch Alert Box if detected
                  if (isMismatch) ...[
                    Container(
                      margin: const EdgeInsets.all(14),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.red.shade50,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.red.shade400, width: 1.5),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.warning, color: Colors.red, size: 18),
                              SizedBox(width: 8),
                              Text(
                                'የማጭበርበር ማስጠንቀቂያ (Tampering Alert):',
                                style: TextStyle(fontWeight: FontWeight.bold, color: Colors.red, fontSize: 12),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('የተለጠፈው ታርጋ (Physical Plate):', style: TextStyle(fontSize: 10, color: Colors.grey)),
                                  Text(
                                    _checkedTarga.isNotEmpty ? _checkedTarga : 'ያልተዛመደ ታርጋ',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.red),
                                  ),
                                ],
                              ),
                              const Icon(Icons.compare_arrows, color: Colors.red, size: 20),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  const Text('ትክክለኛው ሰሌዳ (Registered Plate):', style: TextStyle(fontSize: 10, color: Colors.grey)),
                                  Text(
                                    widget.vehicle.plateNumber,
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0C355B)),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],

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
                              child: widget.vehicle.driverPhoto.isNotEmpty
                                  ? Image.network(
                                      widget.vehicle.driverPhoto,
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
                                      widget.vehicle.plateNumber,
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    widget.vehicle.driverName.isNotEmpty && widget.vehicle.driverName != 'ያልተመዘገበ'
                                        ? widget.vehicle.driverName
                                        : widget.vehicle.owner,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 15,
                                    ),
                                  ),
                                  Text(
                                    'ባለቤት: ${widget.vehicle.owner}',
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
                                      widget.vehicle.kebele,
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

                        const SizedBox(height: 14),

                        // On-Site Physical Targa / Plate Cross-Check Box
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: _hasCheckedTarga
                                  ? (_targaMatches ? Colors.green.shade400 : Colors.red.shade400)
                                  : Colors.blue.shade200,
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Icon(
                                    _hasCheckedTarga
                                        ? (_targaMatches ? Icons.check_circle : Icons.cancel)
                                        : Icons.verified,
                                    size: 16,
                                    color: _hasCheckedTarga
                                        ? (_targaMatches ? Colors.green : Colors.red)
                                        : const Color(0xFF0C355B),
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    _hasCheckedTarga
                                        ? (_targaMatches
                                            ? 'ታርጋ 100% ይዛመዳል (Targa Matches)'
                                            : 'የታርጋ አለመዛመድ (Targa Mismatch!)')
                                        : 'በቦታው የሚታየውን ታርጋ አመሳክር (Verify Physical Plate)',
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: _hasCheckedTarga
                                          ? (_targaMatches ? Colors.green.shade800 : Colors.red.shade800)
                                          : const Color(0xFF0C355B),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Expanded(
                                    child: TextField(
                                      controller: _targaCheckController,
                                      decoration: InputDecoration(
                                        hintText: 'የተለጠፈውን ታርጋ ፃፍ (e.g. 3-AM-04891)',
                                        isDense: true,
                                        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  ElevatedButton(
                                    onPressed: _verifyPhysicalTarga,
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFF0C355B),
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                    child: const Text('አመሳክር', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Action Buttons
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                    child: Column(
                      children: [
                        if (isMismatch) ...[
                          ElevatedButton.icon(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => ViolationReportScreen(vehicle: widget.vehicle),
                                ),
                              );
                            },
                            icon: const Icon(Icons.gavel, size: 18),
                            label: const Text('የሰሌዳ ማጭበርበር ቅጣት ፃፍ (Report Fraud & Impound)'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.red.shade800,
                              foregroundColor: Colors.white,
                              minimumSize: const Size.fromHeight(46),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                          const SizedBox(height: 10),
                        ] else ...[
                          ElevatedButton.icon(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => VehicleDetailsScreen(vehicle: widget.vehicle),
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
                        ],
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
                                      builder: (_) => ViolationReportScreen(vehicle: widget.vehicle),
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
