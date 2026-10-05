import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../services/supabase_service.dart';
import '../models/bajaj_vehicle.dart';
import '../widgets/verifying_progress_dialog.dart';
import 'validity_result_screen.dart';
import 'vehicle_not_found_screen.dart';

class VerificationScreen extends StatefulWidget {
  final Function(BajajVehicle vehicle)? onSelectVehicle;
  final Function(String screen)? onNavigate;

  const VerificationScreen({
    super.key,
    this.onSelectVehicle,
    this.onNavigate,
  });

  @override
  State<VerificationScreen> createState() => _VerificationScreenState();
}

class _VerificationScreenState extends State<VerificationScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Controllers
  final _quickPlateController = TextEditingController(text: '3-AM-04891');
  final _didController = TextEditingController(text: 'DID-GD-0489120');
  final _crossDidController = TextEditingController(text: 'DID-25-000784521');
  final _crossPlateController = TextEditingController(text: '3-AM-04891');
  final _vinController = TextEditingController(text: 'TVS98234109482103');

  bool _isScannerOpen = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  void _runVerification(String query, String type, {String? physicalPlateToCheck}) async {
    final clean = query.trim();
    if (clean.isEmpty) return;

    // Show Progress Dialog with 3 steps
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => VerifyingProgressDialog(
        queryValue: clean,
        queryType: type,
        onFinished: () async {
          Navigator.pop(context); // close progress dialog

          // Query Supabase / Local
          final vehicle = await SupabaseService.verifyVehicle(query: clean, type: type);

          if (mounted) {
            if (vehicle != null) {
              // Real vehicle found in Gondar Registry
              bool isMismatch = false;
              if (physicalPlateToCheck != null && physicalPlateToCheck.trim().isNotEmpty) {
                final inputPlateNorm = physicalPlateToCheck.trim().toUpperCase().replaceAll(RegExp(r'[^A-Z0-9]'), '');
                final regPlateNorm = vehicle.plateNumber.toUpperCase().replaceAll(RegExp(r'[^A-Z0-9]'), '');
                isMismatch = (inputPlateNorm != regPlateNorm);
              }

              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => ValidityResultScreen(
                    vehicle: vehicle,
                    onNavigate: widget.onNavigate,
                    physicalPlateChecked: physicalPlateToCheck,
                    isPlateMismatch: isMismatch,
                  ),
                ),
              );
            } else {
              // Vehicle Not Found
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => VehicleNotFoundScreen(
                    searchedQuery: clean,
                    queryType: type,
                  ),
                ),
              );
            }
          }
        },
      ),
    );
  }

  Widget _buildQuickDemoCard({
    required String titleAm,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: BorderSide(color: color.withOpacity(0.4)),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(color: color, shape: BoxShape.circle),
              ),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    titleAm,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
                  ),
                  Text(
                    subtitle,
                    style: const TextStyle(fontSize: 9, color: Colors.grey),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0C355B), Color(0xFF164472)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.blue.withOpacity(0.15),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Row(
              children: [
                Icon(Icons.verified_user, color: Colors.amber, size: 32),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'የባጃጅ ፈቃድ እና የታርጋ ማረጋገጫ (Targa Check)',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'የታርጋ ሰሌዳ፣ QR ኮድ እና የፈቃድ አለመዛመድ (Plate Mismatch) ፍተሻ',
                        style: TextStyle(color: Colors.white70, fontSize: 10),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Instant Targa / Plate Search Bar (Always visible for fast roadside checking)
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFF0C355B).withOpacity(0.2)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.directions_car, color: Color(0xFF0C355B), size: 18),
                    SizedBox(width: 6),
                    Text(
                      'ፈጣን የታርጋ ሰሌዳ ፍተሻ (Quick Targa Check)',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF0C355B)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _quickPlateController,
                        decoration: InputDecoration(
                          hintText: 'ለምሳሌ፡ 3-AM-04891 ወይም AA-12345',
                          isDense: true,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          prefixIcon: const Icon(Icons.tag, size: 18),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: () => _runVerification(_quickPlateController.text, 'plate'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0C355B),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: const Text('ፈትሽ', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Quick Demo Test Jumps
          const Text(
            'ፈጣን የሙከራ ፍተሻዎች (Demo Shortcuts):',
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0C355B)),
          ),
          const SizedBox(height: 6),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildQuickDemoCard(
                  titleAm: '1. ሕጋዊ ፈቃድ (Valid)',
                  subtitle: 'ታርጋ: 3-AM-04891',
                  color: Colors.green,
                  onTap: () => _runVerification('3-AM-04891', 'plate'),
                ),
                const SizedBox(width: 8),
                _buildQuickDemoCard(
                  titleAm: '2. ፈቃድ (AA-12345)',
                  subtitle: 'ታርጋ: AA-12345',
                  color: Colors.green.shade700,
                  onTap: () => _runVerification('AA-12345', 'plate'),
                ),
                const SizedBox(width: 8),
                // Dedicated Plate Mismatch Test!
                _buildQuickDemoCard(
                  titleAm: '🚨 3. የታርጋ ማጭበርበር (Mismatch)',
                  subtitle: 'ፈቃድ: AA-12345 vs ታርጋ: 3-AM-04891',
                  color: Colors.red,
                  onTap: () => _runVerification(
                    'DID-25-000784521',
                    'did',
                    physicalPlateToCheck: '3-AM-04891',
                  ),
                ),
                const SizedBox(width: 8),
                _buildQuickDemoCard(
                  titleAm: '4. ጊዜው ያለፈበት (Expired)',
                  subtitle: 'ታርጋ: 3-AM-99999',
                  color: Colors.amber.shade800,
                  onTap: () => _runVerification('3-AM-99999', 'plate'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Verification Tabs Container
          Card(
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            clipBehavior: Clip.antiAlias,
            child: Column(
              children: [
                Container(
                  color: const Color(0xFF0C355B),
                  child: TabBar(
                    controller: _tabController,
                    indicatorColor: Colors.amber,
                    indicatorWeight: 3,
                    labelColor: Colors.white,
                    unselectedLabelColor: Colors.white60,
                    tabs: const [
                      Tab(text: 'QR ስካነር'),
                      Tab(text: 'የታርጋ ማመሳከሪያ'),
                      Tab(text: 'ቻሲስ (VIN)'),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: SizedBox(
                    height: 330,
                    child: TabBarView(
                      controller: _tabController,
                      children: [
                        // Tab 1: Live QR Scanner & DID
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const Text(
                              'QR ኮድ ስካነር / ዲጂታል መታወቂያ',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                            const SizedBox(height: 8),
                            TextField(
                              controller: _didController,
                              decoration: InputDecoration(
                                hintText: 'DID-GD-0489120 ወይም 3-AM-04891',
                                prefixIcon: const Icon(Icons.qr_code),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                            ),
                            const SizedBox(height: 10),
                            ElevatedButton.icon(
                              onPressed: () => _runVerification(_didController.text, 'did'),
                              icon: const Icon(Icons.search, size: 18),
                              label: const Text('አረጋግጥ (Verify QR / DID)'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF0C355B),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 12),
                              ),
                            ),
                            const SizedBox(height: 12),
                            const Divider(height: 1),
                            const SizedBox(height: 10),

                            // Camera Scanner Toggle
                            ElevatedButton.icon(
                              onPressed: () {
                                setState(() => _isScannerOpen = !_isScannerOpen);
                              },
                              icon: Icon(_isScannerOpen ? Icons.videocam_off : Icons.camera_alt, size: 18),
                              label: Text(_isScannerOpen ? 'ካሜራ ዝጋ (Close Camera)' : 'የካሜራ ስካነር ክፈት (Live QR Scan)'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF185A9D),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 12),
                              ),
                            ),
                            if (_isScannerOpen) ...[
                              const SizedBox(height: 8),
                              SizedBox(
                                height: 100,
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(10),
                                  child: MobileScanner(
                                    onDetect: (capture) {
                                      final barcodes = capture.barcodes;
                                      for (final b in barcodes) {
                                        if (b.rawValue != null) {
                                          setState(() => _isScannerOpen = false);
                                          _runVerification(b.rawValue!, 'qr');
                                          break;
                                        }
                                      }
                                    },
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),

                        // Tab 2: Dedicated Dual Anti-Fraud Plate Mismatch Inspector!
                        SingleChildScrollView(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: Colors.blue.shade50,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: Colors.blue.shade200),
                                ),
                                child: const Row(
                                  children: [
                                    Icon(Icons.security, size: 18, color: Color(0xFF0C355B)),
                                    SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        'የተለጠፈው ታርጋ ከQR ፈቃዱ ጋር መመሳከሩን ያረጋግጡ (Anti-Plate Fraud)',
                                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Color(0xFF0C355B)),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 12),

                              const Text(
                                '1. የQR ኮድ ወይም ዲጂታል መታወቂያ (Scanned DID / QR):',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
                              ),
                              const SizedBox(height: 6),
                              TextField(
                                controller: _crossDidController,
                                decoration: InputDecoration(
                                  hintText: 'DID-25-000784521',
                                  prefixIcon: const Icon(Icons.qr_code, size: 18),
                                  isDense: true,
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                              ),
                              const SizedBox(height: 12),

                              const Text(
                                '2. በተሽከርካሪው ላይ የሚታየው ታርጋ (Observed Physical Plate):',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
                              ),
                              const SizedBox(height: 6),
                              TextField(
                                controller: _crossPlateController,
                                decoration: InputDecoration(
                                  hintText: 'ለምሳሌ፡ AA-12345 ወይም 3-AM-04891',
                                  prefixIcon: const Icon(Icons.directions_car, size: 18),
                                  isDense: true,
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                              ),
                              const SizedBox(height: 14),

                              ElevatedButton.icon(
                                onPressed: () {
                                  _runVerification(
                                    _crossDidController.text,
                                    'did',
                                    physicalPlateToCheck: _crossPlateController.text,
                                  );
                                },
                                icon: const Icon(Icons.compare_arrows, size: 18),
                                label: const Text('አመሳክር እና ፍተሻ አድርግ (Cross-Check Mismatch)'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF0C355B),
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Tab 3: VIN / Chassis
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const Text(
                              'VIN / ቻሲስ ቁጥር (Chassis Number)',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                            const SizedBox(height: 8),
                            TextField(
                              controller: _vinController,
                              decoration: InputDecoration(
                                hintText: 'ለምሳሌ፡ TVS98234109482103',
                                prefixIcon: const Icon(Icons.tag),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                            ),
                            const SizedBox(height: 14),
                            ElevatedButton.icon(
                              onPressed: () => _runVerification(_vinController.text, 'vin'),
                              icon: const Icon(Icons.search, size: 18),
                              label: const Text('በቻሲስ ፈትሽ (Search Chassis)'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF0C355B),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 14),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
